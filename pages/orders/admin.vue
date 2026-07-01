<template>
  <div class="space-y-6">
    <h1 class="text-2xl font-bold text-[#1A1A1A]">Process Orders</h1>

    <!-- Pending tracking-info requests -->
    <div v-if="trackingRequests.length" class="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-2">
      <h2 class="text-sm font-bold text-[#1565C0]">Tracking Info Requested</h2>
      <div
        v-for="req in trackingRequests"
        :key="req.requestID"
        class="flex items-center justify-between text-sm text-[#1A1A1A]"
      >
        <span>
          #{{ req.requestID }} &bull; {{ req.project?.projectTitle }} &bull;
          {{ req.student?.firstName }} {{ req.student?.lastName }}
        </span>
        <UButton size="xs" class="bg-[#1565C0] text-white" @click="openOrderModal(req)">
          Add Order / Tracking Info
        </UButton>
      </div>
    </div>

    <UTabs :items="tabs" v-model="activeTab" />

    <!-- Requests -->
    <div v-if="activeTab === 0">
      <div v-if="pending" class="text-center py-12 text-[#5A5A5A]">Loading...</div>
      <div v-else-if="!requests?.length" class="text-center py-12 text-[#5A5A5A]">No approved requests to process.</div>
      <div v-else class="space-y-4">
        <RequestCard
          v-for="req in requests"
          :key="req.requestID"
          :request="req"
          user-role="ADMIN"
          @process="openOrderModal(req)"
          @receive="markReceived(req)"
          @reject="openModal(req, 'request', 'REJECTED')"
          @request-changes="openModal(req, 'request', 'CHANGES_REQUESTED')"
        />
      </div>
    </div>

    <!-- Reimbursements -->
    <div v-if="activeTab === 1">
      <div v-if="reimbPending" class="text-center py-12 text-[#5A5A5A]">Loading...</div>
      <div v-else-if="!reimbursements?.length" class="text-center py-12 text-[#5A5A5A]">No approved reimbursements to process.</div>
      <div v-else class="space-y-4">
        <ReimbursementCard
          v-for="r in reimbursements"
          :key="r.reimbursementID"
          :reimbursement="r"
          user-role="ADMIN"
          @process="processReimbursement(r)"
          @reject="openModal(r, 'reimbursement', 'REJECTED')"
          @request-changes="openModal(r, 'reimbursement', 'CHANGES_REQUESTED')"
        />
      </div>
    </div>

    <RejectionModal
      v-model:open="modalOpen"
      :title="modalStatus === 'REJECTED' ? 'Reject Request' : 'Request Changes'"
      :description="modalStatus === 'REJECTED'
        ? 'Please provide a reason for rejection. The student will see this comment.'
        : 'Describe the changes needed. The student will see this note and can edit and resubmit.'"
      :placeholder="modalStatus === 'REJECTED' ? 'Enter rejection reason...' : 'Describe the requested changes...'"
      :confirm-label="modalStatus === 'REJECTED' ? 'Reject' : 'Request Changes'"
      :confirm-class="modalStatus === 'REJECTED' ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-amber-500 hover:bg-amber-600 text-white'"
      @confirm="submitModal"
    />

    <!-- Mark as Ordered / Add Order modal -->
    <UModal v-model:open="orderModalOpen">
      <template #content>
        <div class="p-6 space-y-4">
          <h3 class="text-lg font-bold text-[#1A1A1A]">Order Details</h3>
          <p class="text-sm text-[#5A5A5A]">
            Enter the order information for request #{{ orderTarget?.requestID }}.
            Shipping cost is deducted from the project's available balance.
          </p>
          <div class="space-y-3">
            <div>
              <label class="block text-xs text-[#5A5A5A] mb-1">Order Number *</label>
              <UInput v-model="orderForm.orderNumber" placeholder="e.g. PO-12345" />
            </div>
            <div>
              <label class="block text-xs text-[#5A5A5A] mb-1">Order Details</label>
              <UInput v-model="orderForm.orderDetails" placeholder="Vendor order reference, notes..." />
            </div>
            <div>
              <label class="block text-xs text-[#5A5A5A] mb-1">Tracking Info</label>
              <UInput v-model="orderForm.trackingInfo" placeholder="Carrier + tracking number" />
            </div>
            <div>
              <label class="block text-xs text-[#5A5A5A] mb-1">Shipping Cost ($)</label>
              <UInput v-model.number="orderForm.shippingCost" type="number" step="0.01" min="0" />
            </div>
          </div>
          <div v-if="orderError" class="text-sm text-red-600">{{ orderError }}</div>
          <div class="flex gap-3 justify-end">
            <UButton variant="ghost" @click="orderModalOpen = false">Cancel</UButton>
            <UButton
              class="bg-[#154734] text-white"
              :disabled="!orderForm.orderNumber.trim()"
              :loading="orderSubmitting"
              @click="submitOrder"
            >
              Save Order
            </UButton>
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const { isAdmin } = useAuth()
if (!isAdmin.value) await navigateTo('/orders')

const tabs = [{ label: 'Requests' }, { label: 'Reimbursements' }]
const activeTab = ref(0)

interface AdminRequest {
  requestID: number
  trackingRequested?: boolean
  project?: { projectTitle: string }
  student?: { firstName: string; lastName: string }
  process: { processID: number; status: string }
  orders?: Array<{ trackingInfo: string }>
}

const { data: reqData, pending, refresh } = await useFetch('/api/request/get', { method: 'POST', body: {} })
const requests = computed<AdminRequest[]>(() => reqData.value?.requests ?? [])

const trackingRequests = computed(() =>
  requests.value.filter(r => r.trackingRequested && !r.orders?.some(o => o.trackingInfo)),
)

const { data: reimbData, pending: reimbPending, refresh: reimbRefresh } = await useFetch('/api/reimbursement/get', { method: 'POST', body: {} })
const reimbursements = computed(() => reimbData.value?.reimbursements ?? [])

// ── Reject / Request Changes ────────────────────────────────────────────────
const modalOpen = ref(false)
const modalTarget = ref<{ process: { processID: number } } | null>(null)
const modalType = ref<'request' | 'reimbursement'>('request')
const modalStatus = ref<'REJECTED' | 'CHANGES_REQUESTED'>('REJECTED')

function openModal(item: typeof modalTarget.value, type: 'request' | 'reimbursement', status: 'REJECTED' | 'CHANGES_REQUESTED') {
  modalTarget.value = item
  modalType.value = type
  modalStatus.value = status
  modalOpen.value = true
}

async function submitModal(comment: string) {
  await $fetch('/api/process/update', {
    method: 'POST',
    body: { processID: modalTarget.value!.process.processID, status: modalStatus.value, comment },
  })
  modalType.value === 'request' ? refresh() : reimbRefresh()
}

// ── Mark as Ordered (creates the Order record) ─────────────────────────────
const orderModalOpen = ref(false)
const orderTarget = ref<AdminRequest | null>(null)
const orderSubmitting = ref(false)
const orderError = ref('')
const orderForm = reactive({
  orderNumber: '',
  orderDetails: '',
  trackingInfo: '',
  shippingCost: 0,
})

function openOrderModal(req: AdminRequest) {
  orderTarget.value = req
  orderForm.orderNumber = ''
  orderForm.orderDetails = ''
  orderForm.trackingInfo = ''
  orderForm.shippingCost = 0
  orderError.value = ''
  orderModalOpen.value = true
}

async function submitOrder() {
  if (!orderTarget.value) return
  orderSubmitting.value = true
  orderError.value = ''
  try {
    await $fetch('/api/orders', {
      method: 'POST',
      body: {
        dateOrdered: new Date().toISOString(),
        orderNumber: orderForm.orderNumber,
        orderDetails: orderForm.orderDetails,
        trackingInfo: orderForm.trackingInfo,
        shippingCost: orderForm.shippingCost,
        requestID: orderTarget.value.requestID,
      },
    })
    // Transition to ORDERED if the request was still in APPROVED
    if (orderTarget.value.process.status === 'APPROVED') {
      await $fetch('/api/process/update', {
        method: 'POST',
        body: { processID: orderTarget.value.process.processID, status: 'ORDERED' },
      })
    }
    orderModalOpen.value = false
    refresh()
  } catch (e: any) {
    orderError.value = e?.data?.message ?? 'Failed to save order.'
  } finally {
    orderSubmitting.value = false
  }
}

async function markReceived(req: AdminRequest) {
  await $fetch('/api/process/update', { method: 'POST', body: { processID: req.process.processID, status: 'RECEIVED' } })
  refresh()
}

async function processReimbursement(r: { process: { processID: number } }) {
  await $fetch('/api/process/update', { method: 'POST', body: { processID: r.process.processID, status: 'PROCESSED' } })
  reimbRefresh()
}
</script>

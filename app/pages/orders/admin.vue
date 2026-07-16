<template>
  <div class="mx-auto max-w-5xl space-y-6">
    <section class="app-surface overflow-hidden p-0">
      <div class="border-b border-white/70 bg-gradient-to-r from-[#154734] to-[#0f3326] px-6 py-6 text-white sm:px-8">
        <p class="text-xs font-bold uppercase tracking-[0.3em] text-white/60">Admin dashboard</p>
        <h1 class="mt-2 text-3xl font-black tracking-tight">Process Orders</h1>
        <p class="mt-2 max-w-2xl text-sm text-white/75">
          Review approvals, handle tracking requests, and process reimbursements from one place.
        </p>
      </div>

      <div class="space-y-6 p-6 sm:p-8">
        <div v-if="trackingRequests.length" class="rounded-3xl border border-blue-200 bg-blue-50 p-4">
          <div class="mb-3 flex items-center justify-between gap-3">
            <h2 class="text-sm font-bold uppercase tracking-[0.24em] text-blue-800">Tracking info requested</h2>
            <span class="rounded-full bg-blue-600 px-3 py-1 text-xs font-bold text-white">{{ trackingRequests.length }}</span>
          </div>
          <div class="space-y-3">
            <div
              v-for="req in trackingRequests"
              :key="req.requestID"
              class="flex flex-col gap-3 rounded-2xl border border-blue-200 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div class="text-sm text-slate-700">
                <p class="font-semibold text-slate-900">
                  #{{ req.requestID }} - {{ req.project?.projectTitle }}
                </p>
                <p>{{ req.student?.firstName }} {{ req.student?.lastName }}</p>
              </div>
              <UButton size="xs" class="bg-blue-600 text-white" @click="openOrderModal(req)">
                Add order / tracking info
              </UButton>
            </div>
          </div>
        </div>

        <UTabs :items="tabs" v-model="activeTab" />

        <div v-if="activeTab === 0" class="space-y-4">
          <div v-if="pending" class="rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center text-slate-500">Loading...</div>
          <div v-else-if="!requests?.length" class="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center text-slate-500">No approved requests to process.</div>
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

        <div v-if="activeTab === 1" class="space-y-4">
          <div v-if="reimbPending" class="rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center text-slate-500">Loading...</div>
          <div v-else-if="!reimbursements?.length" class="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center text-slate-500">No approved reimbursements to process.</div>
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
      </div>
    </section>

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

    <UModal v-model:open="orderModalOpen">
      <template #content>
        <div class="p-6 space-y-5">
          <div>
            <h3 class="text-xl font-black tracking-tight text-slate-900">Order Details</h3>
            <p class="mt-1 text-sm text-slate-500">
              Enter the order information for request #{{ orderTarget?.requestID }}. Shipping cost is deducted from the project's available balance.
            </p>
          </div>

          <div class="grid gap-4">
            <UInput v-model="orderForm.orderNumber" label="Order number *" placeholder="e.g. PO-12345" />
            <UInput v-model="orderForm.orderDetails" label="Order details" placeholder="Vendor order reference, notes..." />
            <UInput v-model="orderForm.trackingInfo" label="Tracking info" placeholder="Carrier and tracking number" />
            <UInput v-model.number="orderForm.shippingCost" label="Shipping cost ($)" type="number" step="0.01" min="0" />
          </div>

          <div v-if="orderError" class="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {{ orderError }}
          </div>

          <div class="flex flex-wrap justify-end gap-3">
            <UButton variant="ghost" @click="closeOrderModal">Cancel</UButton>
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

function closeOrderModal() {
  orderModalOpen.value = false
}

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

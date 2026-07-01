<template>
  <div class="space-y-6">
    <h1 class="text-2xl font-bold text-[#1A1A1A]">Pending Review</h1>

    <UTabs :items="tabs" v-model="activeTab" />

    <!-- Requests -->
    <div v-if="activeTab === 0">
      <div v-if="pending" class="text-center py-12 text-[#5A5A5A]">Loading...</div>
      <div v-else-if="!requests?.length" class="text-center py-12 text-[#5A5A5A]">No requests pending review.</div>
      <div v-else class="space-y-4">
        <RequestCard
          v-for="req in requests"
          :key="req.requestID"
          :request="req"
          user-role="MENTOR"
          @approve="approveRequest(req)"
          @reject="openModal(req, 'request', 'REJECTED')"
          @request-changes="openModal(req, 'request', 'CHANGES_REQUESTED')"
        />
      </div>
    </div>

    <!-- Reimbursements -->
    <div v-if="activeTab === 1">
      <div v-if="reimbPending" class="text-center py-12 text-[#5A5A5A]">Loading...</div>
      <div v-else-if="!reimbursements?.length" class="text-center py-12 text-[#5A5A5A]">No reimbursements pending review.</div>
      <div v-else class="space-y-4">
        <ReimbursementCard
          v-for="r in reimbursements"
          :key="r.reimbursementID"
          :reimbursement="r"
          user-role="MENTOR"
          @approve="approveReimbursement(r)"
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
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const { isMentor } = useAuth()
if (!isMentor.value) await navigateTo('/orders')

const tabs = [{ label: 'Requests' }, { label: 'Reimbursements' }]
const activeTab = ref(0)

const { data: reqData, pending, refresh } = await useFetch('/api/request/get', { method: 'POST', body: {} })
const requests = computed(() => reqData.value?.requests ?? [])

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

async function approveRequest(req: { process: { processID: number } }) {
  await $fetch('/api/process/update', { method: 'POST', body: { processID: req.process.processID, status: 'APPROVED' } })
  refresh()
}

async function approveReimbursement(r: { process: { processID: number } }) {
  await $fetch('/api/process/update', { method: 'POST', body: { processID: r.process.processID, status: 'APPROVED' } })
  reimbRefresh()
}

async function submitModal(comment: string) {
  await $fetch('/api/process/update', {
    method: 'POST',
    body: { processID: modalTarget.value!.process.processID, status: modalStatus.value, comment },
  })
  modalType.value === 'request' ? refresh() : reimbRefresh()
}
</script>

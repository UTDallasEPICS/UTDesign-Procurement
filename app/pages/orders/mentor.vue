<template>
  <div class="mx-auto max-w-5xl space-y-6">
    <section class="app-surface overflow-hidden p-0">
      <div class="border-b border-white/70 bg-gradient-to-r from-[#154734] to-[#0f3326] px-6 py-6 text-white sm:px-8">
        <p class="text-xs font-bold uppercase tracking-[0.3em] text-white/60">Mentor dashboard</p>
        <h1 class="mt-2 text-3xl font-black tracking-tight">Pending Review</h1>
        <p class="mt-2 max-w-2xl text-sm text-white/75">
          Review submitted requests and reimbursements, then approve, reject, or send them back with clear comments.
        </p>
      </div>

      <div class="space-y-6 p-6 sm:p-8">
        <UTabs :items="tabs" v-model="activeTab" />

        <div v-if="activeTab === 0" class="space-y-4">
          <div v-if="pending" class="rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center text-slate-500">Loading...</div>
          <div v-else-if="!requests?.length" class="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center text-slate-500">No requests pending review.</div>
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

        <div v-if="activeTab === 1" class="space-y-4">
          <div v-if="reimbPending" class="rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center text-slate-500">Loading...</div>
          <div v-else-if="!reimbursements?.length" class="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center text-slate-500">No reimbursements pending review.</div>
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

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
          @reject="openReject(req, 'request')"
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
          @reject="openReject(r, 'reimbursement')"
        />
      </div>
    </div>

    <RejectionModal v-model:open="rejectOpen" @confirm="submitRejection" />
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

const rejectOpen = ref(false)
const rejectTarget = ref<{ process: { processID: number } } | null>(null)
const rejectType = ref<'request' | 'reimbursement'>('request')

function openReject(item: typeof rejectTarget.value, type: 'request' | 'reimbursement') {
  rejectTarget.value = item
  rejectType.value = type
  rejectOpen.value = true
}

async function approveRequest(req: { process: { processID: number } }) {
  await $fetch('/api/process/update', { method: 'POST', body: { processID: req.process.processID, status: 'APPROVED' } })
  refresh()
}

async function approveReimbursement(r: { process: { processID: number } }) {
  await $fetch('/api/process/update', { method: 'POST', body: { processID: r.process.processID, status: 'APPROVED' } })
  reimbRefresh()
}

async function submitRejection(comment: string) {
  await $fetch('/api/process/update', { method: 'POST', body: { processID: rejectTarget.value!.process.processID, status: 'REJECTED', comment } })
  rejectType.value === 'request' ? refresh() : reimbRefresh()
}
</script>

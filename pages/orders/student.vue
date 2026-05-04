<template>
  <div class="space-y-6">
    <h1 class="text-2xl font-bold text-[#1A1A1A]">My Orders</h1>

    <UTabs :items="tabs" v-model="activeTab" />

    <!-- Requests Tab -->
    <div v-if="activeTab === 0">
      <div v-if="pending" class="text-center py-12 text-[#5A5A5A]">Loading...</div>
      <div v-else-if="!requests?.length" class="text-center py-12 text-[#5A5A5A]">
        No requests yet. <NuxtLink to="/request-form" class="text-[#E87722] underline">Submit one?</NuxtLink>
      </div>
      <div v-else class="space-y-4">
        <RequestCard
          v-for="req in requests"
          :key="req.requestID"
          :request="req"
          user-role="STUDENT"
          @cancel="cancelRequest(req)"
        />
      </div>
    </div>

    <!-- Reimbursements Tab -->
    <div v-if="activeTab === 1">
      <div v-if="reimbPending" class="text-center py-12 text-[#5A5A5A]">Loading...</div>
      <div v-else-if="!reimbursements?.length" class="text-center py-12 text-[#5A5A5A]">
        No reimbursements yet. <NuxtLink to="/reimbursement/student" class="text-[#E87722] underline">Submit one?</NuxtLink>
      </div>
      <div v-else class="space-y-4">
        <ReimbursementCard
          v-for="r in reimbursements"
          :key="r.reimbursementID"
          :reimbursement="r"
          user-role="STUDENT"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const { isStudent } = useAuth()
if (!isStudent.value) await navigateTo('/orders')

const tabs = [{ label: 'Requests' }, { label: 'Reimbursements' }]
const activeTab = ref(0)

const { data: requestData, pending, refresh } = await useFetch('/api/request/get', { method: 'POST', body: {} })
const requests = computed(() => requestData.value?.requests ?? [])

const { data: reimbData, pending: reimbPending, refresh: reimbRefresh } = await useFetch('/api/reimbursement/get', { method: 'POST', body: {} })
const reimbursements = computed(() => reimbData.value?.reimbursements ?? [])

async function cancelRequest(req: { process: { processID: number } }) {
  await $fetch('/api/process/update', { method: 'POST', body: { processID: req.process.processID, status: 'CANCELLED' } })
  refresh()
}
</script>

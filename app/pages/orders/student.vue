<template>
  <div class="mx-auto max-w-5xl space-y-6">
    <section class="app-surface overflow-hidden p-0">
      <div class="border-b border-white/70 bg-gradient-to-r from-[#154734] to-[#0f3326] px-6 py-6 text-white sm:px-8">
        <p class="text-xs font-bold uppercase tracking-[0.3em] text-white/60">Student dashboard</p>
        <h1 class="mt-2 text-3xl font-black tracking-tight">My Orders</h1>
        <p class="mt-2 max-w-2xl text-sm text-white/75">
          Track requests, follow up on reimbursements, and jump back into forms when a reviewer asks for changes.
        </p>
      </div>

      <div class="space-y-6 p-6 sm:p-8">
        <UTabs :items="tabs" v-model="activeTab" />

        <section class="space-y-4">
          <div v-if="activeTab === 0" class="space-y-4">
            <div v-if="pending" class="rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center text-slate-500">Loading...</div>
            <div v-else-if="!requests?.length" class="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center text-slate-500">
              No requests yet.
              <NuxtLink to="/request-form" class="font-semibold text-[#d86e18] underline">Submit one?</NuxtLink>
            </div>
            <div v-else class="space-y-4">
              <RequestCard
                v-for="req in requests"
                :key="req.requestID"
                :request="req"
                user-role="STUDENT"
                @cancel="cancelRequest(req)"
                @request-tracking="requestTracking(req)"
              />
            </div>
          </div>

          <div v-if="activeTab === 1" class="space-y-4">
            <div v-if="reimbPending" class="rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center text-slate-500">Loading...</div>
            <div v-else-if="!reimbursements?.length" class="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center text-slate-500">
              No reimbursements yet.
              <NuxtLink to="/reimbursement/student" class="font-semibold text-[#d86e18] underline">Submit one?</NuxtLink>
            </div>
            <div v-else class="space-y-4">
              <ReimbursementCard
                v-for="r in reimbursements"
                :key="r.reimbursementID"
                :reimbursement="r"
                user-role="STUDENT"
                @cancel="cancelReimbursement(r)"
                @resubmit="resubmitReimbursement(r)"
              />
            </div>
          </div>
        </section>
      </div>
    </section>
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

async function cancelReimbursement(r: { process: { processID: number } }) {
  await $fetch('/api/process/update', { method: 'POST', body: { processID: r.process.processID, status: 'CANCELLED' } })
  reimbRefresh()
}

async function resubmitReimbursement(r: { process: { processID: number } }) {
  await $fetch('/api/process/update', { method: 'POST', body: { processID: r.process.processID, status: 'UNDER_REVIEW' } })
  reimbRefresh()
}

async function requestTracking(req: { requestID: number }) {
  await $fetch('/api/request/tracking-request', { method: 'POST', body: { requestID: req.requestID } })
  refresh()
}
</script>

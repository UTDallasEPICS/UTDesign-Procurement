<template>
  <div class="space-y-6">
    <h1 class="text-2xl font-bold text-[#1A1A1A]">Order History</h1>
    <div v-if="pending" class="text-center py-12 text-[#5A5A5A]">Loading...</div>
    <div v-else-if="!requests?.length" class="text-center py-12 text-[#5A5A5A]">No completed requests yet.</div>
    <div v-else class="space-y-4">
      <div
        v-for="req in completedRequests"
        :key="req.requestID"
        class="bg-white border border-[#D9D9D9] rounded-xl p-5"
      >
        <div class="flex items-center justify-between mb-3">
          <div>
            <p class="font-semibold text-[#1A1A1A]">{{ req.project?.projectTitle }}</p>
            <p class="text-xs text-[#5A5A5A]">Submitted {{ formatDate(req.dateSubmitted) }}</p>
          </div>
          <StatusBadge :status="req.process?.status ?? ''" />
        </div>
        <div class="space-y-1">
          <div
            v-for="item in req.items"
            :key="item.itemID"
            class="text-sm text-[#5A5A5A] flex justify-between"
          >
            <span>{{ item.description }} (x{{ item.quantity }})</span>
            <span>${{ (item.quantity * item.unitPrice).toFixed(2) }}</span>
          </div>
        </div>
        <div class="text-right text-sm font-semibold mt-2 text-[#1A1A1A]">
          Total: ${{ req.expense?.toFixed(2) }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const { isStudent } = useAuth()
if (!isStudent.value) await navigateTo('/orders')

const { data, pending } = await useFetch('/api/request/get', { method: 'POST', body: {} })
const requests = computed(() => data.value?.requests ?? [])
const completedRequests = computed(() =>
  requests.value.filter((r: any) => ['PROCESSED', 'RECEIVED', 'ORDERED', 'REJECTED', 'CANCELLED'].includes(r.process?.status))
)

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-US')
}
</script>

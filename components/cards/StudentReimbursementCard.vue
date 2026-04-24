<template>
  <div class="bg-white border border-[#D9D9D9] rounded-xl overflow-hidden">
    <div class="px-5 py-4 flex items-center justify-between border-b border-[#D9D9D9]">
      <div>
        <p class="font-semibold text-[#1A1A1A]">{{ reimbursement.project?.projectTitle }}</p>
        <p class="text-xs text-[#5A5A5A]">Submitted {{ formatDate(reimbursement.dateSubmitted) }}</p>
      </div>
      <div class="flex items-center gap-3">
        <StatusBadge :status="reimbursement.process?.status ?? ''" />
        <button class="text-xs text-[#E87722]" @click="expanded = !expanded">
          {{ expanded ? 'Hide' : 'Details' }}
        </button>
      </div>
    </div>

    <div
      v-if="reimbursement.process?.status === 'REJECTED' && reimbursement.process?.mentorProcessedComments"
      class="px-5 py-3 bg-red-50 border-b border-red-100 text-sm text-red-700"
    >
      <span class="font-semibold">Rejection reason:</span> {{ reimbursement.process.mentorProcessedComments }}
    </div>

    <div v-if="expanded" class="px-5 py-3 space-y-2 border-b border-[#D9D9D9]">
      <div
        v-for="item in reimbursement.items"
        :key="item.itemID"
        class="flex justify-between text-sm text-[#5A5A5A]"
      >
        <span>{{ item.description }}</span>
        <span>${{ item.receiptTotal.toFixed(2) }}</span>
      </div>
      <div class="text-right font-semibold text-sm text-[#1A1A1A]">
        Total: ${{ reimbursement.expense?.toFixed(2) }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ reimbursement: any }>()
defineEmits(['refresh'])
const expanded = ref(false)
function formatDate(d: string) { return new Date(d).toLocaleDateString('en-US') }
</script>

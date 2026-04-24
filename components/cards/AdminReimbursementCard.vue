<template>
  <div class="bg-white border border-[#D9D9D9] rounded-xl overflow-hidden">
    <div class="px-5 py-4 flex items-center justify-between border-b border-[#D9D9D9]">
      <div>
        <p class="font-semibold text-[#1A1A1A]">{{ reimbursement.project?.projectTitle }}</p>
        <p class="text-xs text-[#5A5A5A]">
          by {{ reimbursement.student?.firstName }} {{ reimbursement.student?.lastName }}
        </p>
      </div>
      <div class="flex items-center gap-3">
        <StatusBadge :status="reimbursement.process?.status ?? ''" />
        <button class="text-xs text-[#E87722]" @click="expanded = !expanded">
          {{ expanded ? 'Collapse' : 'Expand' }}
        </button>
      </div>
    </div>

    <div v-if="expanded" class="p-5 space-y-2">
      <div v-for="item in reimbursement.items" :key="item.itemID" class="text-sm flex justify-between text-[#5A5A5A]">
        <span>{{ item.description }} ({{ item.vendor?.vendorName }})</span>
        <span>${{ item.receiptTotal.toFixed(2) }}</span>
      </div>
      <div class="text-right font-semibold text-sm">Total: ${{ reimbursement.expense?.toFixed(2) }}</div>
      <div v-if="reimbursement.additionalInfo" class="text-xs text-[#5A5A5A]">Notes: {{ reimbursement.additionalInfo }}</div>
    </div>

    <div class="px-5 py-3 flex gap-2 border-t border-[#D9D9D9]">
      <UButton size="sm" class="bg-[#154734] text-white" @click="$emit('process', reimbursement)">Mark as Processed</UButton>
      <UButton size="sm" variant="outline" class="border-red-500 text-red-500" @click="$emit('reject', reimbursement)">Reject</UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ reimbursement: any }>()
defineEmits(['process', 'reject', 'refresh'])
const expanded = ref(false)
</script>

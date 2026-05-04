<template>
  <div class="bg-white border border-[#E0E0E0] rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
    <!-- Header -->
    <div class="px-5 py-4 flex items-center justify-between border-b border-[#F0F0F0]">
      <div>
        <p class="font-semibold text-[#1A1A1A]">{{ reimbursement.project?.projectTitle }}</p>
        <p class="text-xs text-[#5A5A5A]">
          <template v-if="userRole !== 'STUDENT'">
            by {{ reimbursement.student?.firstName }} {{ reimbursement.student?.lastName }}
          </template>
          <template v-else>
            Submitted {{ formatDate(reimbursement.dateSubmitted) }}
          </template>
        </p>
      </div>
      <div class="flex items-center gap-3">
        <StatusBadge :status="reimbursement.process?.status ?? ''" />
        <button class="text-xs text-[#E87722]" @click="expanded = !expanded">
          {{ expanded ? 'Collapse' : 'Expand' }}
        </button>
      </div>
    </div>

    <!-- Rejection reason (student view) -->
    <div
      v-if="userRole === 'STUDENT' && reimbursement.process?.status === 'REJECTED' && reimbursement.process?.mentorProcessedComments"
      class="px-5 py-3 bg-red-50 border-b border-red-100 text-sm text-red-700"
    >
      <span class="font-semibold">Rejection reason:</span> {{ reimbursement.process.mentorProcessedComments }}
    </div>

    <!-- Expanded items -->
    <div v-if="expanded" class="px-5 py-3 space-y-2 border-b border-[#F0F0F0] bg-[#FAFAFA]">
      <div
        v-for="item in reimbursement.items"
        :key="item.itemID"
        class="flex justify-between text-sm text-[#5A5A5A]"
      >
        <span>{{ item.description }} ({{ item.vendor?.vendorName }})</span>
        <span>${{ item.receiptTotal.toFixed(2) }}</span>
      </div>
      <div class="text-right font-semibold text-sm text-[#1A1A1A]">
        Total: ${{ reimbursement.expense?.toFixed(2) }}
      </div>
      <div v-if="reimbursement.additionalInfo" class="text-xs text-[#5A5A5A]">
        Notes: {{ reimbursement.additionalInfo }}
      </div>
    </div>

    <!-- Actions -->
    <div class="px-5 py-3 flex gap-2 border-t border-[#F0F0F0] bg-[#FAFAFA]">
      <template v-if="userRole === 'ADMIN'">
        <UButton size="sm" class="bg-[#154734] text-white" @click="$emit('process', reimbursement)">Mark as Processed</UButton>
        <UButton size="sm" variant="outline" class="border-red-500 text-red-500" @click="$emit('reject', reimbursement)">Reject</UButton>
      </template>
      <template v-else-if="userRole === 'MENTOR'">
        <UButton size="sm" class="bg-[#154734] text-white" @click="$emit('approve', reimbursement)">Approve</UButton>
        <UButton size="sm" variant="outline" class="border-red-500 text-red-500" @click="$emit('reject', reimbursement)">Reject</UButton>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  reimbursement: {
    reimbursementID: number
    dateSubmitted: string
    expense?: number
    additionalInfo?: string | null
    project?: { projectTitle: string }
    student?: { firstName: string; lastName: string }
    process?: {
      status: string
      mentorProcessedComments?: string | null
    }
    items?: Array<{
      itemID: number
      description: string
      receiptTotal: number
      vendor?: { vendorName: string }
    }>
  }
  userRole: 'ADMIN' | 'MENTOR' | 'STUDENT'
}>()

defineEmits(['approve', 'reject', 'process'])

const expanded = ref(false)

function formatDate(d: string | null | undefined) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-US')
}
</script>

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

    <!-- Change-request note (student view) -->
    <template v-if="userRole === 'STUDENT' && reimbursement.process?.status === 'CHANGES_REQUESTED'">
      <div v-if="reimbursement.process?.mentorProcessedComments" class="px-5 py-3 bg-amber-50 border-b border-amber-100 text-sm text-amber-800">
        <span class="font-semibold">Changes requested:</span> {{ reimbursement.process.mentorProcessedComments }}
      </div>
      <div v-if="reimbursement.process?.adminProcessedComments" class="px-5 py-3 bg-amber-50 border-b border-amber-100 text-sm text-amber-800">
        <span class="font-semibold">Admin comment:</span> {{ reimbursement.process.adminProcessedComments }}
      </div>
    </template>

    <!-- Expanded items -->
    <div v-if="expanded" class="px-5 py-3 space-y-2 border-b border-[#F0F0F0] bg-[#FAFAFA]">
      <div
        v-for="item in reimbursement.items"
        :key="item.itemID"
        class="text-sm text-[#5A5A5A]"
      >
        <div class="flex justify-between">
          <span>{{ item.description }} &times; {{ item.quantity }} ({{ item.vendor?.vendorName }})</span>
          <span>${{ (item.quantity * item.unitPrice).toFixed(2) }}</span>
        </div>
        <div class="text-xs">
          <template v-if="item.category">
            {{ item.category }}<template v-if="item.otherCategoryDescription"> ({{ item.otherCategoryDescription }})</template> &bull;
          </template>
          Purchased {{ formatDate(item.receiptDate) }}
          <template v-if="item.upload"> &bull; Receipt: {{ item.upload.attachmentName }}</template>
        </div>
        <div v-if="item.justification" class="text-xs italic mt-0.5">
          Justification: {{ item.justification }}
        </div>
      </div>
      <div class="text-right font-semibold text-sm text-[#1A1A1A]">
        Total: ${{ reimbursement.expense?.toFixed(2) }}
      </div>
      <div v-if="reimbursement.additionalInfo" class="text-xs text-[#5A5A5A]">
        Notes: {{ reimbursement.additionalInfo }}
      </div>
    </div>

    <!-- Actions -->
    <div class="px-5 py-3 flex gap-2 flex-wrap border-t border-[#F0F0F0] bg-[#FAFAFA]">
      <template v-if="userRole === 'ADMIN'">
        <UButton size="sm" class="bg-[#154734] text-white" @click="$emit('process', reimbursement)">Mark as Processed</UButton>
        <UButton size="sm" variant="outline" class="border-amber-500 text-amber-600" @click="$emit('request-changes', reimbursement)">Request Changes</UButton>
        <UButton size="sm" variant="outline" class="border-red-500 text-red-500" @click="$emit('reject', reimbursement)">Reject</UButton>
      </template>
      <template v-else-if="userRole === 'MENTOR'">
        <UButton size="sm" class="bg-[#154734] text-white" @click="$emit('approve', reimbursement)">Approve</UButton>
        <UButton size="sm" variant="outline" class="border-amber-500 text-amber-600" @click="$emit('request-changes', reimbursement)">Request Changes</UButton>
        <UButton size="sm" variant="outline" class="border-red-500 text-red-500" @click="$emit('reject', reimbursement)">Reject</UButton>
      </template>
      <template v-else>
        <UButton
          v-if="reimbursement.process?.status === 'UNDER_REVIEW'"
          size="sm"
          variant="outline"
          class="border-red-500 text-red-500"
          @click="$emit('cancel', reimbursement)"
        >
          Cancel
        </UButton>
        <UButton
          v-if="reimbursement.process?.status === 'REJECTED' || reimbursement.process?.status === 'CHANGES_REQUESTED'"
          size="sm"
          class="bg-[#E87722] text-white"
          @click="$emit('resubmit', reimbursement)"
        >
          Resubmit
        </UButton>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Role } from '~/shared/constants/roles'

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
      adminProcessedComments?: string | null
    }
    items?: Array<{
      itemID: number
      description: string
      receiptDate: string
      quantity: number
      unitPrice: number
      category?: string
      otherCategoryDescription?: string | null
      justification?: string | null
      vendor?: { vendorName: string }
      upload?: { attachmentName: string } | null
    }>
  }
  userRole: Role
}>()

defineEmits(['approve', 'reject', 'process', 'cancel', 'request-changes', 'resubmit'])

const expanded = ref(false)

function formatDate(d: string | null | undefined) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-US')
}
</script>

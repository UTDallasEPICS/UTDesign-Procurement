<template>
  <div class="bg-white border border-[#E0E0E0] rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
    <!-- Header -->
    <div class="px-5 py-4 flex items-center justify-between border-b border-[#F0F0F0]">
      <div>
        <p class="font-semibold text-[#1A1A1A]">{{ request.project?.projectTitle }}</p>
        <p class="text-xs text-[#5A5A5A]">
          <template v-if="userRole !== 'STUDENT'">
            by {{ request.student?.firstName }} {{ request.student?.lastName }} &bull;
          </template>
          <template v-if="userRole === 'MENTOR'">Needed by {{ formatDate(request.dateNeeded) }}</template>
          <template v-else-if="userRole === 'ADMIN'">#{{ request.requestID }} &bull; Approved {{ formatDate(request.dateApproved) }}</template>
          <template v-else>Submitted {{ formatDate(request.dateSubmitted) }}</template>
        </p>
      </div>
      <div class="flex items-center gap-3">
        <StatusBadge :status="request.process?.status ?? ''" />
        <button class="text-xs text-[#E87722]" @click="expanded = !expanded">
          {{ expanded ? 'Collapse' : 'Expand' }}
        </button>
      </div>
    </div>

    <!-- Rejection comments (student view) -->
    <template v-if="userRole === 'STUDENT' && request.process?.status === 'REJECTED'">
      <div v-if="request.process?.mentorProcessedComments" class="px-5 py-3 bg-red-50 border-b border-red-100 text-sm text-red-700">
        <span class="font-semibold">Rejection reason:</span> {{ request.process.mentorProcessedComments }}
      </div>
      <div v-if="request.process?.adminProcessedComments" class="px-5 py-3 bg-red-50 border-b border-red-100 text-sm text-red-700">
        <span class="font-semibold">Admin comment:</span> {{ request.process.adminProcessedComments }}
      </div>
    </template>

    <!-- Change-request comments (student view) -->
    <template v-if="userRole === 'STUDENT' && request.process?.status === 'CHANGES_REQUESTED'">
      <div v-if="request.process?.mentorProcessedComments" class="px-5 py-3 bg-amber-50 border-b border-amber-100 text-sm text-amber-800">
        <span class="font-semibold">Changes requested:</span> {{ request.process.mentorProcessedComments }}
      </div>
      <div v-if="request.process?.adminProcessedComments" class="px-5 py-3 bg-amber-50 border-b border-amber-100 text-sm text-amber-800">
        <span class="font-semibold">Admin comment:</span> {{ request.process.adminProcessedComments }}
      </div>
    </template>

    <!-- Expanded items -->
    <div v-if="expanded" class="px-5 py-3 space-y-3 border-b border-[#F0F0F0] bg-[#FAFAFA]">
      <div v-for="item in request.items" :key="item.itemID" class="text-sm">
        <div class="flex justify-between">
          <span class="font-medium">{{ item.description }} &times; {{ item.quantity }}</span>
          <span class="text-[#5A5A5A]">${{ (item.quantity * item.unitPrice).toFixed(2) }}</span>
        </div>
        <div class="text-xs text-[#5A5A5A]">
          <template v-if="item.category">
            {{ item.category }}<template v-if="item.otherCategoryDescription"> ({{ item.otherCategoryDescription }})</template> &bull;
          </template>
          Vendor: {{ item.vendor?.vendorName }} &bull; Part #: {{ item.partNumber }} &bull;
          <a :href="item.url" target="_blank" class="text-[#E87722] hover:underline">Link</a>
        </div>
        <div v-if="item.justification" class="text-xs text-[#5A5A5A] italic mt-0.5">
          Justification: {{ item.justification }}
        </div>
      </div>

      <!-- Orders section (admin only) -->
      <div v-if="userRole === 'ADMIN'">
        <h4 class="text-sm font-semibold text-[#1A1A1A] mb-1">Orders</h4>
        <div v-if="!request.orders?.length" class="text-sm text-[#5A5A5A]">No orders yet.</div>
        <div v-for="order in request.orders" :key="order.orderID" class="text-sm text-[#5A5A5A]">
          #{{ order.orderNumber }} &bull; {{ order.trackingInfo }} &bull; ${{ order.shippingCost?.toFixed(2) }} shipping
        </div>
      </div>

      <!-- Tracking info (student view) -->
      <div v-if="userRole === 'STUDENT' && request.orders?.some(o => o.trackingInfo)">
        <h4 class="text-sm font-semibold text-[#1A1A1A] mb-1">Tracking</h4>
        <div v-for="order in request.orders" :key="order.orderID" class="text-sm text-[#5A5A5A]">
          <template v-if="order.trackingInfo">#{{ order.orderNumber }} &bull; {{ order.trackingInfo }}</template>
        </div>
      </div>

      <div class="text-right font-semibold text-sm text-[#1A1A1A]">
        Total: ${{ request.expense?.toFixed(2) }}
      </div>
      <div v-if="request.additionalInfo" class="text-xs text-[#5A5A5A]">
        Notes: {{ request.additionalInfo }}
      </div>
    </div>

    <!-- Actions -->
    <div class="px-5 py-3 flex gap-2 flex-wrap border-t border-[#F0F0F0] bg-[#FAFAFA]">
      <template v-if="userRole === 'ADMIN'">
        <UButton
          v-if="request.process?.status === 'APPROVED'"
          size="sm"
          class="bg-[#154734] text-white"
          @click="$emit('process', request)"
        >
          Mark as Ordered
        </UButton>
        <UButton
          v-if="request.process?.status === 'ORDERED'"
          size="sm"
          class="bg-[#00695C] text-white"
          @click="$emit('receive', request)"
        >
          Mark as Received
        </UButton>
        <UButton
          v-if="request.process?.status === 'APPROVED'"
          size="sm"
          variant="outline"
          class="border-amber-500 text-amber-600"
          @click="$emit('request-changes', request)"
        >
          Request Changes
        </UButton>
        <UButton
          v-if="request.process?.status === 'APPROVED'"
          size="sm"
          variant="outline"
          class="border-red-500 text-red-500"
          @click="$emit('reject', request)"
        >
          Reject
        </UButton>
        <a :href="`/api/admin/request/${request.requestID}/export`" download>
          <UButton size="sm" variant="outline" class="border-[#154734] text-[#154734]">Export</UButton>
        </a>
      </template>
      <template v-else-if="userRole === 'MENTOR'">
        <UButton size="sm" class="bg-[#154734] text-white" @click="$emit('approve', request)">Approve</UButton>
        <UButton size="sm" variant="outline" class="border-amber-500 text-amber-600" @click="$emit('request-changes', request)">Request Changes</UButton>
        <UButton size="sm" variant="outline" class="border-red-500 text-red-500" @click="$emit('reject', request)">Reject</UButton>
      </template>
      <template v-else>
        <UButton
          v-if="request.process?.status === 'UNDER_REVIEW'"
          size="sm"
          variant="outline"
          class="border-red-500 text-red-500"
          @click="$emit('cancel', request)"
        >
          Cancel
        </UButton>
        <NuxtLink
          v-if="request.process?.status === 'REJECTED' || request.process?.status === 'CHANGES_REQUESTED'"
          :to="`/request-form?edit=${request.requestID}`"
        >
          <UButton size="sm" class="bg-[#E87722] text-white">Edit &amp; Resubmit</UButton>
        </NuxtLink>
        <UButton
          v-if="request.process?.status === 'ORDERED' && !request.trackingRequested && !request.orders?.some(o => o.trackingInfo)"
          size="sm"
          variant="outline"
          class="border-[#1565C0] text-[#1565C0]"
          @click="$emit('request-tracking', request)"
        >
          Request Tracking Info
        </UButton>
        <span
          v-if="request.process?.status === 'ORDERED' && request.trackingRequested && !request.orders?.some(o => o.trackingInfo)"
          class="text-xs text-[#5A5A5A] self-center"
        >
          Tracking info requested
        </span>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Role } from '~/shared/constants/roles'

defineProps<{
  request: {
    requestID: number
    dateNeeded: string
    dateSubmitted: string
    dateApproved?: string | null
    expense?: number
    additionalInfo?: string | null
    trackingRequested?: boolean
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
      justification?: string
      quantity: number
      unitPrice: number
      url: string
      partNumber: string
      category?: string
      otherCategoryDescription?: string | null
      vendor?: { vendorName: string }
    }>
    orders?: Array<{
      orderID: number
      orderNumber: string
      trackingInfo: string
      shippingCost: number
    }>
  }
  userRole: Role
}>()

defineEmits(['approve', 'reject', 'process', 'receive', 'cancel', 'request-changes', 'request-tracking'])

const expanded = ref(false)

function formatDate(d: string | null | undefined) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-US')
}
</script>

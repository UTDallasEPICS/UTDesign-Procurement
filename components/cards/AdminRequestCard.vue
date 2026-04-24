<template>
  <div class="bg-white border border-[#D9D9D9] rounded-xl overflow-hidden">
    <div class="px-5 py-4 flex items-center justify-between border-b border-[#D9D9D9]">
      <div>
        <p class="font-semibold text-[#1A1A1A]">{{ request.project?.projectTitle }}</p>
        <p class="text-xs text-[#5A5A5A]">
          #{{ request.requestID }} &bull;
          by {{ request.student?.firstName }} {{ request.student?.lastName }} &bull;
          Approved {{ formatDate(request.dateApproved) }}
        </p>
      </div>
      <div class="flex items-center gap-3">
        <StatusBadge :status="request.process?.status ?? ''" />
        <button class="text-xs text-[#E87722]" @click="expanded = !expanded">
          {{ expanded ? 'Collapse' : 'Expand' }}
        </button>
      </div>
    </div>

    <div v-if="expanded" class="p-5 space-y-4">
      <!-- Items -->
      <div>
        <h4 class="text-sm font-semibold text-[#1A1A1A] mb-2">Items</h4>
        <div class="space-y-1">
          <div v-for="item in request.items" :key="item.itemID" class="text-sm flex justify-between text-[#5A5A5A]">
            <span>{{ item.description }} &times; {{ item.quantity }} ({{ item.vendor?.vendorName }})</span>
            <span>${{ (item.quantity * item.unitPrice).toFixed(2) }}</span>
          </div>
        </div>
      </div>

      <!-- Orders -->
      <div>
        <h4 class="text-sm font-semibold text-[#1A1A1A] mb-2">Orders</h4>
        <div v-if="!request.orders?.length" class="text-sm text-[#5A5A5A]">No orders yet.</div>
        <div v-for="order in request.orders" :key="order.orderID" class="text-sm text-[#5A5A5A] mb-1">
          #{{ order.orderNumber }} &bull; {{ order.trackingInfo }} &bull; ${{ order.shippingCost?.toFixed(2) }} shipping
        </div>
      </div>

      <!-- Total -->
      <div class="text-right font-semibold text-sm">Total: ${{ request.expense?.toFixed(2) }}</div>
    </div>

    <!-- Actions -->
    <div class="px-5 py-3 flex gap-2 border-t border-[#D9D9D9]">
      <UButton
        size="sm"
        class="bg-[#154734] text-white"
        @click="$emit('process', request)"
      >
        Mark as Ordered
      </UButton>
      <UButton
        size="sm"
        variant="outline"
        class="border-red-500 text-red-500"
        @click="$emit('reject', request)"
      >
        Reject
      </UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ request: any }>()
defineEmits(['process', 'reject', 'refresh'])
const expanded = ref(false)
function formatDate(d: string) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-US')
}
</script>

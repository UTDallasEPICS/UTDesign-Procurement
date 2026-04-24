<template>
  <div class="bg-white border border-[#D9D9D9] rounded-xl overflow-hidden">
    <div class="px-5 py-4 flex items-center justify-between border-b border-[#D9D9D9]">
      <div>
        <p class="font-semibold text-[#1A1A1A]">{{ request.project?.projectTitle }}</p>
        <p class="text-xs text-[#5A5A5A]">
          by {{ request.student?.firstName }} {{ request.student?.lastName }} &bull;
          Needed by {{ formatDate(request.dateNeeded) }}
        </p>
      </div>
      <div class="flex items-center gap-3">
        <StatusBadge :status="request.process?.status ?? ''" />
        <button class="text-xs text-[#E87722]" @click="expanded = !expanded">
          {{ expanded ? 'Hide' : 'Details' }}
        </button>
      </div>
    </div>

    <div v-if="expanded" class="px-5 py-3 space-y-2 border-b border-[#D9D9D9]">
      <div
        v-for="item in request.items"
        :key="item.itemID"
        class="text-sm"
      >
        <div class="flex justify-between">
          <span class="font-medium">{{ item.description }}</span>
          <span class="text-[#5A5A5A]">${{ (item.quantity * item.unitPrice).toFixed(2) }}</span>
        </div>
        <div class="text-xs text-[#5A5A5A]">
          Vendor: {{ item.vendor?.vendorName }} &bull; Qty: {{ item.quantity }} &bull;
          <a :href="item.url" target="_blank" class="text-[#E87722] hover:underline">Link</a>
        </div>
      </div>
      <div class="text-right font-semibold text-sm text-[#1A1A1A]">
        Total: ${{ request.expense?.toFixed(2) }}
      </div>
      <div v-if="request.additionalInfo" class="text-xs text-[#5A5A5A] mt-1">
        Notes: {{ request.additionalInfo }}
      </div>
    </div>

    <!-- Actions -->
    <div class="px-5 py-3 flex gap-2">
      <UButton
        size="sm"
        class="bg-[#154734] text-white"
        @click="$emit('approve', request)"
      >
        Approve
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
defineEmits(['approve', 'reject'])
const expanded = ref(false)
function formatDate(d: string) { return new Date(d).toLocaleDateString('en-US') }
</script>

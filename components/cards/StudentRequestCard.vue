<template>
  <div class="bg-white border border-[#D9D9D9] rounded-xl overflow-hidden">
    <!-- Header -->
    <div class="px-5 py-4 flex items-center justify-between border-b border-[#D9D9D9]">
      <div>
        <p class="font-semibold text-[#1A1A1A]">{{ request.project?.projectTitle }}</p>
        <p class="text-xs text-[#5A5A5A]">Submitted {{ formatDate(request.dateSubmitted) }}</p>
      </div>
      <div class="flex items-center gap-3">
        <StatusBadge :status="request.process?.status ?? ''" />
        <button class="text-xs text-[#E87722]" @click="expanded = !expanded">
          {{ expanded ? 'Hide' : 'Details' }}
        </button>
      </div>
    </div>

    <!-- Rejection comment -->
    <div
      v-if="request.process?.status === 'REJECTED' && request.process?.mentorProcessedComments"
      class="px-5 py-3 bg-red-50 border-b border-red-100 text-sm text-red-700"
    >
      <span class="font-semibold">Rejection reason:</span> {{ request.process.mentorProcessedComments }}
    </div>
    <div
      v-if="request.process?.status === 'REJECTED' && request.process?.adminProcessedComments"
      class="px-5 py-3 bg-red-50 border-b border-red-100 text-sm text-red-700"
    >
      <span class="font-semibold">Admin comment:</span> {{ request.process.adminProcessedComments }}
    </div>

    <!-- Items (expanded) -->
    <div v-if="expanded" class="px-5 py-3 space-y-2 border-b border-[#D9D9D9]">
      <div
        v-for="item in request.items"
        :key="item.itemID"
        class="flex justify-between text-sm text-[#5A5A5A]"
      >
        <span>{{ item.description }} &times; {{ item.quantity }}</span>
        <span>${{ (item.quantity * item.unitPrice).toFixed(2) }}</span>
      </div>
      <div class="text-right font-semibold text-sm text-[#1A1A1A]">
        Total: ${{ request.expense?.toFixed(2) }}
      </div>
    </div>

    <!-- Actions -->
    <div
      v-if="['UNDER_REVIEW', 'REJECTED'].includes(request.process?.status ?? '')"
      class="px-5 py-3 flex gap-2"
    >
      <UButton
        v-if="request.process?.status === 'UNDER_REVIEW'"
        size="sm"
        variant="outline"
        class="border-red-500 text-red-500"
        @click="$emit('cancel', request)"
      >
        Cancel
      </UButton>
      <NuxtLink v-if="request.process?.status === 'REJECTED'" :to="`/request-form?edit=${request.requestID}`">
        <UButton size="sm" class="bg-[#E87722] text-white">Edit & Resubmit</UButton>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ request: any }>()
defineEmits(['cancel', 'refresh'])

const expanded = ref(false)

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-US')
}
</script>

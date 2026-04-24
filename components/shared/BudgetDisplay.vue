<template>
  <div class="bg-white border border-[#D9D9D9] rounded-lg p-4 flex gap-6">
    <div class="text-center">
      <p class="text-xs text-[#5A5A5A] uppercase tracking-wide">Starting Budget</p>
      <p class="text-lg font-bold text-[#1A1A1A]">${{ formatAmount(startingBudget) }}</p>
    </div>
    <div class="w-px bg-[#D9D9D9]" />
    <div class="text-center">
      <p class="text-xs text-[#5A5A5A] uppercase tracking-wide">Used</p>
      <p class="text-lg font-bold text-[#C75B12]">${{ formatAmount(used) }}</p>
    </div>
    <div class="w-px bg-[#D9D9D9]" />
    <div class="text-center">
      <p class="text-xs text-[#5A5A5A] uppercase tracking-wide">Remaining</p>
      <p class="text-lg font-bold" :class="remaining >= 0 ? 'text-[#154734]' : 'text-red-600'">
        ${{ formatAmount(remaining) }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  startingBudget: number
  used: number
}>()

const remaining = computed(() => props.startingBudget - props.used)

function formatAmount(n: number) {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}
</script>

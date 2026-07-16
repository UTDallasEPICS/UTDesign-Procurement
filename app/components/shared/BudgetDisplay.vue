<template>
  <div class="app-surface rounded-3xl px-4 py-4 sm:px-5 sm:py-5">
    <div class="flex flex-wrap items-center gap-4">
      <div class="min-w-[120px]">
        <p class="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">Starting</p>
        <p class="mt-1 text-lg font-black tracking-tight text-slate-900">${{ formatAmount(startingBudget) }}</p>
      </div>
      <div class="h-10 w-px bg-slate-200" />
      <div class="min-w-[100px]">
        <p class="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">Used</p>
        <p class="mt-1 text-lg font-black tracking-tight text-[#d86e18]">${{ formatAmount(used) }}</p>
      </div>
      <div class="h-10 w-px bg-slate-200" />
      <div class="min-w-[120px]">
        <p class="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">Remaining</p>
        <p class="mt-1 text-lg font-black tracking-tight" :class="remaining >= 0 ? 'text-[#0f4a37]' : 'text-red-600'">
          ${{ formatAmount(remaining) }}
        </p>
      </div>
    </div>
    <div class="mt-4 h-2 overflow-hidden rounded-full bg-slate-200">
      <div
        class="h-full rounded-full transition-all"
        :class="remaining >= 0 ? 'bg-gradient-to-r from-[#0f4a37] to-[#d86e18]' : 'bg-red-500'"
        :style="{ width: progressWidth }"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  startingBudget: number
  used: number
}>()

const remaining = computed(() => props.startingBudget - props.used)
const progressWidth = computed(() => `${Math.min(100, Math.max(0, (props.used / Math.max(props.startingBudget, 1)) * 100))}%`)

function formatAmount(n: number) {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}
</script>

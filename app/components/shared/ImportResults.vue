<template>
  <div class="space-y-2">
    <div class="text-sm font-semibold text-[#1A1A1A]">
      {{ result.total }} rows &bull;
      <span class="text-[#154734]">{{ result.created }} created</span> &bull;
      <span class="text-[#5A5A5A]">{{ result.skipped }} skipped</span> &bull;
      <span :class="result.errors ? 'text-red-600' : 'text-[#5A5A5A]'">{{ result.errors }} errors</span>
    </div>
    <div class="max-h-48 overflow-y-auto border border-[#E0E0E0] rounded-lg divide-y divide-[#F0F0F0]">
      <div
        v-for="(r, i) in result.results"
        :key="i"
        class="px-3 py-1.5 text-xs flex items-center gap-2"
        :class="r.status === 'error' ? 'bg-red-50 text-red-700' : r.status === 'skipped' ? 'bg-[#FAFAFA] text-[#5A5A5A]' : 'text-[#1A1A1A]'"
      >
        <span class="font-mono shrink-0">Row {{ r.row }}</span>
        <span class="font-semibold shrink-0 uppercase">{{ r.status }}</span>
        <span v-if="r.projectNum" class="shrink-0">{{ r.projectNum }}</span>
        <span v-if="r.email" class="shrink-0">{{ r.email }}</span>
        <span class="truncate">{{ r.detail }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  result: {
    total: number
    created: number
    skipped: number
    errors: number
    results: Array<{ row: number; status: string; detail: string; projectNum?: string; email?: string }>
  }
}>()
</script>

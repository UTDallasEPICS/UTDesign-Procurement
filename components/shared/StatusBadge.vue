<template>
  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold" :style="style">
    {{ label }}
  </span>
</template>

<script setup lang="ts">
const props = defineProps<{ status: string }>()

const STATUS_MAP: Record<string, { bg: string; color: string; label: string }> = {
  UNDER_REVIEW: { bg: '#FFF3E0', color: '#E87722', label: 'Under Review' },
  APPROVED:     { bg: '#E8F5E9', color: '#154734', label: 'Approved' },
  REJECTED:     { bg: '#FFEBEE', color: '#C62828', label: 'Rejected' },
  ORDERED:      { bg: '#E3F2FD', color: '#1565C0', label: 'Ordered' },
  RECEIVED:     { bg: '#E0F2F1', color: '#00695C', label: 'Received' },
  PROCESSED:    { bg: '#F3E5F5', color: '#6A1B9A', label: 'Processed' },
  DRAFT:        { bg: '#F5F5F5', color: '#5A5A5A', label: 'Draft' },
  CANCELLED:    { bg: '#ECEFF1', color: '#455A64', label: 'Cancelled' },
}

const config = computed(() => STATUS_MAP[props.status] ?? { bg: '#F5F5F5', color: '#5A5A5A', label: props.status })
const style = computed(() => ({ backgroundColor: config.value.bg, color: config.value.color }))
const label = computed(() => config.value.label)
</script>

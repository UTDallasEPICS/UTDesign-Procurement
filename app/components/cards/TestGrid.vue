<script setup lang="ts" generic="T">
import type { TableColumn } from '@nuxt/ui'

interface Props {
  title: string
  subtitle?: string
  rows: T[]
  columns: TableColumn<T>[]
  footerLeft?: string
  footerRight?: string
}

defineProps<Props>()

const emit = defineEmits<{
  select: [row: T]
}>()

function onSelect(row: T) {
  emit('select', row)
}
</script>

<template>
  <div
    class="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_2px_8px_rgba(15,23,42,0.08)]"
  >
    <!-- Card Header -->
    <div
      v-if="title || subtitle"
      class="flex items-end justify-between px-5 py-4"
    >
      <div>
        <h2 class="text-[15px] font-semibold text-slate-900">
          {{ title }}
        </h2>

        <p
          v-if="subtitle"
          class="mt-1 text-[12px] text-slate-500"
        >
          {{ subtitle }}
        </p>
      </div>

      <slot name="action" />
    </div>

    <!-- Table -->
    <UTable
      :data="rows"
      :columns="columns"
      :ui="{
        root: 'w-full',
        base: 'text-[13px]',
        thead: 'bg-white',
        tbody: 'divide-y divide-slate-100',
        tr: 'cursor-pointer transition-colors hover:bg-slate-50/80',
        th: 'h-[45px] border-b border-slate-200 px-5 py-0 text-[10px] font-medium tracking-[0.08em] text-slate-500',
        td: 'h-[57px] px-5 py-0 text-[13px] text-slate-800'
      }"
      @select="onSelect"
    >
      <!-- Allow parent to customize any cell -->
      <template
        v-for="column in columns"
        :key="column.accessorKey"
        #[`${column.accessorKey}-cell`]="{ row }"
      >
        <slot
          :name="`${column.accessorKey}-cell`"
          :row="row.original"
          :value="row.original[column.accessorKey]"
        >
          {{ row.original[column.accessorKey] }}
        </slot>
      </template>
    </UTable>
  </div>
</template>
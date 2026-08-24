<script setup lang="ts" generic="T">
import type { TableColumn } from '@nuxt/ui'
import type { Column, SortingState } from '@tanstack/vue-table'
import { h, ref } from 'vue'

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
  select: [row: T | null]
}>()

const sorting = ref<SortingState>([])
const selectedRow = ref<any>(null)

function onSelect(e: Event, row: any) {
  if (selectedRow.value && selectedRow.value !== row) {
    selectedRow.value.toggleSelected(false)
  }

  row.toggleSelected(!row.getIsSelected())

  selectedRow.value = row.getIsSelected() ? row : null

  emit('select', selectedRow.value?.original ?? null)
}

function getHeader(column: Column<T, unknown>, label: string) {
  const isSorted = column.getIsSorted()

  function toggleSort() {
    if (isSorted === false) {
      column.toggleSorting(false)
    } else if (isSorted === 'asc') {
      column.toggleSorting(true)
    } else {
      column.clearSorting()
    }
  }

  return h(
    UButton,
    {
      color: 'neutral',
      variant: 'ghost',
      class: '-mx-2.5',
      'aria-label': `Sort ${label}`,
      onClick: toggleSort
    },
    () => [
      h('span', label),
      h(UIcon, {
        name:
          isSorted === 'asc'
            ? 'i-lucide-chevron-up'
            : isSorted === 'desc'
              ? 'i-lucide-chevron-down'
              : 'i-lucide-chevrons-up-down',
        class: 'ml-1 size-4 text-slate-400'
      })
    ]
  )
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
      v-model:sorting="sorting"
      sticky
      class="max-h-[500px]"
      :data="rows"
      :columns="columns"
      :ui="{
        root: 'w-full',
        base: 'text-[13px]',
        thead: 'bg-white',
        tbody: 'divide-y divide-slate-100',
        tr: 'group cursor-pointer transition-colors odd:bg-white even:bg-slate-100 data-[selected=true]:bg-slate-200',
        th: 'h-[45px] border-b border-slate-200 px-5 py-0 text-[15px] font-medium tracking-[0.08em] text-slate-500',
        td: 'h-[57px] px-5 py-0 text-[13px] text-slate-800 group-hover:bg-slate-300'
      }"
      @select="onSelect"
    >
      <!-- Sortable headers -->
      <template
        v-for="column in columns"
        :key="column.accessorKey"
        #[`${column.accessorKey}-header`]="{ column: tableColumn }"
      >
        <component
          :is="
            getHeader(
              tableColumn,
              typeof column.header === 'string'
                ? column.header
                : String(column.accessorKey)
            )
          "
        />
      </template>

      <!-- Cells -->
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
          <template
            v-if="
              typeof row.original[column.accessorKey] === 'boolean'
            "
          >
            <div class="flex items-center justify-left">
              <UIcon
                :name="
                  row.original[column.accessorKey]
                    ? 'i-lucide-check'
                    : 'i-lucide-x'
                "
                :class="
                  row.original[column.accessorKey]
                    ? 'text-green-600'
                    : 'text-red-600'
                "
                class="size-5"
              />
            </div>
          </template>

          <template v-else>
            {{ row.original[column.accessorKey] }}
          </template>
        </slot>
      </template>
    </UTable>
  </div>
</template>
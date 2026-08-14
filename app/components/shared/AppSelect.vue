<template>
  <label class="block space-y-2">
    <span v-if="label" class="text-sm font-semibold text-slate-800">
      {{ label }}<span v-if="required" class="text-[#C75B12]"> *</span>
    </span>

    <div class="relative">
      <input
        v-model="search"
        :disabled="disabled"
        :placeholder="placeholder"
        :required="required"
        class="app-select w-full"
        @focus="open = true"
        @keydown.escape="open = false"
      />

      <div
        v-if="open"
        class="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-white shadow-lg"
      >
        <button
          v-for="item in filteredItems"
          :key="String(item.value)"
          type="button"
          :disabled="item.disabled"
          class="block w-full px-3 py-2 text-left hover:bg-slate-100 disabled:opacity-50"
          @mousedown.prevent="selectItem(item)"
        >
          {{ item.label }}
        </button>

        <div
          v-if="filteredItems.length === 0"
          class="px-3 py-2 text-sm text-slate-500"
        >
          No results
        </div>
      </div>
    </div>

    <p v-if="hint" class="text-xs text-slate-500">
      {{ hint }}
    </p>
  </label>
</template>

<script setup lang="ts">
type SelectItem = {
  label: string
  value: string | number
  disabled?: boolean
}

const props = withDefaults(defineProps<{
  modelValue?: string | number | null
  items: Array<SelectItem | string>
  label?: string
  placeholder?: string
  hint?: string
  required?: boolean
  disabled?: boolean
}>(), {
  placeholder: 'Select one...',
  required: false,
  disabled: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const open = ref(false)
const search = ref('')

const normalizedItems = computed<SelectItem[]>(() =>
  props.items.map(item =>
    typeof item === 'string'
      ? { label: item, value: item }
      : item,
  ),
)

const selected = computed(() =>
  normalizedItems.value.find(
    item => String(item.value) === String(props.modelValue),
  ),
)

const filteredItems = computed(() => {
  const query = search.value.toLowerCase().trim()

  if (!query) {
    return normalizedItems.value
  }

  return normalizedItems.value.filter(item =>
    item.label.toLowerCase().includes(query),
  )
})

function selectItem(item: SelectItem) {
  emit('update:modelValue', String(item.value))
  search.value = item.label
  open.value = false
}

watch(
  () => props.modelValue,
  () => {
    if (selected.value) {
      search.value = selected.value.label
    }
  },
  { immediate: true },
)
</script>
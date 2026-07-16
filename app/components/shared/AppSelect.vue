<template>
  <label class="block space-y-2">
    <span v-if="label" class="text-sm font-semibold text-slate-800">
      {{ label }}<span v-if="required" class="text-[#C75B12]"> *</span>
    </span>
    <div class="relative">
      <select
        v-model="selected"
        :disabled="disabled"
        :required="required"
        class="app-select"
      >
        <option v-if="placeholder" disabled value="">
          {{ placeholder }}
        </option>
        <option
          v-for="item in normalizedItems"
          :key="String(item.value)"
          :value="String(item.value)"
          :disabled="item.disabled"
        >
          {{ item.label }}
        </option>
      </select>
      <div class="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-400">
        <UIcon name="i-lucide-chevron-down" class="h-4 w-4" />
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

const normalizedItems = computed<SelectItem[]>(() =>
  props.items.map(item => typeof item === 'string' ? { label: item, value: item } : item),
)

const selected = computed({
  get: () => String(props.modelValue ?? ''),
  set: value => emit('update:modelValue', String(value)),
})
</script>

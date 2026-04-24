<template>
  <div>
    <USelect
      v-model="selected"
      :items="vendorOptions"
      placeholder="Select vendor..."
      value-key="value"
      label-key="label"
    />
    <div v-if="selected === '__new__'" class="mt-2 space-y-2 border border-[#D9D9D9] rounded-lg p-3 bg-[#F4F4F4]">
      <p class="text-xs font-semibold text-[#5A5A5A] uppercase">New Vendor</p>
      <UInput v-model="newVendor.name" placeholder="Vendor name *" />
      <UInput v-model="newVendor.email" placeholder="Vendor email (optional)" />
      <UInput v-model="newVendor.url" placeholder="Vendor URL (optional)" />
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ modelValue: number | string | undefined }>()
const emit = defineEmits<{
  'update:modelValue': [value: number | string | undefined]
  'update:newVendor': [vendor: { name: string; email: string; url: string }]
}>()

const { data: vendors } = await useFetch<{ vendorID: number; vendorName: string }[]>('/api/vendor')

const newVendor = reactive({ name: '', email: '', url: '' })
watch(newVendor, v => emit('update:newVendor', { ...v }))

const vendorOptions = computed(() => [
  ...(vendors.value ?? []).map(v => ({ label: v.vendorName, value: v.vendorID })),
  { label: '+ Add new vendor', value: '__new__' },
])

const selected = computed({
  get: () => props.modelValue,
  set: v => emit('update:modelValue', v),
})
</script>

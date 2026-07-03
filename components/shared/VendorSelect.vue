<template>
  <div class="space-y-3">
    <AppSelect
      v-model="selected"
      :items="vendorOptions"
      label="Vendor"
      placeholder="Choose an approved vendor or add a new one"
      :hint="selected === '__new__'
        ? 'New vendors are created in PENDING status and must be approved later.'
        : 'Only approved vendors appear here.'"
    />

    <div v-if="selectedVendor" class="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4">
      <div class="flex items-center justify-between gap-3">
        <div>
          <p class="text-sm font-semibold text-emerald-950">{{ selectedVendor.vendorName }}</p>
          <p class="text-xs text-emerald-900/70">Approved vendor selected</p>
        </div>
        <span
          v-if="selectedVendor.isPreferred"
          class="rounded-full bg-emerald-600 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-white"
        >
          Preferred
        </span>
      </div>
    </div>

    <div v-if="selected === '__new__'" class="space-y-3 rounded-3xl border border-slate-200 bg-slate-50 p-4">
      <div>
        <p class="text-sm font-semibold text-slate-900">Add a new vendor</p>
        <p class="text-xs text-slate-500">Fill out the vendor name and optionally include contact details so admins can approve it later.</p>
      </div>
      <UInput v-model="newVendor.name" placeholder="Vendor name *" />
      <div class="grid gap-3 sm:grid-cols-2">
        <UInput v-model="newVendor.email" placeholder="Vendor email (optional)" />
        <UInput v-model="newVendor.url" placeholder="Vendor URL (optional)" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface VendorRecord {
  vendorID: number
  vendorName: string
  isPreferred?: boolean
}

const props = defineProps<{ modelValue: number | string | undefined }>()
const emit = defineEmits<{
  'update:modelValue': [value: number | string | undefined]
  'update:new-vendor': [vendor: { name: string; email: string; url: string }]
  'update:selected-vendor': [vendor: VendorRecord | null]
}>()

const { data: vendors } = await useFetch<VendorRecord[]>('/api/vendor')

const newVendor = reactive({ name: '', email: '', url: '' })
watch(newVendor, v => emit('update:new-vendor', { ...v }), { deep: true, immediate: true })

const vendorOptions = computed(() => [
  ...(vendors.value ?? []).map(v => ({
    label: v.isPreferred ? `${v.vendorName} • preferred` : v.vendorName,
    value: String(v.vendorID),
  })),
  { label: 'Add a new vendor', value: '__new__' },
])

const selected = computed({
  get: () => (props.modelValue == null ? '' : String(props.modelValue)),
  set: v => emit('update:modelValue', v),
})

const selectedVendor = computed(() =>
  selected.value && selected.value !== '__new__'
    ? (vendors.value?.find(x => String(x.vendorID) === String(selected.value)) ?? null)
    : null,
)

watch(selected, v => {
  emit('update:selected-vendor', v && v !== '__new__'
    ? (vendors.value?.find(x => String(x.vendorID) === String(v)) ?? null)
    : null)
}, { immediate: true })
</script>

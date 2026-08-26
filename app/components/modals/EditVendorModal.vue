<template>
  <div
    v-if="open"
    class="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4"
    @click.self="close"
  >
    <div
      class="w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl ring-1 ring-black/10"
    >
      <div class="space-y-2">
        <h3 class="text-xl font-bold text-gray-900">
          Edit Vendor
        </h3>

        <p class="text-sm leading-6 text-gray-600">
          Update the vendor's information and preferences.
        </p>
      </div>

      <div class="mt-5 flex flex-col gap-5 p-4">
        <UInput
          v-model="form.vendorName"
          placeholder="Vendor name *"
          :ui="{
            base: 'placeholder:text-gray-500 text-gray-900',
          }"  
        />

        <UInput
          v-model="form.vendorEmail"
          type="email"
          placeholder="Vendor email (optional)"
          :ui="{
            base: 'placeholder:text-gray-500 text-gray-900',
          }"  
        />

        <UInput
          v-model="form.vendorURL"
          type="url"
          placeholder="Vendor website (optional)"
          :ui="{
            base: 'placeholder:text-gray-500 text-gray-900',
          }"  
        />

        <UCheckbox
          v-model="form.isPreferred"
          label="Preferred vendor"
          description="Mark this vendor as a preferred vendor."
        />
      </div>

      <div
        v-if="error"
        class="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700"
      >
        {{ error }}
      </div>

      <div class="mt-6 flex justify-end gap-3">
        <UButton
          class="cursor-pointer"
          variant="ghost"
          @click="close"
        >
          Cancel
        </UButton>

        <UButton
          class="bg-[#154734] text-white hover:bg-[#103b2a]"
          :loading="saving"
          :disabled="!form.vendorName.trim()"
          @click="save"
        >
          Save Changes
        </UButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const open = defineModel<boolean>('open', {
  default: false,
})

const props = defineProps<{
  vendor: {
    vendorID: number
    vendorName: string
    vendorEmail?: string | null
    vendorURL?: string | null
    isPreferred?: boolean
  } | null
}>()

const emit = defineEmits<{
  saved: []
}>()

const form = reactive({
  vendorName: '',
  vendorEmail: '',
  vendorURL: '',
  isPreferred: false,
})

const saving = ref(false)
const error = ref('')

function populateForm() {
  if (!props.vendor) {
    resetForm()
    return
  }

  form.vendorName = props.vendor.vendorName ?? ''
  form.vendorEmail = props.vendor.vendorEmail ?? ''
  form.vendorURL = props.vendor.vendorURL ?? ''
  form.isPreferred = props.vendor.isPreferred ?? false

  error.value = ''
}

function resetForm() {
  form.vendorName = ''
  form.vendorEmail = ''
  form.vendorURL = ''
  form.isPreferred = false
  error.value = ''
}

async function save() {
  error.value = ''

  if (!form.vendorName.trim()) {
    error.value = 'Vendor name is required.'
    return
  }

  if (!props.vendor?.vendorID) {
    error.value = 'Vendor ID is missing.'
    return
  }

  saving.value = true

  try {
    await $fetch('/api/admin/edit', {
      method: 'PATCH',
      body: {
        type: 'vendor',
        id: props.vendor.vendorID,
        vendorName: form.vendorName.trim(),
        vendorEmail: form.vendorEmail.trim() || null,
        vendorURL: form.vendorURL.trim() || null,
        isPreferred: form.isPreferred,
      },
    })

    emit('saved')

    open.value = false
    resetForm()
  } catch (e: any) {
    console.error('EDIT VENDOR ERROR:', e)
    console.error('ERROR DATA:', e?.data)

    error.value =
      e?.data?.message ||
      e?.data?.statusMessage ||
      e?.message ||
      'Failed to update vendor.'
  } finally {
    saving.value = false
  }
}

function close() {
  open.value = false
  resetForm()
}

watch(open, (isOpen) => {
  if (isOpen) {
    populateForm()
  }
})

watch(
  () => props.vendor,
  () => {
    if (open.value) {
      populateForm()
    }
  },
  { deep: true }
)
</script>

<template>
  <div
    v-if="open"
    class="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4"
  >
    <div
      class="w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl ring-1 ring-black/10"
    >
      <div class="space-y-2">
        <h3 class="text-xl font-bold text-gray-900">
          Add Vendor
        </h3>

        <p class="text-sm leading-6 text-gray-600">
          Create a vendor manually so admins can manage vendors and associate
          them with requests and reimbursements.
        </p>
      </div>

      <div class="mt-5 space-y-4 p-4">
        <UInput
          v-model="form.vendorName"
          placeholder="Vendor name *"
        />

        <UInput
          v-model="form.vendorEmail"
          type="email"
          placeholder="Vendor email (optional)"
        />

        <UInput
          v-model="form.vendorURL"
          type="url"
          placeholder="Vendor website (optional)"
        />

          <UCheckbox 
            v-model="form.isPreferred"
            label="Preferred vendor" description=" Mark this vendor as a preferred vendor."
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
          Add Vendor
        </UButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const open = defineModel<boolean>('open', { default: false })

const emit = defineEmits(['saved'])

const form = reactive({
  vendorName: '',
  vendorEmail: '',
  vendorURL: '',
  isPreferred: false,
})

const saving = ref(false)
const error = ref('')

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

  saving.value = true

  try {
    await $fetch('/api/admin/add', {
      method: 'POST',
      body: {
        type: 'vendor',
        vendorName: form.vendorName.trim(),
        vendorEmail: form.vendorEmail.trim() || null,
        vendorURL: form.vendorURL.trim() || 'https://default.com',
        isPreferred: form.isPreferred,
      },
    })

    emit('saved')
    resetForm()
    open.value = false
  } catch (e: any) {
    error.value = e?.data?.message ?? 'Failed to add vendor.'
  } finally {
    saving.value = false
  }
}

function close() {
  resetForm()
  open.value = false
}

watch(open, (isOpen) => {
  if (!isOpen) {
    resetForm()
  }
})
</script>
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
          Add Project
        </h3>

        <p class="text-sm leading-6 text-gray-600">
          Create a project manually so admins can start assigning students
          and mentors immediately.
        </p>
      </div>

      <div class="mt-5 space-y-3">
        <div class="grid gap-3 sm:grid-cols-2">
          <UInput
            v-model="form.projectNum"
            placeholder="Project # *"
          />

  <UInput
    v-model="form.projectTitle"
    placeholder="Project title *"
  />
</div>

<div class="grid gap-3 sm:grid-cols-2">
  <UInput
    v-model="form.projectType"
    placeholder="Project type *"
  />

  <UInput
    v-model="form.sponsorCompany"
    placeholder="Sponsor company *"
  />
</div>

<div class="grid gap-3 sm:grid-cols-2">
  <UInput
    v-model="form.startingBudget"
    type="number"
    min="0"
    placeholder="Starting budget *"
  />

  <UInput
    v-model="form.costCenter"
    placeholder="Cost center (optional)"

  /> 
        </div>

        <UTextarea
          v-model="form.additionalInfo"
          placeholder="Additional info (optional)"
          :rows="3"
          class="w-full"
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
          class="bg-[#154734] text-white hover:bg-[#103b2a] cursor-pointer"
          :loading="saving"
          @click="save"
        >
          Add Project
        </UButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const open = defineModel<boolean>('open', { default: false })

const emit = defineEmits(['saved'])

const form = reactive({
  projectNum: '',
  projectTitle: '',
  projectType: '',
  sponsorCompany: '',
  startingBudget: '' as string | number,
  costCenter: '',
  additionalInfo: '',
})

const saving = ref(false)
const error = ref('')

async function save() {
  error.value = ''

  if (
    !form.projectNum ||
    !form.projectTitle ||
    !form.projectType ||
    !form.sponsorCompany ||
    !form.startingBudget
  ) {
    error.value = 'All required fields must be filled.'
    return
  }

  saving.value = true

  try {
    await $fetch('/api/admin/add', {
      method: 'POST',
      body: {
        type: 'project',
        ...form,
      },
    })

    emit('saved')
    open.value = false
  } catch (e: any) {
    error.value = e?.data?.message ?? 'Failed to add project.'
  } finally {
    saving.value = false
  }
}

function close() {
  open.value = false
}
</script>
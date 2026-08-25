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
          Edit Project
        </h3>

        <p class="text-sm leading-6 text-gray-600">
          Update the project information below.
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
            v-model.number="form.startingBudget"
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
          Save Changes
        </UButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const open = defineModel<boolean>('open', { default: false })

const props = defineProps<{
  project: {
    projectID: string | number
    projectNum: string
    projectTitle: string
    projectType: string
    sponsorCompany: string
    startingBudget: string | number
    costCenter?: string | null
    additionalInfo?: string | null
  } | null
}>()

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

function loadProject() {
  if (!props.project) return

  form.projectNum = props.project.projectNum ?? ''
  form.projectTitle = props.project.projectTitle ?? ''
  form.projectType = props.project.projectType ?? ''
  form.sponsorCompany = props.project.sponsorCompany ?? ''
  form.startingBudget = props.project.startingBudget ?? ''
  form.costCenter = props.project.costCenter ?? ''
  form.additionalInfo = props.project.additionalInfo ?? ''
}

watch(
  () => props.project,
  () => {
    loadProject()
  },
  { immediate: true }
)

watch(open, (isOpen) => {
  if (isOpen) {
    error.value = ''
    loadProject()
  }
})

async function save() {
  error.value = ''

  if (
    !form.projectNum ||
    !form.projectTitle ||
    !form.projectType ||
    !form.sponsorCompany ||
    form.startingBudget === '' ||
    form.startingBudget === null ||
    form.startingBudget === undefined
  ) {
    error.value = 'All required fields must be filled.'
    return
  }

  if (!props.project) {
    error.value = 'No project selected.'
    return
  }

  if (!props.project.projectID) {
    error.value = 'Project ID is missing.'
    return
  }

  saving.value = true

  try {
    await $fetch('/api/admin/edit', {
      method: 'PUT',
      body: {
        type: 'project',
        id: props.project.projectID,
        projectNum: form.projectNum,
        projectTitle: form.projectTitle,
        projectType: form.projectType,
        sponsorCompany: form.sponsorCompany,
        startingBudget: Number(form.startingBudget),
        costCenter: form.costCenter,
        additionalInfo: form.additionalInfo,
      },
    })

    emit('saved')
    open.value = false
  } catch (e: any) {
    console.error('EDIT PROJECT ERROR:', e)

    error.value =
      e?.data?.message ||
      e?.message ||
      'Failed to update project.'
  } finally {
    saving.value = false
  }
}

function close() {
  open.value = false
}
</script>

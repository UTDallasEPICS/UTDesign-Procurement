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
          Assign to Project
        </h3>

        <p v-if="user" class="text-sm leading-6 text-gray-600">
          Assign <strong>{{ user.firstName }} {{ user.lastName }}</strong>
          to an active project.
        </p>
      </div>

      <div class="mt-5">
        <AppSelect
          v-model="projectNum"
          :items="projectOptions"
          label="Project"
          placeholder="Choose a project"
          hint="This creates an active work assignment for the selected user."
          required
        />
      </div>

      <div
        v-if="error"
        class="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
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
          :disabled="!projectNum"
          @click="save"
        >
          Assign
        </UButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const open = defineModel<boolean>('open', { default: false })

const props = defineProps<{ user: any }>()
const emit = defineEmits(['saved'])

const { data: projects } = await useFetch('/api/project')

const projectOptions = computed(() =>
  (projects.value ?? []).map((p: any) => ({
    label: `#${p.projectNum} - ${p.projectTitle}`,
    value: p.projectNum,
  })),
)

const projectNum = ref('')
const saving = ref(false)
const error = ref('')

async function save() {
  if (!projectNum.value || !props.user) return

  saving.value = true
  error.value = ''

  try {
    await $fetch('/api/worksOn', {
      method: 'POST',
      body: {
        userID: props.user.userID,
        projectNum: projectNum.value,
      },
    })

    emit('saved')
    projectNum.value = ''
    open.value = false
  } catch (e: any) {
    error.value = e?.data?.message ?? 'Failed to assign.'
  } finally {
    saving.value = false
  }
}

function close() {
  projectNum.value = ''
  error.value = ''
  open.value = false
}
</script>
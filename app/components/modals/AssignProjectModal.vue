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

      <!-- Currently assigned projects -->
      <div class="mt-5">
        <h4 class="text-sm font-semibold text-gray-900">
          Currently Assigned
        </h4>

        <div
          v-if="loadingProjects"
          class="mt-2 text-sm text-gray-500"
        >
          Loading projects...
        </div>

        <div
          v-else-if="currentProjects.length === 0"
          
          class="mt-2 text-sm text-gray-500"
        >
        <pre> {{ currentProjects }} </pre>
        <pre> {{ projects.value }} </pre>

          No projects currently assigned.
        </div>

        <div v-else class="mt-2 space-y-2">
          <div
            v-for="project in currentProjects"
            :key="project.projectNum"
            class="flex items-center justify-between gap-3 rounded-lg bg-gray-50 px-3 py-2"
          >
            <div class="min-w-0 text-sm">
              <span class="font-medium text-gray-900">
                #{{ project.projectNum }}
              </span>

              <span class="text-gray-600">
                - {{ project.projectTitle }}
              </span>
            </div>

            <UButton
              size="sm"
              color="red"
              variant="ghost"
              class="shrink-0 cursor-pointer"
              :loading="unassigningProject === project.projectNum"
              @click="unassign(project)"
            >
              Unassign
            </UButton>
          </div>
        </div>
      </div>

      <!-- Assign another project -->
      <div class="mt-5">
        <AppSelect
          v-model="projectNum"
          :items="projectOptions"
          label="Add Another Project"
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

const currentProjects = ref<any[]>([])
const loadingProjects = ref(false)

const projectNum = ref('')
const saving = ref(false)
const error = ref('')

const unassigningProject = ref<string | number | null>(null)

const projectOptions = computed(() => {
  const assignedProjectNums = new Set(
    (currentProjects.value ?? []).map((project: any) =>
      String(project.projectNum),
    ),
  )

  return (projects.value ?? [])
    .filter(
      (project: any) =>
        !assignedProjectNums.has(String(project.projectNum)),
    )
    .map((project: any) => ({
      label: `#${project.projectNum} - ${project.projectTitle}`,
      value: project.projectNum,
    }))
})

async function loadCurrentProjects() {

  if (!props.user) {
    return
  }

  loadingProjects.value = true

  try {
    const userID = props.user.userID ?? props.user.id


    const result = await $fetch('/api/worksOn/currentProjects', {
      query: { userID },
    })


    currentProjects.value = result
  } catch (e: any) {

    error.value =
      e?.data?.message ?? 'Failed to load current projects.'

    currentProjects.value = []
  } finally {
    loadingProjects.value = false
  }
}


async function save() {
  if (!projectNum.value || !props.user) return

  saving.value = true
  error.value = ''

  try {
    await $fetch('/api/worksOn', {
      method: 'POST',
      body: {
        userID: props.user.userID ?? props.user.id,
        projectNum: projectNum.value,
      },
    })

    projectNum.value = ''

    await loadCurrentProjects()
    emit('saved')
  } catch (e: any) {
    error.value = e?.data?.message ?? 'Failed to assign.'
  } finally {
    saving.value = false
  }
}

async function unassign(project: any) {
  if (!props.user || !project) return

  unassigningProject.value = project.projectNum
  error.value = ''

  try {
    await $fetch('/api/admin/edit', {
      method: 'PATCH',
      body: {
        type: 'worksOn',
        userID: props.user.userID ?? props.user.id,
        projectNum: project.projectNum,
      },
    })

    await loadCurrentProjects()
    emit('saved')
  } catch (e: any) {
    error.value =
      e?.data?.message ?? 'Failed to unassign project.'
  } finally {
    unassigningProject.value = null
  }
}

function close() {
  projectNum.value = ''
  error.value = ''
  open.value = false
}

watch(
  () => [open.value, props.user?.userID, props.user?.id],
  ([isOpen, userID, id]) => {

    if (isOpen) {
      loadCurrentProjects()
    }
  },
  { immediate: true },
)




</script>
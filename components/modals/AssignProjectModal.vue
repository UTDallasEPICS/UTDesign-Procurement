<template>
  <UModal v-model:open="open">
    <template #content>
      <div class="p-6 space-y-5">
        <div>
          <h3 class="text-xl font-black tracking-tight text-slate-900">Assign to Project</h3>
          <p v-if="user" class="mt-1 text-sm text-slate-500">
            Assign <strong>{{ user.firstName }} {{ user.lastName }}</strong> to an active project.
          </p>
        </div>

        <AppSelect
          v-model="projectNum"
          :items="projectOptions"
          label="Project"
          placeholder="Choose a project"
          hint="This creates an active work assignment for the selected user."
          required
        />

        <div v-if="error" class="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {{ error }}
        </div>

        <div class="flex flex-wrap justify-end gap-3">
          <UButton variant="ghost" @click="close">Cancel</UButton>
          <UButton class="bg-[#154734] text-white" :loading="saving" @click="save">Assign</UButton>
        </div>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
const open = defineModel<boolean>('open', { default: false })
const props = defineProps<{ user: any }>()
const emit = defineEmits(['saved'])

const { data: projects } = await useFetch('/api/project')
const projectOptions = computed(() =>
  (projects.value ?? []).map((p: any) => ({ label: `#${p.projectNum} - ${p.projectTitle}`, value: p.projectNum })),
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
      body: { userID: props.user.userID, projectNum: projectNum.value },
    })
    emit('saved')
    open.value = false
  } catch (e: any) {
    error.value = e?.data?.message ?? 'Failed to assign.'
  } finally {
    saving.value = false
  }
}

function close() {
  open.value = false
}
</script>

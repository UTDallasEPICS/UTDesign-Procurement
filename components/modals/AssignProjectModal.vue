<template>
  <UModal v-model:open="open">
    <template #content>
      <div class="p-6 space-y-4">
        <h3 class="text-lg font-bold text-[#1A1A1A]">Assign to Project</h3>
        <p v-if="user" class="text-sm text-[#5A5A5A]">Assigning: <strong>{{ user.firstName }} {{ user.lastName }}</strong></p>
        <USelect
          v-model="projectNum"
          :items="projectOptions"
          value-key="value"
          label-key="label"
          placeholder="Select project..."
        />
        <div v-if="error" class="text-sm text-red-600">{{ error }}</div>
        <div class="flex gap-3 justify-end">
          <UButton variant="ghost" @click="open = false">Cancel</UButton>
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
  (projects.value ?? []).map((p: any) => ({ label: `${p.projectNum} — ${p.projectTitle}`, value: p.projectNum }))
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
</script>

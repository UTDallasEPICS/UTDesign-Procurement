<template>
  <UModal v-model:open="open">
    <template #content>
      <div class="p-6 space-y-4">
        <h3 class="text-lg font-bold text-[#1A1A1A]">Add Project</h3>
        <UInput v-model="form.projectNum" placeholder="Project # *" />
        <UInput v-model="form.projectTitle" placeholder="Project Title *" />
        <UInput v-model="form.projectType" placeholder="Type (Capstone, EPICS, etc.) *" />
        <UInput v-model="form.sponsorCompany" placeholder="Sponsor Company *" />
        <UInput v-model="form.startingBudget" type="number" placeholder="Starting Budget ($) *" />
        <UInput v-model="form.costCenter" placeholder="Cost Center (optional)" />
        <UTextarea v-model="form.additionalInfo" placeholder="Additional info (optional)" :rows="2" />
        <div v-if="error" class="text-sm text-red-600">{{ error }}</div>
        <div class="flex gap-3 justify-end">
          <UButton variant="ghost" @click="open = false">Cancel</UButton>
          <UButton class="bg-[#154734] text-white" :loading="saving" @click="save">Add Project</UButton>
        </div>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
const open = defineModel<boolean>('open', { default: false })
const emit = defineEmits(['saved'])

const form = reactive({ projectNum: '', projectTitle: '', projectType: '', sponsorCompany: '', startingBudget: '' as string | number, costCenter: '', additionalInfo: '' })
const saving = ref(false)
const error = ref('')

async function save() {
  error.value = ''
  if (!form.projectNum || !form.projectTitle || !form.projectType || !form.sponsorCompany || !form.startingBudget) {
    error.value = 'All required fields must be filled.'
    return
  }
  saving.value = true
  try {
    await $fetch('/api/admin/add', { method: 'POST', body: { type: 'project', ...form } })
    emit('saved')
    open.value = false
  } catch (e: any) {
    error.value = e?.data?.message ?? 'Failed to add project.'
  } finally {
    saving.value = false
  }
}
</script>

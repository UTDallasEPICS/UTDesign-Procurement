<template>
  <UModal v-model:open="open">
    <template #content>
      <div class="p-6 space-y-4">
        <h3 class="text-lg font-bold text-[#1A1A1A]">Add User</h3>
        <UInput v-model="form.firstName" placeholder="First Name *" />
        <UInput v-model="form.lastName" placeholder="Last Name *" />
        <UInput v-model="form.email" type="email" placeholder="UTD Email * (abc123456@utdallas.edu)" />
        <USelect
          v-model="form.roleID"
          :items="roles"
          value-key="value"
          label-key="label"
          placeholder="Role *"
        />
        <UInput v-model="form.projectNum" placeholder="Project # (optional)" />
        <div v-if="error" class="text-sm text-red-600">{{ error }}</div>
        <div class="flex gap-3 justify-end">
          <UButton variant="ghost" @click="open = false">Cancel</UButton>
          <UButton class="bg-[#154734] text-white" :loading="saving" @click="save">Add User</UButton>
        </div>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
const open = defineModel<boolean>('open', { default: false })
const emit = defineEmits(['saved'])

const roles = [
  { label: 'Admin', value: 1 },
  { label: 'Mentor', value: 2 },
  { label: 'Student', value: 3 },
]

const form = reactive({ firstName: '', lastName: '', email: '', roleID: undefined as number | undefined, projectNum: '' })
const saving = ref(false)
const error = ref('')

async function save() {
  error.value = ''
  if (!form.firstName || !form.lastName || !form.email || !form.roleID) {
    error.value = 'All fields are required.'
    return
  }
  saving.value = true
  try {
    await $fetch('/api/admin/add', {
      method: 'POST',
      body: { type: 'user', ...form },
    })
    emit('saved')
    open.value = false
    Object.assign(form, { firstName: '', lastName: '', email: '', roleID: undefined, projectNum: '' })
  } catch (e: any) {
    error.value = e?.data?.message ?? 'Failed to add user.'
  } finally {
    saving.value = false
  }
}
</script>

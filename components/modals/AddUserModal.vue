<template>
  <UModal v-model:open="open">
    <template #content>
      <div class="p-6 space-y-4">
        <h3 class="text-lg font-bold text-[#1A1A1A]">Add User</h3>
        <UInput v-model="form.firstName" placeholder="First Name *" />
        <UInput v-model="form.lastName" placeholder="Last Name *" />
        <UInput
          v-model="form.email"
          type="email"
          :placeholder="form.role === 'MENTOR' ? 'Email * (any address)' : 'UTD Email * (abc123456@utdallas.edu)'"
        />
        <USelect
          v-model="form.role"
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
  { label: 'Admin',   value: 'ADMIN'   },
  { label: 'Mentor',  value: 'MENTOR'  },
  { label: 'Student', value: 'STUDENT' },
]

const form = reactive({ firstName: '', lastName: '', email: '', role: undefined as string | undefined, projectNum: '' })
const saving = ref(false)
const error = ref('')

async function save() {
  error.value = ''
  if (!form.firstName || !form.lastName || !form.email || !form.role) {
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
    Object.assign(form, { firstName: '', lastName: '', email: '', role: undefined, projectNum: '' })
  } catch (e: unknown) {
    error.value = (e as { data?: { message?: string } })?.data?.message ?? 'Failed to add user.'
  } finally {
    saving.value = false
  }
}
</script>

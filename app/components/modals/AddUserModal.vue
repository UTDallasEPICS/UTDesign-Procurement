<template>
  <UModal v-model:open="open">
    <template #content>
      <div class="p-6 space-y-5">
        <div>
          <h3 class="text-xl font-black tracking-tight text-slate-900">Add User</h3>
          <p class="mt-1 text-sm text-slate-500">Create a person manually, then assign them to a project right away if needed.</p>
        </div>
        <div class="grid gap-3 sm:grid-cols-2">
          <UInput v-model="form.firstName" placeholder="First Name *" />
          <UInput v-model="form.lastName" placeholder="Last Name *" />
        </div>
        <UInput
          v-model="form.email"
          type="email"
          :placeholder="form.role === 'MENTOR' ? 'Email * (any address)' : 'UTD Email * (abc123456@utdallas.edu)'"
        />
        <AppSelect
          v-model="form.role"
          :items="roles"
          label="Role"
          placeholder="Choose a role"
          required
        />
        <AppSelect
          v-model="form.projectNum"
          :items="projectOptions"
          label="Initial project assignment"
          placeholder="Optional - assign to a project now"
          hint="This creates the user and adds an active project assignment in one step."
        />
        <div v-if="error" class="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {{ error }}
        </div>
        <div class="flex flex-wrap gap-3 justify-end">
          <UButton variant="ghost" @click="close">Cancel</UButton>
          <UButton class="bg-[#0f4a37] text-white" :loading="saving" @click="save">Add User</UButton>
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

const { data: projects } = await useFetch('/api/project')
const projectOptions = computed(() =>
  (projects.value ?? []).map((p: any) => ({ label: `${p.projectNum} - ${p.projectTitle}`, value: p.projectNum })),
)

const form = reactive({ firstName: '', lastName: '', email: '', role: '', projectNum: '' })
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
    Object.assign(form, { firstName: '', lastName: '', email: '', role: '', projectNum: '' })
  } catch (e: unknown) {
    error.value = (e as { data?: { message?: string } })?.data?.message ?? 'Failed to add user.'
  } finally {
    saving.value = false
  }
}

function close() {
  open.value = false
}
</script>

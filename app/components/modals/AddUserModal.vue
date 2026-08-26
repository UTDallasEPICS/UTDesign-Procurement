<template>
  <div
    v-if="open"
    class="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4"
    role="dialog"
    aria-modal="true"
    aria-labelledby="add-user-title"
    @click.self="close"
    @keydown.escape="close"
  >
    <div
      class="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl"
    >
      <div class="space-y-5">
        <!-- Header -->
        <div>
          <h3
            id="add-user-title"
            class="text-xl font-black tracking-tight text-slate-900"
          >
            Add User
          </h3>

          <p class="mt-1 text-sm text-slate-500">
            Create a person manually, then assign them to a project right away
            if needed.
          </p>
        </div>

        <!-- Name -->
        <div class="grid gap-3 sm:grid-cols-2">
          <UInput
            v-model="form.firstName"
            placeholder="First Name *"
              :ui="{
            base: 'placeholder:text-gray-500 text-gray-900',
          }"
          />

          <UInput
            v-model="form.lastName"
            placeholder="Last Name *"
              :ui="{
              base: 'placeholder:text-gray-500 text-gray-900',
            }"
          />
        </div>

        <!-- Email -->
        <UInput
          v-model="form.email"
          type="email"
          :placeholder="
            form.role === 'MENTOR'
              ? 'Email * (any address)'
              : 'UTD Email * (abc123456@utdallas.edu)'
          "
            :ui="{
              base: 'placeholder:text-gray-500 text-gray-900',
            }"
        />

        <!-- Role -->
        <AppSelect
          v-model="form.role"
          :items="roles"
          label="Role"
          placeholder="Choose a role"
          required
        />

        <!-- Project -->
        <AppSelect
          v-model="form.projectNum"
          :items="projectOptions"
          label="Initial project assignment"
          placeholder="Optional - assign to a project now"
          hint="This creates the user and adds an active project assignment in one step."
        />

        <!-- Error -->
        <div
          v-if="error"
          class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {{ error }}
        </div>

        <!-- Actions -->
        <div class="flex justify-end gap-3 pt-2">
          <UButton
            class="cursor-pointer"
            variant="ghost"
            :disabled="saving"
            @click="close"
          >
            Cancel
          </UButton>

          <UButton
            class="bg-[#0f4a37] text-white hover:bg-[#0c3d2e] cursor-pointer"
            :loading="saving"
            @click="save"
          >
            Add User
          </UButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const open = defineModel<boolean>('open', { default: false })

const emit = defineEmits<{
  saved: []
}>()

const roles = [
  { label: 'Admin', value: 'ADMIN' },
  { label: 'Mentor', value: 'MENTOR' },
  { label: 'Student', value: 'STUDENT' },
]

const { data: projects } = await useFetch('/api/project')

const projectOptions = computed(() =>
  (projects.value ?? []).map((p: any) => ({
    label: `${p.projectNum} - ${p.projectTitle}`,
    value: p.projectNum,
  })),
)

const form = reactive({
  firstName: '',
  lastName: '',
  email: '',
  role: '',
  projectNum: '',
})

const saving = ref(false)
const error = ref('')

async function save() {
  error.value = ''

  if (
    !form.firstName.trim() ||
    !form.lastName.trim() ||
    !form.email.trim() ||
    !form.role
  ) {
    error.value = 'All fields are required.'
    return
  }

  saving.value = true

  try {
    await $fetch('/api/admin/add', {
      method: 'POST',
      body: {
        type: 'user',
        ...form,
      },
    })

    emit('saved')

    open.value = false

    Object.assign(form, {
      firstName: '',
      lastName: '',
      email: '',
      role: '',
      projectNum: '',
    })
  } catch (e: unknown) {
    error.value =
      (e as { data?: { message?: string } })?.data?.message ??
      'Failed to add user.'
  } finally {
    saving.value = false
  }
}

function close() {
  if (saving.value) return

  open.value = false
  error.value = ''
}
</script>
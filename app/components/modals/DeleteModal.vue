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
          {{ title }}
        </h3>

        <p class="text-sm leading-6 text-gray-600">
          Are you sure you want to permanently delete
          <strong>{{ name }}</strong>?
        </p>
      </div>

      <div
        class="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-900"
      >
        This action cannot be undone. The record and its associated data will
        be permanently removed.
      </div>

      <div
        v-if="error"
        class="mt-4 rounded-xl border border-red-300 bg-red-100 px-4 py-3 text-sm leading-6 text-red-900"
      >
        {{ error }}
      </div>

      <div class="mt-6 flex justify-end gap-3">
        <UButton
          class="cursor-pointer"
          variant="ghost"
          :disabled="loading"
          @click="close"
        >
          Cancel
        </UButton>

        <UButton
          class="cursor-pointer bg-red-600 text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          :loading="loading"
          :disabled="loading"
          @click="confirm"
        >
          {{ loading ? 'Deleting...' : 'Delete' }}
        </UButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const open = defineModel<boolean>('open', { default: false })

const props = withDefaults(
  defineProps<{
    name: string
    id: string | number
    type: 'vendor'
    title?: string
  }>(),
  {
    title: 'Delete',
  },
)

const emit = defineEmits<{
  confirm: []
}>()

const loading = ref(false)
const error = ref('')

async function confirm() {
  if (loading.value) return

  loading.value = true
  error.value = ''

  try {
    await $fetch('/api/admin/delete', {
      method: 'POST',
      body: {
        type: props.type,
        id: props.id,
      },
    })

    emit('confirm')
    open.value = false
  } catch (err: unknown) {
    const fetchError = err as {
      data?: {
        message?: string
      }
      message?: string
    }

    error.value =
      fetchError.data?.message ||
      fetchError.message ||
      'Unable to delete this record.'
  } finally {
    loading.value = false
  }
}

function close() {
  if (loading.value) return

  error.value = ''
  open.value = false
}

watch(open, value => {
  if (value) {
    error.value = ''
  }
})
</script>

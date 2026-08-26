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
          Are you sure you want to deactivate
          <strong>{{ name }}</strong>? This can be reversed later.
        </p>
      </div>

      <div
        class="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900"
      >
        Deactivation keeps the record but removes it from active assignment
        and selection flows.
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
          class="bg-red-600 text-white hover:bg-red-700 cursor-pointer"
          @click="confirm"
        >
          Deactivate
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
    title?: string
  }>(),
  {
    title: 'Deactivate',
  },
)

const emit = defineEmits(['confirm'])

function confirm() {
  emit('confirm')
  open.value = false
}

function close() {
  open.value = false
}
</script>
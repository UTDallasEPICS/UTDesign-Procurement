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
          {{ description }}
        </p>
      </div>

      <div class="mt-5">
        <UTextarea
          v-model="comment"
          :placeholder="placeholder"
          :rows="4"
          class="w-full"
        />
      </div>

      <div class="mt-6 flex justify-end gap-3">
        <UButton
          class="cursor-pointer"
          variant="ghost"
          @click="cancel"
        >
          Cancel
        </UButton>

        <UButton
          :class="confirmClass"
          :disabled="!comment.trim()"
          @click="confirm"
        >
          {{ confirmLabel }}
        </UButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  title?: string
  description?: string
  placeholder?: string
  confirmLabel?: string
  confirmClass?: string
}>(), {
  title: 'Reject Request',
  description: 'Please provide a reason for rejection. The student will see this comment.',
  placeholder: 'Enter rejection reason...',
  confirmLabel: 'Reject',
  confirmClass: 'bg-red-600 hover:bg-red-700 text-white',
})

const open = defineModel<boolean>('open', { default: false })
const emit = defineEmits<{   'update:open': [value: boolean]; confirm: [comment: string]; cancel: [] }>()

const comment = ref('')

function confirm() {
  emit('confirm', comment.value)
  comment.value = ''
  open.value = false
}

function cancel() {
  comment.value = ''
  open.value = false
  emit('update:open', false)
  emit('cancel')
}
</script>
<template>
  <UModal v-model:open="open">
    <template #content>
      <div class="p-6 space-y-4">
        <h3 class="text-lg font-bold text-[#1A1A1A]">{{ title }}</h3>
        <p class="text-sm text-[#5A5A5A]">{{ description }}</p>
        <UTextarea
          v-model="comment"
          :placeholder="placeholder"
          :rows="4"
          class="w-full"
        />
        <div class="flex gap-3 justify-end">
          <UButton variant="ghost" @click="cancel">Cancel</UButton>
          <UButton
            :class="confirmClass"
            :disabled="!comment.trim()"
            @click="confirm"
          >
            {{ confirmLabel }}
          </UButton>
        </div>
      </div>
    </template>
  </UModal>
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
const emit = defineEmits<{ confirm: [comment: string]; cancel: [] }>()

const comment = ref('')

function confirm() {
  emit('confirm', comment.value)
  comment.value = ''
  open.value = false
}

function cancel() {
  comment.value = ''
  open.value = false
  emit('cancel')
}
</script>

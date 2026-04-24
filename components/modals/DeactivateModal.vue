<template>
  <UModal v-model:open="open">
    <template #content>
      <div class="p-6 space-y-4">
        <h3 class="text-lg font-bold text-[#1A1A1A]">Deactivate</h3>
        <p class="text-sm text-[#5A5A5A]">
          Are you sure you want to deactivate <strong>{{ name }}</strong>? This can be reversed.
        </p>
        <div class="flex gap-3 justify-end">
          <UButton variant="ghost" @click="open = false">Cancel</UButton>
          <UButton class="bg-red-600 text-white" @click="confirm">Deactivate</UButton>
        </div>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
const open = defineModel<boolean>('open', { default: false })
defineProps<{ name: string }>()
const emit = defineEmits(['confirm'])
function confirm() { emit('confirm'); open.value = false }
</script>

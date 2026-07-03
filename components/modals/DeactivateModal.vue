<template>
  <UModal v-model:open="open">
    <template #content>
      <div class="p-6 space-y-5">
        <div>
          <h3 class="text-xl font-black tracking-tight text-slate-900">{{ title }}</h3>
          <p class="mt-1 text-sm text-slate-500">
            Are you sure you want to deactivate <strong>{{ name }}</strong>? This can be reversed later.
          </p>
        </div>

        <div class="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Deactivation keeps the record but removes it from active assignment and selection flows.
        </div>

        <div class="flex flex-wrap justify-end gap-3">
          <UButton variant="ghost" @click="close">Cancel</UButton>
          <UButton class="bg-red-600 text-white hover:bg-red-700" @click="confirm">Deactivate</UButton>
        </div>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
const open = defineModel<boolean>('open', { default: false })
const props = withDefaults(defineProps<{ name: string; title?: string }>(), {
  title: 'Deactivate',
})
const emit = defineEmits(['confirm'])

function confirm() {
  emit('confirm')
  open.value = false
}

function close() {
  open.value = false
}
</script>

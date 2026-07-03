<template>
  <div
    class="group cursor-pointer rounded-3xl border-2 border-dashed p-6 text-center transition-all duration-200"
    :class="isDragging ? 'border-[#d86e18] bg-orange-50 shadow-lg shadow-orange-100' : 'border-slate-300 bg-white/90 hover:border-[#d86e18] hover:bg-white hover:shadow-md'"
    @dragover.prevent="isDragging = true"
    @dragleave="isDragging = false"
    @drop.prevent="onDrop"
    @click="fileInput?.click()"
  >
    <input ref="fileInput" type="file" class="hidden" :accept="accept" @change="onFileChange" />
    <div v-if="!file">
      <div class="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#0f4a37]/10 text-[#0f4a37]">
        <UIcon name="i-lucide-upload" class="h-5 w-5" />
      </div>
      <p class="text-sm text-slate-600">
        <span class="font-semibold text-[#d86e18]">Click to upload</span> or drag and drop
      </p>
      <p v-if="label" class="mt-1 text-xs text-slate-500">{{ label }}</p>
    </div>
    <div v-else class="flex items-center justify-center gap-2">
      <span class="rounded-full bg-[#0f4a37]/10 px-3 py-1 text-sm font-semibold text-[#0f4a37]">
        {{ file.name }}
      </span>
      <button
        class="ml-2 rounded-full border border-red-200 bg-red-50 px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-100"
        @click.stop="removeFile"
      >
        Remove
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  accept?: string
  label?: string
  modelValue?: File | null
}>()
const emit = defineEmits<{ 'update:modelValue': [file: File | null] }>()

const isDragging = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)
const file = computed(() => props.modelValue ?? null)

function onDrop(e: DragEvent) {
  isDragging.value = false
  const f = e.dataTransfer?.files?.[0] ?? null
  emit('update:modelValue', f)
}

function onFileChange(e: Event) {
  const f = (e.target as HTMLInputElement).files?.[0] ?? null
  emit('update:modelValue', f)
}

function removeFile() {
  emit('update:modelValue', null)
  if (fileInput.value) fileInput.value.value = ''
}
</script>

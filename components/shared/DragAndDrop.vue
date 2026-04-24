<template>
  <div
    class="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors"
    :class="isDragging ? 'border-[#E87722] bg-orange-50' : 'border-[#D9D9D9] bg-white hover:border-[#E87722]'"
    @dragover.prevent="isDragging = true"
    @dragleave="isDragging = false"
    @drop.prevent="onDrop"
    @click="fileInput?.click()"
  >
    <input ref="fileInput" type="file" class="hidden" :accept="accept" @change="onFileChange" />
    <div v-if="!file">
      <p class="text-[#5A5A5A] text-sm">
        <span class="font-semibold text-[#E87722]">Click to upload</span> or drag and drop
      </p>
      <p v-if="label" class="text-xs text-[#5A5A5A] mt-1">{{ label }}</p>
    </div>
    <div v-else class="flex items-center justify-center gap-2">
      <span class="text-sm font-medium text-[#154734]">{{ file.name }}</span>
      <button
        class="text-red-500 hover:text-red-700 text-xs ml-2"
        @click.stop="removeFile"
      >
        ✕
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

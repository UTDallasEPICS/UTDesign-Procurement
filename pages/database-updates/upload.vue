<template>
  <div class="max-w-2xl mx-auto space-y-6">
    <div class="flex items-center gap-3">
      <NuxtLink to="/database-updates/admin" class="text-[#E87722] text-sm hover:underline">← Back</NuxtLink>
      <h1 class="text-2xl font-bold text-[#1A1A1A]">Bulk XLSX Upload</h1>
    </div>

    <div class="bg-white border border-[#D9D9D9] rounded-xl p-6 space-y-6">
      <p class="text-sm text-[#5A5A5A]">
        Upload Excel files to create or update users and projects in bulk.
        Files are processed in order: <strong>Mentors → Projects → Students</strong>.
      </p>

      <div>
        <label class="block text-sm font-semibold mb-2 text-[#1A1A1A]">Mentor / Faculty File</label>
        <DragAndDrop v-model="mentorFile" accept=".xlsx" label=".xlsx — columns: firstName, lastName, email" />
      </div>

      <div>
        <label class="block text-sm font-semibold mb-2 text-[#1A1A1A]">Project File</label>
        <DragAndDrop v-model="projectFile" accept=".xlsx" label=".xlsx — columns: projectNum, projectTitle, projectType, startingBudget, sponsorCompany" />
      </div>

      <div>
        <label class="block text-sm font-semibold mb-2 text-[#1A1A1A]">Student File</label>
        <DragAndDrop v-model="studentFile" accept=".xlsx" label=".xlsx — columns: firstName, lastName, email, projectNum" />
      </div>

      <!-- Result -->
      <div v-if="result" class="text-sm bg-green-50 border border-green-200 text-green-700 rounded px-4 py-3">
        ✓ Upload complete — {{ result.mentors }} mentors, {{ result.projects }} projects, {{ result.students }} students processed.
      </div>
      <div v-if="error" class="text-sm bg-red-50 border border-red-200 text-red-700 rounded px-4 py-3">
        {{ error }}
      </div>

      <div class="flex gap-3 justify-end">
        <UButton
          class="bg-[#154734] hover:bg-[#0f3326] text-white"
          :loading="uploading"
          :disabled="!mentorFile && !projectFile && !studentFile"
          @click="upload"
        >
          Upload & Process
        </UButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const { isAdmin } = useAuth()
if (!isAdmin.value) await navigateTo('/orders')

const mentorFile = ref<File | null>(null)
const projectFile = ref<File | null>(null)
const studentFile = ref<File | null>(null)
const uploading = ref(false)
const result = ref<{ mentors: number; projects: number; students: number } | null>(null)
const error = ref('')

async function upload() {
  if (!mentorFile.value && !projectFile.value && !studentFile.value) return

  uploading.value = true
  result.value = null
  error.value = ''

  const fd = new FormData()
  if (mentorFile.value) fd.append('mentorFile', mentorFile.value)
  if (projectFile.value) fd.append('projectFile', projectFile.value)
  if (studentFile.value) fd.append('studentFile', studentFile.value)

  try {
    const res = await $fetch<any>('/api/db-upload', { method: 'POST', body: fd })

    // If response is a blob (error report), trigger download
    if (res instanceof Blob || res instanceof ArrayBuffer) {
      const blob = res instanceof ArrayBuffer ? new Blob([res]) : res
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'upload-errors.xlsx'
      a.click()
      URL.revokeObjectURL(url)
      error.value = 'Validation errors found. Download the error report to see details.'
    } else {
      result.value = res
    }
  } catch (e: any) {
    error.value = e?.data?.message ?? 'Upload failed. Please try again.'
  } finally {
    uploading.value = false
  }
}
</script>

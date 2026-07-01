<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-[#1A1A1A]">Database Management</h1>
    </div>

    <UTabs :items="tabs" v-model="activeTab" />

    <!-- Users Tab -->
    <div v-if="activeTab === 0" class="space-y-3">
      <div class="flex gap-2">
        <UButton class="bg-[#154734] text-white" @click="addUserOpen = true">+ Add User</UButton>
        <UButton
          v-if="selectedUser"
          variant="outline"
          class="border-red-500 text-red-500"
          @click="deactivateOpen = true"
        >
          Deactivate
        </UButton>
        <UButton
          v-if="selectedUser && !selectedUser.active"
          variant="outline"
          class="border-[#154734] text-[#154734]"
          @click="reactivateUser"
        >
          Reactivate
        </UButton>
        <UButton
          v-if="selectedUser"
          variant="outline"
          class="border-[#E87722] text-[#E87722]"
          @click="assignOpen = true"
        >
          Assign to Project
        </UButton>
        <UButton
          v-if="selectedUser"
          variant="outline"
          class="border-red-700 text-red-700"
          @click="deleteUserOpen = true"
        >
          Delete
        </UButton>
      </div>

      <div class="bg-white border border-[#D9D9D9] rounded-xl overflow-hidden">
        <div style="height: 500px" class="ag-theme-alpine w-full">
          <AgGridVue
            :row-data="users"
            :column-defs="userColumns"
            :default-col-def="{ resizable: true, sortable: true, filter: true }"
            row-selection="single"
            @selection-changed="onUserSelect"
            @cell-value-changed="onUserEdit"
          />
        </div>
      </div>
    </div>

    <!-- Projects Tab -->
    <div v-if="activeTab === 1" class="space-y-3">
      <div class="flex gap-2">
        <UButton class="bg-[#154734] text-white" @click="addProjectOpen = true">+ Add Project</UButton>
        <UButton
          v-if="selectedProject"
          variant="outline"
          class="border-red-500 text-red-500"
          @click="deactivateProjectOpen = true"
        >
          Deactivate
        </UButton>
      </div>
      <div class="bg-white border border-[#D9D9D9] rounded-xl overflow-hidden">
        <div style="height: 500px" class="ag-theme-alpine w-full">
          <AgGridVue
            :row-data="projects"
            :column-defs="projectColumns"
            :default-col-def="{ resizable: true, sortable: true, filter: true }"
            row-selection="single"
            @selection-changed="onProjectSelect"
            @cell-value-changed="onProjectEdit"
          />
        </div>
      </div>
    </div>

    <!-- Vendors Tab -->
    <div v-if="activeTab === 2" class="space-y-3">
      <div class="flex gap-2">
        <UButton
          v-if="selectedVendor"
          variant="outline"
          class="border-red-700 text-red-700"
          @click="deleteVendorOpen = true"
        >
          Delete
        </UButton>
      </div>
      <div v-if="vendorError" class="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
        {{ vendorError }}
      </div>
      <div class="bg-white border border-[#D9D9D9] rounded-xl overflow-hidden">
        <div style="height: 400px" class="ag-theme-alpine w-full">
          <AgGridVue
            :row-data="vendors"
            :column-defs="vendorColumns"
            :default-col-def="{ resizable: true, sortable: true, filter: true }"
            row-selection="single"
            @selection-changed="onVendorSelect"
            @cell-value-changed="onVendorEdit"
          />
        </div>
      </div>
    </div>

    <!-- Import Tab -->
    <div v-if="activeTab === 3" class="space-y-6 max-w-2xl">
      <!-- Step 1: Projects -->
      <div class="bg-white border border-[#D9D9D9] rounded-xl p-6 space-y-3">
        <h2 class="font-bold text-[#1A1A1A]">Step 1 — Import Projects</h2>
        <p class="text-sm text-[#5A5A5A]">
          Columns: <code>projectNum, projectTitle, projectType, startingBudget, sponsorCompany</code>
          (optional: <code>costCenter, additionalInfo, mentorName, mentorEmail</code>).
          Existing project numbers are skipped.
        </p>
        <DragAndDrop v-model="projectFile" accept=".xlsx,.xls" label="Projects spreadsheet (.xlsx)" />
        <UButton
          class="bg-[#154734] text-white"
          :disabled="!projectFile"
          :loading="importingProjects"
          @click="importProjects"
        >
          Import Projects
        </UButton>
        <ImportResults v-if="projectImportResult" :result="projectImportResult" />
      </div>

      <!-- Step 2: Students -->
      <div class="bg-white border border-[#D9D9D9] rounded-xl p-6 space-y-3">
        <h2 class="font-bold text-[#1A1A1A]">Step 2 — Import Students</h2>
        <div
          v-if="!projects.length"
          class="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded px-3 py-2"
        >
          ⚠ No projects exist yet. Import projects first — student rows referencing unknown project numbers will be rejected.
        </div>
        <p class="text-sm text-[#5A5A5A]">
          Columns: <code>firstName, lastName, email, projectNum</code>.
          Students must use @utdallas.edu emails and reference an existing project number.
        </p>
        <DragAndDrop v-model="studentFile" accept=".xlsx,.xls" label="Students spreadsheet (.xlsx)" />
        <UButton
          class="bg-[#154734] text-white"
          :disabled="!studentFile"
          :loading="importingStudents"
          @click="importStudents"
        >
          Import Students
        </UButton>
        <ImportResults v-if="studentImportResult" :result="studentImportResult" />
      </div>
    </div>

    <!-- Modals -->
    <AddUserModal v-model:open="addUserOpen" @saved="refreshUsers" />
    <AddProjectModal v-model:open="addProjectOpen" @saved="refreshProjects" />
    <DeactivateModal
      v-model:open="deactivateOpen"
      :name="selectedUser ? `${selectedUser.firstName} ${selectedUser.lastName}` : ''"
      @confirm="deactivateUser"
    />
    <DeactivateModal
      v-model:open="deactivateProjectOpen"
      :name="selectedProject?.projectTitle ?? ''"
      @confirm="deactivateProject"
    />
    <DeactivateModal
      v-model:open="deleteUserOpen"
      :name="selectedUser ? `${selectedUser.firstName} ${selectedUser.lastName} (permanent delete)` : ''"
      @confirm="deleteUser"
    />
    <DeactivateModal
      v-model:open="deleteVendorOpen"
      :name="selectedVendor ? `${selectedVendor.vendorName} (permanent delete)` : ''"
      @confirm="deleteVendor"
    />
    <AssignProjectModal
      v-model:open="assignOpen"
      :user="selectedUser"
      @saved="refreshUsers"
    />
  </div>
</template>

<script setup lang="ts">
import { AgGridVue } from 'ag-grid-vue3'
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-alpine.css'
import ImportResults from '~/components/shared/ImportResults.vue'

definePageMeta({ middleware: 'auth' })

const { isAdmin } = useAuth()
if (!isAdmin.value) await navigateTo('/orders')

const tabs = [{ label: 'Users' }, { label: 'Projects' }, { label: 'Vendors' }, { label: 'Import' }]
const activeTab = ref(0)

// ── Users ──────────────────────────────────────────────────────────────────
const { data: userData, refresh: refreshUsers } = await useFetch('/api/user')
const users = computed(() => userData.value ?? [])
const selectedUser = ref<{ id: number; firstName: string; lastName: string; active: boolean } | null>(null)

const userColumns = [
  { field: 'netID', headerName: 'NetID' },
  { field: 'firstName', headerName: 'First Name', editable: true },
  { field: 'lastName', headerName: 'Last Name', editable: true },
  { field: 'email', headerName: 'Email' },
  { field: 'role', headerName: 'Role' },
  { field: 'active', headerName: 'Active', valueFormatter: (p: { value: boolean }) => p.value ? 'Yes' : 'No' },
]

function onUserSelect(e: { api: { getSelectedRows: () => typeof selectedUser.value[] } }) {
  selectedUser.value = e.api.getSelectedRows()[0] ?? null
}

async function onUserEdit(e: { data: { id: number }; colDef: { field: string }; newValue: unknown }) {
  await $fetch('/api/admin/edit', {
    method: 'POST',
    body: { type: 'user', id: e.data.id, field: e.colDef.field, value: e.newValue },
  })
}

// ── Projects ───────────────────────────────────────────────────────────────
const { data: projectData, refresh: refreshProjects } = await useFetch('/api/project')
const projects = computed(() => projectData.value ?? [])
const selectedProject = ref<{ projectID: number; projectTitle: string } | null>(null)

const projectColumns = [
  { field: 'projectNum', headerName: 'Project #' },
  { field: 'projectTitle', headerName: 'Title', editable: true },
  { field: 'projectType', headerName: 'Type', editable: true },
  { field: 'startingBudget', headerName: 'Budget ($)', editable: true },
  { field: 'sponsorCompany', headerName: 'Sponsor', editable: true },
  { field: 'totalExpenses', headerName: 'Expenses ($)' },
]

function onProjectSelect(e: { api: { getSelectedRows: () => typeof selectedProject.value[] } }) {
  selectedProject.value = e.api.getSelectedRows()[0] ?? null
}

async function onProjectEdit(e: { data: { projectID: number }; colDef: { field: string }; newValue: unknown }) {
  await $fetch('/api/admin/edit', {
    method: 'POST',
    body: { type: 'project', id: e.data.projectID, field: e.colDef.field, value: e.newValue },
  })
}

// ── Vendors ────────────────────────────────────────────────────────────────
const { data: vendorData, refresh: refreshVendors } = await useFetch('/api/vendor/all')
const vendors = computed(() => vendorData.value ?? [])
const selectedVendor = ref<{ vendorID: number; vendorName: string } | null>(null)
const vendorError = ref('')

const vendorColumns = [
  { field: 'vendorName', headerName: 'Vendor Name', editable: true },
  {
    field: 'vendorStatus', headerName: 'Status', editable: true,
    cellEditor: 'agSelectCellEditor',
    cellEditorParams: { values: ['APPROVED', 'PENDING', 'DENIED'] },
  },
  {
    field: 'isPreferred', headerName: 'Preferred', editable: true,
    cellEditor: 'agSelectCellEditor',
    cellEditorParams: { values: [true, false] },
    valueFormatter: (p: { value: boolean }) => p.value ? 'Yes ★' : 'No',
  },
  { field: 'vendorEmail', headerName: 'Email', editable: true },
  { field: 'vendorURL', headerName: 'URL', editable: true },
]

function onVendorSelect(e: { api: { getSelectedRows: () => typeof selectedVendor.value[] } }) {
  selectedVendor.value = e.api.getSelectedRows()[0] ?? null
}

async function onVendorEdit(e: { data: { vendorID: number }; colDef: { field: string }; newValue: unknown }) {
  if (e.colDef.field === 'vendorStatus') {
    await $fetch('/api/vendor/updateStatus', {
      method: 'POST',
      body: { vendorID: e.data.vendorID, status: e.newValue },
    })
  } else {
    await $fetch('/api/admin/edit', {
      method: 'POST',
      body: { type: 'vendor', id: e.data.vendorID, field: e.colDef.field, value: e.newValue },
    })
  }
}

async function deleteVendor() {
  vendorError.value = ''
  try {
    await $fetch('/api/admin/delete', {
      method: 'POST',
      body: { type: 'vendor', id: selectedVendor.value!.vendorID },
    })
    selectedVendor.value = null
    refreshVendors()
  } catch (e: unknown) {
    vendorError.value = (e as { data?: { message?: string } })?.data?.message ?? 'Failed to delete vendor.'
  }
}

// ── Deactivate / Reactivate / Delete ───────────────────────────────────────
const addUserOpen = ref(false)
const addProjectOpen = ref(false)
const deactivateOpen = ref(false)
const deactivateProjectOpen = ref(false)
const deleteUserOpen = ref(false)
const deleteVendorOpen = ref(false)
const assignOpen = ref(false)

async function deactivateUser() {
  await $fetch('/api/admin/deactivate-user', {
    method: 'POST',
    body: { userID: selectedUser.value!.id },
  })
  selectedUser.value = null
  refreshUsers()
}

async function reactivateUser() {
  await $fetch('/api/admin/reactivate-user', {
    method: 'POST',
    body: { userID: selectedUser.value!.id },
  })
  selectedUser.value = null
  refreshUsers()
}

async function deleteUser() {
  await $fetch('/api/admin/delete', {
    method: 'POST',
    body: { type: 'user', id: selectedUser.value!.id },
  })
  selectedUser.value = null
  refreshUsers()
}

async function deactivateProject() {
  await $fetch('/api/admin/deactivate-project', {
    method: 'POST',
    body: { projectID: selectedProject.value!.projectID },
  })
  selectedProject.value = null
  refreshProjects()
}

// ── Excel Import ───────────────────────────────────────────────────────────
interface ImportResult {
  total: number
  created: number
  skipped: number
  errors: number
  results: Array<{ row: number; status: string; detail: string; projectNum?: string; email?: string }>
}

const projectFile = ref<File | null>(null)
const studentFile = ref<File | null>(null)
const importingProjects = ref(false)
const importingStudents = ref(false)
const projectImportResult = ref<ImportResult | null>(null)
const studentImportResult = ref<ImportResult | null>(null)

function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

async function importProjects() {
  if (!projectFile.value) return
  importingProjects.value = true
  projectImportResult.value = null
  try {
    projectImportResult.value = await $fetch<ImportResult>('/api/admin/import/projects', {
      method: 'POST',
      body: { fileData: await readFileAsDataURL(projectFile.value) },
    })
    refreshProjects()
  } catch (e: unknown) {
    projectImportResult.value = {
      total: 0, created: 0, skipped: 0, errors: 1,
      results: [{ row: 0, status: 'error', detail: (e as { data?: { message?: string } })?.data?.message ?? 'Import failed' }],
    }
  } finally {
    importingProjects.value = false
  }
}

async function importStudents() {
  if (!studentFile.value) return
  importingStudents.value = true
  studentImportResult.value = null
  try {
    studentImportResult.value = await $fetch<ImportResult>('/api/admin/import/students', {
      method: 'POST',
      body: { fileData: await readFileAsDataURL(studentFile.value) },
    })
    refreshUsers()
  } catch (e: unknown) {
    studentImportResult.value = {
      total: 0, created: 0, skipped: 0, errors: 1,
      results: [{ row: 0, status: 'error', detail: (e as { data?: { message?: string } })?.data?.message ?? 'Import failed' }],
    }
  } finally {
    importingStudents.value = false
  }
}
</script>

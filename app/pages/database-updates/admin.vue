<template>
  <div 
    class="space-y-6" 
    @click="selectedUser = false; selectedProject = false; selectedVendor = false">
    
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-[#1A1A1A]">Database Management</h1>
    </div>

    <UTabs :items="tabs" v-model="activeTab" class="[&_[role=tab]]:cursor-pointer" />

    <!-- Users Tab -->
    <div v-if="activeTab == 0" class="space-y-3">
      <div class="flex gap-2 justify-end">
        <UButton
          label="+ add User"
          class="bg-[#154734] text-white cursor-pointer justify-end" 
          @click.stop="openAddUser" 
        />
        </div>
    
      <div v-if="selectedUser" class="flex gap-2 ml-auto justify-end bg-white border border-[#D9D9D9] rounded-xl p-2 w-fit">
        
         <UButton
          label="Deactivate"
          class="cursor-pointer rounded-lg border border-[#F6C94D] bg-[#FFF9E6] text-[#D88900] hover:bg-[#FFF3CC]"
          @click.stop="openDeactivateUser"
        />

        <UButton
          label="Reactivate"
          class="cursor-pointer rounded-lg border"
          :class="
            selectedUser.active
              ? 'border-[#EAF8F0] bg-[#F8FDFB] text-[#C4E8D3] hover:bg-[#F2FAF6]'
              : 'border-[#B8E8D0] bg-[#DFF7EA] text-[#5FAF82] hover:bg-[#D0F2E0]'
          "
          @click.stop="reactivateUser"
        />

        <UButton
          label="Assign to Project"
          class="cursor-pointer rounded-lg border border-[#9DD8F5] bg-[#EFF9FF] text-[#2384C6] hover:bg-[#E2F4FC]"
          @click.stop="openAssignProject"
        />

        <UButton
          label="Edit"
          class="cursor-pointer rounded-lg border border-[#D7F2E5] bg-[#F2FCF7] text-[#154734] hover:bg-[#E8F8F0]"
          @click.stop="openEditUser"
        />

        <UButton
          label="Delete"
          class="cursor-pointer rounded-lg border border-[#FFB5B5] bg-[#FFF1F1] text-[#E53935] hover:bg-[#FFE5E5]"
          @click.stop="openDeleteUser"
        />
        <UButton
          icon="lucide:x"
          class="bg-white text-slate-400 hover:bg-slate-200 active:bg-slate-300 cursor-pointer"
          @click.stop="selectedUser = false"
        />
        
      </div>

      <div class="bg-white border border-[#D9D9D9] rounded-xl overflow-hidden">
        <TestGrid
          title="User management"
          :rows="users"
          :columns="userColumns"
          @select="user => { selectedUser = user }"   
        />
      </div>

    </div>

    <!-- Projects Tab -->
    <div v-if="activeTab == 1" class="space-y-3">
      <div class="flex gap-2 justify-end">
        <UButton 
          label="+ Add Project"
          class="bg-[#154734] text-white cursor-pointer" 
          @click.stop="openAddProject"
        />
      </div>

      <div v-if="selectedProject" class="flex gap-2 ml-auto justify-end bg-white border border-[#D9D9D9] rounded-xl p-2 w-fit">
        <UButton
          label="Edit"
          class="cursor-pointer rounded-lg border border-[#D7F2E5] bg-[#F2FCF7] text-[#0F3828] hover:bg-[#E8F8F0]"
          @click.stop="openEditProject"
        />

        <UButton
          label="Delete"
          class="cursor-pointer rounded-lg border border-[#FFB5B5] bg-[#FFF1F1] text-[#C62828] hover:bg-[#FFE5E5]"
          @click.stop="openDeactivateProject"
        />

        <UButton
          label="Deactivate"
          class="cursor-pointer rounded-lg border border-[#F6C94D] bg-[#FFF9E6] text-[#D88900] hover:bg-[#FFF3CC]"
          @click.stop="openDeactivateProject"
        />
        <UButton
          icon="lucide:x"
          class="bg-white text-slate-400 hover:bg-slate-200 active:bg-slate-300 cursor-pointer"
          @click="selectedProject = false"
        />
      </div>
      
      <div class="bg-white border border-[#D9D9D9] rounded-xl overflow-hidden">
          <TestGrid
            title="Project management"
            :rows="projects"
            :columns="projectColumns"
            @select="project => selectedProject = project"
          />
        </div>
    </div>

    <!-- Vendors Tab -->
    <div v-if="activeTab == 2" class="space-y-3">
      <div class="flex gap-2 justify-end">
        <UButton 
          label="+ Add Vendor"
          class="bg-[#154734] text-white cursor-pointer" 
          @click.stop="openAddVendor"
        />
      </div>

      <div v-if="selectedVendor" class="flex gap-2 ml-auto justify-end bg-white border border-[#D9D9D9] rounded-xl p-2 w-fit">
      <UButton
        label="Edit"
        class="cursor-pointer rounded-lg border border-[#D7F2E5] bg-[#F2FCF7] text-[#0F3828] hover:bg-[#E8F8F0]"
        @click.stop="openEditVendor"
      />

      <UButton
        label="Delete"
        class="cursor-pointer rounded-lg border border-[#FFB5B5] bg-[#FFF1F1] text-[#C62828] hover:bg-[#FFE5E5]"
        @click.stop="openDeleteVendor"
      />

      <UButton
        icon="lucide:x"
        class="cursor-pointer rounded-lg border border-[#E2E8F0] bg-white text-slate-500 hover:bg-slate-100 active:bg-slate-200"
        @click="selectedVendor = false"
      />
      </div>
      
      <div v-if="vendorError" class="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
        {{ vendorError }}
      </div>

      <div class="bg-white border border-[#D9D9D9] rounded-xl overflow-hidden">
        <TestGrid
          title="Vendor management"
          :rows="vendors"
          :columns="vendorColumns"
          @select="vendor => selectedVendor = vendor"
        />
      </div>
    </div>

    <!-- Import Tab -->
    <div v-if="activeTab == 3" class="w-full space-y-4 sm:space-y-6">
    <!-- Step 1: Projects -->
    <div class="w-full rounded-xl border border-[#D9D9D9] bg-white p-4 sm:p-6">
      <div class="space-y-3">
        <h2 class="font-bold text-[#1A1A1A]">
          Step 1 — Import Projects
        </h2>

        <p class="text-sm leading-6 text-[#5A5A5A] break-words">
          Columns:
          <code class="break-all">projectNum, projectTitle, projectType, startingBudget, sponsorCompany</code>
          (optional:
          <code class="break-all">costCenter, additionalInfo, mentorName, mentorEmail</code>).
          Existing project numbers are skipped.
        </p>

        <DragAndDrop
          v-model="projectFile"
          accept=".xlsx,.xls"
          label="Projects spreadsheet (.xlsx)"
        />

        <UButton
          class="w-full cursor-pointer bg-[#154734] text-white sm:w-auto"
          :disabled="!projectFile"
          :loading="importingProjects"
          @click.stop="importProjects"
        >
          Import Projects
        </UButton>

        <ImportResults
          v-if="projectImportResult"
          :result="projectImportResult"
        />
      </div>
    </div>

    <!-- Step 2: Students -->
    <div class="w-full rounded-xl border border-[#D9D9D9] bg-white p-4 sm:p-6">
      <div class="space-y-3">
        <h2 class="font-bold text-[#1A1A1A]">
          Step 2 — Import Students
        </h2>

        <div
          v-if="!projects.length"
          class="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm leading-5 text-amber-800"
        >
          ⚠ No projects exist yet. Import projects first — student rows
          referencing unknown project numbers will be rejected.
        </div>

        <p class="text-sm leading-6 text-[#5A5A5A] break-words">
          Columns:
          <code class="break-all">firstName, lastName, email, projectNum</code>.
          Students must use @utdallas.edu emails and reference an existing
          project number.
        </p>

        <DragAndDrop
          v-model="studentFile"
          accept=".xlsx,.xls"
          label="Students spreadsheet (.xlsx)"
        />

        <UButton
          class="w-full cursor-pointer bg-[#154734] text-white sm:w-auto"
          :disabled="!studentFile"
          :loading="importingStudents"
          @click.stop="importStudents"
        >
          Import Students
        </UButton>

        <ImportResults
          v-if="studentImportResult"
          :result="studentImportResult"
        />
      </div>
    </div>
    </div>
  </div>

  <div v-if="activeTab == 3" class="w-full max-w-3xl space-y-4 sm:space-y-6">
  <!-- Step 1: Projects -->
  <div class="w-full rounded-xl border border-[#D9D9D9] bg-white p-4 sm:p-6">
    <div class="space-y-3">
      <h2 class="font-bold text-[#1A1A1A]">
        Step 1 — Import Projects
      </h2>

      <p class="text-sm leading-6 text-[#5A5A5A] break-words">
        Columns:
        <code class="break-all">projectNum, projectTitle, projectType, startingBudget, sponsorCompany</code>
        (optional:
        <code class="break-all">costCenter, additionalInfo, mentorName, mentorEmail</code>).
        Existing project numbers are skipped.
      </p>

      <DragAndDrop
        v-model="projectFile"
        accept=".xlsx,.xls"
        label="Projects spreadsheet (.xlsx)"
      />

      <UButton
        class="w-full cursor-pointer bg-[#154734] text-white sm:w-auto"
        :disabled="!projectFile"
        :loading="importingProjects"
        @click.stop="importProjects"
      >
        Import Projects
      </UButton>

      <ImportResults
        v-if="projectImportResult"
        :result="projectImportResult"
      />
    </div>
  </div>

  <!-- Step 2: Students -->
  <div class="w-full rounded-xl border border-[#D9D9D9] bg-white p-4 sm:p-6">
    <div class="space-y-3">
      <h2 class="font-bold text-[#1A1A1A]">
        Step 2 — Import Students
      </h2>

      <div
        v-if="!projects.length"
        class="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm leading-5 text-amber-800"
      >
        ⚠ No projects exist yet. Import projects first — student rows
        referencing unknown project numbers will be rejected.
      </div>

      <p class="text-sm leading-6 text-[#5A5A5A] break-words">
        Columns:
        <code class="break-all">firstName, lastName, email, projectNum</code>.
        Students must use @utdallas.edu emails and reference an existing
        project number.
      </p>

      <DragAndDrop
        v-model="studentFile"
        accept=".xlsx,.xls"
        label="Students spreadsheet (.xlsx)"
      />

      <UButton
        class="w-full cursor-pointer bg-[#154734] text-white sm:w-auto"
        :disabled="!studentFile"
        :loading="importingStudents"
        @click.stop="importStudents"
      >
        Import Students
      </UButton>

      <ImportResults
        v-if="studentImportResult"
        :result="studentImportResult"
      />
    </div>
  </div>
</div>

<!-- Modals -->
<AddUserModal
  v-model:open="addUserOpen"
  @saved="refreshUsers"
/>

<AddProjectModal
  v-model:open="addProjectOpen"
  @saved="refreshProjects"
/>

<AddVendorModal
  v-model:open="addVendorOpen"
  @saved="refreshVendors"
/>

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

<EditProjectModal
  v-model:open="editProjectOpen"
  :project="selectedProject"
  @saved="refreshProjects"
/>
<EditUserModal
  v-model:open="editUserOpen"
  :user="selectedUser"
  @saved="refreshUsers"
  />

<EditVendorModal
  v-model:open="editVendorOpen"
  :vendor="selectedVendor"
  @saved="refreshVendors"
  />
  
</template>



<script setup lang="ts">
import { h } from 'vue'
import { UBadge } from '#components'
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-alpine.css'
import ImportResults from '~/components/shared/ImportResults.vue'
import { ModuleRegistry, AllCommunityModule,} from 'ag-grid-community'



ModuleRegistry.registerModules([AllCommunityModule])

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
  { accessorKey: 'netID', header: 'NetID' },
  { accessorKey: 'firstName', header: 'First Name' },
  { accessorKey: 'lastName', header: 'Last Name' },
  { accessorKey: 'email', header: 'Email' },
  { accessorKey: 'responsibilities', header: 'Project' },
  { accessorKey: 'role', header: 'Role'},
  { accessorKey: 'active', header: 'Active' },
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
  { accessorKey: 'projectNum', header: 'Project #' },
  { accessorKey: 'projectTitle', header: 'Title' },
  { accessorKey: 'projectType', header: 'Type' },
  { accessorKey: 'startingBudget', header: 'Budget ($)' },
  { accessorKey: 'sponsorCompany', header: 'Sponsor' },
  { accessorKey: 'totalExpenses', header: 'Expenses ($)' },
]

function handleDeselect(row) {
  emit('deselect', row)
}

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
  { accessorKey: 'vendorName', header: 'Vendor Name' },
  { accessorKey: 'vendorStatus', header: 'Status' },
  { accessorKey: 'isPreferred', header: 'Preferred' },
  { accessorKey: 'vendorEmail', header: 'Email' },
  { accessorKey: 'vendorURL', header: 'URL' },
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
const addVendorOpen = ref(false)
const editProjectOpen = ref(false)
const editUserOpen = ref(false)
const editVendorOpen = ref(false)


function openAddVendor() { addVendorOpen.value = true }
function openAddUser() { addUserOpen.value = true }
function openAddProject() { addProjectOpen.value = true }
function openDeactivateUser() { deactivateOpen.value = true }
function openDeactivateProject() { deactivateProjectOpen.value = true }
function openDeleteUser() { deleteUserOpen.value = true }
function openDeleteVendor() { deleteVendorOpen.value = true }
function openAssignProject() { assignOpen.value = true }
function openEditProject() { editProjectOpen.value = true }
function openEditUser() { editUserOpen.value = true }
function openEditVendor() { editVendorOpen.value = true }

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

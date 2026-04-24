<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-[#1A1A1A]">Database Management</h1>
      <NuxtLink to="/database-updates/upload">
        <UButton variant="outline" class="border-[#E87722] text-[#E87722]">Bulk XLSX Upload</UButton>
      </NuxtLink>
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
    <div v-if="activeTab === 2">
      <div class="bg-white border border-[#D9D9D9] rounded-xl overflow-hidden">
        <div style="height: 400px" class="ag-theme-alpine w-full">
          <AgGridVue
            :row-data="vendors"
            :column-defs="vendorColumns"
            :default-col-def="{ resizable: true, sortable: true, filter: true }"
            @cell-value-changed="onVendorEdit"
          />
        </div>
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

definePageMeta({ middleware: 'auth' })

const { isAdmin } = useAuth()
if (!isAdmin.value) await navigateTo('/orders')

const tabs = [{ label: 'Users' }, { label: 'Projects' }, { label: 'Vendors' }]
const activeTab = ref(0)

// ── Users ──────────────────────────────────────────────────────────────────
const { data: userData, refresh: refreshUsers } = await useFetch('/api/user')
const users = computed(() => userData.value ?? [])
const selectedUser = ref<any>(null)

const userColumns = [
  { field: 'netID', headerName: 'NetID' },
  { field: 'firstName', headerName: 'First Name', editable: true },
  { field: 'lastName', headerName: 'Last Name', editable: true },
  { field: 'email', headerName: 'Email' },
  { field: 'role.role', headerName: 'Role' },
  { field: 'active', headerName: 'Active', valueFormatter: (p: any) => p.value ? 'Yes' : 'No' },
]

function onUserSelect(e: any) {
  selectedUser.value = e.api.getSelectedRows()[0] ?? null
}

async function onUserEdit(e: any) {
  await $fetch('/api/admin/edit', {
    method: 'POST',
    body: { type: 'user', id: e.data.userID, field: e.colDef.field, value: e.newValue },
  })
}

// ── Projects ───────────────────────────────────────────────────────────────
const { data: projectData, refresh: refreshProjects } = await useFetch('/api/project')
const projects = computed(() => projectData.value ?? [])
const selectedProject = ref<any>(null)

const projectColumns = [
  { field: 'projectNum', headerName: 'Project #' },
  { field: 'projectTitle', headerName: 'Title', editable: true },
  { field: 'projectType', headerName: 'Type', editable: true },
  { field: 'startingBudget', headerName: 'Budget ($)', editable: true },
  { field: 'sponsorCompany', headerName: 'Sponsor', editable: true },
  { field: 'totalExpenses', headerName: 'Expenses ($)' },
]

function onProjectSelect(e: any) {
  selectedProject.value = e.api.getSelectedRows()[0] ?? null
}

async function onProjectEdit(e: any) {
  await $fetch('/api/admin/edit', {
    method: 'POST',
    body: { type: 'project', id: e.data.projectID, field: e.colDef.field, value: e.newValue },
  })
}

// ── Vendors ────────────────────────────────────────────────────────────────
const { data: vendorData, refresh: refreshVendors } = await useFetch('/api/vendor/all')
const vendors = computed(() => vendorData.value ?? [])

const vendorColumns = [
  { field: 'vendorName', headerName: 'Vendor Name', editable: true },
  { field: 'vendorStatus', headerName: 'Status', editable: true,
    cellEditor: 'agSelectCellEditor',
    cellEditorParams: { values: ['APPROVED', 'PENDING', 'DENIED'] },
  },
  { field: 'vendorEmail', headerName: 'Email', editable: true },
  { field: 'vendorURL', headerName: 'URL', editable: true },
]

async function onVendorEdit(e: any) {
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

// ── Deactivate / Reactivate ────────────────────────────────────────────────
const addUserOpen = ref(false)
const addProjectOpen = ref(false)
const deactivateOpen = ref(false)
const deactivateProjectOpen = ref(false)
const assignOpen = ref(false)

async function deactivateUser() {
  await $fetch('/api/admin/deactivate-user', {
    method: 'POST',
    body: { userID: selectedUser.value.userID },
  })
  selectedUser.value = null
  refreshUsers()
}

async function reactivateUser() {
  await $fetch('/api/admin/reactivate-user', {
    method: 'POST',
    body: { userID: selectedUser.value.userID },
  })
  selectedUser.value = null
  refreshUsers()
}

async function deactivateProject() {
  await $fetch('/api/admin/deactivate-project', {
    method: 'POST',
    body: { projectID: selectedProject.value.projectID },
  })
  selectedProject.value = null
  refreshProjects()
}
</script>

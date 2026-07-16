<template>
  <div class="space-y-6">
    <div v-if="pending" class="text-center py-12 text-[#5A5A5A]">Loading...</div>
    <div v-else-if="!project" class="text-center py-12 text-[#5A5A5A]">Project not found.</div>

    <template v-else>
      <!-- Header -->
      <div class="bg-[#154734] text-white rounded-xl px-6 py-5 flex items-center justify-between">
        <div>
          <span class="text-xs font-semibold text-white/60 uppercase tracking-wide">#{{ project.projectNum }}</span>
          <h1 class="text-2xl font-bold">{{ project.projectTitle }}</h1>
          <p class="text-sm text-white/70">
            {{ project.projectType }} &mdash; {{ project.sponsorCompany }}
            <template v-if="project.costCenter"> &bull; Cost Center: {{ project.costCenter }}</template>
          </p>
        </div>
        <div class="flex items-center gap-4">
          <BudgetDisplay
            class="scale-90 origin-right"
            :starting-budget="project.startingBudget"
            :used="project.totalExpenses"
          />
          <a v-if="isAdmin" :href="`/api/admin/project/${project.projectNum}/export`" download>
            <UButton size="sm" variant="outline" class="border-white text-white">Export Orders</UButton>
          </a>
        </div>
      </div>

      <!-- Budget summary -->
      <div class="grid grid-cols-3 gap-4">
        <div class="bg-white border border-[#D9D9D9] rounded-xl p-4 text-center">
          <p class="text-xs text-[#5A5A5A] uppercase font-semibold">Starting Budget</p>
          <p class="text-xl font-bold text-[#1A1A1A]">${{ project.startingBudget.toLocaleString() }}</p>
        </div>
        <div class="bg-white border border-[#D9D9D9] rounded-xl p-4 text-center">
          <p class="text-xs text-[#5A5A5A] uppercase font-semibold">Total Expenses</p>
          <p class="text-xl font-bold text-[#E87722]">${{ project.totalExpenses.toLocaleString() }}</p>
        </div>
        <div class="bg-white border border-[#D9D9D9] rounded-xl p-4 text-center">
          <p class="text-xs text-[#5A5A5A] uppercase font-semibold">Available Balance</p>
          <p class="text-xl font-bold" :class="remaining < 0 ? 'text-red-600' : 'text-[#154734]'">
            ${{ remaining.toLocaleString() }}
          </p>
        </div>
      </div>

      <!-- Current team -->
      <div class="bg-white border border-[#D9D9D9] rounded-xl p-6 space-y-3">
        <h2 class="font-bold text-[#1A1A1A]">Current Team</h2>
        <div v-if="!currentTeam.length" class="text-sm text-[#5A5A5A]">No active members.</div>
        <div
          v-for="w in currentTeam"
          :key="`${w.userID}-${w.startDate}`"
          class="flex items-center justify-between text-sm border border-[#F0F0F0] rounded-lg px-4 py-2"
        >
          <span>
            {{ w.user.firstName }} {{ w.user.lastName }}
            <span class="text-xs text-[#5A5A5A] ml-2">{{ w.user.role }}</span>
            <span class="text-xs text-[#5A5A5A] ml-2">since {{ formatDate(w.startDate) }}</span>
          </span>
          <UButton
            v-if="isAdmin"
            size="xs"
            variant="outline"
            class="border-red-500 text-red-500"
            @click="removeMember(w)"
          >
            Remove
          </UButton>
        </div>
      </div>

      <!-- Previous team history -->
      <div v-if="previousTeam.length" class="bg-white border border-[#D9D9D9] rounded-xl p-6 space-y-3">
        <h2 class="font-bold text-[#1A1A1A]">Previous Team Members</h2>
        <div
          v-for="w in previousTeam"
          :key="`${w.userID}-${w.startDate}`"
          class="text-sm text-[#5A5A5A] border border-[#F0F0F0] rounded-lg px-4 py-2"
        >
          {{ w.user.firstName }} {{ w.user.lastName }}
          <span class="text-xs ml-2">{{ w.user.role }}</span>
          <span class="text-xs ml-2">{{ formatDate(w.startDate) }} → {{ formatDate(w.endDate) }}</span>
        </div>
      </div>

      <!-- Requests -->
      <div class="bg-white border border-[#D9D9D9] rounded-xl p-6 space-y-3">
        <h2 class="font-bold text-[#1A1A1A]">Procurement Requests</h2>
        <div v-if="!project.requests?.length" class="text-sm text-[#5A5A5A]">No requests.</div>
        <div
          v-for="req in project.requests"
          :key="req.requestID"
          class="flex items-center justify-between border border-[#F0F0F0] rounded-lg px-4 py-2 text-sm"
        >
          <span>
            <span class="font-medium">Request #{{ req.requestID }}</span>
            <span class="text-[#5A5A5A] ml-2">by {{ req.student?.firstName }} {{ req.student?.lastName }}</span>
            <span class="text-[#5A5A5A] ml-2">{{ formatDate(req.dateSubmitted) }}</span>
            <span class="text-[#5A5A5A] ml-2">${{ req.expense?.toFixed(2) }}</span>
          </span>
          <StatusBadge :status="req.process?.status ?? ''" />
        </div>
      </div>

      <!-- Reimbursements -->
      <div class="bg-white border border-[#D9D9D9] rounded-xl p-6 space-y-3">
        <h2 class="font-bold text-[#1A1A1A]">Reimbursements</h2>
        <div v-if="!project.reimbursements?.length" class="text-sm text-[#5A5A5A]">No reimbursements.</div>
        <div
          v-for="r in project.reimbursements"
          :key="r.reimbursementID"
          class="flex items-center justify-between border border-[#F0F0F0] rounded-lg px-4 py-2 text-sm"
        >
          <span>
            <span class="font-medium">Reimbursement #{{ r.reimbursementID }}</span>
            <span class="text-[#5A5A5A] ml-2">by {{ r.student?.firstName }} {{ r.student?.lastName }}</span>
            <span class="text-[#5A5A5A] ml-2">{{ formatDate(r.dateSubmitted) }}</span>
            <span class="text-[#5A5A5A] ml-2">${{ r.expense?.toFixed(2) }}</span>
          </span>
          <StatusBadge :status="r.process?.status ?? ''" />
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const { isAdmin } = useAuth()
const route = useRoute()

interface WorksOnEntry {
  userID: number
  startDate: string
  endDate?: string | null
  user: { firstName: string; lastName: string; role: string }
}

interface ProjectDetail {
  projectID: number
  projectNum: string
  projectTitle: string
  projectType: string
  sponsorCompany: string
  costCenter?: string | null
  startingBudget: number
  totalExpenses: number
  worksOn: WorksOnEntry[]
  requests?: Array<{
    requestID: number
    dateSubmitted: string
    expense?: number
    student?: { firstName: string; lastName: string }
    process?: { status: string }
  }>
  reimbursements?: Array<{
    reimbursementID: number
    dateSubmitted: string
    expense?: number
    student?: { firstName: string; lastName: string }
    process?: { status: string }
  }>
}

const { data: project, pending, refresh } = await useFetch<ProjectDetail>(
  `/api/project/${route.params.projectNum}`,
)

const remaining = computed(() =>
  project.value ? project.value.startingBudget - project.value.totalExpenses : 0,
)

const currentTeam = computed(() => (project.value?.worksOn ?? []).filter(w => !w.endDate))
const previousTeam = computed(() => (project.value?.worksOn ?? []).filter(w => w.endDate))

async function removeMember(w: WorksOnEntry) {
  await $fetch('/api/worksOn/deactivate', {
    method: 'POST',
    body: { userID: w.userID, projectID: project.value!.projectID },
  })
  refresh()
}

function formatDate(d: string | null | undefined) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-US')
}
</script>

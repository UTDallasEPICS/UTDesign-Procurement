<template>
  <div class="space-y-6">
    <h1 class="text-2xl font-bold text-[#1A1A1A]">All Projects</h1>

    <div v-if="pending" class="text-center py-12 text-[#5A5A5A]">Loading...</div>
    <div v-else-if="!projects?.length" class="text-center py-12 text-[#5A5A5A]">No projects found.</div>

    <div v-else class="space-y-6">
      <div
        v-for="project in projects"
        :key="project.projectID"
        class="bg-white border border-[#D9D9D9] rounded-xl overflow-hidden"
      >
        <!-- Project Header -->
        <div class="bg-[#154734] text-white px-6 py-4 flex items-center justify-between">
          <div>
            <span class="text-xs font-semibold text-white/60 uppercase tracking-wide">#{{ project.projectNum }}</span>
            <h2 class="text-lg font-bold">{{ project.projectTitle }}</h2>
            <span class="text-xs text-white/70">{{ project.projectType }} &mdash; {{ project.sponsorCompany }}</span>
          </div>
          <div class="flex items-center gap-3">
            <BudgetDisplay
              class="scale-90 origin-right"
              :starting-budget="project.startingBudget"
              :used="project.totalExpenses"
            />
            <NuxtLink :to="`/projects/${project.projectNum}`">
              <UButton size="sm" variant="outline" class="border-white text-white">View Details</UButton>
            </NuxtLink>
          </div>
        </div>

        <!-- Team Members -->
        <div class="px-6 py-3 border-b border-[#D9D9D9] flex gap-6 text-sm">
          <div>
            <span class="font-semibold text-[#5A5A5A]">Mentors: </span>
            <span>{{ getMentors(project).map((u: any) => `${u.user.firstName} ${u.user.lastName}`).join(', ') || 'None' }}</span>
          </div>
          <div>
            <span class="font-semibold text-[#5A5A5A]">Students: </span>
            <span>{{ getStudents(project).map((u: any) => `${u.user.firstName} ${u.user.lastName}`).join(', ') || 'None' }}</span>
          </div>
        </div>

        <!-- Requests -->
        <div class="px-6 py-4">
          <h3 class="font-semibold text-[#1A1A1A] mb-3">Request History</h3>
          <div v-if="!project.requests?.length" class="text-sm text-[#5A5A5A]">No requests.</div>
          <div v-else class="space-y-2">
            <div
              v-for="req in project.requests"
              :key="req.requestID"
              class="flex items-center justify-between border border-[#D9D9D9] rounded-lg px-4 py-2"
            >
              <div class="text-sm">
                <span class="font-medium">Request #{{ req.requestID }}</span>
                <span class="text-[#5A5A5A] ml-2">{{ formatDate(req.dateSubmitted) }}</span>
                <span class="text-[#5A5A5A] ml-2">${{ req.expense.toFixed(2) }}</span>
              </div>
              <StatusBadge :status="req.process?.status ?? 'UNKNOWN'" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const { isAdmin } = useAuth()
if (!isAdmin.value) await navigateTo('/orders')

const { data, pending } = await useFetch<any[]>('/api/project')
const projects = computed(() => (data.value ?? []) as any[])

function getMentors(project: any) {
  return (project.worksOn ?? []).filter((w: any) => w.user?.role === 'MENTOR' && !w.endDate)
}

function getStudents(project: any) {
  return (project.worksOn ?? []).filter((w: any) => w.user?.role === 'STUDENT' && !w.endDate)
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-US')
}
</script>

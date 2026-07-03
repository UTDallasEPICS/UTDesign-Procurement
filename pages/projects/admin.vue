<template>
  <div class="mx-auto max-w-5xl space-y-6">
    <section class="app-surface overflow-hidden p-0">
      <div class="border-b border-white/70 bg-gradient-to-r from-[#154734] to-[#0f3326] px-6 py-6 text-white sm:px-8">
        <p class="text-xs font-bold uppercase tracking-[0.3em] text-white/60">Admin dashboard</p>
        <h1 class="mt-2 text-3xl font-black tracking-tight">All Projects</h1>
        <p class="mt-2 max-w-2xl text-sm text-white/75">
          Review every project, its budget position, and the active mentor/student assignments in one place.
        </p>
      </div>

      <div class="space-y-6 p-6 sm:p-8">
        <div v-if="pending" class="rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center text-slate-500">Loading...</div>
        <div v-else-if="!projects?.length" class="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center text-slate-500">No projects found.</div>

        <div v-else class="space-y-6">
          <div
            v-for="project in projects"
            :key="project.projectID"
            class="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
          >
            <div class="flex flex-col gap-4 border-b border-slate-200 bg-slate-50 px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p class="text-xs font-bold uppercase tracking-[0.24em] text-[#154734]">#{{ project.projectNum }}</p>
                <h2 class="text-xl font-black tracking-tight text-slate-900">{{ project.projectTitle }}</h2>
                <p class="text-sm text-slate-500">{{ project.projectType }} - {{ project.sponsorCompany }}</p>
              </div>
              <div class="flex flex-wrap items-center gap-3">
                <BudgetDisplay
                  class="scale-95 origin-right"
                  :starting-budget="project.startingBudget"
                  :used="project.totalExpenses"
                />
                <NuxtLink :to="`/projects/${project.projectNum}`">
                  <UButton size="sm" class="bg-[#154734] text-white">View Details</UButton>
                </NuxtLink>
              </div>
            </div>

            <div class="grid gap-4 px-6 py-5 md:grid-cols-2">
              <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm">
                <p class="text-xs font-bold uppercase tracking-[0.24em] text-slate-500">Mentors</p>
                <p class="mt-2 text-slate-700">
                  {{ getMentors(project).map((u: any) => `${u.user.firstName} ${u.user.lastName}`).join(', ') || 'None' }}
                </p>
              </div>
              <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm">
                <p class="text-xs font-bold uppercase tracking-[0.24em] text-slate-500">Students</p>
                <p class="mt-2 text-slate-700">
                  {{ getStudents(project).map((u: any) => `${u.user.firstName} ${u.user.lastName}`).join(', ') || 'None' }}
                </p>
              </div>
            </div>

            <div class="border-t border-slate-200 px-6 py-5">
              <h3 class="mb-3 text-sm font-bold uppercase tracking-[0.24em] text-slate-500">Request history</h3>
              <div v-if="!project.requests?.length" class="text-sm text-slate-500">No requests.</div>
              <div v-else class="space-y-2">
                <div
                  v-for="req in project.requests"
                  :key="req.requestID"
                  class="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div class="text-sm">
                    <p class="font-semibold text-slate-900">Request #{{ req.requestID }}</p>
                    <p class="text-slate-500">{{ formatDate(req.dateSubmitted) }} - ${{ req.expense.toFixed(2) }}</p>
                  </div>
                  <StatusBadge :status="req.process?.status ?? 'UNKNOWN'" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
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

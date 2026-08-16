<template>
  <div class="mx-auto max-w-5xl space-y-6">
    <section class="app-surface overflow-hidden p-0">
      <div class="border-b border-white/70 bg-gradient-to-r from-[#154734] to-[#0f3326] px-6 py-6 text-white sm:px-8">
        <p class="text-xs font-bold uppercase tracking-[0.3em] text-white/60">Mentor dashboard</p>
        <h1 class="mt-2 text-3xl font-black tracking-tight">Project Overview</h1>
        <p class="mt-2 max-w-2xl text-sm text-white/75">
          Review the projects you are assigned to, inspect budgets, and open the detailed project timeline when needed.
        </p>
      </div>

      <div class="space-y-6 p-6 sm:p-8">
        <div v-if="pending" class="rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center text-slate-500">Loading...</div>
        <div v-else-if="!projects?.length" class="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center text-slate-500">
          You are not assigned to any projects.
        </div>
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
              <BudgetDisplay
                class="scale-95 origin-right"
                :starting-budget="project.startingBudget"
                :used="project.totalExpenses"
              />
            </div>
            <div class="flex flex-col gap-3 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
              <p class="text-sm text-slate-600">
                Budget: ${{ project.startingBudget.toLocaleString() }} starting / ${{ (project.startingBudget - project.totalExpenses).toLocaleString() }} remaining
              </p>
              <NuxtLink :to="`/projects/${project.projectNum}`">
                <UButton size="sm" class="bg-[#154734] text-white">View Details</UButton>
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const { isMentor } = useAuth()
if (!isMentor.value) await navigateTo('/orders')

const { data, pending } = await useFetch('/api/worksOn/currentProjects')
const projects = computed(() => data.value ?? [])
</script>

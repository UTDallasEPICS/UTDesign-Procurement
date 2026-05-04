<template>
  <div class="space-y-6">
    <h1 class="text-2xl font-bold text-[#1A1A1A]">My Projects</h1>
    <div v-if="pending" class="text-center py-12 text-[#5A5A5A]">Loading...</div>
    <div v-else-if="!projects?.length" class="text-center py-12 text-[#5A5A5A]">You are not assigned to any projects.</div>
    <div v-else class="space-y-6">
      <div
        v-for="project in projects"
        :key="project.projectID"
        class="bg-white border border-[#D9D9D9] rounded-xl overflow-hidden"
      >
        <div class="bg-[#154734] text-white px-6 py-4 flex items-center justify-between">
          <div>
            <span class="text-xs text-white/70">#{{ project.projectNum }}</span>
            <h2 class="text-lg font-bold">{{ project.projectTitle }}</h2>
            <span class="text-xs text-white/70">{{ project.projectType }} &mdash; {{ project.sponsorCompany }}</span>
          </div>
          <BudgetDisplay
            class="scale-90 origin-right"
            :starting-budget="project.startingBudget"
            :used="project.totalExpenses"
          />
        </div>
        <div class="px-6 py-4 text-sm text-[#5A5A5A]">
          <p>Budget: ${{ project.startingBudget.toLocaleString() }} starting / ${{ (project.startingBudget - project.totalExpenses).toLocaleString() }} remaining</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const { isMentor } = useAuth()
if (!isMentor.value) await navigateTo('/orders')

const { data, pending } = await useFetch('/api/worksOn/currentProjects')
const projects = computed(() => data.value ?? [])
</script>

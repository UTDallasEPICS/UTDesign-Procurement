<template>
  <nav class="sticky top-0 z-40 border-b border-white/50 bg-[#0f3d2f]/95 text-white shadow-[0_10px_30px_rgba(15,23,42,0.14)] backdrop-blur-xl">
    <div class="mx-auto flex min-h-20 w-full max-w-[1500px] items-center gap-4 px-4 py-3 sm:px-6 lg:px-8">
      <div class="flex items-center gap-3 shrink-0">
        <div class="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-[#0f3d2f] font-black shadow-lg shadow-black/10 select-none">
          UT<span class="text-[#d86e18]">D</span>
        </div>
        <div class="leading-tight">
          <p class="text-[10px] uppercase tracking-[0.32em] text-white/55">The University of Texas at Dallas</p>
          <p class="text-base font-semibold tracking-tight">UTDesign Procurement</p>
          <p class="text-xs text-white/55">Clearer workflows for requests, reimbursements, and database upkeep</p>
        </div>
      </div>

      <div class="hidden lg:flex flex-1 justify-center">
        <div class="flex items-center gap-2 rounded-full border border-white/10 bg-white/8 px-2 py-2">
          <NuxtLink
            v-if="isStudent"
            to="/request-form"
            class="rounded-full px-4 py-2 text-sm font-semibold transition hover:bg-white/10 hover:text-white"
            :class="isActive('/request-form') ? 'bg-[#d86e18] text-white shadow-sm' : 'text-white/80'"
          >
            New Request
          </NuxtLink>
          <NuxtLink
            v-if="isStudent"
            to="/reimbursement/student"
            class="rounded-full px-4 py-2 text-sm font-semibold transition hover:bg-white/10 hover:text-white"
            :class="isActive('/reimbursement') ? 'bg-[#d86e18] text-white shadow-sm' : 'text-white/80'"
          >
            Reimbursement
          </NuxtLink>
          <NuxtLink
            to="/orders"
            class="rounded-full px-4 py-2 text-sm font-semibold transition hover:bg-white/10 hover:text-white"
            :class="isActive('/orders') ? 'bg-[#d86e18] text-white shadow-sm' : 'text-white/80'"
          >
            Orders
          </NuxtLink>
          <NuxtLink
            to="/projects"
            class="rounded-full px-4 py-2 text-sm font-semibold transition hover:bg-white/10 hover:text-white"
            :class="isActive('/projects') ? 'bg-[#d86e18] text-white shadow-sm' : 'text-white/80'"
          >
            Projects
          </NuxtLink>
          <NuxtLink
            v-if="isAdmin"
            to="/database-updates"
            class="rounded-full px-4 py-2 text-sm font-semibold transition hover:bg-white/10 hover:text-white"
            :class="isActive('/database-updates') ? 'bg-[#d86e18] text-white shadow-sm' : 'text-white/80'"
          >
            Database
          </NuxtLink>
        </div>
      </div>

      <div v-if="user" class="ml-auto flex items-center gap-3">
        <div class="hidden md:flex flex-col items-end text-right">
          <div class="flex items-center gap-2">
            <span class="rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-white/70">
              {{ roleLabel }}
            </span>
          </div>
          <span class="mt-1 text-sm font-medium">{{ user.name ?? user.email }}</span>
          <span class="text-xs text-white/55">{{ user.netID ? `NetID ${user.netID}` : 'Session authenticated' }}</span>
        </div>
        <UButton
          size="sm"
          variant="solid"
          class="bg-white text-[#0f3d2f] hover:bg-white/90 font-semibold shadow-sm"
          @click="signOut"
        >
          Sign Out
        </UButton>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
const route = useRoute()
const { user, isAdmin, isStudent, signOut } = useAuth()

const isActive = (path: string) => {
  return route.path.startsWith(path)
}

const roleLabel = computed(() => {
  if (isAdmin.value) return 'Admin'
  if (isStudent.value) return 'Student'
  return 'Mentor'
})
</script>
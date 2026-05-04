<template>
  <nav class="bg-[#154734] text-white shadow-md">
    <div class="container mx-auto px-4 flex items-stretch justify-between h-14">
      <!-- UTD Logo + Title -->
      <div class="flex items-center gap-3">
        <div class="font-black text-lg tracking-tight bg-white text-[#154734] px-2 py-0.5 leading-tight select-none">
          UT<span class="text-[#E87722]">D</span>
        </div>
        <div class="hidden sm:flex flex-col leading-none">
          <span class="text-[10px] text-white/60 uppercase tracking-widest">The University of Texas at Dallas</span>
          <span class="font-semibold text-sm">UTDesign Procurement</span>
        </div>
      </div>

      <!-- Nav Links (role-based) -->
      <div class="flex items-stretch gap-1 text-sm font-medium">
        <NuxtLink
          v-if="isStudent"
          to="/request-form"
          class="flex items-center px-4 hover:bg-white/10 transition-colors border-b-2 border-transparent"
          active-class="border-b-2 border-[#E87722] bg-white/10"
        >
          New Request
        </NuxtLink>
        <NuxtLink
          v-if="isStudent"
          to="/reimbursement/student"
          class="flex items-center px-4 hover:bg-white/10 transition-colors border-b-2 border-transparent"
          active-class="border-b-2 border-[#E87722] bg-white/10"
        >
          Reimbursement
        </NuxtLink>
        <NuxtLink
          to="/orders"
          class="flex items-center px-4 hover:bg-white/10 transition-colors border-b-2 border-transparent"
          active-class="border-b-2 border-[#E87722] bg-white/10"
        >
          Orders
        </NuxtLink>
        <NuxtLink
          to="/projects"
          class="flex items-center px-4 hover:bg-white/10 transition-colors border-b-2 border-transparent"
          active-class="border-b-2 border-[#E87722] bg-white/10"
        >
          Projects
        </NuxtLink>
        <NuxtLink
          v-if="isAdmin"
          to="/database-updates"
          class="flex items-center px-4 hover:bg-white/10 transition-colors border-b-2 border-transparent"
          active-class="border-b-2 border-[#E87722] bg-white/10"
        >
          Database
        </NuxtLink>

        <!-- User info + Logout -->
        <div v-if="user" class="flex items-center gap-3 ml-2 pl-4 border-l border-white/20">
          <span class="text-white/70 hidden md:block text-xs">{{ user.name ?? user.email }}</span>
          <UButton
            size="xs"
            color="white"
            variant="outline"
            class="border-white/40 text-white hover:bg-white/10"
            @click="signOut"
          >
            Sign Out
          </UButton>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
const { user, isAdmin, isStudent, signOut } = useAuth()
</script>

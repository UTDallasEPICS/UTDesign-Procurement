<template>
  <nav class="bg-[#C75B12] text-white shadow-md">
    <div class="container mx-auto px-4 py-3 flex items-center justify-between">
      <!-- UTD Logo + Title -->
      <div class="flex items-center gap-3">
        <div class="font-bold text-xl tracking-tight border-2 border-white px-2 py-0.5 text-[#E87722]">
          UT<span class="text-white">D</span>
        </div>
        <span class="font-semibold text-lg hidden sm:block">UTDesign Procurement</span>
      </div>

      <!-- Nav Links (role-based) -->
      <div class="flex items-center gap-6 text-sm font-medium">
        <NuxtLink
          v-if="isStudent"
          to="/request-form"
          class="hover:text-[#E87722] transition-colors"
          active-class="border-b-2 border-[#E87722]"
        >
          New Request
        </NuxtLink>
        <NuxtLink
          v-if="isStudent"
          to="/reimbursement/student"
          class="hover:text-[#E87722] transition-colors"
          active-class="border-b-2 border-[#E87722]"
        >
          Reimbursement
        </NuxtLink>
        <NuxtLink
          to="/orders"
          class="hover:text-[#E87722] transition-colors"
          active-class="border-b-2 border-[#E87722]"
        >
          Orders
        </NuxtLink>
        <NuxtLink
          to="/projects"
          class="hover:text-[#E87722] transition-colors"
          active-class="border-b-2 border-[#E87722]"
        >
          Projects
        </NuxtLink>
        <NuxtLink
          v-if="isAdmin"
          to="/database-updates"
          class="hover:text-[#E87722] transition-colors"
          active-class="border-b-2 border-[#E87722]"
        >
          Database
        </NuxtLink>

        <!-- User info + Logout -->
        <div v-if="user" class="flex items-center gap-3 ml-4 pl-4 border-l border-white/40">
          <span class="text-white/80 hidden md:block text-xs">{{ user.name ?? user.email }}</span>
          <UButton
            size="xs"
            variant="outline"
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

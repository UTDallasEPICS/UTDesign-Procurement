<template>
  <nav
    class="sticky top-0 z-40 border-b border-white/50 bg-[#0f3d2f]/95 text-white shadow-[0_10px_30px_rgba(15,23,42,0.14)] backdrop-blur-xl"
  >
    <div class="mx-auto w-full max-w-[1500px] px-4 sm:px-6 lg:px-8">
      <!-- Main navbar -->
      <div class="flex min-h-20 items-center gap-3 py-3">

        <!-- Logo / Brand -->
        <div class="flex min-w-0 shrink items-center gap-3">
          <div
            class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white font-black text-[#0f3d2f] shadow-lg shadow-black/10 select-none"
          >
            UT<span class="text-[#d86e18]">D</span>
          </div>

          <div class="min-w-0 leading-tight">
            <p
              class="hidden text-[10px] uppercase tracking-[0.32em] text-white/55 sm:block"
            >
              The University of Texas at Dallas
            </p>

            <p class="truncate text-sm font-semibold tracking-tight sm:text-base">
              UTDesign Procurement
            </p>

            <p class="hidden truncate text-xs text-white/55 md:block">
              Clearer workflows for requests, reimbursements, and database upkeep
            </p>
          </div>
        </div>

        <!-- Desktop Navigation -->
        <div class="hidden flex-1 justify-center lg:flex">
          <div
            class="flex items-center gap-1 rounded-full border border-white/10 bg-white/8 px-2 py-2"
          >
            <NuxtLink
              v-if="isStudent"
              to="/request-form"
              class="rounded-full px-4 py-2 text-sm font-semibold transition hover:bg-white/10 hover:text-white"
              :class="
                isActive('/request-form')
                  ? 'bg-[#d86e18] text-white shadow-sm'
                  : 'text-white/80'
              "
            >
              New Request
            </NuxtLink>

            <NuxtLink
              v-if="isStudent"
              to="/reimbursement/student"
              class="rounded-full px-4 py-2 text-sm font-semibold transition hover:bg-white/10 hover:text-white"
              :class="
                isActive('/reimbursement')
                  ? 'bg-[#d86e18] text-white shadow-sm'
                  : 'text-white/80'
              "
            >
              Reimbursement
            </NuxtLink>

            <NuxtLink
              to="/orders"
              class="rounded-full px-4 py-2 text-sm font-semibold transition hover:bg-white/10 hover:text-white"
              :class="
                isActive('/orders')
                  ? 'bg-[#d86e18] text-white shadow-sm'
                  : 'text-white/80'
              "
            >
              Orders
            </NuxtLink>

            <NuxtLink
              to="/projects"
              class="rounded-full px-4 py-2 text-sm font-semibold transition hover:bg-white/10 hover:text-white"
              :class="
                isActive('/projects')
                  ? 'bg-[#d86e18] text-white shadow-sm'
                  : 'text-white/80'
              "
            >
              Projects
            </NuxtLink>

            <NuxtLink
              v-if="isAdmin"
              to="/database-updates"
              class="rounded-full px-4 py-2 text-sm font-semibold transition hover:bg-white/10 hover:text-white"
              :class="
                isActive('/database-updates')
                  ? 'bg-[#d86e18] text-white shadow-sm'
                  : 'text-white/80'
              "
            >
              Database
            </NuxtLink>
          </div>
        </div>

        <!-- User / Actions -->
        <div v-if="user" class="ml-auto flex shrink-0 items-center gap-2 sm:gap-3">
          <!-- User info -->
          <div class="hidden text-right md:flex md:flex-col md:items-end">
            <div class="flex items-center gap-2">
              <span
                class="rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-white/70"
              >
                {{ roleLabel }}
              </span>
            </div>

            <span class="mt-1 max-w-[180px] truncate text-sm font-medium">
              {{ user.name ?? user.email }}
            </span>

            <span class="text-xs text-white/55">
              {{ user.netID ? `NetID ${user.netID}` : 'Session authenticated' }}
            </span>
          </div>

          <!-- Sign out -->
          <UButton
            size="sm"
            variant="solid"
            class="cursor-pointer bg-white font-semibold text-[#0f3d2f] shadow-sm hover:bg-white/90"
            @click="signOut"
          >
            <span class="hidden sm:inline">Sign Out</span>
            <span class="sm:hidden">Exit</span>
          </UButton>

          <!-- Mobile menu button -->
          <button
            type="button"
            class="flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-white/10 transition hover:bg-white/15 lg:hidden"
            :aria-expanded="mobileMenuOpen"
            aria-label="Toggle navigation menu"
            @click="mobileMenuOpen = !mobileMenuOpen"
          >
            <svg
              v-if="!mobileMenuOpen"
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>

            <svg
              v-else
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <!-- Mobile menu button when no user -->
        <button
          v-else
          type="button"
          class="ml-auto flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-white/10 transition hover:bg-white/15 lg:hidden"
          :aria-expanded="mobileMenuOpen"
          aria-label="Toggle navigation menu"
          @click="mobileMenuOpen = !mobileMenuOpen"
        >
          <svg
            v-if="!mobileMenuOpen"
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>

          <svg
            v-else
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <!-- Mobile Navigation -->
      <div
        v-if="mobileMenuOpen"
        class="border-t border-white/10 pb-4 pt-3 lg:hidden"
      >
        <div class="flex flex-col gap-1">

          <NuxtLink
            v-if="isStudent"
            to="/request-form"
            class="rounded-xl px-4 py-3 text-sm font-semibold transition hover:bg-white/10"
            :class="
              isActive('/request-form')
                ? 'bg-[#d86e18] text-white'
                : 'text-white/80'
            "
            @click="mobileMenuOpen = false"
          >
            New Request
          </NuxtLink>

          <NuxtLink
            v-if="isStudent"
            to="/reimbursement/student"
            class="rounded-xl px-4 py-3 text-sm font-semibold transition hover:bg-white/10"
            :class="
              isActive('/reimbursement')
                ? 'bg-[#d86e18] text-white'
                : 'text-white/80'
            "
            @click="mobileMenuOpen = false"
          >
            Reimbursement
          </NuxtLink>

          <NuxtLink
            to="/orders"
            class="rounded-xl px-4 py-3 text-sm font-semibold transition hover:bg-white/10"
            :class="
              isActive('/orders')
                ? 'bg-[#d86e18] text-white'
                : 'text-white/80'
            "
            @click="mobileMenuOpen = false"
          >
            Orders
          </NuxtLink>

          <NuxtLink
            to="/projects"
            class="rounded-xl px-4 py-3 text-sm font-semibold transition hover:bg-white/10"
            :class="
              isActive('/projects')
                ? 'bg-[#d86e18] text-white'
                : 'text-white/80'
            "
            @click="mobileMenuOpen = false"
          >
            Projects
          </NuxtLink>

          <NuxtLink
            v-if="isAdmin"
            to="/database-updates"
            class="rounded-xl px-4 py-3 text-sm font-semibold transition hover:bg-white/10"
            :class="
              isActive('/database-updates')
                ? 'bg-[#d86e18] text-white'
                : 'text-white/80'
            "
            @click="mobileMenuOpen = false"
          >
            Database
          </NuxtLink>

          <!-- Mobile user information -->
          <div
            v-if="user"
            class="mt-2 border-t border-white/10 px-4 pt-4"
          >
            <div class="flex items-center justify-between gap-3">
              <div class="min-w-0">
                <p class="truncate text-sm font-semibold">
                  {{ user.name ?? user.email }}
                </p>

                <p class="mt-1 text-xs text-white/55">
                  {{ user.netID ? `NetID ${user.netID}` : 'Session authenticated' }}
                </p>
              </div>

              <span
                class="shrink-0 rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white/70"
              >
                {{ roleLabel }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
const route = useRoute()
const { user, isAdmin, isStudent, signOut } = useAuth()

const mobileMenuOpen = ref(false)

const isActive = (path: string) => {
  return route.path.startsWith(path)
}

const roleLabel = computed(() => {
  if (isAdmin.value) return 'Admin'
  if (isStudent.value) return 'Student'
  return 'Mentor'
})

// Close mobile menu whenever the route changes
watch(
  () => route.path,
  () => {
    mobileMenuOpen.value = false
  }
)
</script>
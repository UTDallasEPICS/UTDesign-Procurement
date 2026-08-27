<template>
  <div class="min-h-screen flex flex-col" style="background: linear-gradient(160deg, #154734 0%, #0f3326 60%, #1a1a1a 100%);">
    <!-- Top accent bar -->
    <div class="h-1 bg-[#E87722]" />

    <div class="flex-1 flex items-center justify-center px-4 py-12">
      <div class="w-full max-w-sm">
        <!-- Logo block -->
        <div class="text-center mb-8">
          <div class="inline-flex items-center gap-3 mb-3">
            <div class="font-black text-3xl tracking-tight bg-white text-[#154734] px-2.5 py-1 leading-tight">
              UT<span class="text-[#E87722]">D</span>
            </div>
          </div>
          <p class="text-white/50 text-xs uppercase tracking-widest">The University of Texas at Dallas</p>
          <h1 class="text-white font-bold text-xl mt-1">UTDesign Procurement</h1>
        </div>

        <!-- Login Card -->
        <div class="bg-white rounded-xl shadow-2xl overflow-hidden">
          <div class="px-8 py-6 border-b border-[#E8E8E8]">
            <h2 class="text-lg font-bold text-[#154734]">Sign In</h2>
            <p class="text-sm text-[#5A5A5A] mt-0.5">UTD students &amp; staff: use your UTD email. External mentors: use the email your admin registered.</p>
          </div>

          <form class="px-8 py-6 space-y-4" @submit.prevent="handleLogin">
              <UInput
                class="w-full text-slate-500"
                label="email"
                v-model="email"
                type="email"
                placeholder="abc123456@utdallas.edu..."
                autocomplete="email"
                size="lg"
                required
                />
            <div
              v-if="error"
              class="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5"
            >
              {{ error }}
            </div>

            <UButton
              type="submit"
              block
              size="lg"
              class="bg-[#154734] hover:bg-[#0f3326] text-white font-semibold mt-2"
              :loading="loading"
              @click="openInputCodeModal"
            >
              send One time password
            </UButton>
          </form>
        </div>

        <p class="text-white/30 text-xs text-center mt-6">
          Access is restricted to authorized UTD personnel.
        </p>
      </div>
    </div>

    <div class="h-1 bg-[#154734]/50" />
  </div>


  <InputCodeModal
    v-if="codeInputOpen"
    @close="codeInputOpen = false"
  />
</template>

<script setup lang="ts">
definePageMeta({ layout: false, middleware: 'auth' })

const { authClient, isLoggedIn } = useAuth()

const email = ref('')
const error = ref('')
const loading = ref(false)
const codeInputOpen = ref(false)


async function handleLogin() {
  error.value = ''

  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  if (!emailRe.test(email.value.trim())) {
    error.value = 'Please enter a valid email address'
    return
  }

  // Open modal after validation
  codeInputOpen.value = true
}

</script>

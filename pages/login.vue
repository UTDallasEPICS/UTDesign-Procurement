<template>
  <div class="min-h-screen bg-[#F4F4F4] flex items-center justify-center">
    <div class="w-full max-w-md">
      <!-- UTD Header -->
      <div class="bg-[#C75B12] text-white px-8 py-6 rounded-t-xl">
        <div class="flex items-center gap-3 mb-1">
          <div class="font-bold text-2xl tracking-tight border-2 border-white px-2 py-0.5 text-[#E87722]">
            UT<span class="text-white">D</span>
          </div>
          <div>
            <p class="text-xs text-white/70 uppercase tracking-widest">The University of Texas at Dallas</p>
            <p class="font-bold text-lg">UTDesign Procurement</p>
          </div>
        </div>
      </div>

      <!-- Login Card -->
      <div class="bg-white border border-[#D9D9D9] px-8 py-8 rounded-b-xl shadow-lg">
        <h2 class="text-xl font-bold text-[#1A1A1A] mb-1">Sign In</h2>
        <p class="text-sm text-[#5A5A5A] mb-6">Use your UTD email address</p>

        <form class="space-y-4" @submit.prevent="handleLogin">
          <div>
            <label class="block text-sm font-medium text-[#1A1A1A] mb-1">UTD Email</label>
            <UInput
              v-model="email"
              type="email"
              placeholder="abc123456@utdallas.edu"
              autocomplete="email"
              required
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-[#1A1A1A] mb-1">Password</label>
            <UInput
              v-model="password"
              type="password"
              placeholder="Password"
              autocomplete="current-password"
              required
            />
          </div>

          <div
            v-if="error"
            class="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2"
          >
            {{ error }}
          </div>

          <UButton
            type="submit"
            block
            class="bg-[#154734] hover:bg-[#0f3326] text-white font-semibold py-2"
            :loading="loading"
          >
            Sign In
          </UButton>
        </form>

        <!-- UTD SSO stub — enable when OIT provides credentials -->
        <!-- <div class="mt-4 pt-4 border-t border-[#D9D9D9]">
          <UButton block variant="outline" class="border-[#E87722] text-[#E87722]" disabled>
            Sign in with UTD Microsoft SSO (coming soon)
          </UButton>
        </div> -->

        <p class="text-xs text-[#5A5A5A] text-center mt-6">
          Access is restricted to authorized UTD personnel.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false, middleware: 'auth' })

const { authClient, isLoggedIn } = useAuth()

const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

async function handleLogin() {
  error.value = ''

  // Basic UTD email format check
  const utdEmailRe = /^[a-zA-Z]{3}\d{6}@utdallas\.edu$/
  if (!utdEmailRe.test(email.value.trim())) {
    error.value = 'Please enter a valid UTD email (e.g. abc123456@utdallas.edu)'
    return
  }

  loading.value = true
  try {
    await authClient.signIn.email({
      email: email.value.trim().toLowerCase(),
      password: password.value,
    })
    await navigateTo('/orders')
  } catch {
    error.value = 'Invalid email or password.'
  } finally {
    loading.value = false
  }
}
</script>

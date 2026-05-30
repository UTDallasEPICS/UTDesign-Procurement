<script setup lang="ts">
import { authClient } from '../utils/auth-client'

definePageMeta({ auth: false })

const email = ref('')
const otp = ref('')
const step = ref<'email' | 'otp'>('email')
const loading = ref(false)
const errorMsg = ref('')

const isUtdEmail = computed(() => email.value.toLowerCase().endsWith('@utdallas.edu'))

async function sendOTP() {
  if (!email.value) return
  if (!isUtdEmail.value) {
    errorMsg.value = 'Only @utdallas.edu email addresses are allowed.'
    return
  }
  loading.value = true
  errorMsg.value = ''

  try {
    await authClient.emailOtp.sendVerificationOtp({
      email: email.value,
      type: 'sign-in',
    })
    step.value = 'otp'
  } catch (err: any) {
    errorMsg.value = err?.message ?? 'Failed to send OTP. Please try again.'
  } finally {
    loading.value = false
  }
}

async function verifyOTP() {
  if (!otp.value) return
  loading.value = true
  errorMsg.value = ''

  try {
    await authClient.signIn.emailOtp({
      email: email.value,
      otp: otp.value,
    })
    await navigateTo('/')
  } catch (err: any) {
    errorMsg.value = err?.message ?? 'Invalid OTP. Please try again.'
  } finally {
    loading.value = false
  }
}

function goBack() {
  step.value = 'email'
  otp.value = ''
  errorMsg.value = ''
}
</script>

<template>
  <div class="min-h-screen flex flex-col bg-gray-100">
    <!-- UTD Header -->
    <header class="bg-[#154734]">
      <div class="max-w-6xl mx-auto px-6 py-4 flex items-center gap-4">
        <img :src="'/utd-logo.png'" alt="UTD Logo" class="h-10 w-auto" />
        <div>
          <div class="text-white font-bold text-base tracking-widest uppercase leading-tight">
            The University of Texas at Dallas
          </div>
          <div class="text-[#E87722] text-xs tracking-wider uppercase">Student Portal</div>
        </div>
      </div>
    </header>
    <div class="h-1 bg-[#E87722]" />

    <!-- Login card -->
    <div class="flex-1 flex items-center justify-center py-16 px-4">
      <div class="w-full max-w-md rounded-lg shadow-xl overflow-hidden bg-white">
        <!-- Card header -->
        <div class="bg-[#E87722] px-8 py-6">
          <h1 class="text-white font-bold text-xl tracking-wide">Sign In</h1>
          <p class="text-orange-100 text-sm mt-1">
            {{ step === 'email' ? 'Enter your UTD email to receive a one-time code' : 'Check your UTD email for the code' }}
          </p>
        </div>

        <!-- Card body -->
        <div class="px-8 py-7 space-y-5">
          <div
            v-if="errorMsg"
            class="flex items-start gap-2 rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700"
          >
            <svg class="mt-0.5 h-4 w-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-.75-9.25a.75.75 0 011.5 0v4a.75.75 0 01-1.5 0v-4zm.75-2a.75.75 0 100-1.5.75.75 0 000 1.5z" clip-rule="evenodd"/>
            </svg>
            <span>{{ errorMsg }}</span>
          </div>

          <!-- Step 1: Email -->
          <template v-if="step === 'email'">
            <div class="space-y-1">
              <label class="block text-sm font-semibold text-gray-700">UTD Email Address</label>
              <input
                v-model="email"
                type="email"
                placeholder="netid@utdallas.edu"
                class="w-full rounded-md border border-gray-300 px-4 py-2.5 text-sm focus:border-[#E87722] focus:outline-none focus:ring-2 focus:ring-[#E87722]/30"
                @keyup.enter="sendOTP"
              />
              <p v-if="email && !isUtdEmail" class="text-xs text-red-500">Must end in @utdallas.edu</p>
            </div>

            <button
              :disabled="!isUtdEmail || loading"
              class="w-full rounded-md bg-[#E87722] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#c9621a] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              @click="sendOTP"
            >
              <svg v-if="loading" class="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
              {{ loading ? 'Sending…' : 'Send One-Time Code' }}
            </button>
          </template>

          <!-- Step 2: OTP -->
          <template v-else>
            <p class="text-sm text-gray-600">
              A 6-digit code was sent to <strong class="text-gray-900">{{ email }}</strong>
            </p>

            <div class="space-y-1">
              <label class="block text-sm font-semibold text-gray-700">One-Time Password</label>
              <input
                v-model="otp"
                type="text"
                inputmode="numeric"
                placeholder="Enter 6-digit code"
                maxlength="6"
                class="w-full rounded-md border border-gray-300 px-4 py-2.5 text-sm tracking-widest focus:border-[#E87722] focus:outline-none focus:ring-2 focus:ring-[#E87722]/30"
                @keyup.enter="verifyOTP"
              />
            </div>

            <button
              :disabled="otp.length < 6 || loading"
              class="w-full rounded-md bg-[#E87722] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#c9621a] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              @click="verifyOTP"
            >
              <svg v-if="loading" class="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
              {{ loading ? 'Verifying…' : 'Verify & Sign In' }}
            </button>

            <button
              class="w-full rounded-md border border-gray-300 px-4 py-2.5 text-sm text-gray-600 transition hover:bg-gray-50"
              @click="goBack"
            >
              Use a different email
            </button>
          </template>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <footer class="bg-[#154734] py-4 text-center text-xs text-gray-400">
      © {{ new Date().getFullYear() }} The University of Texas at Dallas. All rights reserved.
    </footer>
  </div>
</template>

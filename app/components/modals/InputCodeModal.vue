<template>
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
  >
    <div
      class="w-full max-w-md rounded-xl bg-white p-8 shadow-2xl"
    >
      <div class="text-center">
        <h2 class="text-xl font-bold text-[#154734]">
          Enter Verification Code
        </h2>

        <p class="mt-2 text-sm text-gray-500">
          Enter the 6-digit code sent to your email.
        </p>

        <div class="mt-6 flex justify-center">
        <UPinInput
            v-model="code"
            :length="6"
            :separator="3"
            placeholder="*"
        />
        </div>

        <UButton
          label="berify code"
          class="mt-6 w-full bg-[#154734] hover:bg-[#0f3326]"
          @click="verifyCode"
        />

        <UButton
          variant="ghost"
          class="mt-2 w-full"
          @click="$emit('close')"
        >
          Cancel
        </UButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { authClient } = useAuth()

const props = defineProps<{
  email: string
}>()

const code = ref<string[]>([])

const emit = defineEmits<{
  close: []
  verified: []
}>()
async function verifyCode() {
  console.log('RAW CODE:', code.value)
  console.log('RAW CODE TYPE:', typeof code.value)
  console.log('IS ARRAY:', Array.isArray(code.value))

  const otp = Array.isArray(code.value)
    ? code.value.join('')
    : String(code.value)

  console.log('OTP BEING SENT:', otp)
  console.log('OTP TYPE:', typeof otp)

  const { data, error } = await authClient.signIn.emailOtp({
    email: props.email,
    otp: otp,
  })

  if (error) {
    console.error('OTP verification failed:', error)
    return
  }

  console.log('Email verified!', data)
  emit('verified')
}

</script>

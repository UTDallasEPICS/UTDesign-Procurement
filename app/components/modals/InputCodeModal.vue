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
        >
</UPinInput>
        </div>

        <UButton
          class="mt-6 w-full bg-[#154734] hover:bg-[#0f3326]"
          @click="verifyCode"
        >
          Verify Code
        </UButton>

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
const code = ref('')

const emit = defineEmits<{
  close: []
}>()

function verifyCode() {
  console.log('OTP:', code.value)

  // Add your verification logic here.
}
</script>
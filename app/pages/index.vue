<script setup lang="ts">
  import { authClient } from '../utils/auth-client'

  const { data: users, pending, error } = await useFetch('/api/users')

  const selectedFile = ref<File | null>(null)
  const imagePreview = ref<string>('')
  const isUploading = ref(false)
  const isModalOpen = ref(false)

  async function logout() {
    await authClient.signOut()
    await navigateTo('/auth', { external: true })
  }

  function getImageLink(user: { image: boolean; id: string }) {
    return user.image ? 'api/users/' + user.id + '/profile' : undefined
  }

  function handleImageUpload(event: Event) {
    const target = event.target as HTMLInputElement
    const files = target.files as FileList

    if (!files || files.length === 0) return

    const file = files[0]

    if (!file?.type.startsWith('image/')) {
      return
    }

    selectedFile.value = file

    const reader = new FileReader()
    reader.onload = (e) => {
      imagePreview.value = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }

  const openModal = () => {
    isModalOpen.value = true
  }

  const closeModal = () => {
    isModalOpen.value = false
  }

  async function updatePfp() {
    if (!selectedFile.value) return

    isUploading.value = true

    try {
      const formData = new FormData()
      formData.append('file', selectedFile.value)

      await $fetch('/api/users/upload', {
        method: 'POST',
        body: formData,
      })

      // Refresh users data to show updated profile picture
      await refreshNuxtData()

      // Reset state
      selectedFile.value = null
      imagePreview.value = ''
      isModalOpen.value = false
    } catch (error) {
      console.error('Upload failed:', error)
    } finally {
      isUploading.value = false
    }
  }
</script>

<template>
  <UContainer class="py-10">
    <div class="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
      <div>
        <h1 class="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Dashboard</h1>
        <p class="mt-1 text-gray-500 dark:text-gray-400">
          Manage your application users and settings.
        </p>
      </div>
      <div class="flex justify-between gap-4 md:items-center">
        <UModal :open="isModalOpen">
          <UButton
            color="success"
            variant="soft"
            @click="openModal"
            icon="i-heroicons-arrow-up-on-square-20-solid"
            label="Update Profile Picture"
          />

          <template #content>
            <div class="m-12 space-y-4">
              <h3 class="text-lg font-medium text-gray-900 dark:text-white">
                Update Profile Picture
              </h3>

              <div v-if="imagePreview" class="flex justify-center">
                <UAvatar :src="imagePreview" size="3xl" />
              </div>

              <div>
                <input
                  type="file"
                  accept="image/*"
                  class="file:bg-primary-50 file:text-brand4 hover:file:bg-primary-100 block w-full cursor-pointer text-sm text-gray-500 file:mr-4 file:rounded-full file:border-0 file:px-4 file:py-2 file:text-sm file:font-semibold"
                  @change="handleImageUpload"
                />
              </div>

              <div class="flex justify-end gap-2">
                <UButton variant="soft" @click="closeModal"> Cancel </UButton>
                <UButton
                  color="success"
                  :loading="isUploading"
                  :disabled="!selectedFile"
                  @click="updatePfp"
                >
                  Upload
                </UButton>
              </div>
            </div>
          </template>
        </UModal>
        <UButton
          color="error"
          variant="soft"
          icon="i-heroicons-arrow-right-on-rectangle-20-solid"
          label="Logout"
          @click="logout"
        />
      </div>
    </div>

    <UCard class="w-full">
      <template #header>
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <UIcon name="i-heroicons-users-20-solid" class="h-5 w-5 text-gray-500" />
            <h2 class="text-base leading-7 font-semibold text-gray-900 dark:text-white">
              Registered Users
            </h2>
          </div>
          <UBadge variant="subtle" color="primary" size="md">{{ users?.length || 0 }} Users</UBadge>
        </div>
      </template>

      <div v-if="pending" class="space-y-4">
        <div v-for="i in 3" :key="i" class="flex items-center justify-between py-2">
          <div class="flex w-full items-center gap-3">
            <USkeleton class="h-10 w-10 rounded-full" />
            <div class="w-full max-w-[200px] space-y-2">
              <USkeleton class="h-4 w-full" />
              <USkeleton class="h-3 w-2/3" />
            </div>
          </div>
        </div>
      </div>

      <div v-else-if="error">
        <UAlert
          icon="i-heroicons-exclamation-triangle-20-solid"
          color="error"
          variant="subtle"
          title="Error loading users"
          :description="error.message"
        />
      </div>

      <div v-else class="divide-y divide-gray-200 dark:divide-gray-800">
        <div
          v-for="user in users"
          :key="user.id"
          class="flex items-center justify-between py-4 first:pt-0 last:pb-0"
        >
          <div class="flex items-center gap-3">
            <UAvatar :src="getImageLink(user)" :alt="user.name" size="md" :as="{ img: 'img' }" />
            <div>
              <p class="font-medium text-gray-900 dark:text-white">{{ user.name }}</p>
              <p class="text-sm text-gray-500 dark:text-gray-400">{{ user.email }}</p>
            </div>
          </div>
          <UBadge :color="user.emailVerified ? 'success' : 'warning'" variant="subtle" size="sm">
            {{ user.emailVerified ? 'Verified' : 'Pending' }}
          </UBadge>
        </div>

        <div v-if="users?.length === 0" class="py-8 text-center text-gray-500">No users found.</div>
      </div>
    </UCard>
  </UContainer>
</template>

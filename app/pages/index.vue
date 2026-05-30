<script setup lang="ts">
import { authClient } from '../utils/auth-client'

const { data: users, pending, error } = await useFetch('/api/users')
const { data: orders, refresh: refreshOrders } = await useFetch('/api/orders')
const { data: sessionData } = await authClient.useSession(useFetch)
const { data: me } = await useFetch('/api/me')

// Profile picture
const selectedFile = ref<File | null>(null)
const imagePreview = ref<string>('')
const isUploading = ref(false)
const isModalOpen = ref(false)

// Product lookup
const productUrl = ref('')
const product = ref<null | { name: string; image: string; description: string; price: string; currency: string; url: string }>(null)
const productLoading = ref(false)
const productError = ref('')

// Order request
const isOrderModalOpen = ref(false)
const orderNotes = ref('')
const orderError = ref('')
const isSubmittingOrder = ref(false)

async function logout() {
  await authClient.signOut()
  await navigateTo('/auth', { external: true })
}

function getImageLink(user: { image: boolean; id: string }) {
  return user.image ? '/api/users/' + user.id + '/profile' : undefined
}

function handleImageUpload(event: Event) {
  const target = event.target as HTMLInputElement
  const files = target.files as FileList
  if (!files || files.length === 0) return
  const file = files[0]
  if (!file?.type.startsWith('image/')) return
  selectedFile.value = file
  const reader = new FileReader()
  reader.onload = (e) => { imagePreview.value = e.target?.result as string }
  reader.readAsDataURL(file)
}

async function updatePfp() {
  if (!selectedFile.value) return
  isUploading.value = true
  try {
    const formData = new FormData()
    formData.append('file', selectedFile.value)
    await $fetch('/api/users/upload', { method: 'POST', body: formData })
    await refreshNuxtData()
    selectedFile.value = null
    imagePreview.value = ''
    isModalOpen.value = false
  } catch (err) {
    console.error('Upload failed:', err)
  } finally {
    isUploading.value = false
  }
}

async function lookupProduct() {
  if (!productUrl.value.trim()) return
  productLoading.value = true
  productError.value = ''
  product.value = null
  try {
    product.value = await $fetch('/api/product/lookup', { query: { url: productUrl.value } })
  } catch (err: any) {
    productError.value = err?.data?.message || 'Failed to fetch product'
  } finally {
    productLoading.value = false
  }
}

async function submitOrder() {
  if (!product.value) return
  isSubmittingOrder.value = true
  orderError.value = ''
  try {
    await $fetch('/api/orders', {
      method: 'POST',
      body: {
        productName: product.value.name,
        productUrl: product.value.url,
        productImage: product.value.image || null,
        productPrice: product.value.price ? `${product.value.currency} ${product.value.price}`.trim() : null,
        notes: orderNotes.value || null,
      },
    })
    isOrderModalOpen.value = false
    orderNotes.value = ''
    product.value = null
    productUrl.value = ''
    await refreshOrders()
  } catch (err: any) {
    orderError.value = err?.data?.message || 'Failed to submit order'
  } finally {
    isSubmittingOrder.value = false
  }
}

const statusColor = (status: string) =>
  status === 'approved' ? 'text-green-700 bg-green-50 border-green-200'
  : status === 'rejected' ? 'text-red-700 bg-red-50 border-red-200'
  : 'text-yellow-700 bg-yellow-50 border-yellow-200'
</script>

<template>
  <div class="min-h-screen flex flex-col bg-gray-100">

    <!-- UTD Header -->
    <header class="bg-[#154734]">
      <div class="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <img :src="'/utd-logo.png'" alt="UTD Logo" class="h-10 w-auto" />
          <div>
            <div class="text-white font-bold text-sm tracking-widest uppercase leading-tight">
              The University of Texas at Dallas
            </div>
            <div class="text-[#E87722] text-xs tracking-wider">Student Portal</div>
          </div>
        </div>
        <div class="flex items-center gap-4 text-sm">
          <span class="text-gray-300 hidden sm:block">{{ sessionData?.user?.email }}</span>
          <button
            class="text-[#E87722] hover:text-orange-300 font-semibold text-sm transition"
            @click="logout"
          >
            Sign Out
          </button>
        </div>
      </div>
    </header>

    <!-- Orange nav bar -->
    <nav class="bg-[#E87722]">
      <div class="max-w-7xl mx-auto px-6 py-2 flex items-center justify-between">
        <div class="flex items-center gap-6 text-white text-sm font-semibold">
          <span class="border-b-2 border-white pb-0.5">Dashboard</span>
          <NuxtLink
            v-if="(me as any)?.isAdmin"
            to="/admin"
            class="hover:text-orange-100 transition"
          >
            Admin Panel
          </NuxtLink>
        </div>
        <!-- Profile picture button -->
        <button
          class="flex items-center gap-1.5 text-white text-xs font-medium hover:text-orange-100 transition"
          @click="isModalOpen = true"
        >
          <svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 6.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM3.75 20.25a8.25 8.25 0 1116.5 0"/>
          </svg>
          Update Photo
        </button>
      </div>
    </nav>

    <!-- Profile picture modal -->
    <UModal v-model:open="isModalOpen">
      <template #content>
        <div class="m-10 space-y-4">
          <h3 class="text-base font-semibold text-gray-900">Update Profile Picture</h3>
          <div v-if="imagePreview" class="flex justify-center">
            <UAvatar :src="imagePreview" size="3xl" />
          </div>
          <input
            type="file"
            accept="image/*"
            class="block w-full cursor-pointer text-sm text-gray-500 file:mr-4 file:rounded-full file:border-0 file:bg-[#E87722] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white"
            @change="handleImageUpload"
          />
          <div class="flex justify-end gap-2">
            <UButton variant="soft" @click="isModalOpen = false">Cancel</UButton>
            <UButton
              :loading="isUploading"
              :disabled="!selectedFile"
              style="background:#E87722;color:white;"
              @click="updatePfp"
            >Upload</UButton>
          </div>
        </div>
      </template>
    </UModal>

    <!-- Main content -->
    <main class="flex-1 max-w-7xl mx-auto w-full px-6 py-8 space-y-8">

      <!-- Registered Students -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <svg class="h-5 w-5 text-[#E87722]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"/>
            </svg>
            <h2 class="font-semibold text-gray-900">Registered Students</h2>
          </div>
          <span class="rounded-full bg-[#E87722]/10 px-3 py-0.5 text-xs font-semibold text-[#E87722]">
            {{ users?.length || 0 }} Students
          </span>
        </div>
        <div class="px-6 py-4">
          <div v-if="pending" class="space-y-4">
            <div v-for="i in 3" :key="i" class="flex items-center gap-3 py-2">
              <div class="h-10 w-10 rounded-full bg-gray-200 animate-pulse" />
              <div class="space-y-2 flex-1 max-w-xs">
                <div class="h-3.5 bg-gray-200 rounded animate-pulse" />
                <div class="h-3 w-2/3 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
          </div>
          <div v-else-if="error" class="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            Error loading students: {{ error.message }}
          </div>
          <div v-else class="divide-y divide-gray-100">
            <div
              v-for="user in users"
              :key="user.id"
              class="flex items-center justify-between py-3 first:pt-0 last:pb-0"
            >
              <div class="flex items-center gap-3">
                <UAvatar :src="getImageLink(user)" :alt="user.name" size="md" />
                <div>
                  <p class="font-medium text-gray-900 text-sm">{{ user.name }}</p>
                  <p class="text-xs text-gray-500">{{ user.email }}</p>
                </div>
              </div>
              <span
                :class="user.emailVerified ? 'bg-green-50 text-green-700 border-green-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200'"
                class="rounded-full border px-2.5 py-0.5 text-xs font-medium"
              >
                {{ user.emailVerified ? 'Verified' : 'Pending' }}
              </span>
            </div>
            <div v-if="users?.length === 0" class="py-8 text-center text-sm text-gray-400">No students found.</div>
          </div>
        </div>
      </div>

      <!-- Product Lookup -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-200 flex items-center gap-2">
          <svg class="h-5 w-5 text-[#E87722]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 15.803a7.5 7.5 0 0 0 10.607 0z"/>
          </svg>
          <h2 class="font-semibold text-gray-900">Product Lookup</h2>
        </div>
        <div class="px-6 py-5 space-y-4">
          <div class="flex gap-2">
            <input
              v-model="productUrl"
              type="url"
              placeholder="Paste a product URL (Amazon, eBay, Etsy…)"
              class="flex-1 rounded-md border border-gray-300 px-4 py-2 text-sm focus:border-[#E87722] focus:outline-none focus:ring-2 focus:ring-[#E87722]/30"
              :disabled="productLoading"
              @keydown.enter="lookupProduct"
            />
            <button
              :disabled="!productUrl.trim() || productLoading"
              class="rounded-md bg-[#E87722] px-4 py-2 text-sm font-semibold text-white hover:bg-[#c9621a] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition"
              @click="lookupProduct"
            >
              <svg v-if="productLoading" class="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
              {{ productLoading ? 'Fetching…' : 'Look Up' }}
            </button>
          </div>

          <div v-if="productError" class="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {{ productError }}
          </div>

          <div v-if="product" class="rounded-lg border border-gray-200 p-4 flex gap-4">
            <img
              v-if="product.image"
              :src="product.image"
              :alt="product.name"
              class="h-28 w-28 flex-shrink-0 rounded-md object-contain border border-gray-100"
            />
            <div class="flex-1 min-w-0 space-y-1.5">
              <p class="font-semibold text-gray-900">{{ product.name }}</p>
              <p v-if="product.price" class="text-lg font-bold text-[#E87722]">
                {{ product.currency ? product.currency + ' ' : '' }}{{ product.price }}
              </p>
              <p v-if="product.description" class="text-sm text-gray-500 line-clamp-2">{{ product.description }}</p>
              <div class="flex items-center gap-3 pt-1">
                <a
                  :href="product.url"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-sm text-[#154734] hover:underline flex items-center gap-1"
                >
                  View original
                  <svg class="h-3 w-3" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"/>
                  </svg>
                </a>
                <button
                  class="rounded-md bg-[#154734] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#0f3325] transition"
                  @click="isOrderModalOpen = true"
                >
                  Request Order
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- My Orders -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <svg class="h-5 w-5 text-[#E87722]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z"/>
            </svg>
            <h2 class="font-semibold text-gray-900">My Order Requests</h2>
          </div>
          <span class="rounded-full bg-[#E87722]/10 px-3 py-0.5 text-xs font-semibold text-[#E87722]">
            {{ orders?.length || 0 }} Orders
          </span>
        </div>
        <div class="px-6 py-4">
          <div v-if="!orders || orders.length === 0" class="py-8 text-center text-sm text-gray-400">
            No order requests yet. Look up a product above to get started.
          </div>
          <div v-else class="divide-y divide-gray-100">
            <div
              v-for="order in orders"
              :key="order.id"
              class="flex items-center gap-4 py-3 first:pt-0 last:pb-0"
            >
              <img
                v-if="order.productImage"
                :src="order.productImage"
                :alt="order.productName"
                class="h-12 w-12 rounded object-contain border border-gray-100 flex-shrink-0"
              />
              <div v-else class="h-12 w-12 rounded bg-gray-100 flex-shrink-0 flex items-center justify-center">
                <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909"/>
                </svg>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-gray-900 truncate">{{ order.productName }}</p>
                <p v-if="order.productPrice" class="text-xs text-gray-500">{{ order.productPrice }}</p>
                <p v-if="order.notes" class="text-xs text-gray-400 italic truncate">{{ order.notes }}</p>
              </div>
              <div class="flex flex-col items-end gap-1 flex-shrink-0">
                <span :class="statusColor(order.status)" class="rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize">
                  {{ order.status }}
                </span>
                <span class="text-xs text-gray-400">
                  {{ new Date(order.createdAt).toLocaleDateString() }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Order request modal -->
    <UModal v-model:open="isOrderModalOpen">
      <template #content>
        <div class="m-8 space-y-4">
          <h3 class="text-base font-semibold text-gray-900">Request Order</h3>

          <div v-if="product" class="flex gap-3 rounded-md bg-gray-50 border border-gray-200 p-3">
            <img v-if="product.image" :src="product.image" :alt="product.name" class="h-14 w-14 rounded object-contain flex-shrink-0" />
            <div class="min-w-0">
              <p class="text-sm font-medium text-gray-900 line-clamp-2">{{ product.name }}</p>
              <p v-if="product.price" class="text-sm font-bold text-[#E87722]">
                {{ product.currency ? product.currency + ' ' : '' }}{{ product.price }}
              </p>
            </div>
          </div>

          <div class="space-y-1">
            <label class="block text-sm font-semibold text-gray-700">Notes <span class="font-normal text-gray-400">(optional)</span></label>
            <textarea
              v-model="orderNotes"
              rows="3"
              placeholder="Reason for request, quantity, any additional details…"
              class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#E87722] focus:outline-none focus:ring-2 focus:ring-[#E87722]/30 resize-none"
            />
          </div>

          <div v-if="orderError" class="rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
            {{ orderError }}
          </div>

          <div class="flex justify-end gap-2">
            <UButton variant="soft" @click="isOrderModalOpen = false">Cancel</UButton>
            <button
              :disabled="isSubmittingOrder"
              class="rounded-md bg-[#E87722] px-4 py-2 text-sm font-semibold text-white hover:bg-[#c9621a] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition"
              @click="submitOrder"
            >
              <svg v-if="isSubmittingOrder" class="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
              {{ isSubmittingOrder ? 'Submitting…' : 'Submit Request' }}
            </button>
          </div>
        </div>
      </template>
    </UModal>

    <!-- Footer -->
    <footer class="bg-[#154734] mt-8 py-4 text-center text-xs text-gray-400">
      © {{ new Date().getFullYear() }} The University of Texas at Dallas. All rights reserved.
    </footer>
  </div>
</template>

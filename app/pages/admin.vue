<script setup lang="ts">
import { authClient } from '../utils/auth-client'

const { data: orders, refresh } = await useFetch('/api/admin/orders')
const { data: me } = await useFetch('/api/me')

async function logout() {
  await authClient.signOut()
  await navigateTo('/auth', { external: true })
}

const updatingId = ref<string | null>(null)

async function updateStatus(id: string, status: 'approved' | 'rejected') {
  updatingId.value = id
  try {
    await $fetch(`/api/admin/orders/${id}`, { method: 'PATCH', body: { status } })
    await refresh()
  } finally {
    updatingId.value = null
  }
}

const statusStyle = (status: string) =>
  status === 'approved' ? 'text-green-700 bg-green-50 border-green-200'
  : status === 'rejected' ? 'text-red-700 bg-red-50 border-red-200'
  : 'text-yellow-700 bg-yellow-50 border-yellow-200'

type Order = {
  id: string
  productName: string
  productUrl: string
  productImage?: string | null
  productPrice?: string | null
  notes?: string | null
  status: string
  createdAt: string
  user: { name: string; email: string }
}
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
            <div class="text-[#E87722] text-xs tracking-wider">Admin Portal</div>
          </div>
        </div>
        <div class="flex items-center gap-4 text-sm">
          <span class="text-gray-300 hidden sm:block">{{ (me as any)?.email }}</span>
          <button class="text-[#E87722] hover:text-orange-300 font-semibold transition" @click="logout">
            Sign Out
          </button>
        </div>
      </div>
    </header>

    <!-- Orange nav bar -->
    <nav class="bg-[#E87722]">
      <div class="max-w-7xl mx-auto px-6 py-2 flex items-center gap-6 text-white text-sm font-semibold">
        <NuxtLink to="/" class="hover:text-orange-100 transition">Dashboard</NuxtLink>
        <span class="border-b-2 border-white pb-0.5">Admin Panel</span>
      </div>
    </nav>

    <!-- Content -->
    <main class="flex-1 max-w-7xl mx-auto w-full px-6 py-8">
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <svg class="h-5 w-5 text-[#E87722]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z"/>
            </svg>
            <h2 class="font-semibold text-gray-900">All Order Requests</h2>
          </div>
          <span class="rounded-full bg-[#E87722]/10 px-3 py-0.5 text-xs font-semibold text-[#E87722]">
            {{ (orders as Order[])?.length || 0 }} Total
          </span>
        </div>

        <div v-if="!orders || (orders as Order[]).length === 0" class="py-12 text-center text-sm text-gray-400">
          No order requests yet.
        </div>

        <div v-else class="divide-y divide-gray-100">
          <div
            v-for="order in (orders as Order[])"
            :key="order.id"
            class="flex items-center gap-4 px-6 py-4"
          >
            <!-- Product image -->
            <img
              v-if="order.productImage"
              :src="order.productImage"
              :alt="order.productName"
              class="h-14 w-14 rounded object-contain border border-gray-100 flex-shrink-0"
            />
            <div v-else class="h-14 w-14 rounded bg-gray-100 flex-shrink-0 flex items-center justify-center">
              <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909"/>
              </svg>
            </div>

            <!-- Product info -->
            <div class="flex-1 min-w-0">
              <p class="text-sm font-semibold text-gray-900 truncate">{{ order.productName }}</p>
              <p v-if="order.productPrice" class="text-xs font-bold text-[#E87722]">{{ order.productPrice }}</p>
              <p v-if="order.notes" class="text-xs text-gray-400 italic truncate">{{ order.notes }}</p>
              <a
                :href="order.productUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="text-xs text-[#154734] hover:underline"
              >View product</a>
            </div>

            <!-- Student info -->
            <div class="hidden md:block text-right flex-shrink-0 w-48">
              <p class="text-xs font-medium text-gray-700">{{ order.user.name }}</p>
              <p class="text-xs text-gray-400">{{ order.user.email }}</p>
              <p class="text-xs text-gray-400">{{ new Date(order.createdAt).toLocaleDateString() }}</p>
            </div>

            <!-- Status + actions -->
            <div class="flex flex-col items-end gap-2 flex-shrink-0">
              <span :class="statusStyle(order.status)" class="rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize">
                {{ order.status }}
              </span>
              <div v-if="order.status === 'pending'" class="flex gap-1.5">
                <button
                  :disabled="updatingId === order.id"
                  class="rounded px-2.5 py-1 text-xs font-semibold bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 transition"
                  @click="updateStatus(order.id, 'approved')"
                >
                  Approve
                </button>
                <button
                  :disabled="updatingId === order.id"
                  class="rounded px-2.5 py-1 text-xs font-semibold bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 transition"
                  @click="updateStatus(order.id, 'rejected')"
                >
                  Reject
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <footer class="bg-[#154734] mt-8 py-4 text-center text-xs text-gray-400">
      © {{ new Date().getFullYear() }} The University of Texas at Dallas. All rights reserved.
    </footer>
  </div>
</template>

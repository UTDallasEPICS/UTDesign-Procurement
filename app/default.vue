<template>
  <div class="min-h-screen flex flex-col text-slate-900">
    <NavBar />
    <main class="flex-1 w-full max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <slot />
    </main>
    <footer class="border-t border-white/60 bg-white/50 text-center text-xs text-slate-500 py-4 backdrop-blur-sm">
      UTDesign Procurement System for The University of Texas at Dallas
    </footer>
  </div>
</template>

<script setup lang="ts">
import NavBar from '~/components/layout/NavBar.vue'
</script>

<template>
  <div class="min-h-screen flex flex-col bg-[#F4F4F4]">
    <NavBar />
    <main class="flex-1 container mx-auto px-4 py-6">
      <slot />
    </main>
    <footer class="bg-[#154734] text-white/60 text-xs text-center py-3 border-t-2 border-[#E87722]">
      UTDesign Procurement System &mdash; The University of Texas at Dallas
    </footer>
  </div>
</template>

<script setup lang="ts">
import NavBar from '~/components/layout/NavBar.vue'
</script>

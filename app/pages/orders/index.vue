<script setup lang="ts">
definePageMeta({ middleware: 'auth' })
// Auth middleware handles role-based redirect
const { isStudent, isMentor, isAdmin } = useAuth()
</script>
<template>
<div v-if="isStudent">
      <StudentOrders />
    </div>

    <!-- Mentor -->
    <div v-else-if="isMentor">
      <MentorOrders />
    </div>

    <!-- Admin -->
    <div v-else-if="isAdmin">
      <AdminOrders />
    </div>

</template>
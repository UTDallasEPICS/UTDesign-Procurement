<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const { isStudent, isMentor, isAdmin } = useAuth()
</script>

<template>
  <div>
    <!-- Student -->
    <div v-if="isStudent">
      <StudentProjects />
    </div>

    <!-- Mentor -->
    <div v-else-if="isMentor">
      <MentorProjects />
    </div>

    <!-- Admin -->
    <div v-else-if="isAdmin">
      <AdminProjects />
    </div>
  </div>
</template>
<script setup lang="ts">
definePageMeta({ middleware: 'auth' })
await navigateTo('/database-updates/admin')
</script>

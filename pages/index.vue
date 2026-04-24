<script setup lang="ts">
definePageMeta({ middleware: 'auth' })
// The auth middleware will redirect to /orders which then role-routes
await navigateTo('/orders')
</script>

<script setup>
import { onMounted, ref } from 'vue'
import AppShell from '@/components/AppShell.vue'
import UnderMaintenance from '@/components/UnderMaintenance.vue'
import { checkMaintenanceStatus } from '@/lib/maintenance'

const maintenance = ref({ underMaintenance: false })
const checked = ref(false)

onMounted(async () => {
  maintenance.value = await checkMaintenanceStatus()
  checked.value = true
})
</script>

<template>
  <UnderMaintenance
    v-if="checked && maintenance.underMaintenance"
    :message="maintenance.message"
    :estimated-end-time="maintenance.estimatedEndTime"
  />
  <AppShell v-else />
</template>

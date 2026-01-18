<script setup>
import { useAttrs, computed } from 'vue';
import { useMapGetter } from 'dashboard/composables/store';
import { useAccount } from 'dashboard/composables/useAccount';

const attrs = useAttrs();
const globalConfig = useMapGetter('globalConfig/get');
const { currentAccount } = useAccount();

// Use account branding logo if available and customized
// Don't show any logo if not customized (no fallback to Chatwoot logo)
const logoUrl = computed(() => {
  const brandingSettings = currentAccount.value?.branding_settings;
  // Only show logo if it's customized (has custom logo attached)
  if (brandingSettings?.is_customized && brandingSettings?.logo_url) {
    const brandingLogo = brandingSettings.logo_url;
    // Ensure absolute URL
    return brandingLogo.startsWith('http') 
      ? brandingLogo 
      : `${window.location.origin}${brandingLogo}`;
  }
  // Don't show any logo if not customized
  return null;
});
</script>

<template>
  <img
    v-if="logoUrl"
    v-bind="attrs"
    :src="logoUrl"
    alt="Logo"
  />
</template>

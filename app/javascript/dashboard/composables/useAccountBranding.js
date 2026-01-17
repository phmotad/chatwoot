import { computed, watch, onMounted } from 'vue';
import { useStore } from 'vuex';
import { useAccount } from './useAccount';

/**
 * Composable for account branding functionality
 * Applies custom branding (colors and logos) to the application
 * @returns {Object} Branding state and methods
 */
export function useAccountBranding() {
  const store = useStore();
  const { accountId, currentAccount } = useAccount();

  const branding = computed(() => {
    return currentAccount.value?.branding_settings || {};
  });

  /**
   * Applies branding colors to CSS custom properties
   */
  const applyBranding = () => {
    if (!branding.value) return;

    const root = document.documentElement;

    if (branding.value.primary_color) {
      root.style.setProperty('--n-brand', branding.value.primary_color);
      root.style.setProperty('--brand-color', branding.value.primary_color);
    }

    if (branding.value.secondary_color) {
      root.style.setProperty('--brand-secondary', branding.value.secondary_color);
    }
  };

  /**
   * Fetches branding settings from API
   */
  const fetchBranding = async () => {
    if (!accountId.value) return;

    try {
      await store.dispatch('accounts/fetchBranding', accountId.value);
    } catch (error) {
      console.error('Error fetching branding:', error);
    }
  };

  /**
   * Updates branding settings
   * @param {Object} brandingData - Branding data to update
   */
  const updateBranding = async brandingData => {
    if (!accountId.value) return;

    try {
      await store.dispatch('accounts/updateBranding', {
        accountId: accountId.value,
        branding: brandingData,
      });
      applyBranding();
    } catch (error) {
      console.error('Error updating branding:', error);
      throw error;
    }
  };

  /**
   * Resets branding to default values
   */
  const resetBranding = async () => {
    if (!accountId.value) return;

    try {
      await store.dispatch('accounts/resetBranding', accountId.value);
      applyBranding();
    } catch (error) {
      console.error('Error resetting branding:', error);
      throw error;
    }
  };

  // Apply branding on mount
  onMounted(() => {
    applyBranding();
    // Fetch branding if not already in store
    if (!branding.value || Object.keys(branding.value).length === 0) {
      fetchBranding();
    }
  });

  // Watch for branding changes and reapply
  watch(
    branding,
    () => {
      applyBranding();
    },
    { deep: true }
  );

  return {
    branding,
    applyBranding,
    fetchBranding,
    updateBranding,
    resetBranding,
  };
}

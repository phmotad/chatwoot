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
   * Converts hex color to RGB
   */
  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
      : null;
  };

  /**
   * Applies branding colors to CSS custom properties
   */
  const applyBranding = () => {
    if (!branding.value) return;

    const root = document.documentElement;

    if (branding.value.primary_color) {
      const primaryColor = branding.value.primary_color;
      root.style.setProperty('--n-brand', primaryColor);
      root.style.setProperty('--brand-color', primaryColor);
      
      // Convert to RGB for use in rgba() functions
      const rgb = hexToRgb(primaryColor);
      if (rgb) {
        root.style.setProperty('--brand-color-rgb', rgb);
      }
      
      // Apply to blue colors for buttons and links (used by Tailwind)
      // These will override the default blue colors
      root.style.setProperty('--blue-9', primaryColor);
      root.style.setProperty('--blue-10', primaryColor);
      root.style.setProperty('--blue-11', primaryColor);
      root.style.setProperty('--blue-12', primaryColor);
      
      // Also set text-blue to use brand color
      if (rgb) {
        root.style.setProperty('--text-blue', rgb);
      }
    }

    if (branding.value.secondary_color) {
      root.style.setProperty('--brand-secondary', branding.value.secondary_color);
    }

    // Update favicon if logo thumbnail is available
    if (branding.value.logo_thumbnail_url) {
      updateFavicon(branding.value.logo_thumbnail_url);
    }
  };

  /**
   * Updates the favicon dynamically
   */
  const updateFavicon = (url) => {
    if (!url) return;
    
    // Remove existing branding favicon links
    const existingFavicons = document.querySelectorAll('link.branding-favicon');
    existingFavicons.forEach(link => link.remove());

    // Update or create favicon link
    let faviconLink = document.querySelector('link[rel="icon"]:not(.branding-favicon)');
    
    if (faviconLink) {
      // Update existing favicon
      faviconLink.href = url;
    } else {
      // Create new favicon link
      faviconLink = document.createElement('link');
      faviconLink.rel = 'icon';
      faviconLink.type = url.includes('.svg') ? 'image/svg+xml' : 'image/png';
      faviconLink.href = url;
      faviconLink.classList.add('branding-favicon');
      document.head.appendChild(faviconLink);
    }
    
    // Also update the 512x512 favicon if it exists
    const largeFavicon = document.querySelector('link[rel="icon"][sizes="512x512"]');
    if (largeFavicon) {
      largeFavicon.href = url;
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
      // Wait a bit for the store to update, then apply branding
      await new Promise(resolve => setTimeout(resolve, 100));
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
      // Wait a bit for the store to update, then apply branding
      await new Promise(resolve => setTimeout(resolve, 100));
      applyBranding();
      
      // Reset favicon to default
      const defaultFavicon = document.querySelector('link[rel="icon"]:not(.branding-favicon)');
      if (defaultFavicon) {
        const brandingFavicon = document.querySelector('link.branding-favicon');
        if (brandingFavicon) {
          brandingFavicon.remove();
        }
      }
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

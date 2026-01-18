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
    const root = document.documentElement;

    // Use branding color if available, otherwise use FireAgent orange default
    const primaryColor = branding.value?.primary_color || '#FF5C00';
    
    if (primaryColor) {
      
      // Set CSS custom properties for brand color
      root.style.setProperty('--n-brand', primaryColor);
      root.style.setProperty('--brand-color', primaryColor);
      
      // Convert to RGB for use in rgba() functions
      const rgb = hexToRgb(primaryColor);
      if (rgb) {
        root.style.setProperty('--brand-color-rgb', rgb);
        root.style.setProperty('--text-blue', rgb);
      }
      
      // Apply to blue colors for buttons and links (used by Tailwind)
      // These will override the default blue colors dynamically
      root.style.setProperty('--blue-9', primaryColor);
      root.style.setProperty('--blue-10', primaryColor);
      root.style.setProperty('--blue-11', primaryColor);
      root.style.setProperty('--blue-12', primaryColor);
      
      // Override Tailwind's n-brand color class dynamically
      // This ensures bg-n-brand uses the custom color
      const style = document.createElement('style');
      style.id = 'branding-override';
      style.textContent = `
        .bg-n-brand { background-color: ${primaryColor} !important; }
        .text-n-brand { color: ${primaryColor} !important; }
        .border-n-brand { border-color: ${primaryColor} !important; }
        .outline-n-brand { outline-color: ${primaryColor} !important; }
      `;
      
      // Remove existing override if any
      const existingOverride = document.getElementById('branding-override');
      if (existingOverride) {
        existingOverride.remove();
      }
      
      document.head.appendChild(style);
    } else {
      // Remove override if no branding color
      const existingOverride = document.getElementById('branding-override');
      if (existingOverride) {
        existingOverride.remove();
      }
    }

    if (branding.value.secondary_color) {
      root.style.setProperty('--brand-secondary', branding.value.secondary_color);
    }

    // Update favicon if logo thumbnail is available
    if (branding.value.logo_thumbnail_url) {
      // Use absolute URL if it's a relative path
      const faviconUrl = branding.value.logo_thumbnail_url.startsWith('http') 
        ? branding.value.logo_thumbnail_url 
        : `${window.location.origin}${branding.value.logo_thumbnail_url}`;
      updateFavicon(faviconUrl);
    } else {
      // Reset to default if no custom thumbnail
      updateFavicon(null);
    }
  };

  /**
   * Updates the favicon dynamically
   */
  const updateFavicon = (url) => {
    if (!url) {
      // Reset to default if no URL provided
      const defaultFavicon = document.querySelector('link[rel="icon"]:not(.branding-favicon)');
      if (defaultFavicon) {
        const brandingFavicon = document.querySelector('link.branding-favicon');
        if (brandingFavicon) {
          brandingFavicon.remove();
        }
      }
      return;
    }
    
    // Remove existing branding favicon links
    const existingFavicons = document.querySelectorAll('link.branding-favicon');
    existingFavicons.forEach(link => link.remove());

    // Find all existing favicon links
    const allFaviconLinks = document.querySelectorAll('link[rel="icon"], link[rel="shortcut icon"]');
    
    // Update existing favicon links or create new one
    if (allFaviconLinks.length > 0) {
      allFaviconLinks.forEach(link => {
        link.href = url;
      });
    } else {
      // Create new favicon link
      const faviconLink = document.createElement('link');
      faviconLink.rel = 'icon';
      faviconLink.type = url.includes('.svg') ? 'image/svg+xml' : 'image/png';
      faviconLink.href = url;
      faviconLink.classList.add('branding-favicon');
      document.head.appendChild(faviconLink);
    }
    
    // Also create/update the 512x512 favicon
    let largeFavicon = document.querySelector('link[rel="icon"][sizes="512x512"]');
    if (!largeFavicon) {
      largeFavicon = document.createElement('link');
      largeFavicon.rel = 'icon';
      largeFavicon.type = url.includes('.svg') ? 'image/svg+xml' : 'image/png';
      largeFavicon.sizes = '512x512';
      largeFavicon.classList.add('branding-favicon');
      document.head.appendChild(largeFavicon);
    }
    largeFavicon.href = url;
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
    console.log('🔄 Composable updateBranding called:', { accountId: accountId.value, brandingData });
    if (!accountId.value) {
      console.error('❌ No accountId available');
      return;
    }

    try {
      console.log('📡 Dispatching store action...');
      await store.dispatch('accounts/updateBranding', {
        accountId: accountId.value,
        branding: brandingData,
      });
      console.log('✅ Store action completed');
      
      // Fetch fresh branding data to ensure we have the latest URLs
      await fetchBranding();
      
      // Wait a bit for the store to update, then apply branding
      await new Promise(resolve => setTimeout(resolve, 200));
      console.log('🎨 Applying branding...');
      applyBranding();
      console.log('✅ Branding update completed successfully');
    } catch (error) {
      console.error('❌ Composable updateBranding error:', error);
      console.error('❌ Error details:', {
        message: error.message,
        response: error.response,
        status: error.response?.status,
        data: error.response?.data
      });
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
      
      // Fetch fresh branding data to ensure we have the latest state
      await fetchBranding();
      
      // Wait a bit for the store to update, then apply branding
      await new Promise(resolve => setTimeout(resolve, 200));
      applyBranding();
      
      // Reset favicon to default (will be handled by applyBranding if logo_thumbnail_url is null)
      updateFavicon(null);
    } catch (error) {
      console.error('Error resetting branding:', error);
      throw error;
    }
  };

  // Watch for accountId changes and fetch branding
  watch(
    accountId,
    async (newAccountId) => {
      if (newAccountId) {
        await fetchBranding();
        // Wait a bit for store to update
        await new Promise(resolve => setTimeout(resolve, 100));
        applyBranding();
      }
    },
    { immediate: true }
  );

  // Apply branding on mount
  onMounted(async () => {
    // Always fetch branding first to ensure we have latest data
    if (accountId.value) {
      await fetchBranding();
      // Wait a bit for store to update
      await new Promise(resolve => setTimeout(resolve, 100));
      // Then apply branding
      applyBranding();
    }
  });

  // Watch for branding changes and reapply
  watch(
    branding,
    () => {
      applyBranding();
    },
    { deep: true, immediate: true }
  );

  return {
    branding,
    applyBranding,
    fetchBranding,
    updateBranding,
    resetBranding,
  };
}

/* global axios */

class BrandingAPI {
  constructor() {
    this.accountIdFromRoute = () => {
      const isInsideAccountScopedURLs =
        window.location.pathname.includes('/app/accounts');

      if (isInsideAccountScopedURLs) {
        return window.location.pathname.split('/')[3];
      }

      return '';
    };
  }

  get(accountId) {
    const id = accountId || this.accountIdFromRoute();
    return axios.get(`/api/v1/accounts/${id}/branding`);
  }

  update(accountId, brandingData) {
    const id = accountId || this.accountIdFromRoute();
    console.log('📤 BrandingAPI.update called:', { accountId: id, brandingData });
    try {
      const response = axios.put(`/api/v1/accounts/${id}/branding`, brandingData);
      console.log('✅ BrandingAPI.update request sent');
      return response;
    } catch (error) {
      console.error('❌ BrandingAPI.update error:', error);
      throw error;
    }
  }

  reset(accountId) {
    const id = accountId || this.accountIdFromRoute();
    return axios.post(`/api/v1/accounts/${id}/branding/reset`);
  }
}

export default new BrandingAPI();

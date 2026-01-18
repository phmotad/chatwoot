import * as MutationHelpers from 'shared/helpers/vuex/mutationHelpers';
import * as types from '../mutation-types';
import AccountAPI from '../../api/account';
import BrandingAPI from '../../api/branding';
import { differenceInDays } from 'date-fns';
import EnterpriseAccountAPI from '../../api/enterprise/account';
import { throwErrorMessage } from '../utils/api';
import { getLanguageDirection } from 'dashboard/components/widgets/conversation/advancedFilterItems/languages';

const findRecordById = ($state, id) =>
  $state.records.find(record => record.id === Number(id)) || {};

const TRIAL_PERIOD_DAYS = 15;

const state = {
  records: [],
  uiFlags: {
    isFetching: false,
    isFetchingItem: false,
    isUpdating: false,
    isCheckoutInProcess: false,
    isFetchingLimits: false,
  },
};

export const getters = {
  getAccount: $state => id => {
    const account = findRecordById($state, id);
    return account;
  },
  getBranding: $state => id => {
    const account = findRecordById($state, id);
    return account?.branding_settings || {};
  },
  getUIFlags($state) {
    return $state.uiFlags;
  },
  isRTL: ($state, _getters, rootState, rootGetters) => {
    const accountId = Number(rootState.route?.params?.accountId);
    const userLocale = rootGetters?.getUISettings?.locale;
    const accountLocale =
      accountId && findRecordById($state, accountId)?.locale;

    // Prefer user locale; fallback to account locale
    const effectiveLocale = userLocale ?? accountLocale;

    return effectiveLocale ? getLanguageDirection(effectiveLocale) : false;
  },
  isTrialAccount: $state => id => {
    const account = findRecordById($state, id);
    const createdAt = new Date(account.created_at);
    const diffDays = differenceInDays(new Date(), createdAt);

    return diffDays <= TRIAL_PERIOD_DAYS;
  },
  isFeatureEnabledonAccount: $state => (id, featureName) => {
    const { features = {} } = findRecordById($state, id);
    return features[featureName] || false;
  },
};

export const actions = {
  get: async ({ commit }) => {
    commit(types.default.SET_ACCOUNT_UI_FLAG, { isFetchingItem: true });
    try {
      const response = await AccountAPI.get();
      commit(types.default.ADD_ACCOUNT, response.data);
      commit(types.default.SET_ACCOUNT_UI_FLAG, {
        isFetchingItem: false,
      });
    } catch (error) {
      commit(types.default.SET_ACCOUNT_UI_FLAG, {
        isFetchingItem: false,
      });
    }
  },
  update: async ({ commit }, { options, ...updateObj }) => {
    if (options?.silent !== true) {
      commit(types.default.SET_ACCOUNT_UI_FLAG, { isUpdating: true });
    }

    try {
      const response = await AccountAPI.update('', updateObj);
      commit(types.default.EDIT_ACCOUNT, response.data);
      commit(types.default.SET_ACCOUNT_UI_FLAG, { isUpdating: false });
    } catch (error) {
      commit(types.default.SET_ACCOUNT_UI_FLAG, { isUpdating: false });
      throw new Error(error);
    }
  },
  delete: async ({ commit }, { id }) => {
    commit(types.default.SET_ACCOUNT_UI_FLAG, { isUpdating: true });
    try {
      await AccountAPI.delete(id);
      commit(types.default.SET_ACCOUNT_UI_FLAG, { isUpdating: false });
    } catch (error) {
      commit(types.default.SET_ACCOUNT_UI_FLAG, { isUpdating: false });
      throw new Error(error);
    }
  },
  toggleDeletion: async (
    { commit },
    { action_type } = { action_type: 'delete' }
  ) => {
    commit(types.default.SET_ACCOUNT_UI_FLAG, { isUpdating: true });
    try {
      await EnterpriseAccountAPI.toggleDeletion(action_type);
      commit(types.default.SET_ACCOUNT_UI_FLAG, { isUpdating: false });
    } catch (error) {
      commit(types.default.SET_ACCOUNT_UI_FLAG, { isUpdating: false });
      throw new Error(error);
    }
  },
  create: async ({ commit }, accountInfo) => {
    commit(types.default.SET_ACCOUNT_UI_FLAG, { isCreating: true });
    try {
      const response = await AccountAPI.createAccount(accountInfo);
      const account_id = response.data.data.account_id;
      commit(types.default.SET_ACCOUNT_UI_FLAG, { isCreating: false });
      return account_id;
    } catch (error) {
      commit(types.default.SET_ACCOUNT_UI_FLAG, { isCreating: false });
      throw error;
    }
  },

  checkout: async ({ commit }) => {
    commit(types.default.SET_ACCOUNT_UI_FLAG, { isCheckoutInProcess: true });
    try {
      const response = await EnterpriseAccountAPI.checkout();
      window.location = response.data.redirect_url;
    } catch (error) {
      throwErrorMessage(error);
    } finally {
      commit(types.default.SET_ACCOUNT_UI_FLAG, { isCheckoutInProcess: false });
    }
  },

  subscription: async ({ commit }) => {
    commit(types.default.SET_ACCOUNT_UI_FLAG, { isCheckoutInProcess: true });
    try {
      await EnterpriseAccountAPI.subscription();
    } catch (error) {
      throwErrorMessage(error);
    } finally {
      commit(types.default.SET_ACCOUNT_UI_FLAG, { isCheckoutInProcess: false });
    }
  },

  limits: async ({ commit }) => {
    commit(types.default.SET_ACCOUNT_UI_FLAG, { isFetchingLimits: true });
    try {
      const response = await EnterpriseAccountAPI.getLimits();
      commit(types.default.SET_ACCOUNT_LIMITS, response.data);
    } catch (error) {
      // silent error
    } finally {
      commit(types.default.SET_ACCOUNT_UI_FLAG, { isFetchingLimits: false });
    }
  },

  getCacheKeys: async () => {
    return AccountAPI.getCacheKeys();
  },

  fetchBranding: async ({ commit }, accountId) => {
    try {
      const response = await BrandingAPI.get(accountId);
      commit(types.default.SET_ACCOUNT_BRANDING, {
        accountId,
        branding: response.data.branding,
      });
    } catch (error) {
      throwErrorMessage(error);
      throw error;
    }
  },

  updateBranding: async ({ commit, dispatch }, { accountId, branding }) => {
    console.log('🔄 Store updateBranding action called:', { accountId, branding });
    commit(types.default.SET_ACCOUNT_UI_FLAG, { isUpdating: true });
    try {
      console.log('📡 Calling BrandingAPI.update...');
      const response = await BrandingAPI.update(accountId, { branding });
      console.log('✅ BrandingAPI.update response received:', response);
      const brandingData = response.data.branding;
      
      // Update branding in store immediately
      commit(types.default.SET_ACCOUNT_BRANDING, {
        accountId,
        branding: brandingData,
      });
      
      // Update account in store to reflect branding changes (this will refresh the account)
      await dispatch('get');
      
      // Ensure branding is still set after get() updates the account
      commit(types.default.SET_ACCOUNT_BRANDING, {
        accountId,
        branding: brandingData,
      });
      
      commit(types.default.SET_ACCOUNT_UI_FLAG, { isUpdating: false });
    } catch (error) {
      commit(types.default.SET_ACCOUNT_UI_FLAG, { isUpdating: false });
      throwErrorMessage(error);
      throw error;
    }
  },

  resetBranding: async ({ commit, dispatch }, accountId) => {
    commit(types.default.SET_ACCOUNT_UI_FLAG, { isUpdating: true });
    try {
      const response = await BrandingAPI.reset(accountId);
      const brandingData = response.data.branding;
      
      // Update branding in store immediately
      commit(types.default.SET_ACCOUNT_BRANDING, {
        accountId,
        branding: brandingData,
      });
      
      // Update account in store to reflect branding changes (this will refresh the account)
      await dispatch('get');
      
      // Ensure branding is still set after get() updates the account
      commit(types.default.SET_ACCOUNT_BRANDING, {
        accountId,
        branding: brandingData,
      });
      
      commit(types.default.SET_ACCOUNT_UI_FLAG, { isUpdating: false });
    } catch (error) {
      commit(types.default.SET_ACCOUNT_UI_FLAG, { isUpdating: false });
      throwErrorMessage(error);
      throw error;
    }
  },
};

export const mutations = {
  [types.default.SET_ACCOUNT_UI_FLAG]($state, data) {
    $state.uiFlags = {
      ...$state.uiFlags,
      ...data,
    };
  },
  [types.default.ADD_ACCOUNT]: MutationHelpers.setSingleRecord,
  [types.default.EDIT_ACCOUNT]: MutationHelpers.update,
  [types.default.SET_ACCOUNT_LIMITS]: MutationHelpers.updateAttributes,
  [types.default.SET_ACCOUNT_BRANDING]($state, { accountId, branding }) {
    const account = findRecordById($state, accountId);
    if (account) {
      account.branding_settings = branding;
    }
  },
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};

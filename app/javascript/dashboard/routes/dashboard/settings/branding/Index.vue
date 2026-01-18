<script setup>
import { ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAccountBranding } from 'dashboard/composables/useAccountBranding';
import { useAccount } from 'dashboard/composables/useAccount';
import { useAlert } from 'dashboard/composables';
import { DirectUpload } from 'activestorage';
import { useMapGetter } from 'dashboard/composables/store';
import BaseSettingsHeader from '../components/BaseSettingsHeader.vue';
import SectionLayout from '../account/components/SectionLayout.vue';
import ColorPicker from 'dashboard/components-next/colorpicker/ColorPicker.vue';
import Button from 'dashboard/components-next/button/Button.vue';
import Input from 'dashboard/components-next/input/Input.vue';
import WithLabel from 'v3/components/Form/WithLabel.vue';

const { t } = useI18n();
const { accountId } = useAccount();
const {
  branding,
  fetchBranding,
  updateBranding,
  resetBranding,
} = useAccountBranding();
const currentUser = useMapGetter('getCurrentUser');
const globalConfig = useMapGetter('globalConfig/get');

const isUpdating = ref(false);
const isResetting = ref(false);

const primaryColor = ref('#FF5C00');
const secondaryColor = ref('#FF7A33');
const logoBlobId = ref(null);
const logoDarkBlobId = ref(null);
const logoThumbnailBlobId = ref(null);

const logoPreview = ref(null);
const logoDarkPreview = ref(null);
const logoThumbnailPreview = ref(null);

const isUploadingLogo = ref(false);
const isUploadingLogoDark = ref(false);
const isUploadingLogoThumbnail = ref(false);

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/svg+xml', 'image/png', 'image/jpeg', 'image/jpg'];

onMounted(async () => {
  await fetchBranding();
  if (branding.value) {
    primaryColor.value = branding.value.primary_color || '#FF5C00';
    secondaryColor.value = branding.value.secondary_color || '#FF7A33';
    logoPreview.value = branding.value.logo_url;
    logoDarkPreview.value = branding.value.logo_dark_url;
    logoThumbnailPreview.value = branding.value.logo_thumbnail_url;
  }
});

const validateColor = color => {
  const hexRegex = /^#[0-9A-Fa-f]{6}$/;
  return hexRegex.test(color);
};

const validateFile = file => {
  if (!file) return { valid: true };

  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: t('BRANDING.FILE_TYPE_ERROR', {
        types: 'SVG, PNG, JPG',
      }),
    };
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: t('BRANDING.FILE_SIZE_ERROR', { maxSize: '5MB' }),
    };
  }

  return { valid: true };
};

  const uploadFile = (file, callback, onStart, onEnd) => {
    if (!file) {
      callback(null);
      return;
    }

    const validation = validateFile(file);
    if (!validation.valid) {
      useAlert(validation.error);
      callback(null);
      return;
    }

    if (onStart) onStart();

    const upload = new DirectUpload(
      file,
      `/api/v1/accounts/${accountId.value}/direct_uploads`,
      {
        directUploadWillCreateBlobWithXHR: xhr => {
          xhr.setRequestHeader(
            'api_access_token',
            currentUser.value?.access_token
          );
        },
      }
    );

    upload.create((error, blob) => {
      if (onEnd) onEnd();
      if (error) {
        useAlert(error);
        callback(null);
      } else {
        callback(blob.signed_id);
      }
    });
  };

const handleLogoUpload = event => {
  const file = event.target.files[0];
  if (!file) return;

  // Create preview
  const reader = new FileReader();
  reader.onload = e => {
    logoPreview.value = e.target.result;
  };
  reader.readAsDataURL(file);

  uploadFile(
    file,
    blobId => {
      logoBlobId.value = blobId;
    },
    () => {
      isUploadingLogo.value = true;
    },
    () => {
      isUploadingLogo.value = false;
    }
  );
};

const handleLogoDarkUpload = event => {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = e => {
    logoDarkPreview.value = e.target.result;
  };
  reader.readAsDataURL(file);

  uploadFile(
    file,
    blobId => {
      logoDarkBlobId.value = blobId;
    },
    () => {
      isUploadingLogoDark.value = true;
    },
    () => {
      isUploadingLogoDark.value = false;
    }
  );
};

const handleLogoThumbnailUpload = event => {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = e => {
    logoThumbnailPreview.value = e.target.result;
  };
  reader.readAsDataURL(file);

  uploadFile(
    file,
    blobId => {
      logoThumbnailBlobId.value = blobId;
    },
    () => {
      isUploadingLogoThumbnail.value = true;
    },
    () => {
      isUploadingLogoThumbnail.value = false;
    }
  );
};

const handleSubmit = async () => {
  // Check if uploads are still in progress
  if (isUploadingLogo.value || isUploadingLogoDark.value || isUploadingLogoThumbnail.value) {
    useAlert(t('BRANDING.UPLOAD_IN_PROGRESS', { defaultValue: 'Aguarde o upload dos arquivos terminar antes de salvar.' }));
    return;
  }

  // Validate colors
  if (!validateColor(primaryColor.value)) {
    useAlert(t('BRANDING.INVALID_COLOR_ERROR'));
    return;
  }

  if (!validateColor(secondaryColor.value)) {
    useAlert(t('BRANDING.INVALID_COLOR_ERROR'));
    return;
  }

  isUpdating.value = true;

  try {
    const brandingData = {
      branding: {
        primary_color: primaryColor.value,
        secondary_color: secondaryColor.value,
        logo_blob_id: logoBlobId.value,
        logo_dark_blob_id: logoDarkBlobId.value,
        logo_thumbnail_blob_id: logoThumbnailBlobId.value,
      },
    };

    console.log('🔄 Index.vue: Sending branding update:', brandingData);
    console.log('🔄 Index.vue: AccountId:', accountId.value);
    try {
      await updateBranding(brandingData);
      console.log('✅ Index.vue: Branding update completed');
    } catch (error) {
      console.error('❌ Index.vue: Error in updateBranding:', error);
      throw error; // Re-throw to be caught by outer try-catch
    }
    
    // Refresh branding data after update
    await fetchBranding();
    
    // Update previews with new URLs
    if (branding.value) {
      logoPreview.value = branding.value.logo_url;
      logoDarkPreview.value = branding.value.logo_dark_url;
      logoThumbnailPreview.value = branding.value.logo_thumbnail_url;
    }
    
    // Clear blob IDs after successful save
    logoBlobId.value = null;
    logoDarkBlobId.value = null;
    logoThumbnailBlobId.value = null;
    
    useAlert(t('BRANDING.UPDATE_SUCCESS'));
  } catch (error) {
    console.error('Error updating branding:', error);
    useAlert(t('BRANDING.UPDATE_ERROR'));
  } finally {
    isUpdating.value = false;
  }
};

const handleReset = async () => {
  if (
    !confirm(
      t('BRANDING.RESET_CONFIRM', {
        defaultValue: 'Tem certeza que deseja resetar o branding para os valores padrão?',
      })
    )
  ) {
    return;
  }

  isResetting.value = true;

  try {
    await resetBranding();
    primaryColor.value = '#FF5C00';
    secondaryColor.value = '#FF7A33';
    logoBlobId.value = null;
    logoDarkBlobId.value = null;
    logoThumbnailBlobId.value = null;
    logoPreview.value = branding.value?.logo_url;
    logoDarkPreview.value = branding.value?.logo_dark_url;
    logoThumbnailPreview.value = branding.value?.logo_thumbnail_url;
    useAlert(t('BRANDING.RESET_SUCCESS'));
  } catch (error) {
    useAlert(t('BRANDING.RESET_ERROR'));
  } finally {
    isResetting.value = false;
  }
};
</script>

<template>
  <div class="flex flex-col max-w-2xl mx-auto w-full">
    <BaseSettingsHeader
      :title="t('BRANDING.TITLE', { defaultValue: 'Personalização de Branding' })"
      :description="
        t('BRANDING.DESCRIPTION', {
          defaultValue:
            'Personalize as cores e logos da sua empresa. As alterações serão aplicadas imediatamente na interface.',
        })
      "
      icon-name="color"
    />
    <div class="flex-grow flex-shrink min-w-0 mt-3">
      <SectionLayout
        :title="t('BRANDING.COLORS_SECTION', { defaultValue: 'Cores' })"
        :description="
          t('BRANDING.COLORS_DESCRIPTION', {
            defaultValue: 'Defina as cores primária e secundária da sua marca.',
          })
        "
      >
        <div class="grid gap-4">
          <WithLabel
            :label="t('BRANDING.PRIMARY_COLOR', { defaultValue: 'Cor Primária' })"
          >
            <ColorPicker v-model="primaryColor" />
            <template #help>
              {{ t('BRANDING.PRIMARY_COLOR_HELP', { defaultValue: 'Cor principal da marca' }) }}
            </template>
          </WithLabel>

          <WithLabel
            :label="t('BRANDING.SECONDARY_COLOR', { defaultValue: 'Cor Secundária' })"
          >
            <ColorPicker v-model="secondaryColor" />
            <template #help>
              {{ t('BRANDING.SECONDARY_COLOR_HELP', { defaultValue: 'Cor secundária da marca' }) }}
            </template>
          </WithLabel>
        </div>
      </SectionLayout>

      <SectionLayout
        :title="t('BRANDING.LOGOS_SECTION', { defaultValue: 'Logos' })"
        :description="
          t('BRANDING.LOGOS_DESCRIPTION', {
            defaultValue:
              'Faça upload dos logos da sua empresa. Formatos suportados: SVG, PNG, JPG (máx 5MB).',
          })
        "
        :with-border="true"
      >
        <div class="grid gap-4">
          <WithLabel
            :label="t('BRANDING.LOGO', { defaultValue: 'Logo (Modo Claro)' })"
          >
            <div class="flex items-center gap-4">
              <div v-if="logoPreview" class="flex-shrink-0">
                <img
                  :src="logoPreview"
                  alt="Logo preview"
                  class="h-16 w-auto object-contain"
                />
              </div>
              <input
                type="file"
                accept="image/svg+xml,image/png,image/jpeg,image/jpg"
                class="text-sm"
                @change="handleLogoUpload"
              />
            </div>
          </WithLabel>

          <WithLabel
            :label="t('BRANDING.LOGO_DARK', { defaultValue: 'Logo (Modo Escuro)' })"
          >
            <div class="flex items-center gap-4">
              <div v-if="logoDarkPreview" class="flex-shrink-0">
                <img
                  :src="logoDarkPreview"
                  alt="Logo dark preview"
                  class="h-16 w-auto object-contain"
                />
              </div>
              <input
                type="file"
                accept="image/svg+xml,image/png,image/jpeg,image/jpg"
                class="text-sm"
                @change="handleLogoDarkUpload"
              />
            </div>
          </WithLabel>

          <WithLabel
            :label="t('BRANDING.LOGO_THUMBNAIL', { defaultValue: 'Logo Thumbnail' })"
          >
            <div class="flex items-center gap-4">
              <div v-if="logoThumbnailPreview" class="flex-shrink-0">
                <img
                  :src="logoThumbnailPreview"
                  alt="Logo thumbnail preview"
                  class="h-16 w-auto object-contain"
                />
              </div>
              <input
                type="file"
                accept="image/svg+xml,image/png,image/jpeg,image/jpg"
                class="text-sm"
                @change="handleLogoThumbnailUpload"
              />
            </div>
          </WithLabel>
        </div>
      </SectionLayout>

      <div class="flex gap-3 mt-6">
        <Button
          :is-loading="isUpdating"
          color="slate"
          @click="handleSubmit"
        >
          {{ t('BRANDING.SAVE', { defaultValue: 'Salvar' }) }}
        </Button>
        <Button
          :is-loading="isResetting"
          color="slate"
          variant="outline"
          @click="handleReset"
        >
          {{ t('BRANDING.RESET', { defaultValue: 'Resetar para Padrão' }) }}
        </Button>
      </div>
    </div>
  </div>
</template>

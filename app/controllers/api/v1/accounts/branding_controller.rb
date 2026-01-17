class Api::V1::Accounts::BrandingController < Api::V1::Accounts::BaseController
  include ::FileTypeHelper

  before_action :check_authorization

  def show
    @branding = Current.account.branding_settings
  end

  def update
    ActiveRecord::Base.transaction do
      # Processar cores
      colors_params = {
        primary_color: params.dig(:branding, :primary_color),
        secondary_color: params.dig(:branding, :secondary_color)
      }.compact

      # Processar logos via blob_id (padrão do projeto)
      process_attached_logo(:branding_logo, params.dig(:branding, :logo_blob_id)) if params.dig(:branding, :logo_blob_id).present?
      process_attached_logo(:branding_logo_dark, params.dig(:branding, :logo_dark_blob_id)) if params.dig(:branding, :logo_dark_blob_id).present?
      process_attached_logo(:branding_logo_thumbnail, params.dig(:branding, :logo_thumbnail_blob_id)) if params.dig(:branding, :logo_thumbnail_blob_id).present?

      if Current.account.update_branding(colors_params)
        @branding = Current.account.branding_settings
        render :show
      else
        render_error_response(Current.account)
      end
    rescue ActiveRecord::RecordInvalid => e
      render_record_invalid(e)
    end
  end

  def reset
    Current.account.settings.delete('branding')
    Current.account.branding_logo.purge if Current.account.branding_logo.attached?
    Current.account.branding_logo_dark.purge if Current.account.branding_logo_dark.attached?
    Current.account.branding_logo_thumbnail.purge if Current.account.branding_logo_thumbnail.attached?
    Current.account.save!
    @branding = Current.account.branding_settings
    render :show
  end

  private

  def branding_params
    params.require(:branding).permit(
      :primary_color,
      :secondary_color,
      :logo_blob_id,
      :logo_dark_blob_id,
      :logo_thumbnail_blob_id
    )
  end

  def process_attached_logo(attachment_name, blob_id)
    return unless blob_id.present?

    blob = ActiveStorage::Blob.find_signed(blob_id)
    Current.account.public_send(attachment_name).attach(blob)
  end

  def check_authorization
    authorize(Current.account, :update_branding?)
  end
end

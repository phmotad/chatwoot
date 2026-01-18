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

      # Atualizar cores no settings
      Current.account.update_branding(colors_params)
      
      # Garantir que tudo foi salvo
      Current.account.save!
      
      @branding = Current.account.branding_settings
      render :show
    rescue ActiveRecord::RecordInvalid => e
      render_record_invalid(e)
    rescue ActiveStorage::FileNotFoundError, ActiveStorage::IntegrityError => e
      Rails.logger.error("Error processing logo: #{e.message}")
      render json: { error: e.message }, status: :unprocessable_entity
    rescue StandardError => e
      Rails.logger.error("Error updating branding: #{e.message}")
      Rails.logger.error(e.backtrace.join("\n"))
      render json: { error: 'Failed to update branding' }, status: :internal_server_error
    end
  end

  def reset
    ActiveRecord::Base.transaction do
      # Remove branding settings
      Current.account.settings.delete('branding') if Current.account.settings['branding'].present?
      
      # Purge attached logos
      Current.account.branding_logo.purge if Current.account.branding_logo.attached?
      Current.account.branding_logo_dark.purge if Current.account.branding_logo_dark.attached?
      Current.account.branding_logo_thumbnail.purge if Current.account.branding_logo_thumbnail.attached?
      
      # Garantir que tudo foi salvo
      Current.account.save!
      
      @branding = Current.account.branding_settings
      render :show
    rescue ActiveRecord::RecordInvalid => e
      render_record_invalid(e)
    rescue StandardError => e
      Rails.logger.error("Error resetting branding: #{e.message}")
      Rails.logger.error(e.backtrace.join("\n"))
      render json: { error: 'Failed to reset branding' }, status: :internal_server_error
    end
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

    begin
      blob = ActiveStorage::Blob.find_signed(blob_id)
      if blob
        Current.account.public_send(attachment_name).attach(blob)
      else
        Rails.logger.warn("Blob not found for signed_id: #{blob_id}")
      end
    rescue ActiveSupport::MessageVerifier::InvalidSignature => e
      Rails.logger.error("Invalid blob signature: #{e.message}")
      raise
    rescue StandardError => e
      Rails.logger.error("Error processing logo attachment #{attachment_name}: #{e.message}")
      raise
    end
  end

  def check_authorization
    authorize(Current.account, :update_branding?)
  end
end

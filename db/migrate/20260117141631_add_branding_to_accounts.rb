class AddBrandingToAccounts < ActiveRecord::Migration[7.1]
  def change
    # No need to add columns, uses existing settings JSONB
    # ActiveStorage is already globally configured
    # This migration is a placeholder to track the branding feature implementation
  end
end

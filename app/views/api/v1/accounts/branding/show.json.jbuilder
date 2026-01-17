json.branding do
  json.primary_color @branding[:primary_color]
  json.secondary_color @branding[:secondary_color]
  json.logo_url @branding[:logo_url]
  json.logo_dark_url @branding[:logo_dark_url]
  json.logo_thumbnail_url @branding[:logo_thumbnail_url]
  json.is_customized @branding[:is_customized]
end

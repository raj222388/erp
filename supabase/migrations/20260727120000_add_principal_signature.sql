-- Add principal_signature_url to site_settings for use on ID cards and fee receipts
ALTER TABLE site_settings
  ADD COLUMN IF NOT EXISTS principal_signature_url text DEFAULT NULL;

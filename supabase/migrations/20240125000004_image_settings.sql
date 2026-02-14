-- Add image_settings column to site_settings table
ALTER TABLE site_settings 
ADD COLUMN IF NOT EXISTS image_settings JSONB DEFAULT '{
  "max_upload_size_mb": 5,
  "compression_level": 80,
  "target_size_kb": 100,
  "output_formats": ["webp", "jpeg"],
  "resize": {
    "enabled": true,
    "max_width": 1920,
    "max_height": 1920,
    "keep_aspect_ratio": true
  },
  "metadata": {
    "keep_exif": false
  }
}';

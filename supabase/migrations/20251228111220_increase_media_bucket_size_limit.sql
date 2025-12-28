/*
  # Increase Media Storage Bucket Size Limit

  1. Changes
    - Increase file size limit from 50MB to 5GB to support full-length movies
    - Update existing 'media' bucket configuration

  2. Reasoning
    - 90-minute movies at standard quality can be 500MB-2GB
    - 5GB provides comfortable headroom for high-quality video content
*/

-- Update the media storage bucket to allow larger files (5GB = 5368709120 bytes)
UPDATE storage.buckets
SET file_size_limit = 5368709120
WHERE id = 'media';

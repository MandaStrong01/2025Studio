/*
  # Create Media Storage Bucket

  1. Storage Setup
    - Create 'media' storage bucket for user uploads
    - Enable public access for easy file sharing
    - Set file size limit to 50MB
  
  2. Security Policies
    - Allow authenticated users to upload files
    - Allow authenticated users to read their own files
    - Allow public read access for all files
    - Allow authenticated users to delete their own files
*/

-- Create the media storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'media',
  'media',
  true,
  52428800,
  ARRAY['image/*', 'video/*', 'audio/*', 'application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- Policy: Allow authenticated users to upload files
CREATE POLICY "Authenticated users can upload media"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'media');

-- Policy: Allow public read access to all files
CREATE POLICY "Public read access for media"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'media');

-- Policy: Allow authenticated users to update their own files
CREATE POLICY "Users can update own media"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'media' AND auth.uid()::text = (storage.foldername(name))[1])
WITH CHECK (bucket_id = 'media' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Policy: Allow authenticated users to delete their own files
CREATE POLICY "Users can delete own media"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'media' AND auth.uid()::text = (storage.foldername(name))[1]);
import { supabase } from './supabase';

export interface VideoAsset {
  name: string;
  url: string;
  size?: number;
  uploadedAt?: Date;
}

const STATIC_VIDEO_BUCKET = 'media';
const STATIC_VIDEO_FOLDER = 'static-assets';

export async function getVideoUrl(filename: string): Promise<string> {
  const path = `${STATIC_VIDEO_FOLDER}/${filename}`;

  const { data } = supabase.storage
    .from(STATIC_VIDEO_BUCKET)
    .getPublicUrl(path);

  return data.publicUrl;
}

export async function listStaticVideos(): Promise<VideoAsset[]> {
  const { data, error } = await supabase.storage
    .from(STATIC_VIDEO_BUCKET)
    .list(STATIC_VIDEO_FOLDER);

  if (error || !data) {
    console.error('Error listing videos:', error);
    return [];
  }

  return Promise.all(
    data.map(async (file) => {
      const url = await getVideoUrl(file.name);
      return {
        name: file.name,
        url,
        size: file.metadata?.size,
        uploadedAt: file.created_at ? new Date(file.created_at) : undefined,
      };
    })
  );
}

export async function uploadStaticVideo(file: File, filename?: string): Promise<string | null> {
  const finalFilename = filename || file.name;
  const path = `${STATIC_VIDEO_FOLDER}/${finalFilename}`;

  const { data, error } = await supabase.storage
    .from(STATIC_VIDEO_BUCKET)
    .upload(path, file, {
      upsert: true,
      contentType: file.type,
    });

  if (error) {
    console.error('Error uploading video:', error);
    return null;
  }

  return await getVideoUrl(finalFilename);
}

export async function deleteStaticVideo(filename: string): Promise<boolean> {
  const path = `${STATIC_VIDEO_FOLDER}/${filename}`;

  const { error } = await supabase.storage
    .from(STATIC_VIDEO_BUCKET)
    .remove([path]);

  if (error) {
    console.error('Error deleting video:', error);
    return false;
  }

  return true;
}

export const REQUIRED_VIDEOS = {
  BACKGROUND: 'background.mp4',
  AVATAR: 'avatar.mp4',
  DOXY_MOVIE: 'packageDTSBexpscript.mp4',
  OUTRO: 'thatsallfolks.mp4',
};

export async function checkRequiredVideos(): Promise<Record<string, boolean>> {
  const videos = await listStaticVideos();
  const videoNames = videos.map(v => v.name);

  return {
    [REQUIRED_VIDEOS.BACKGROUND]: videoNames.includes(REQUIRED_VIDEOS.BACKGROUND),
    [REQUIRED_VIDEOS.AVATAR]: videoNames.includes(REQUIRED_VIDEOS.AVATAR),
    [REQUIRED_VIDEOS.DOXY_MOVIE]: videoNames.includes(REQUIRED_VIDEOS.DOXY_MOVIE),
    [REQUIRED_VIDEOS.OUTRO]: videoNames.includes(REQUIRED_VIDEOS.OUTRO),
  };
}

import { supabase } from './supabase';

export interface VideoAsset {
  name: string;
  url: string;
  size?: number;
  uploadedAt?: Date;
}

export interface StaticVideo {
  id: string;
  video_key: string;
  video_url: string;
  display_name: string;
  description: string;
  is_active: boolean;
  updated_at: string;
}

const STATIC_VIDEO_BUCKET = 'media';
const STATIC_VIDEO_FOLDER = 'static-assets';

export async function getVideoUrl(videoKey: string): Promise<string> {
  try {
    const { data, error } = await supabase
      .from('static_videos')
      .select('video_url')
      .eq('video_key', videoKey)
      .eq('is_active', true)
      .maybeSingle();

    if (error) {
      console.error('Error fetching video URL:', error);
      return '';
    }

    return data?.video_url || '';
  } catch (error) {
    console.error('Error in getVideoUrl:', error);
    return '';
  }
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
  BACKGROUND: 'background',
  AVATAR: 'avatar',
  DOXY_MOVIE: 'doxy_movie',
  OUTRO: 'outro',
};

export async function getAllStaticVideos(): Promise<StaticVideo[]> {
  try {
    const { data, error } = await supabase
      .from('static_videos')
      .select('*')
      .order('video_key');

    if (error) {
      console.error('Error fetching static videos:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getAllStaticVideos:', error);
    return [];
  }
}

export async function updateStaticVideo(
  videoKey: string,
  videoUrl: string,
  updatedBy: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('static_videos')
      .update({
        video_url: videoUrl,
        updated_at: new Date().toISOString(),
        updated_by: updatedBy,
      })
      .eq('video_key', videoKey);

    if (error) {
      console.error('Error updating static video:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in updateStaticVideo:', error);
    return false;
  }
}

export async function checkRequiredVideos(): Promise<Record<string, boolean>> {
  const videos = await getAllStaticVideos();

  return {
    [REQUIRED_VIDEOS.BACKGROUND]: !!videos.find(v => v.video_key === REQUIRED_VIDEOS.BACKGROUND && v.video_url)?.video_url,
    [REQUIRED_VIDEOS.AVATAR]: !!videos.find(v => v.video_key === REQUIRED_VIDEOS.AVATAR && v.video_url)?.video_url,
    [REQUIRED_VIDEOS.DOXY_MOVIE]: !!videos.find(v => v.video_key === REQUIRED_VIDEOS.DOXY_MOVIE && v.video_url)?.video_url,
    [REQUIRED_VIDEOS.OUTRO]: !!videos.find(v => v.video_key === REQUIRED_VIDEOS.OUTRO && v.video_url)?.video_url,
  };
}

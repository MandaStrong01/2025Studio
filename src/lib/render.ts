
typescriptexport async function renderVideo(videos: string[]): Promise<Blob> {
  console.log('🎬 Starting video render with', videos.length, 'videos');
  
  if (!videos || videos.length === 0) {
    throw new Error('No videos provided for rendering');
  }
  
  try {
    // Create FormData for the videos
    const formData = new FormData();
    videos.forEach((videoPath, index) => {
      formData.append(`video${index}`, videoPath);
    });
    
    console.log('📤 Sending render request...');
    
    // Call render API endpoint
    const response = await fetch('/api/render', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ videos })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Render failed');
    }
    
    console.log('✅ Render complete, downloading...');
    
    const blob = await response.blob();
    
    if (blob.size < 10000) {
      throw new Error(`Output file too small: ${blob.size} bytes`);
    }
    
    console.log(`📦 Video rendered: ${(blob.size / 1024 / 1024).toFixed(2)} MB`);
    
    return blob;
    
  } catch (error: any) {
    console.error('❌ Render error:', error);
    throw error;
  }
}

export async function downloadRenderedVideo(blob: Blob, filename: string = 'rendered_movie.mp4') {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
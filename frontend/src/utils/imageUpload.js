export const uploadToImgBB = async (file) => {
  const IMGBB_API_KEY = process.env.REACT_APP_IMGBB_API_KEY;
  
  if (!IMGBB_API_KEY) {
    throw new Error('ImgBB API key is not configured');
  }

  try {
    const formData = new FormData();
    formData.append('image', file);
    
    const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const data = await response.json();
    
    if (data.success) {
      return data.data.url;
    } else {
      throw new Error(data.error?.message || 'Failed to upload image');
    }
  } catch (error) {
    console.error('Image upload error:', error);
    throw new Error('Failed to upload image. Please try again.');
  }
};
export function getBrandConfig(categoryName) {
  if (!categoryName) return { primary: '#3B82F6', bgLight: '#EFF6FF', icon: 'Key' };
  
  const name = categoryName.toLowerCase();
  
  if (name.includes('facebook') || name.includes('fb')) {
    return { primary: '#1877F2', bgLight: '#E7F3FF', icon: 'FacebookLogo' };
  }
  if (name.includes('google') || name.includes('gmail')) {
    return { primary: '#EA4335', bgLight: '#FCE8E6', icon: 'EnvelopeSimple' };
  }
  if (name.includes('xiaomi') || name.includes('mi')) {
    return { primary: '#FF6900', bgLight: '#FFF0E6', icon: 'DeviceMobile' };
  }
  if (name.includes('instagram') || name.includes('ig')) {
    return { primary: '#E4405F', bgLight: '#FDE8EC', icon: 'InstagramLogo' };
  }
  if (name.includes('tiktok')) {
    return { primary: '#000000', bgLight: '#F2F2F2', icon: 'TiktokLogo' };
  }
  
  return { primary: '#3B82F6', bgLight: '#EFF6FF', icon: 'Key' };
}

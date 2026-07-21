export function getBrandConfig(categoryName) {
  if (!categoryName) {
    return {
      primary: '#3B82F6',
      bgLight: '#EFF6FF',
      primaryDark: '#60A5FA',
      bgDark: 'rgba(59, 130, 246, 0.15)',
      icon: 'Key'
    };
  }
  
  const name = categoryName.toLowerCase();
  
  if (name.includes('facebook') || name.includes('fb')) {
    return {
      primary: '#1877F2',
      bgLight: '#E7F3FF',
      primaryDark: '#388BFD',
      bgDark: 'rgba(24, 119, 242, 0.15)',
      icon: 'FacebookLogo'
    };
  }
  if (name.includes('google') || name.includes('gmail')) {
    return {
      primary: '#EA4335',
      bgLight: '#FCE8E6',
      primaryDark: '#F87171',
      bgDark: 'rgba(234, 67, 53, 0.15)',
      icon: 'EnvelopeSimple'
    };
  }
  if (name.includes('xiaomi') || name.includes('mi')) {
    return {
      primary: '#FF6900',
      bgLight: '#FFF0E6',
      primaryDark: '#FF8533',
      bgDark: 'rgba(255, 105, 0, 0.15)',
      icon: 'DeviceMobile'
    };
  }
  if (name.includes('instagram') || name.includes('ig')) {
    return {
      primary: '#E4405F',
      bgLight: '#FDE8EC',
      primaryDark: '#F472B6',
      bgDark: 'rgba(228, 64, 95, 0.15)',
      icon: 'InstagramLogo'
    };
  }
  if (name.includes('tiktok')) {
    return {
      primary: '#000000',
      bgLight: '#F2F2F2',
      primaryDark: '#FFFFFF',
      bgDark: 'rgba(255, 255, 255, 0.15)',
      icon: 'TiktokLogo'
    };
  }
  
  return {
    primary: '#3B82F6',
    bgLight: '#EFF6FF',
    primaryDark: '#60A5FA',
    bgDark: 'rgba(59, 130, 246, 0.15)',
    icon: 'Key'
  };
}


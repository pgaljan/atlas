export const setFaviconWithFallback = (faviconUrl, fallbackUrl = '/assets/atlas-logo.png') => {
  const existingIcons = document.querySelectorAll("link[rel~='icon']");
  existingIcons.forEach((icon) => icon.remove());

  const testImg = new Image();
  testImg.onload = () => {
    const link = document.createElement('link');
    link.rel = 'icon';
    link.type = 'image/png';
    link.href = faviconUrl;
    document.head.appendChild(link);
  };
  testImg.onerror = () => {
    const link = document.createElement('link');
    link.rel = 'icon';
    link.type = 'image/png';
    link.href = fallbackUrl;
    document.head.appendChild(link);
  };
  testImg.src = faviconUrl;
};

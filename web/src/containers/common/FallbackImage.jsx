import { useState } from 'react';

const FallbackImage = ({
  src,
  alt,
  fallback = '/assets/atlas-logo.png',
  className = '',
  ...props
}) => {
  const [imgSrc, setImgSrc] = useState(src || fallback);

  const handleError = () => {
    setImgSrc(fallback);
  };

  return (
    <img src={imgSrc} alt={alt || 'image'} onError={handleError} className={className} {...props} />
  );
};

export default FallbackImage;

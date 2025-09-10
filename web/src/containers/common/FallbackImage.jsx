import { useState, useEffect } from 'react';

const FallbackImage = ({
  src,
  alt,
  fallback = '/assets/atlas-logo.png',
  className = '',
  ...props
}) => {
  const [imgSrc, setImgSrc] = useState(src || fallback);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (src) {
      setHasError(false);
      setImgSrc(src);
    } else {
      setImgSrc(fallback);
    }
  }, [src, fallback]);

  const handleError = () => {
    setHasError(true);
    setImgSrc(fallback);
  };

  return (
    <img
      src={hasError ? fallback : imgSrc}
      alt={alt || 'image'}
      onError={handleError}
      className={className}
      {...props}
    />
  );
};

export default FallbackImage;

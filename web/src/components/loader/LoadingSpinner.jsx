import { FiLoader } from 'react-icons/fi';

const LoadingSpinner = ({
  size = 12,
  color = 'text-custom-main',
  wrapperClassName = '',
  className = '',
  mode = 'overlay',
  message = '',
  minHeight = 'min-h-screen',
  messageClass = 'text-gray-500 text-sm',
}) => {
  const sizeClasses = {
    2: 'w-2 h-2',
    3: 'w-3 h-3',
    4: 'w-4 h-4',
    5: 'w-5 h-5',
    6: 'w-6 h-6',
    8: 'w-8 h-8',
    10: 'w-10 h-10',
    12: 'w-12 h-12',
  };

  const SpinnerContent = (
    <div className="flex flex-col items-center  justify-center text-center space-y-3">
      <FiLoader className={`animate-spin ${sizeClasses[size]} ${color} ${className}`} />
      {message && <p className={messageClass}>{message}</p>}
    </div>
  );

  if (mode === 'inline') return SpinnerContent;

  const overlayBase = `relative flex-1 min-h-0 ${minHeight}`;
  const overlayInner = `absolute inset-0 flex items-center justify-center z-50 ${wrapperClassName}`;

  if (mode === 'overlay') {
    return (
      <div className={overlayBase}>
        <div className={`${overlayInner} bg-white bg-opacity-70 rounded-xl`}>{SpinnerContent}</div>
      </div>
    );
  }

  if (mode === 'overlayClear') {
    return (
      <div className={overlayBase}>
        <div className={overlayInner}>{SpinnerContent}</div>
      </div>
    );
  }
  if (mode === 'fullscreen') {
    return (
      <div
        className={`fixed inset-0 flex items-center justify-center z-50 bg-white bg-opacity-50 backdrop-blur-sm ${wrapperClassName}`}
      >
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-custom-main border-t-transparent"></div>
        {message && <p className={`mt-3 ${messageClass}`}>{message}</p>}
      </div>
    );
  }

  return null;
};

export default LoadingSpinner;

import { FiLoader } from "react-icons/fi"

const LoadingSpinner = ({ 
  size = 4, 
  className = "", 
  color = "text-custom-main" 
}) => {
  const sizeClasses = {
    2: "w-2 h-2",
    3: "w-3 h-3", 
    4: "w-4 h-4",
    5: "w-5 h-5",
    6: "w-6 h-6",
    8: "w-8 h-8",
    10: "w-10 h-10",
    12: "w-12 h-12"
  }

  return (
    <FiLoader 
      className={`animate-spin ${sizeClasses[size]} ${color} ${className}`} 
    />
  )
}

export default LoadingSpinner

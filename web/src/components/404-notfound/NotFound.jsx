import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="flex items-center justify-center min-h-screen  bg-custom-main  text-custom-main">
      <div className="text-center p-10 max-w-lg mx-auto bg-custom-background-white rounded-xl shadow-lg">
        <h1 className="text-6xl font-bold mb-4 animate__animated animate__fadeIn">
          404
        </h1>
        <p className="text-xl mb-6 animate__animated animate__fadeIn animate__delay-1s">
          Oops! The page you're looking for doesn't exist.
        </p>
        <p className="text-md mb-6 animate__animated animate__fadeIn animate__delay-2s">
          It might have been moved or deleted.
        </p>
        <Link
          to="/"
          className="inline-block px-6 py-3 mt-4 bg-white text-custom-main font-semibold rounded-lg shadow-md hover:bg-gray-200 transition duration-300"
        >
          Go Back Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;

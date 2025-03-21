import { Link } from "react-router-dom";
import React from "react";


const ComingSoon = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-custom-main text-custom-main">
      <div className="text-center p-10 max-w-lg mx-auto bg-custom-background-white rounded-xl shadow-lg">
        <h1 className="text-5xl font-bold mb-8 animate__animated animate__fadeIn">
          Coming Soon
        </h1>
        <p className="text-lg mb-6 animate__animated animate__fadeIn animate__delay-1s">
          We're working hard to bring you something amazing.
        </p>
        <p className="text-md mb-6 animate__animated animate__fadeIn animate__delay-2s">
          Stay tuned for updates!
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

export default ComingSoon;

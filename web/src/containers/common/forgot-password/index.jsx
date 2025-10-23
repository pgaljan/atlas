import cogoToast from '@successtar/cogo-toast';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import OnboardingHeader from '../../../components/common/OnboardingHeader';
import { forgotPassword } from '../../../redux/slices/users';

const ForgotPassword = () => {
  const dispatch = useDispatch();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) return setError('Email is required');
    if (!/\S+@\S+\.\S+/.test(email)) {
      return setError('Please enter a valid email');
    }

    setError('');
    setIsSubmitting(true);

    try {
      const normalizedEmail = email.trim().toLowerCase();
      await dispatch(forgotPassword(normalizedEmail)).unwrap();
      cogoToast.success('Reset link sent! Check your email.');
    } catch (err) {
      cogoToast.error(err?.message || 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-custom-background-white">
      <OnboardingHeader />
      <main className="flex items-center justify-center h-screen">
        <div className="p-6 w-full max-w-[30%]">
          <h1 className="text-3xl font-semibold text-center mb-4 text-custom-text-heading">
            Forgot Password
          </h1>

          <form onSubmit={handleSubmit} noValidate>
            <div className="mb-4">
              <label
                htmlFor="forgot-email-input"
                className="block text-sm font-medium text-custom-text-grey mb-1"
              >
                Work email
              </label>
              <input
                type="email"
                id="forgot-email-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your work email"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
              {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
            </div>

            <button
              type="submit"
              className="w-full bg-custom-main text-white py-2 cursor-pointer rounded-lg mt-2 hover:bg-custom-main transition duration-200 ease-in-out"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>

          <div className="text-center mt-4">
            <Link
              to="http://www.Atlas.co/terms/services-agreement"
              className="text-black underline text-sm hover:text-blue-700 transition duration-200 ease-in-out"
            >
              Terms of Service
            </Link>
          </div>

          {/* NEW: Link to Login Page */}
          <div className="text-center mt-3">
            <Link to="/" className="text-blue-600 text-sm hover:underline">
              Remember your password? Log in
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ForgotPassword;

import Cookies from 'js-cookie';
import { useEffect, useRef, useState } from 'react';
import Avatar from 'react-avatar';
import { FiLogOut, FiSettings } from 'react-icons/fi';
import { TbAppsFilled } from 'react-icons/tb';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import cogoToast from '@successtar/cogo-toast';
import { logoutUser } from '../../redux/slices/auth';
import { PiTreeStructure } from 'react-icons/pi';
const CustomLearnerPlatformMenu = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const menuRef = useRef();
  const dispatch = useDispatch();

  const displayName = Cookies.get('displayName') || 'User';
  const email = Cookies.get('atlas_email') || 'user@example.com';
  const username = Cookies.get('atlas_username') || 'username';

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      Cookies.remove('atlas_access_token');
      Cookies.remove('atlas_userId');
      Cookies.remove('atlas_username');
      Cookies.remove('atlas_email');
      Cookies.remove('workspaceId');
      localStorage.clear();
      sessionStorage.clear();
      cogoToast.success('Logged out successfully!');
      navigate('/');
    } catch (error) {
      cogoToast.error(
        error?.message || 'An unexpected error occurred during logout. Please try again.',
      );
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      <button onClick={() => setOpen((prev) => !prev)} className="focus:outline-none">
        <Avatar name={displayName} size="38" round />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-100 z-50 animate-fade-in">
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-sm font-semibold text-gray-900 truncate">{displayName}</p>
            <p className="text-xs text-gray-600 truncate">username: {username}</p>
            <p className="text-xs text-gray-500 truncate">{email}</p>
          </div>

          <div className="p-1 space-y-1">
            <button
              onClick={() => {
                navigate('/app/dashboard');
                setOpen(false);
              }}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 rounded-md hover:bg-gray-100 transition"
            >
              <PiTreeStructure className="text-base" />
              Atlas Dashboard
            </button>

            <button
              onClick={() => {
                navigate('/learner/account-settings');
                setOpen(false);
              }}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 rounded-md hover:bg-gray-100 transition"
            >
              <FiSettings className="text-base" />
              Account Settings
            </button>

            <hr className="border-gray-100" />

            <button
              onClick={() => {
                handleLogout();
                setOpen(false);
              }}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 rounded-md font-semibold hover:bg-red-100 transition"
            >
              <FiLogOut className="text-base" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomLearnerPlatformMenu;

import Cookies from 'js-cookie';
import { useEffect, useRef, useState } from 'react';
import Avatar from 'react-avatar';
import { FiKey, FiLogOut, FiSettings } from 'react-icons/fi';
import { IoKeyOutline } from 'react-icons/io5';
import { PiStudentBold } from 'react-icons/pi';
import { useNavigate } from 'react-router-dom';

const CustomAtlasMenu = ({ handleLogout }) => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef();
  const navigate = useNavigate();

  const displayName = Cookies.get('displayName') || 'User';
  const email = Cookies.get('atlas_email') || 'user@example.com';

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative ml-4" ref={menuRef}>
      <button onClick={() => setOpen((prev) => !prev)} className="focus:outline-none">
        <Avatar name={displayName} size="38" round />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-100 z-50 animate-fade-in">
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-sm font-semibold text-gray-900 truncate">{displayName}</p>
            <p className="text-xs text-gray-500 truncate">{email}</p>
          </div>

          <div className="p-1 space-y-1">
            <button
              onClick={() => {
                navigate('/app/user-settings');
                setOpen(false);
              }}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 rounded-md hover:bg-gray-100 transition"
            >
              <FiSettings className="text-base" />
              Account Settings
            </button>

            <button
              onClick={() => {
                navigate('/api-management/overview');
                setOpen(false);
              }}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 rounded-md hover:bg-gray-100 transition"
            >
              <IoKeyOutline className="text-base" />
              API Access
            </button>
            <button
              onClick={() => {
                navigate('/learner/dashboard');
                setOpen(false);
              }}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 rounded-md hover:bg-gray-100 transition"
            >
              <PiStudentBold className="text-base" />
              Learner Platform
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

export default CustomAtlasMenu;

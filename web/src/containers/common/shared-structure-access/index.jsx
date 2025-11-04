import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Cookies from 'js-cookie';
import cogoToast from '@successtar/cogo-toast';
import { FiEye, FiUser, FiMessageCircle, FiSettings, FiLock, FiGlobe, FiClock, FiAlertCircle } from 'react-icons/fi';

const SharedStructureAccess = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const [loading, setLoading] = useState(true);
  const [structure, setStructure] = useState(null);
  const [error, setError] = useState(null);
  const [accessType, setAccessType] = useState(null);

  const isLoggedIn = !!Cookies.get('atlas_token');
  const user = useSelector((state) => state.auth?.user || null);

  const permissionConfig = {
    owner: {
      label: "Owner",
      description: "Full control - can add collaborators, edit, and export",
      icon: FiSettings,
      color: "text-purple-600",
      bgColor: "bg-purple-100"
    },
    collaborator: {
      label: "Can edit",
      description: "Can edit structure map and records",
      icon: FiUser,
      color: "text-blue-600",
      bgColor: "bg-blue-100"
    },
    commenter: {
      label: "Can comment",
      description: "Can browse and comment on structure map and records",
      icon: FiMessageCircle,
      color: "text-green-600",
      bgColor: "bg-green-100"
    },
    viewer: {
      label: "Can view",
      description: "Can browse and export structure map and records",
      icon: FiEye,
      color: "text-gray-600",
      bgColor: "bg-gray-100"
    }
  };

  useEffect(() => {
    if (!token) {
      navigate('/404', { replace: true });
      return;
    }

    accessSharedStructure();
  }, [token]);

  const accessSharedStructure = async () => {
    setLoading(true);
    setError(null);

    try {
      const userId = isLoggedIn ? Cookies.get('atlas_userId') : null;
      
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/structure/shared/${token}${userId ? `?userId=${userId}` : ''}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...(isLoggedIn && {
              'Authorization': `Bearer ${Cookies.get('atlas_token')}`,
            }),
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to access shared structure');
      }

      const data = await response.json();
      setStructure(data.structure);
      setAccessType(data.accessType);
      
      if (data.structure) {
        sessionStorage.setItem('shared_structure_access', JSON.stringify({
          token,
          permission: data.structure.permission,
          accessType: data.accessType
        }));
        
        const structureUrl = `/app/s/${data.structure.owner?.name || 'shared'}/${data.structure.id}?shared=${token}`;
        navigate(structureUrl);
      }
      
    } catch (error) {
      const errorMessage = error?.message || 'Failed to access shared structure';
      setError(errorMessage);
      
      if (errorMessage.includes('expired')) {
        cogoToast.error('This share link has expired');
      } else if (errorMessage.includes('Invalid')) {
        cogoToast.error('This share link is invalid');
      } else {
        cogoToast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = () => {
    sessionStorage.setItem('shared_link_token', token);
    navigate(`/?redirect=shared-structure&token=${token}`);
  };

  const handleRegister = () => {
    sessionStorage.setItem('shared_link_token', token);
    navigate(`/register?redirect=shared-structure&token=${token}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading shared structure...</h2>
            <p className="text-gray-600">Please wait while we verify your access.</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiAlertCircle className="w-8 h-8 text-red-600" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-red-600 mb-4">{error}</p>
            
            <div className="space-y-2">
              {!isLoggedIn ? (
                <>
                  <button
                    onClick={handleLogin}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Log In to Access
                  </button>
                  
                  <button
                    onClick={handleRegister}
                    className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 transition-colors"
                  >
                    Create Account
                  </button>
                </>
              ) : (
                <button
                  onClick={() => navigate('/app/dashboard')}
                  className="w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors"
                >
                  Go to Dashboard
                </button>
              )}
              
              <button
                onClick={() => navigate('/')}
                className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 transition-colors"
              >
                Go to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (structure) {
    const config = permissionConfig[structure.permission] || permissionConfig.viewer;
    const Icon = config.icon;

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiGlobe className="w-8 h-8 text-green-600" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Granted</h2>
            
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-gray-900 mb-2">{structure.name}</h3>
              <p className="text-sm text-gray-600 mb-3">{structure.description}</p>
              
              <div className="flex items-center justify-center space-x-2">
                <Icon className={`w-4 h-4 ${config.color}`} />
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.bgColor} ${config.color}`}>
                  {config.label}
                </span>
              </div>
              
              {structure.owner && (
                <p className="text-xs text-gray-500 mt-2">
                  Shared by {structure.owner.name}
                </p>
              )}
            </div>
            
            <p className="text-gray-600 mb-4">
              You have {config.label.toLowerCase()} access to this structure.
            </p>
            
            <p className="text-sm text-gray-500 mb-6">
              Redirecting to structure view...
            </p>
            
            <button
              onClick={() => navigate(`/app/s/${structure.owner?.name || 'shared'}/${structure.id}?shared=${token}`)}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
            >
              View Structure
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiGlobe className="w-8 h-8 text-blue-600" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Shared Structure</h2>
          <p className="text-gray-600 mb-6">
            Loading shared structure access...
          </p>
        </div>
      </div>
    </div>
  );
};

export default SharedStructureAccess;

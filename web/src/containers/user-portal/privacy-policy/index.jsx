import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { fetchPrivacyPolicy } from '../../../redux/slices/privacy-policy';
import LoadingSpinner from '../../../components/loader/LoadingSpinner';

const PrivacyPolicy = () => {
  const dispatch = useDispatch();
  const [lastUpdatedDate, setLastUpdatedDate] = useState('24 April 2025');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const resultAction = await dispatch(fetchPrivacyPolicy());
      if (fetchPrivacyPolicy.fulfilled.match(resultAction)) {
        setContent(resultAction?.payload?.policy?.content || '');
        setLastUpdatedDate(resultAction.payload.policy.updatedAt || 'N/A');
      }
      setLoading(false);
    };

    fetchData();
  }, [dispatch]);

  const formattedDate = new Date(lastUpdatedDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="relative min-h-screen bg-white shadow rounded-[18px] p-8 m-2">
      {loading ? (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/70 backdrop-blur-sm p-2 rounded-[18px]">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-custom-main border-t-transparent"></div>
          <p className="mt-3 text-gray-600 text-sm">Loading Privacy Policy...</p>
        </div>
      ) : (
        <>
          <h1 className="text-2xl font-bold mb-4">Privacy Policy</h1>
          <div className="text-sm text-gray-500 mb-4">
            Last updated: <strong>{formattedDate}</strong>
          </div>
          <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: content }} />
        </>
      )}
    </div>
  );
};

export default PrivacyPolicy;

import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { fetchPrivacyPolicy } from '../../../redux/slices/privacy-policy';
import LoadingSpinner from '../../../components/loader/LoadingSpinner';

const PrivacyPolicy = () => {
  const dispatch = useDispatch();
  const [lastUpdatedDate, setLastUpdatedDate] = useState('N/A');
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
    <div className=" bg-white shadow rounded-[18px] p-8 m-2">
      {loading ? (
        <LoadingSpinner mode="overlay" minHeight="h-screen" message="Loading Privacy Policy" />
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

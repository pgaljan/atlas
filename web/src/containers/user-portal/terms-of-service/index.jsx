import { useEffect, useState } from 'react';
import { fetchTermsOfService } from '../../../redux/slices/terms-of-service';
import { useDispatch, useSelector } from 'react-redux';
import LoadingSpinner from '../../../components/loader/LoadingSpinner';

const TermsOfService = () => {
  const dispatch = useDispatch();
  const appName = useSelector((state) => state.appSettings.appSettings?.appName || 'Atlas');

  const [content, setContent] = useState('');
  const [lastUpdatedDate, setLastUpdatedDate] = useState('24 April 2025');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const resultAction = await dispatch(fetchTermsOfService());
      if (fetchTermsOfService.fulfilled.match(resultAction)) {
        const rawContent = resultAction?.payload?.terms?.content || '';
        const updatedContent = rawContent.replaceAll('{{appName}}', appName);
        setContent(updatedContent);
        setLastUpdatedDate(resultAction.payload.terms.updatedAt || 'N/A');
      }
      setIsLoading(false);
    };

    fetchData();
  }, [dispatch, appName]);

  const formattedDate = new Date(lastUpdatedDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="relative flex flex-col h-screen bg-white shadow rounded-[18px] p-8">
      {isLoading ? (
        <LoadingSpinner mode="overlay" minHeight="h-full" message="Loading Terms of Service..." />
      ) : (
        <>
          <h1 className="text-2xl font-bold mb-4">{appName} Terms of Service</h1>
          <div className="text-sm text-gray-500 mb-4">
            <span className="block">
              Last updated: <strong>{formattedDate}</strong>
            </span>
          </div>
          <div
            className="prose max-w-none flex-1 overflow-auto"
            style={{ minHeight: '200px' }}
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </>
      )}
    </div>
  );
};

export default TermsOfService;

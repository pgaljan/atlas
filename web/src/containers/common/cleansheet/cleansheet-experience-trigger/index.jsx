import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ActionBar from './experience-action-buttons';
import ExperienceList from './experience-list';
import CareerSummary from './cleansheet-career-summary';
import { fetchCleansheetProfile } from '../../../../redux/slices/cleansheet';
import Cookies from 'js-cookie';
import LoadingSpinner from '../../../../components/loader/LoadingSpinner';

const ExperienceTrigger = ({ userId: userIdProp } = {}) => {
  const dispatch = useDispatch();
  const [forceOpenAdd, setForceOpenAdd] = useState(false);

  const profile = useSelector((s) => s.cleansheet.profile);
  const status = useSelector((s) => s.cleansheet.status);
  const error = useSelector((s) => s.cleansheet.error);

  const prevStatusRef = useRef();
  useEffect(() => {
    prevStatusRef.current = status;
  }, [status]);
  const prevStatus = prevStatusRef.current;

  const cookieUserId = Cookies.get('atlas_userId');
  const userId = userIdProp || cookieUserId;

  useEffect(() => {
    if (!userId) {
      console.warn('No userId available to fetch profile');
      return;
    }
    dispatch(fetchCleansheetProfile(userId));
  }, [dispatch, userId]);

  const showFullScreenLoader = status === 'loading' && !profile;

  return (
    <div className="space-y-6 relative">
      {showFullScreenLoader && (
        <LoadingSpinner
          mode="fullscreen"
          message="Loading cleansheet profile..."
          wrapperClassName=""
          minHeight=""
          messageClass="text-gray-700 text-sm"
        />
      )}

      <div className="w-full">
        <div className="w-full">
          <div className="bg-gradient-to-br from-[#e3f2fd] to-[#bbdefb] p-6 rounded-lg border-l-4 border-blue-500">
            <h2 className="text-lg font-semibold mb-2 text-gray-800">
              How to Use Experience Tagger
            </h2>
            <p className="text-sm text-gray-700 leading-relaxed">
              Document your career journey by adding each role you've held. For each experience, tag
              the technologies you used (Core vs Peripheral), key skills developed, competencies
              gained, project types delivered, stakeholders engaged, and major achievements. The
              reporting panel automatically calculates total years of experience for each category.
              Import/export JSON to save your data.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <ActionBar onAddExperience={() => setForceOpenAdd((s) => !s)} userId={userId} />

          <div className=" rounded shadow relative">
            <ExperienceList forceOpenAdd={forceOpenAdd} userId={userId} />
          </div>
        </div>

        <div>
          <CareerSummary />
        </div>
      </div>
    </div>
  );
};

export default ExperienceTrigger;

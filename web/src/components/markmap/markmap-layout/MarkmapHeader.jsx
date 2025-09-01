import cogoToast from '@successtar/cogo-toast';
import Cookies from 'js-cookie';
import { useCallback, useEffect, useRef, useState } from 'react';
import { BiSearch, BiUser } from 'react-icons/bi';
import { PiShareNetworkBold } from 'react-icons/pi';
import { RiDownloadCloud2Line } from 'react-icons/ri';
import RoleBadge from '@/components/common/RoleBadge';

import {
  TbFileTypeZip,
  TbLayoutSidebarLeftCollapse,
  TbLayoutSidebarLeftExpand,
  TbTemplate,
  TbWorldUpload,
} from 'react-icons/tb';
import { VscGitPullRequestCreate } from 'react-icons/vsc';
import { useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import Icons from '../../../constants/icons';
import useFeatureFlag from '../../../hooks/useFeatureFlag';
import { fetchAppSettings } from '../../../redux/slices/app-settings';
import { createBackup } from '../../../redux/slices/backups';
import { getStructure, updateStructure, updateWbsStart } from '../../../redux/slices/structures';
import { assignWbsNumbers } from '../../../utils/markmapHelpers';
import ExportModalStructure from '../../modals/ExportModalStructure';
import ImportModal from '../../modals/ImportModal';
import ShareModal from '../../modals/ShareModal';
import WbsModeModal from '../../modals/WbsModeModal';
import Tooltip from '../../tooltip/Tooltip';
import { createStructureTemplate } from '../../../redux/slices/structure-templates';
import { restoreBackup } from '../../../redux/slices/restore-backups';
import { getRoleAccessMap, getRoleAndAccess } from '../../../utils/permissionFunctions';

const MarkmapHeader = ({
  showWbs,
  setShowWbs,
  onSearch,
  structureId,
  onSuccess,
  onExportModal,
  treeData,
  wbsStart,
  setWbsStart,
  renderType,
  permission,
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const wbsStartDebounceTimer = useRef(null);
  const [title, setTitle] = useState('');
  const [isWbsModalOpen, setIsWbsModalOpen] = useState(false);
  const [wbsMode, setWbsMode] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaveDisabled, setIsSaveDisabled] = useState(true);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [isExportModal, setIsExportModal] = useState(false);
  const [isHeaderVisible, setIsHeaderVisible] = useState(false);
  const [appName, setAppName] = useState('ATLAS');
  const { role } = getRoleAndAccess(permission);
  const access = getRoleAccessMap(role);
  const canRestoreBackup = useFeatureFlag('Structure Backup/Restore');
  const canDynamicWbs = useFeatureFlag('Dynamic WBS');
  const treeDataWithWbs = assignWbsNumbers(treeData, null, null, 1);

  const handleFeatureClick = (canAccess, action) => {
    if (canAccess) {
      action();
    } else {
      navigate(`?plan=upgrade-to-premium`);
    }
  };
  useEffect(() => {
    if (structureId) {
      dispatch(getStructure(structureId))
        .unwrap()
        .then((data) => {
          setTitle(data?.title || '');
        })
        .catch((error) => {
          cogoToast.error(`Failed to load structure: ${error}`);
        });
    }
  }, [dispatch, structureId]);

  const debounceUpdateTitle = useCallback(
    (() => {
      let timer;
      return (newTitle) => {
        clearTimeout(timer);
        timer = setTimeout(() => {
          dispatch(
            updateStructure({
              id: structureId,
              updateData: { title: newTitle },
            }),
          ).unwrap();
        }, 1000);
      };
    })(),
    [dispatch, structureId],
  );

  const handleTitleChange = (e) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    debounceUpdateTitle(newTitle);
  };

  const saveTitle = async (newTitle) => {
    try {
      await dispatch(
        updateStructure({
          id: structureId,
          updateData: { title: newTitle },
        }),
      ).unwrap();
      cogoToast.success('Structure title updated successfully!');
      setIsSaveDisabled(true);
    } catch (error) {
      cogoToast.error(`Failed to update structure title: ${error}`);
    }
  };

  const handleTitleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      saveTitle(title);
    }
  };

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (!isSaveDisabled) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isSaveDisabled]);

  const handleSearchChange = (e) => {
    let value = e?.target?.value?.replace(/^[\s]+/, '')?.replace(/[^a-zA-Z0-9 ]/g, '');
    if (value === '0') {
      cogoToast?.error('Level 0 is not searchable.');
      return;
    }
    setSearchValue(value);
    if (!value) {
      onSearch(null, '');
    }
  };

  const handleKeyPress = (e) => {
    if (e?.key === 'Enter') {
      const level = /^\d+$/.test(searchValue?.trim()) ? +searchValue?.trim() : null;
      onSearch(level, level !== null ? '' : searchValue);
    }
  };

  const handleCreateBackup = async () => {
    setIsLoading(true);
    const userId = Cookies.get('atlas_userId');

    if (!userId) {
      cogoToast.error('User ID not found in cookies.');
      setIsLoading(false);
      return;
    }

    try {
      // Create the backup
      const response = await dispatch(createBackup({ userId, structureId })).unwrap();

      setIsLoading(false);
      cogoToast.success('Backup created successfully!');

      const fileUrl = response?.fileUrl;
      if (fileUrl) {
        window.open(fileUrl, '_blank');
      }
    } catch (error) {
      setIsLoading(false);

      if (error?.statusCode === 401) {
        navigate('?plan=upgrade-to-premium');
      } else {
        cogoToast.error(`Failed to create backup: ${error}`);
      }
    }
  };

  const handleFileSelection = (file) => {
    if (!file) {
      cogoToast.error('Please select a valid structure!');
      return;
    }

    setIsImportModalOpen(false);
    handleFileUpload(file);
  };

  const handleFileUpload = async (file) => {
    try {
      setIsLoading(true);
      const response = await dispatch(restoreBackup({ fileData: file, structureId })).unwrap();
      cogoToast.success('Backup restored successfully!');
      onSuccess();
    } catch (err) {
      cogoToast.error('Failed to restore backups.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const resultAction = await dispatch(fetchAppSettings());
        if (fetchAppSettings.fulfilled.match(resultAction)) {
          const settings = resultAction.payload;
          if (settings) {
            setAppName(settings.appName || 'ATLAS');
          }
        }
      } catch (error) {
        // console.error("Error loading app settings")
      }
    };

    loadSettings();
  }, [dispatch]);

  useEffect(() => {
    if (structureId) {
      const savedState = localStorage.getItem(`markMap_header_${structureId}`);
      setIsHeaderVisible(savedState === 'true');
    }
  }, [structureId]);

  const toggleSidebar = () => {
    const newState = !isHeaderVisible;
    setIsHeaderVisible(newState);
    if (structureId) {
      localStorage.setItem(`markMap_header_${structureId}`, newState.toString());
    }
  };

  const toggleShareModal = () => setIsShareModalOpen(!isShareModalOpen);
  const toggleImportModal = () => setIsImportModalOpen(!isImportModalOpen);

  useEffect(() => {
    const mode = localStorage.getItem(`wbs_mode_${structureId}`);
    if (mode) setWbsMode(mode);
  }, [structureId]);

  const handleWbsToggle = async (checked) => {
    if (checked) {
      handleWbsModeSelect('manual');
    } else {
      try {
        await dispatch(
          updateStructure({
            id: structureId,
            updateData: { showWbs: false },
          }),
        );
        setShowWbs(false);
      } catch (err) {
        cogoToast.error('Failed to disable WBS view.');
      }
    }
  };

  const handleWbsModeSelect = async (mode) => {
    setWbsMode(mode);
    localStorage.setItem(`wbs_mode_${structureId}`, mode);

    try {
      await dispatch(
        updateStructure({
          id: structureId,
          updateData: { showWbs: true },
        }),
      );
      setShowWbs(true);

      if (mode === 'manual') {
        const data = await dispatch(getStructure(structureId)).unwrap();
        const currentWbsStart = data?.wbsStart;

        const startValue = typeof currentWbsStart === 'number' ? currentWbsStart : 1;
        setWbsStart(startValue);

        if (currentWbsStart === null || currentWbsStart === undefined) {
          await dispatch(updateWbsStart({ id: structureId, wbsStart: 1 }));
        }

        onSuccess?.();
        cogoToast.success(`Manual WBS mode enabled (starting at ${startValue}).`);
      }
    } catch (err) {
      cogoToast.error('Failed to enable WBS.');
    }
  };

  const handleWbsStartChange = (e) => {
    const newValue = parseInt(e.target.value || '1', 10);
    setWbsStart(newValue);

    // Clear the existing timeout
    if (wbsStartDebounceTimer.current) {
      clearTimeout(wbsStartDebounceTimer.current);
    }

    // Debounce the dispatch
    wbsStartDebounceTimer.current = setTimeout(async () => {
      try {
        await dispatch(updateWbsStart({ id: structureId, wbsStart: newValue }));
        onSuccess();
        cogoToast.success('WBS Start value updated!');
      } catch (error) {
        cogoToast.error('Failed to update WBS Start.');
      }
    }, 800);
  };

  useEffect(() => {
    return () => {
      if (wbsStartDebounceTimer.current) {
        clearTimeout(wbsStartDebounceTimer.current);
      }
    };
  }, []);

  const handleSaveAsTemplate = async () => {
    const userId = Cookies.get('atlas_userId');
    const workspaceId = Cookies.get('workspaceId');

    if (!structureId || !treeData || !workspaceId) {
      return cogoToast.error('Missing structure or workspace information.');
    }

    try {
      const payload = {
        structureId,
        userId,
        ownerId: userId,
        workspaceId,
        name: title,
      };

      await dispatch(createStructureTemplate(payload)).unwrap();
      cogoToast.success('Structure saved as a template!');
    } catch (err) {
      cogoToast.error(`Failed to save template: ${err?.message || err}`);
    }
  };

  return (
    <>
      <div
        className="absolute top-10 left-2    bg-slate-200 rounded-lg cursor-pointer"
        onClick={toggleSidebar}
      >
        <Tooltip label="Toolbar">
          <button className="flex items-center justify-center w-10 h-10">
            {isHeaderVisible ? (
              <TbLayoutSidebarLeftCollapse size={32} className="text-custom-main" />
            ) : (
              <TbLayoutSidebarLeftExpand size={32} className="text-custom-main" />
            )}
          </button>
        </Tooltip>
      </div>
      {isHeaderVisible && (
        <div className="absolute top-4 left-14 right-0 flex items-center pr-3  py-2 z-50">
          <div className="flex items-center w-full justify-between">
            <div className="header-container flex items-center space-x-3 p-3 rounded-lg bg-slate-200">
              <Link to="/app/dashboard">
                <h1 className="text-2xl font-bold text-custom-main uppercase">{appName}</h1>
              </Link>
              <input
                type="text"
                value={title}
                onChange={access.canEdit ? handleTitleChange : undefined}
                onKeyDown={access.canEdit ? handleTitleKeyDown : undefined}
                readOnly={!access.canEdit}
                className={`structure-title text-md font-medium w-auto max-w-20 pl-1 rounded-md py-1 text-custom-main truncate bg-slate-200 border-1 border-transparent ${
                  access.canEdit
                    ? 'focus:border-custom-main outline-none focus:ring-2 focus:ring-custom-main'
                    : 'cursor-not-allowed'
                } transition-all`}
              />
              {permission && role !== 'owner' && <RoleBadge role={role} />}

              <Tooltip label="Import Backups">
                <button
                  className={`p-2 hover:bg-gray-100 rounded-full ${
                    !access.canManage && 'opacity-50 cursor-not-allowed'
                  }`}
                  aria-label="Import Backups"
                  onClick={() =>
                    access.canManage && handleFeatureClick(canRestoreBackup, toggleImportModal)
                  }
                  disabled={!access.canManage}
                >
                  <VscGitPullRequestCreate
                    size={24}
                    className={access.canManage ? 'text-custom-main' : 'text-gray-400'}
                  />
                </button>
              </Tooltip>

              <Tooltip label="Create Backup">
                {isLoading ? (
                  <button
                    disabled={true}
                    className={`p-2 hover:bg-gray-100 rounded-full ${
                      !access.canManage && 'opacity-50 cursor-not-allowed'
                    }`}
                    aria-label="Create Backup"
                  >
                    <Icons.LoadingIcon />
                  </button>
                ) : (
                  <button
                    disabled={isLoading || !access.canManage}
                    onClick={() =>
                      access.canManage && handleFeatureClick(canRestoreBackup, handleCreateBackup)
                    }
                    className={`p-2 hover:bg-gray-100 rounded-full ${
                      !access.canManage && 'opacity-50 cursor-not-allowed'
                    }`}
                    aria-label="Create Backup"
                  >
                    <RiDownloadCloud2Line
                      size={26}
                      className={access.canManage ? 'text-custom-main' : 'text-gray-400'}
                    />
                  </button>
                )}
              </Tooltip>

              <Tooltip label="Save">
                <button
                  disabled={isSaveDisabled || !access.canEdit}
                  className={`p-3 rounded-full ${
                    isSaveDisabled || !access.canEdit
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'hover:bg-gray-100 text-custom-main cursor-pointer'
                  }`}
                  aria-label="Save"
                >
                  <TbWorldUpload
                    size={24}
                    className={`${
                      isSaveDisabled || !access.canEdit
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-custom-main'
                    }`}
                  />
                </button>
              </Tooltip>

              <div className="relative flex items-center">
                <input
                  type="text"
                  value={searchValue}
                  onChange={handleSearchChange}
                  onKeyDown={handleKeyPress}
                  placeholder="Search: By level or text"
                  className="bg-white border border-gray-300 focus:border-custom-main focus:border-2 focus:outline-none rounded-l-md p-2 w-64 sm:w-60 shadow-lg pl-10 "
                />

                <BiSearch size={24} className="absolute left-2 text-gray-500" />
              </div>
            </div>

            <div className="flex items-center space-x-3 shadow-lg p-2 bg-slate-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <span
                  className={`text-sm font-medium ${
                    showWbs ? 'text-custom-main' : 'text-gray-700'
                  }`}
                >
                  Show WBS
                </span>

                <label
                  className={`relative inline-flex items-center ${
                    access.canEdit ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                  }`}
                  htmlFor="show-wbs-toggle"
                >
                  <input
                    id="show-wbs-toggle"
                    type="checkbox"
                    checked={showWbs}
                    onChange={(e) =>
                      access.canEdit &&
                      handleFeatureClick(canDynamicWbs, () => handleWbsToggle(e.target.checked))
                    }
                    disabled={!access.canEdit}
                    className="sr-only peer"
                  />
                  <div
                    className={`w-12 h-6 rounded-full transition-all ${
                      showWbs ? 'bg-custom-main border-none' : 'bg-white border border-gray-300'
                    }`}
                  ></div>
                  <div
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white border border-gray-600 rounded-full peer-checked:translate-x-6 peer-checked:border-custom-main transition-transform
      ${showWbs ? '' : '!bg-custom-main'}
    `}
                  ></div>
                </label>

                {showWbs && wbsMode === 'manual' && (
                  <>
                    <label htmlFor="#" className="text-custom-main">
                      WBS Start #
                    </label>
                    <input
                      type="number"
                      value={wbsStart}
                      onChange={handleWbsStartChange}
                      placeholder="#"
                      className="w-full max-w-[60px] border border-gray-300 rounded pl-3 py-1 focus:ring-2 focus:ring-custom-main outline-none"
                    />
                  </>
                )}
              </div>

              <Tooltip label="Save as Template">
                <button
                  className={`p-2 rounded-full bg-white shadow transition ${
                    access.canManage
                      ? 'text-gray-600 hover:text-custom-main'
                      : 'text-gray-400 opacity-50 cursor-not-allowed'
                  }`}
                  onClick={() => access.canManage && handleSaveAsTemplate()}
                  disabled={!access.canManage}
                >
                  <TbTemplate size={20} />
                </button>
              </Tooltip>

              <Tooltip label="Export">
                <button
                  className={`p-2 rounded-full border border-gray-300 bg-white shadow-sm transition ${
                    access.canExport
                      ? 'text-gray-600 hover:bg-gray-100 hover:text-custom-main'
                      : 'text-gray-400 opacity-50 cursor-not-allowed'
                  }`}
                  onClick={() => access.canExport && setIsExportModal(true)}
                  disabled={!access.canExport}
                >
                  <TbFileTypeZip size={20} />
                </button>
              </Tooltip>

              <Tooltip label="Share Structure">
                <button
                  className={`p-2 rounded-full bg-white shadow transition ${
                    access.canManage
                      ? 'text-gray-600 hover:bg-gray-100 hover:text-custom-main'
                      : 'text-gray-400 opacity-50 cursor-not-allowed'
                  }`}
                  onClick={() => access.canManage && toggleShareModal()}
                  disabled={!access.canManage}
                >
                  <PiShareNetworkBold size={20} />
                </button>
              </Tooltip>

              <Tooltip label="Profile">
                <Link to={'/app/user-settings'}>
                  <button
                    className="p-2 rounded-full bg-white text-gray-600 shadow hover:bg-gray-100 hover:text-custom-main transition"
                    aria-label="Profile"
                  >
                    <BiUser size={22} />
                  </button>
                </Link>
              </Tooltip>
            </div>
          </div>
        </div>
      )}
      <ShareModal isOpen={isShareModalOpen} onClose={toggleShareModal} structureId={structureId} />
      <ImportModal
        isOpen={isImportModalOpen}
        onClose={toggleImportModal}
        title={'Import Backups'}
        onSuccess={onSuccess}
        isLoading={isLoading}
        handleFileSelection={handleFileSelection}
        buttonText={'Restore'}
        format={'.zip'}
      />

      {isExportModal && (
        <ExportModalStructure
          isOpen={isExportModal}
          treeData={treeData}
          renderType={renderType}
          showWbs={showWbs}
          treeDataWithWbs={treeDataWithWbs}
          onClose={() => setIsExportModal(false)}
          onExport={(opts) => {
            setIsExportModal(false);
            onExportModal(opts);
          }}
        />
      )}
      {isWbsModalOpen && (
        <WbsModeModal
          isOpen={isWbsModalOpen}
          onClose={() => setIsWbsModalOpen(false)}
          onSelect={handleWbsModeSelect}
        />
      )}
    </>
  );
};

export default MarkmapHeader;

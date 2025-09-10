import cogoToast from '@successtar/cogo-toast';
import React, { useCallback, useMemo, useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FaMinus, FaPlus } from 'react-icons/fa';
import { FiSearch } from 'react-icons/fi';
import Tooltip from '../../components/tooltip/Tooltip';
import ModalComponent from '../modals/Modal';

const GenericTable = ({
  title,
  tabs = [],
  enableSearch = false,
  enableDate = false,
  columns = [],
  data = [],
  emptyState = {},
  actions = null,
  onSearchChange,
  searchQuery = '',
  selectedDate,
  onDateChange,
  handleFilterByDate,
  filterByDate = 'false',
  showId,
  onSearch,
  showTitle = false,
}) => {
  const [activeTab, setActiveTab] = useState(tabs?.[0]?.key || null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);

  const handleZoomIn = useCallback(() => setZoomLevel((prev) => Math.min(prev + 0.1, 3)), []);
  const handleZoomOut = useCallback(() => setZoomLevel((prev) => Math.max(prev - 0.1, 1)), []);

  const getStatusText = (row) => {
    if (row.status === 'accepted') return 'Accepted';
    const isExpired = new Date(row.expire) < new Date();
    return isExpired ? 'Expired' : 'Pending';
  };

  const handleActionClick = useCallback((action, row) => {
    if (!action.disabled?.(row)) {
      action.onClick(row);
    } else {
      cogoToast.warn('Accepted invitations cannot be deleted.');
    }
  }, []);

  const filteredData = useMemo(() => {
    if (activeTab === 'pending') {
      return data.filter((item) => item.status === 'pending');
    }
    return data;
  }, [activeTab, data]);

  const renderEmptyState = () => (
    <div className="flex flex-col text-center mt-[25%]">
      <div className="flex flex-col items-center justify-center flex-grow">
        <div className="flex items-center justify-center bg-white rounded-full w-28 h-28 mb-4">
          {emptyState.icon}
        </div>
        <h2 className="text-2xl font-bold text-custom-text-grey mb-4">{emptyState.title}</h2>
        <p className="text-lg text-custom-text-grey">{emptyState.description}</p>
      </div>
    </div>
  );

  const renderNoResultsRow = (message) => (
    <tr>
      <td
        colSpan={columns.length + (showId ? 1 : 0) + (actions ? 1 : 0)}
        className="text-center py-10 text-custom-text-grey"
      >
        <div className="flex flex-col items-center justify-center">
          <p className="text-lg text-custom-text-grey">{message}</p>
        </div>
      </td>
    </tr>
  );

  return (
    <>
      {/* Image Modal */}
      <ModalComponent
        isOpen={!!selectedImage}
        onClose={() => setSelectedImage(null)}
        title="Image Preview"
      >
        {selectedImage && (
          <div className="relative">
            <img
              src={selectedImage}
              alt="Preview"
              className="w-full h-auto rounded-lg"
              style={{
                transform: `scale(${zoomLevel})`,
                transition: 'transform 0.3s ease',
              }}
            />
            <div className="fixed bottom-3 right-4 p-2 flex items-center gap-2 rounded-[4px] shadow-md bg-white">
              <button
                onClick={handleZoomIn}
                className="text-[20px] text-black font-bold hover:text-custom-main"
                aria-label="Zoom In"
              >
                <FaPlus />
              </button>
              <button
                onClick={handleZoomOut}
                className="text-[20px] text-black font-bold hover:text-custom-main"
                aria-label="Zoom Out"
              >
                <FaMinus />
              </button>
            </div>
          </div>
        )}
      </ModalComponent>

      {filteredData?.length === 0 && !searchQuery && !selectedDate && activeTab !== 'pending' ? (
        renderEmptyState()
      ) : (
        <div className="flex flex-col p-8 rounded-[18px] bg-custom-background-white flex-1 min-h-0 shadow-md overflow-hidden">
          {title && <h1 className="text-[24px] font-bold text-black">{title}</h1>}

          {/* Tabs */}
          {tabs.length > 0 && (
            <div className="flex items-center mb-3">
              {tabs.map((tab) => (
                <button
                  key={tab?.key}
                  className={`pr-4 py-2 font-semibold transition-colors ${
                    activeTab === tab?.key ? 'text-custom-text-heading' : 'text-custom-text-grey'
                  }`}
                  onClick={() => setActiveTab(tab?.key)}
                >
                  {tab?.label}
                  <hr
                    className={`mt-1 transition-all ${
                      activeTab === tab?.key ? 'border-custom-main' : 'border-transparent'
                    } border-2`}
                  />
                </button>
              ))}
            </div>
          )}

          {/* Search & Date Filters */}
          {(enableSearch || enableDate) && (
            <div className="flex flex-wrap items-center justify-between gap-6 my-4">
              {/* Search */}
              {enableSearch && (
                <div className="flex items-center gap-3">
                  {showTitle && (
                    <span className="font-bold whitespace-nowrap">Search by Title</span>
                  )}
                  <div className="relative w-full max-w-md">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-xl text-custom-text-grey" />
                    <input
                      type="text"
                      placeholder="Search..."
                      className="w-full pl-10 pr-4 py-2 border-2 rounded-lg focus:border-custom-main focus:outline-none"
                      value={searchQuery}
                      onKeyDown={(e) => e.key === 'Enter' && onSearch?.(searchQuery)}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\s+/g, ' ').trim();
                        onSearchChange?.(value);
                        if (value === '') onSearch?.('');
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Date */}
              {enableDate && filterByDate && (
                <div className="flex items-center gap-3">
                  <span className="font-bold whitespace-nowrap">Search by Date</span>
                  <DatePicker
                    selected={selectedDate}
                    onChange={(date) => {
                      if (date) {
                        const utcDate = new Date(
                          Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
                        );
                        onDateChange?.(utcDate);
                        handleFilterByDate?.(utcDate);
                      }
                    }}
                    dateFormat="yyyy-MM-dd"
                    placeholderText="Filter By Date"
                    className="pl-2 py-2 border-2 rounded-lg focus:border-custom-main focus:outline-none w-48"
                  />
                </div>
              )}
            </div>
          )}

          {/* Table */}
          <div className="flex-1 overflow-auto">
            <div className="w-full overflow-x-auto max-h-[calc(100vh-300px)]">
              <table className="min-w-[800px] w-full text-left border-collapse">
                <thead className="bg-gray-50 sticky top-0 z-10">
                  <tr className="text-custom-text-heading border-b border-gray-300 h-16">
                    {showId && <th className="px-4 py-2">#Id</th>}
                    {columns.map((col) => (
                      <th key={col?.key} className="px-4 py-2 whitespace-nowrap">
                        <div className="flex items-center">
                          {col?.label}
                          {Array.isArray(col?.icon)
                            ? col.icon.map((icon, index) => (
                                <span key={index} className="ml-2">
                                  {icon}
                                </span>
                              ))
                            : React.isValidElement(col?.icon) && (
                                <span className="ml-2">{col.icon}</span>
                              )}
                        </div>
                      </th>
                    ))}
                    {actions && <th className="px-4 py-2">Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {filteredData?.length === 0
                    ? searchQuery
                      ? renderNoResultsRow('No results found matching your search query.')
                      : selectedDate
                        ? renderNoResultsRow('No results found for the selected date.')
                        : activeTab === 'pending' &&
                          renderNoResultsRow('There are currently no pending invitations.')
                    : filteredData.map((row, rowIndex) => (
                        <tr
                          key={row?.id || rowIndex}
                          className={`border-b border-gray-300 ${
                            rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-100'
                          }`}
                        >
                          {showId && <td className="px-4 py-2">{row?.id?.substring(0, 8)}...</td>}
                          {columns.map((col) => (
                            <td key={col?.key} className="px-4 py-2 whitespace-nowrap">
                              <div className="flex items-center">
                                {col?.render
                                  ? col.render(row)
                                  : ['updatedAt', 'createdAt'].includes(col?.key)
                                    ? row[col?.key]
                                      ? new Date(row[col?.key]).toLocaleString('en-US', {
                                          month: '2-digit',
                                          day: '2-digit',
                                          year: 'numeric',
                                          hour: '2-digit',
                                          minute: '2-digit',
                                          hour12: true,
                                        })
                                      : 'N/A'
                                    : col?.key === 'status'
                                      ? getStatusText(row)
                                      : row[col?.key]}
                              </div>
                            </td>
                          ))}

                          {actions && (
                            <td className="px-4 py-2 items-center flex space-x-4">
                              {actions.map((action, idx) => (
                                <Tooltip key={idx} label={action.tooltip || 'Action'}>
                                  <button
                                    className={`items-center flex justify-center ${
                                      action.disabled?.(row)
                                        ? 'opacity-50 cursor-not-allowed'
                                        : 'hover:text-custom-dark'
                                    }`}
                                    onClick={() => handleActionClick(action, row)}
                                    disabled={action.disabled?.(row)}
                                    aria-label={action.tooltip}
                                  >
                                    {action.icon}
                                  </button>
                                </Tooltip>
                              ))}
                            </td>
                          )}
                        </tr>
                      ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default GenericTable;

import React, { useState } from 'react';
import CleanSheetHeader from './CleanSheetHeader';
import CleanSheetSidebar from './CleanSheetSidebar';
import RightPanel from './RightPanel';
import CleanSheetCanvas from './CleanSheetCanvas';
import { MarkmapProvider } from '../../markmap/markmap-context/MarkmapContext';
import CleanSheetMarkmap from './CleanSheetMarkmap';

export default function CleanSheetLayout({
  user = {
    name: 'Learner',
    initials: 'LM',
    avatarColor: 'bg-emerald-400',
    statusDotColor: 'bg-emerald-400',
  },
  leaders = [
    { id: 'j', name: 'Jenny M.', initials: 'J', selected: true },
    { id: 's', name: 'Coach Sarah', initials: 'CS', selected: false },
  ],
  onSelectLeader = () => {},
  calendarItems = [
    { id: 1, text: 'Coach Session - Oct 8', color: 'bg-emerald-500' },
    { id: 2, text: 'Project Due - Oct 14', color: 'bg-pink-400' },
  ],
}) {
  const [viewMode, setViewMode] = useState('learner');
  const [activeLeader, setActiveLeader] = useState(
    leaders.find((l) => l.selected)?.id || leaders[0].id,
  );

  const [treeData, setTreeData] = useState(null);

  const handleSelectLeader = (id) => {
    setActiveLeader(id);
    onSelectLeader(id);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <CleanSheetSidebar
          brand="CLEANSHEET"
          navItems={[{ key: 'canvas', label: 'Canvas', icon: '📦' }]}
          viewMode={viewMode}
          onChangeViewMode={setViewMode}
          activeNavKey="canvas"
        />

        <div className="flex-1 flex flex-col">
          <CleanSheetHeader user={user} />

          <div className="flex gap-6 p-6">
            <CleanSheetCanvas>
              <MarkmapProvider>
                <CleanSheetMarkmap
                  treeData={treeData}
                  setTreeData={setTreeData}
                  structureId="myStructure123"
                  initialCollapse={true}
                />
              </MarkmapProvider>
            </CleanSheetCanvas>

            <aside className="w-96 flex-shrink-0">
              <RightPanel
                user={user}
                leaders={leaders}
                activeLeader={activeLeader}
                onSelectLeader={handleSelectLeader}
                calendarItems={calendarItems}
              />
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}

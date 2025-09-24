import React from 'react';
import { Outlet } from 'react-router-dom';
import LearnerPlatformSidebar from './LearnerPlatfromSidebar';
import LearnerHeader from './LearnerPlatformHeader';

export default function LearnerPlatformLayout() {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <aside className="w-64 h-screen fixed top-0 left-0 border-r border-gray-200 bg-white z-30">
        <LearnerPlatformSidebar />
      </aside>

      <div className="flex flex-col flex-1 ml-64">
        <div className="fixed top-0 left-64 right-0 z-20 bg-gray-100 shadow-sm">
          <LearnerHeader />
        </div>

        <main className="flex-1 overflow-auto p-6 mt-[72px]">
          <div className="w-full bg-white rounded-2xl shadow-md overflow-hidden min-h-[80vh]">
            <div className="p-6">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

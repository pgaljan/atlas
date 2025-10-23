import React from 'react';
import { Outlet } from 'react-router-dom';
import HeaderCleanSheet from './HeaderCleanSheet';
import FooterCleanSheet from './FooterCleanSheet';

const CleanSheetLayout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <HeaderCleanSheet />
      <main className="flex-1 bg-gray-100 p-6">
        <Outlet />
      </main>

      <FooterCleanSheet />
    </div>
  );
};

export default CleanSheetLayout;

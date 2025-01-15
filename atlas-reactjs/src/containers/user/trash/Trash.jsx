import React from "react";
import { FaRegTrashCan } from "react-icons/fa6";
import Layout from "../../../components/layout";
import { trashConfig } from "../../../constants/index";
import GenericTable from "../../../components/generic-table/GenericTable";

const TrashPage = ({ onSubmit, trashData = [] }) => {
  let hasTrash = trashData?.length > 0;
  hasTrash = 1;
  return (
    <Layout onSubmit={onSubmit}>
      {hasTrash ? (
        <div className="p-2">
          <GenericTable {...trashConfig} />
        </div>
      ) : (
        <div className="flex flex-col h-full text-center p-6">
          <div className="flex flex-col items-center justify-center flex-grow">
            <div className="flex items-center justify-center bg-white rounded-full w-28 h-28 mb-4">
              <FaRegTrashCan className="text-5xl text-custom-main" />
            </div>
            <p className="text-2xl font-bold text-custom-text-grey mb-4">
              Deleted mindmaps will appear here
            </p>
            <p className="text-lg text-custom-text-grey">
              Changed your mind? Restore your map
            </p>
            <p className="text-lg text-custom-text-grey">
              within 30 days with a paid plan.
            </p>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default TrashPage;

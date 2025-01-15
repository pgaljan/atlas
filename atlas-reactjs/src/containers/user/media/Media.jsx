import React from "react";
import Layout from "../../../components/layout";
import GenericTable from "../../../components/generic-table/GenericTable";
import { mediaConfig } from "../../../constants";
import { MdPermMedia } from "react-icons/md";

const Media = ({ onSubmit, mediaData = [] }) => {
  let hasMedia = mediaData.length > 0;
  hasMedia = 1;
  return (
    <Layout onSubmit={onSubmit}>
      {hasMedia ? (
        <div className="p-2">
          <GenericTable {...mediaConfig} />
        </div>
      ) : (
        <div className="flex flex-col h-full text-center p-6">
          <div className="flex flex-col items-center justify-center flex-grow">
            <div className="flex items-center justify-center bg-white rounded-full w-28 h-28 mb-4">
              <MdPermMedia className="text-5xl text-custom-main" />
            </div>
            <p className="text-2xl font-bold text-custom-text-grey mb-4">
              Deleted media will appear here
            </p>
            <p className="text-lg text-custom-text-grey">
              Changed your media? Restore your media
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

export default Media;

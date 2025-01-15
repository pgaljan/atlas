import React from "react";
import Layout from "../../../components/layout";
import { backupConfig, mediaConfig, teamMembersConfig } from "../../../constants";
import GenericTable from "../../../components/generic-table/GenericTable";

const Backups = ({ onSubmit }) => {
  return  <Layout onSubmit={onSubmit}>
  <div className="p-2">
    <GenericTable {...backupConfig} />
  </div>
</Layout>
};

export default Backups;

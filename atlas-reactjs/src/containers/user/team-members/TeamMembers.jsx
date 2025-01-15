import React from "react";
import GenericTable from "../../../components/generic-table/GenericTable";
import { teamMembersConfig } from "../../../constants/index";
import Layout from "../../../components/layout";

const TeamMembersPage = ({ onSubmit }) => {
  return (
    <Layout onSubmit={onSubmit}>
      <div className="p-2">
        <GenericTable {...teamMembersConfig} />
      </div>
    </Layout>
  );
};

export default TeamMembersPage;

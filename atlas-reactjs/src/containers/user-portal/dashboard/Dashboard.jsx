import React from "react"
import Layout from "../../../components/layout"
import StructureCard from "../../../components/cards/StructureCard"

const Dashboard = ({ onSubmit }) => {
  return (
    <Layout onSubmit={onSubmit}>
      <StructureCard />
    </Layout>
  )
}

export default Dashboard

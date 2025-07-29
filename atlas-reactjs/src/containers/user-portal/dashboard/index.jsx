import StructureCard from "../../../components/cards/StructureCard"
import Layout from "../../../components/layout"

const Dashboard = ({ onSubmit }) => {
  return (
    <Layout onSubmit={onSubmit}>
      <StructureCard />
    </Layout>
  )
}

export default Dashboard

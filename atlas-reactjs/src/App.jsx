import React from "react";
import { Route, Routes, useNavigate } from "react-router-dom";
import NotFound from "./components/404-notfound/NotFound";
import MarkmapCanvas from "./components/markmap/markmap-canvas/MarkmapCanvas";
import Login from "./containers/common/login/Login";
import Register from "./containers/common/register/Register";
import ResetPassword from "./containers/common/reset-password/ResetPassword";
import SubscriptionPlans from "./containers/common/subscription-plans/SubscriptionPlans";
import Backups from "./containers/user/backups/Backups";
import Home from "./containers/user/home/Home";
import Media from "./containers/user/media/Media";
import TeamMembers from "./containers/user/team-members/TeamMembers";
import Trash from "./containers/user/trash/Trash";

const App = () => {
  const navigate = useNavigate();

  const handleSubmitStructure = (name) => {
    navigate(`/s/markmap/4cd2791c9e3b9dd729e854db9046240404180a15`);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Routes>
        <Route path="/" element={<Login />} />
        <Route
          path="/home"
          element={<Home onSubmit={handleSubmitStructure} />}
        />
        <Route path="/register" element={<Register />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/subscription-plans" element={<SubscriptionPlans />} />
        <Route path="/s/:username/:id" element={<MarkmapCanvas />} />
        <Route path="/team-members" element={<TeamMembers />} />
        <Route path="/backups" element={<Backups />} />
        <Route path="/media" element={<Media />} />
        <Route path="/trash" element={<Trash />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
};

export default App;

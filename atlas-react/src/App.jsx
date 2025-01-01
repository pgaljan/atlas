import React, { useState } from "react";
import { Route, Routes, useNavigate } from "react-router-dom";
import Login from "./containers/common/login/Login";
import Register from "./containers/common/register/Register";
import ResetPassword from "./containers/common/reset-password/ResetPassword";
import SubscriptionPlans from "./containers/common/subscription-plans/SubscriptionPlans";
import Home from "./containers/dashboard/home/Home";
import NotFound from "./components/404-notfound/NotFound";
import MarkmapCanvas from "./components/markmap/markmap-canvas/MarkmapCanvas";

const App = () => {
  const navigate = useNavigate();

  const handleSubmitStructure = (name) => {
    navigate(`/${name}`);
  };
  return (
    <div className="min-h-screen bg-gray-100">
      <Routes>
        <Route path="/" element={<Login />} />
        <Route
          path="/home"
          element={<Home onSubmit={handleSubmitStructure} />}
        />
        <Route path="/register" element={<Register />} xp />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/subscription-plans" element={<SubscriptionPlans />} />

        <Route path="/:structureName" element={<MarkmapCanvas />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
};

export default App;

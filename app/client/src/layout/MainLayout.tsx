import React from "react";
import { Outlet } from "react-router-dom";

// Layout wrapper that renders nested route outlets
const MainLayout = () => {
  return (
    <div>
      <Outlet />
    </div>
  );
};

export default MainLayout;

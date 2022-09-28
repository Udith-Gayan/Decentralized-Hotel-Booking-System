import React from "react";
import Footer from "../Footer/Footer";
//import Spinner from "../Spinner/Spinner";
import Navbar from "../Navbar/Navbar";
import { Outlet } from "react-router-dom";
import classes from "./Dashboard.module.css";
function DashboardLayout() {
  return (
    <div>
      <Navbar />
      {/* <Suspense fallback={<Spinner />}>
        <h1>kasun</h1>
      </Suspense> */}
      <div className={`${classes.dashboardBottom}`}>
        <Outlet />
      </div>
      <Footer />
    </div>
  );
}

export default DashboardLayout;

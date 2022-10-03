import React from "react";
import classes from "./Navbar.module.css";

const redirectUrl = process.env.REACT_APP_LOGO_RIDERECTION_URL;

function Navbar() {
  return (
    <div className="bg-dark p-4 mt-8">
      <p onClick={() => {window.location.href=redirectUrl}} className={classes.headerText}>| HOTEL BOOKING SYSTEM |</p>
    </div>
  );
}

export default Navbar;

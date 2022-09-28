import React from "react";
import classes from "./Navbar.module.css";
function Navbar() {
  return (
    <div className="bg-dark p-4 mt-8">
      <p onClick={() => {window.location.href="https://smart-hotel-booking.netlify.app/"}} className={classes.headerText}>| HOTEL BOOKING SYSTEM |</p>
    </div>
  );
}

export default Navbar;

import React from "react";
import { Link } from "react-router-dom";
import classes from "./HotelOwnerRegisterLogin.module.css";
import "../Shared/styles/common.css";

const HotelOwnerRegisterLogin = () => {
  return (
    <div className={classes.landingPageBackground}>
      <div className={classes.box}>
        <div>
          <Link
            to="/hotel-owner-register-login"
            className="m-2 p-3 normalButton"
          >
            Register
          </Link>
          <Link
            to="/hotel-owner-register-login"
            className="m-2 p-3 normalButton"
          >
            Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HotelOwnerRegisterLogin;

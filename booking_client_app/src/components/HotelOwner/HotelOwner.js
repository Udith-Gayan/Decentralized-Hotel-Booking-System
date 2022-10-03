import React, { useState, useEffect } from "react";
//import { Link } from "react-router-dom";
import classes from "./HotelOwner.module.css";
import Button from "react-bootstrap/Button";
import "../Shared/styles/common.css";
import HotelOwnerRegisterForm from "../HotelOwnerRegisterForm/HotelOwnerRegisterForm";
import HotelOwnerLoginForm from "../HotelOwnerLoginForm/HotelOwnerLoginForm";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
const redirectUrl = process.env.REACT_APP_LOGO_RIDERECTION_URL;

const HotelOwner = () => {
  const navigate = useNavigate();

  const [hotelOwnerLogVisibility, setHotelOwnerLogVisibility] = useState(false);


  const [hotelOwnerRegisterVisibility, setHotelOwnerRegisterVisibility] =
    useState(true);
  const [hotelOwnerLoginVisibility, setHotelOwnerLoginVisibility] =
    useState(true);


  const [
    hotelOwnerRegisterFormVisibility,
    setHotelOwnerRegisterFormVisibility,
  ] = useState(false);

  const [hotelOwnerLoginFormVisibility, setHotelOwnerLoginFormVisibility] = useState(false);

  const hotelOwnerRegister = () => {
    console.log("hotelOwnerRegister");
    setHotelOwnerRegisterFormVisibility(!hotelOwnerRegisterFormVisibility);
    setHotelOwnerRegisterVisibility(!hotelOwnerRegisterVisibility);
    setHotelOwnerLoginVisibility(!hotelOwnerLoginVisibility);
  };

  const hotelOwnerLogin = () => {
    console.log("hotelOwnerLogin");
    setHotelOwnerLoginFormVisibility(!hotelOwnerLoginFormVisibility);
    setHotelOwnerRegisterVisibility(!hotelOwnerRegisterVisibility);
    setHotelOwnerLoginVisibility(!hotelOwnerLoginVisibility);
  };

  return (
    <div className={classes.landingPageBackground}>
      <div className="p-4 mt-8">
      <p onClick={() => {window.location.href=redirectUrl}} className={classes.headerText}>| HOTEL BOOKING SYSTEM |</p>
    </div>
      <div className={classes.box}>
        {hotelOwnerRegisterFormVisibility && <HotelOwnerRegisterForm />}
        {hotelOwnerLoginFormVisibility && <HotelOwnerLoginForm />}
        <div>
          {hotelOwnerRegisterVisibility && (
            <Button
              variant="warning"
              className="m-2 p-3"
              onClick={() => hotelOwnerRegister()}
            >
              Register
            </Button>
          )}

          {hotelOwnerLoginVisibility && (
            <Button
              variant="warning"
              className="m-2 p-3"
              onClick={() => hotelOwnerLogin()}
            >
              Login
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default HotelOwner;

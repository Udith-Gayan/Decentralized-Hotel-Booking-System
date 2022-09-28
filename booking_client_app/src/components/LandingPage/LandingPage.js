import React, { useState, useEffect } from "react";
//import { Link } from "react-router-dom";
import classes from "./LandingPage.module.css";
import Button from "react-bootstrap/Button";
import "../Shared/styles/common.css";
import HotelOwnerRegisterForm from "../HotelOwnerRegisterForm/HotelOwnerRegisterForm";
import HotelOwnerLoginForm from "../HotelOwnerLoginForm/HotelOwnerLoginForm";
import { useNavigate } from "react-router-dom";
import ContractService from "./../../services/contract-service";
import toast from "react-hot-toast";

const LandingPage = () => {
  const navigate = useNavigate();
  const contractService = ContractService.instance;

  const [customerLogVisibility, setCustomerLogVisibility] = useState(false);
  const [hotelOwnerLogVisibility, setHotelOwnerLogVisibility] = useState(false);
  const [customerRegisterVisibility, setCustomerRegisterVisibility] =
    useState(false);
  const [customerLoginVisibility, setCustomerLoginVisibility] = useState(false);
  const [hotelOwnerRegisterVisibility, setHotelOwnerRegisterVisibility] =
    useState(false);
  const [hotelOwnerLoginVisibility, setHotelOwnerLoginVisibility] =
    useState(false);

  const [landingPageButton, setLandingPageButton] = useState(true);

  const [
    hotelOwnerRegisterFormVisibility,
    setHotelOwnerRegisterFormVisibility,
  ] = useState(false);

  const [hotelOwnerLoginFormVisibility, setHotelOwnerLoginFormVisibility] =
    useState(false);
  const customerClick = () => {
    setCustomerLogVisibility(!customerLogVisibility);
    localStorage.removeItem("user");
    localStorage.setItem("user", JSON.stringify("customer"));
    navigate("/dashboard/hotels");
    // setCustomerRegisterVisibility(!customerRegisterVisibility);
    // setCustomerLoginVisibility(!customerLoginVisibility);
  };

  const hotelOwnerClick = () => {
    localStorage.removeItem("user");
    localStorage.setItem("user", JSON.stringify("hotelowner"));
    setHotelOwnerLogVisibility(!hotelOwnerLogVisibility);
    setHotelOwnerRegisterVisibility(!hotelOwnerRegisterVisibility);
    setHotelOwnerLoginVisibility(!hotelOwnerLoginVisibility);
  };

  const customerRegister = () => {
    console.log("customerRegister");
  };

  const customerLogin = () => {
    console.log("customerLogin");
  };

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

  const initContractService = async () => {
    const initService = await contractService.init();

    if (initService) {
      setLandingPageButton(false);
      toast.success("Connected!");
    } else {
      setLandingPageButton(true);
    }
  };

  useEffect(() => {
    initContractService();
  }, []);

  return (
    <div className={classes.landingPageBackground}>
      <div className={classes.box}>
        {hotelOwnerRegisterFormVisibility && <HotelOwnerRegisterForm />}
        {hotelOwnerLoginFormVisibility && <HotelOwnerLoginForm />}
        <div>
          {!(customerLogVisibility || hotelOwnerLogVisibility) && (
            <Button
              variant="warning"
              className="m-2 p-3"
              onClick={() => customerClick()}
              disabled={landingPageButton}
            >
              Are you looking for Hotel?
            </Button>
          )}

          {customerRegisterVisibility && (
            <Button
              variant="warning"
              className="m-2 p-3"
              onClick={() => customerRegister()}
            >
              Register
            </Button>
          )}

          {customerLoginVisibility && (
            <Button
              variant="warning"
              className="m-2 p-3"
              onClick={() => customerLogin()}
            >
              Login
            </Button>
          )}

          {!(customerLogVisibility || hotelOwnerLogVisibility) && (
            <Button
              variant="warning"
              className="m-2 p-3"
              onClick={() => hotelOwnerClick()}
              disabled={landingPageButton}
            >
              Are you a Hotel Owner?
            </Button>
          )}

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

export default LandingPage;

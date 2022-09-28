import React, { useState, useEffect } from "react";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import classes from "./HotelOwnerRegisterForm.module.css";
import { useNavigate } from "react-router-dom";
import HotelService from "./../../services/hotel-service";
import toast from "react-hot-toast";

const HotelOwnerLoginForm = () => {
  const navigate = useNavigate();
  const hotelService = HotelService.instance;

  const [secret, setSecret] = useState(null);
  const [loginButtonDisable, setLoginButtonDisable] = useState(false);

  const Login = async () => {
    const id = toast.loading("Please wait...");
    setLoginButtonDisable(true);
    try {
      await hotelService.setUserWallet(secret, true);
      toast.success("Login success", { id: id, duration: 5000 });
      navigate("/dashboard/hotel-owner-login-overview");
    } catch (error) {
      setLoginButtonDisable(false);
      toast.error("Login Failed", { id: id, duration: 60000 });
      console.log(error);
    }
  };
  return (
    <div className={classes.pageLayout}>
      <Form>
        <Form.Group className="mb-3" controlId="secret">
          <Form.Label>Enter Secret</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter Secret"
            onChange={(e) => setSecret(e.target.value)}
          />
        </Form.Group>

        <Button
          variant="primary"
          onClick={() => Login()}
          disabled={loginButtonDisable}
        >
          Login
        </Button>
      </Form>
    </div>
  );
};

export default HotelOwnerLoginForm;

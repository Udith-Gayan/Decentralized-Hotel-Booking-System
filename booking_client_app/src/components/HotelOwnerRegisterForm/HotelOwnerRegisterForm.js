import React, { useState, useCallback } from "react";
import toast from "react-hot-toast";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import { useNavigate } from "react-router-dom";
import classes from "./HotelOwnerRegisterForm.module.css";
import SecretModal from "../SecretModal/SecretModal";
import ContractService from "./../../services/contract-service";
import HotelService from "./../../services/hotel-service";

let toastId = 0;
const HotelOwnerRegisterForm = () => {
  const navigate = useNavigate();
  const contractService = ContractService.instance;
  const hotelService = HotelService.instance;

  const [showModal, setShowModal] = useState(false);

  const [hotelName, setHotelName] = useState(null);
  const [email, setEmail] = useState(null);
  const [address, setAddress] = useState(null);

  const [registerButtonDisable, setRegisterButtonDisable] = useState(false);

  // const handleChangeAddress = useCallback(async () => {
  //   setShowModal(!showModal);
  //   toast(
  //     (t) => (
  //       <span>
  //         Please save this secret.
  //         <br />
  //         <br />
  //         <b>FEFA23ED23DFDFD2323</b>
  //         <br />
  //         <br />
  //         If you loose it, no one can recover it.
  //         <br />
  //         <br />
  //         Notification will be removed in couple of minutues.
  //         <br />
  //         <Button variant="danger" onClick={() => toast.dismiss(t.id)}>
  //           Dismiss
  //         </Button>
  //       </span>
  //     ),
  //     { duration: 30000 }
  //   );

  const submitForm = useCallback(async () => {
    console.log("Submtted.");
    setRegisterButtonDisable(true);
    const regObj = {
      hotelName: hotelName,
      location: address,
      email: email,
    };

    try {
      toastId = toast.loading("Creating a hotel wallet...");
      //creating a hotel wallet...
      const newUserWallet = await hotelService.createNewUserWallet();
      console.log(newUserWallet);
      //started hotel registration 1second
      toast("Started hotel registration", {
        id: toastId,
        duration: 3000,
      });
      const output = await hotelService.registerHotel(regObj);
      console.log(output);
      toast(
        (t) => (
          <span>
            Please copy and save this secret key safely.
            <br />
            <br />
            <b>{newUserWallet.walletSecret}</b>
            <br />
            <br />
            If you loose it, no one can recover it.
            <br />
            <br />
            Notification will be removed in couple of minutues.
            <br />
            <Button variant="danger" onClick={() => toast.dismiss(t.id)}>
              Dismiss
            </Button>
          </span>
        ),
        { id: await hotelService.toastId, duration: Infinity }
      );

      setShowModal(!showModal);
      navigate("/dashboard/hotel-overview");
    } catch (error) {
      toast.error("Hotel Registration failed. Refresh and try again.", {
        id: toastId,
        duration: 10000,
      });
      console.log(error);
      setRegisterButtonDisable(false);
    }
  }, [contractService, hotelName, email, address, hotelService]);

  return (
    <div className={classes.pageLayout}>
      {showModal && (
        <div>
          <SecretModal />
        </div>
      )}

      <Form>
        <Form.Group className="mb-3" controlId="hotelName">
          <Form.Label>Hotel Name</Form.Label>
          <Form.Control
            type="text"
            placeholder="Hotel Name"
            onChange={(e) => setHotelName(e.target.value)}
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="email">
          <Form.Label>Email</Form.Label>
          <Form.Control
            type="email"
            placeholder="Email"
            onChange={(e) => setEmail(e.target.value)}
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="address">
          <Form.Label>Hotel Location</Form.Label>
          <Form.Control
            type="text"
            placeholder="Hotel Address"
            onChange={(e) => setAddress(e.target.value)}
          />
        </Form.Group>

        <Button
          variant="primary"
          onClick={submitForm}
          disabled={registerButtonDisable}
        >
          Register
        </Button>
      </Form>
    </div>
  );
};

export default HotelOwnerRegisterForm;

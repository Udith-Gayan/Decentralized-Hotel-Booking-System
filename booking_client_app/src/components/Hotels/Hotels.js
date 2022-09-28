import React, { useState, useEffect } from "react";
import Accordion from "react-bootstrap/Accordion";
import Button from "react-bootstrap/Button";
import { useNavigate } from "react-router-dom";
import classes from "./Hotels.module.css";
import HotelService from "./../../services/hotel-service";
import Spinner from "../Spinner/Spinner";
import { Form } from "react-bootstrap";

const Hotels = () => {
  const navigate = useNavigate();
  const hotelService = HotelService.instance;

  const [hotels, setHotels] = useState([]);
  const [hotelsCopy, setHotelsCopy] = useState([]);
  const [isHotelsLoaded, setisHotelsLoaded] = useState(false);

  const getHotelList = async () => {
    console.log("Getting hotel list")
    try {
      const res = await hotelService.getHotels({isRegistered: 1});
      console.log(res)
      setHotels(res.hotels);
      setHotelsCopy(res.hotels);
      setisHotelsLoaded(true);
    } catch (error) {
      setisHotelsLoaded(false);
      console.log(error);
    }
  };

  useEffect(() => {
    getHotelList();
  }, []);

  const seeMore = (hObj) => {
    hotelService.setUserWalletAddress(hObj.HotelWalletAddress);
    hotelService.setHotelId(hObj.Id);
    navigate("/dashboard/hotel-overview")
  }

  const searchByLocation = (inp) => {
    if (inp?.length === 0) {
      setHotelsCopy(hotels);
    } else if (inp && inp.length > 0) {
      setHotelsCopy(hotels.filter(h => h.Address.startsWith(inp)));
    }
  }

  return (
    <div>
      <h2 className="mt-3 mb-4 d-inline ">Hotels</h2>

      <Button
        variant="primary"
        className={classes.myReservationBtn}
        onClick={() => navigate("/dashboard/my-reservations")}
      >
        My Reservations
      </Button>

      <div className={classes.hotelListWrapper}>

      <Form>
        <Form.Group className="mb-3" controlId="roomName">
          <Form.Label>Search by Location</Form.Label>
          <Form.Control type="text" placeholder="Location" onChange={e => searchByLocation(e.target.value)} />
        </Form.Group>
      </Form>

        <Accordion defaultActiveKey="0">
          {!isHotelsLoaded && (<Spinner />)}
          {hotelsCopy.map((hotel, i) => { return (
            <Accordion.Item eventKey={i} key={i}>
              <Accordion.Header>{hotel.Name} - {hotel.Address}</Accordion.Header>
              <Accordion.Body>
                Hotel Wallet: {hotel.HotelWalletAddress}
                <div>
                  <Button
                    variant="primary"
                    onClick={() => seeMore(hotel)}
                  >
                    More Info
                  </Button>
                </div>
              </Accordion.Body>
            </Accordion.Item>

          )})}

        </Accordion>
      </div>
    </div>
  );
};

export default Hotels;

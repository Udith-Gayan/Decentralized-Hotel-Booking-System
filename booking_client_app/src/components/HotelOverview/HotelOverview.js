import React, { Suspense, useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { solid } from "@fortawesome/fontawesome-svg-core/import.macro"; // <-- import styles to be used
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import classes from "./HotelOverview.module.css";
import CreateRoom from "../CreateRoom/CreateRoom";
import RoomBook from "../RoomBook/RoomBook";
import { Link, useNavigate } from "react-router-dom";
import ContractService from "./../../services/contract-service";
import HotelService from "./../../services/hotel-service";
import toast from "react-hot-toast";
import Spinner from "../Spinner/Spinner";

const HotelOverview = () => {
  const navigate = useNavigate();
  const contractService = ContractService.instance;
  const hotelService = HotelService.instance;

  const [createRoomVisibility, setCreateRoomVisibility] = useState(false);
  const [bookRoomFormVisibility, setBookRoomFormVisibility] = useState(false);
  const [roomIndex, setRoomIndex] = useState(-1);
  const [myHotel, setMyHotel] = useState(null);
  const [roomList, setRoomList] = useState([]);

  const [isRoomsLoaded, setIsRoomsLoaded] = useState(false);

  const getMyHotelDetails = async () => {
    try {
      const hotelObj = await hotelService.getCurrentHotelDetails();
      const hotel = {
        name: hotelObj.Name,
        address: hotelObj.Address,
        email: hotelObj.Email,
        hotelNftId: hotelObj.HotelNftId,
        hotelWalletAddress: hotelObj.HotelWalletAddress,
        id: hotelObj.Id,
      };
      setMyHotel(hotel);
      await getMyRoomList();
    } catch (error) {
      console.log(error);
    }
  };

  const getMyRoomList = async () => {
    try {
      // await contractService.init();
      const res = await hotelService.getRoomsByMyHotel();
      setRoomList(res.rooms);
      setIsRoomsLoaded(true);
    } catch (error) {
      setIsRoomsLoaded(false);
      console.log(error);
    }
  };

  useEffect(() => {
    getMyHotelDetails();
  }, []);

  const createRoomPanel = () => {
    setCreateRoomVisibility(!createRoomVisibility);
  };

  const submitRoomToCreate = async (roomName) => {
    try {
      const res = await hotelService.createARoom({ roomName: roomName });
      console.log(res.rowId);
      setCreateRoomVisibility(!createRoomVisibility);
      toast.success("Room created successfully.", { duration: 5000 });
      await getMyRoomList();
    } catch (error) {
      console.log(error);
      toast.error("Error in room creation.", { duration: 5000 });
      setCreateRoomVisibility(!createRoomVisibility);
    }
  };

  const makeReservation = async (bookObj) => {
    const id = toast.loading("Please wait...");
    try {
      const res = await hotelService.makeABooking({
        roomId: roomIndex,
        ...bookObj,
      });
      toast.success("Reservation successfull.", { id: id, duration: 10000 });
      setBookRoomFormVisibility(false);
    } catch (error) {
      setBookRoomFormVisibility(false);
      toast.error(error, { id: id, duration: 10000 });
      console.log(error);
    }
  };

  const bookRoom = (id) => {
    console.log("booking a room", id);
    setRoomIndex(id);
    setBookRoomFormVisibility(!bookRoomFormVisibility);
  };

  return (
    <div>
      <Button variant="secondary" onClick={() => navigate(-1)}>
        Back
      </Button>
      <div style={{ textAlign: "center" }}>
        <h2 className={classes.pageTitle}>Hotel Overview</h2>
        <FontAwesomeIcon icon={solid("hotel")} className={classes.hotelIcon} />

        <div className={classes.cardWrapper}>
          <p>
            <span className={classes.title}>Name:</span> {myHotel?.name}
          </p>
          <p>
            <span className={classes.title}>Email:</span> {myHotel?.email}
          </p>
          <p>
            <span className={classes.title}>Address:</span> {myHotel?.address}
          </p>
        </div>
        {JSON.parse(localStorage.getItem("user")) === "hotelowner" && (
          <div>
            <Button variant="primary" onClick={() => createRoomPanel()}>
              {!createRoomVisibility ? "Open " : "Close "}
              Room Creation Panel
            </Button>
          </div>
        )}

        {createRoomVisibility && (
          <div>
            <CreateRoom onSubmit={submitRoomToCreate} />
          </div>
        )}
        {!isRoomsLoaded && <Spinner />}
        <div className={classes.cardWrapper}>
          {roomList.map((roomDetail, index) => (
            <Card
              id={4}
              key={roomDetail.id}
              style={{ width: "18rem", display: "inline-block", margin: "5px" }}
            >
              <Card.Body>
                <Card.Title>{roomDetail.roomName}</Card.Title>
                <Card.Text>{roomDetail.nftId}</Card.Text>
                {JSON.parse(localStorage.getItem("user")) === "customer" && (
                  <Button
                    variant="primary"
                    id={roomDetail.id}
                    onClick={() => bookRoom(roomDetail.id)}
                  >
                    Make a reservation
                  </Button>
                )}
                {/* replace index with relevant variable and once you navigate, you can access that variable from Room page. example provided */}
                {JSON.parse(localStorage.getItem("user")) === "hotelowner" && (
                  <Link
                    to={`/dashboard/hotel-owner-login-overview/room/${roomDetail.id}`}
                  >
                    <Button variant="primary">See Bookings</Button>
                  </Link>
                )}
                {bookRoomFormVisibility && roomIndex === roomDetail.id && (
                  <RoomBook onSubmit={makeReservation} />
                )}
              </Card.Body>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HotelOverview;

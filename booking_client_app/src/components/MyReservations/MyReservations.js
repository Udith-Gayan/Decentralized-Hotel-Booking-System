import React, { useState, useEffect } from "react";
import Table from "react-bootstrap/Table";
import Button from "react-bootstrap/Button";
import { useNavigate } from "react-router-dom";
import HotelService from "./../../services/hotel-service";
import Spinner from "../Spinner/Spinner";

const MyReservations = () => {
  const navigate = useNavigate();

  const hotelService = HotelService.instance;

  const [bookings, setBookings] = useState([]);
  const [showSpinner, setShowSpinner] = useState(true);

  const getRoomBookings = async () => {
    try {
      const res = await hotelService.getMyBookings();
      setBookings(res.bookings);
      setShowSpinner(false);

    } catch (error) {
      // console.log(error);
      setShowSpinner(true);
    }
  };

  useEffect(() => {
    getRoomBookings();
  }, []);


  return (
    <div>
      <Button variant="secondary" onClick={() => navigate(-1)}>
        Back
      </Button>
      <h2 className="mt-3 mb-4">My Reservations</h2>
      {showSpinner && (<Spinner />)}
      {!showSpinner && (
        <Table striped bordered hover size="sm">
          <thead>
            <tr>
              <th>Index</th>
              <th>Hotel Name</th>
              <th>Room Name</th>
              <th>By</th>
              <th>Date From</th>
              <th>Date To</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((book, i) => (
              <tr key={i}>
                <td>{i + 1}</td>
                <td>{book.hotelName}</td>
                <td>{book.roomName}</td>
                <td>{book.customer}</td>
                <td>{book.fromDate}</td>
                <td>{book.toDate}</td>
              </tr>

            ))}

          </tbody>
        </Table>
      )}
    </div>
  );
};

export default MyReservations;

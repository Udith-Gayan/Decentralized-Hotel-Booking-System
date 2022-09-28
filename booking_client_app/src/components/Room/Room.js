import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Table from "react-bootstrap/Table";
import HotelService from "./../../services/hotel-service";
import { Button } from "react-bootstrap";

const Room = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const hotelService = HotelService.instance;

  const [bookings, setBookings] = useState([]);

  const getRoomBookings = async () => {
    try {
      const res = await hotelService.getBookingsByRoom(parseInt(id));
      setBookings(res.bookings);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getRoomBookings();
  }, [id]);

  return (
    <div>
      <Button variant="secondary" onClick={() => navigate(-1)}>
        Back
      </Button>
      {/* example mentioned */}
      <br />
      <br />

      {/* example mentioned */}
      <h2 className="mt-3 mb-4">Room Bookings</h2>
      <Table striped bordered hover size="sm">
        <thead>
          <tr>
            <th>Index</th>
            <th>Room Name</th>
            <th>Booked By</th>
            <th>Date From</th>
            <th>Date To</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((book, i) => (
            <tr key={i}>
              <td>{i + 1}</td>
              <td>{book.roomName}</td>
              <td>{book.customer}</td>
              <td>{book.fromDate}</td>
              <td>{book.toDate}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default Room;

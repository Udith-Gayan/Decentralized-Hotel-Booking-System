import React, { useState } from "react";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";

const RoomBook = ({ onSubmit }) => {
  const [personName, setPersonName] = useState(null);
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [makeReservationButtonDisable, setMakeReservationButtonDisable] =
    useState(false);
  const notifySubmission = () => {
    setMakeReservationButtonDisable(true);
    console.log("Room details submitted.");
    if (personName != null && fromDate != null && toDate != null) {
      onSubmit({ personName: personName, fromDate: fromDate, toDate: toDate });
    }
  };

  return (
    <div>
      <Form>
        <Form.Group className="mb-3" controlId="name">
          <Form.Label>Name</Form.Label>
          <Form.Control
            type="text"
            placeholder="Name"
            onChange={(e) => setPersonName(e.target.value)}
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="datefrom">
          <Form.Label>Date From</Form.Label>
          <Form.Control
            type="date"
            placeholder="Date From"
            onChange={(e) => setFromDate(e.target.value)}
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="dateto">
          <Form.Label>Date To</Form.Label>
          <Form.Control
            type="date"
            placeholder="Date To"
            onChange={(e) => setToDate(e.target.value)}
          />
        </Form.Group>
        <Button
          variant="primary"
          onClick={() => notifySubmission()}
          disabled={makeReservationButtonDisable}
        >
          Submit
        </Button>
      </Form>
    </div>
  );
};

export default RoomBook;

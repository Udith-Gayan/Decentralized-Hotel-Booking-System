import React, { useCallback, useState } from "react";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import classes from "./CreateRoom.module.css";

const CreateRoom = ({ onSubmit }) => {
  const [roomName, setRoomName] = useState(null);
  const [submitRoomButtonDisable, setSubmitRoomButtonDisable] = useState(false);

  const notifySubmission = () => {
    setSubmitRoomButtonDisable(true);
    console.log("Room details submitted.");
    if (roomName != null) {
      onSubmit(roomName);
    }
  };

  return (
    <div className={classes.createRoomForm}>
      <Form>
        <Form.Group className="mb-3" controlId="roomName">
          <Form.Label>Room Name</Form.Label>
          <Form.Control
            type="text"
            placeholder="Room Name"
            onChange={(e) => setRoomName(e.target.value)}
          />
        </Form.Group>
        <Button
          variant="primary"
          onClick={notifySubmission}
          disabled={submitRoomButtonDisable}
        >
          Submit Room Details
        </Button>
      </Form>
    </div>
  );
};

export default CreateRoom;

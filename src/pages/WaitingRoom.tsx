import { useParams } from "react-router-dom";
import { useEffect } from "react";
import { io } from "socket.io-client";
import { useNavigate } from "react-router-dom";

const WaitingRoom = () => {
  const { roomID } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const socket = io(import.meta.env.VITE_SOCKET_ENDPOINT || "/");
    socket.emit("joinRoom", roomID);

    socket.on("startGame", ({ message }) => {
      console.log(message);
      navigate(`/mancala/${roomID}`);
    });

    return () => {
      socket.disconnect();
    };
  }, [roomID, navigate]);

  return (
    <div>
      <p>ルームID: {roomID}</p>
      <p>ルームIDを相手に教えてください</p>
    </div>
  );
};

export default WaitingRoom;

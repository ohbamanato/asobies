import { useParams } from "react-router-dom";
import { useEffect } from "react";
import { io } from "socket.io-client";
import { useNavigate } from "react-router-dom";
import "../css/WaitingRoom.css";

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
    <div className="waiting-container">
      <div className="waiting-content">
        <h1 className="waiting-title">プレイヤーを待機中...</h1>
        
        <div className="room-info">
          <p className="room-id">ルームID: {roomID}</p>
          <p className="room-instruction">
            このルームIDを相手に教えて、参加してもらってください
          </p>
        </div>
        
        <div className="loading-animation">
          <div className="loading-dots">
            <div className="dot"></div>
            <div className="dot"></div>
            <div className="dot"></div>
          </div>
        </div>
        
        <p className="waiting-message">
          相手プレイヤーが参加すると、自動的にゲームが開始されます
        </p>
      </div>
    </div>
  );
};

export default WaitingRoom;

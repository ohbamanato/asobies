import { useParams } from "react-router-dom";
import { useEffect } from "react";
import { io } from "socket.io-client";
import { useNavigate } from "react-router-dom";

const WaitingRoom = () => {
  const { roomID } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const socket = io("http://localhost:8080"); // useEffect内でsocket作成
    socket.emit("joinRoom", roomID);

    socket.on("startGame", ({ message }) => {
      console.log(message); // サーバーから来たメッセージ表示
      navigate(`/mancala/${roomID}`);
    });

    return () => {
      socket.disconnect(); // 必ずdisconnect！
    };
  }, [roomID, navigate]);

  return (
    <div>
      <p>ルームID: {roomID}</p>
    </div>
  );
};

export default WaitingRoom;

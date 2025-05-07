import { useEffect, useState } from "react";
import "../css/Mancala.css";
import { io } from "socket.io-client";
import Board from "../components/Board";
import { useParams } from "react-router-dom";

const socket = io(import.meta.env.VITE_SOCKET_ENDPOINT || "/");

const Mancala = () => {
  const [data, setData] = useState<number[]>([]);
  const [turn, setTurn] = useState<number>(0);
  const [playerNumber, setPlayerNumber] = useState<number | null>(null);
  const [opponentLeft, setOpponentLeft] = useState(false);

  const { roomID } = useParams();

  const [selectedPit, setSelectedPit] = useState<number | null>(null);

  useEffect(() => {
    socket.emit("mancalaStart", roomID);

    socket.on("gameState", (state) => {
      console.log("Game state received:", state);
      setData(state.gameData.dataArray);
      setTurn(state.gameData.turn);
      if (playerNumber === null && typeof state.playerNumber === "number") {
        setPlayerNumber(state.playerNumber);
      }
    });

    socket.on("gameEnd", ({ message, finalData }) => {
      alert(message);
      setData(finalData);
    });

    socket.on("opponentDisconnected", () => {
      setOpponentLeft(true);
    });

    return () => {
      socket.off("gameState");
      socket.off("gameEnd");
      socket.off("opponentDisconnected");
    };
  }, []);

  const handlePitClick = (pitIndex: number) => {
    setSelectedPit(pitIndex);
  };

  const handleDirectionClick = (direction: "left" | "right") => {
    if (selectedPit !== null) {
      socket.emit("moveStones", {
        roomId: roomID,
        pitIndex: selectedPit,
        direction,
      });
      setSelectedPit(null);
    }
  };

  return (
    <div className="board-container">
      <Board
        turn={turn}
        data={data}
        handlePitClick={handlePitClick}
        isReversed={playerNumber === 1}
        selectedPit={selectedPit}
      />
      {selectedPit !== null && (
        <div className="direction-select">
          <button onClick={() => handleDirectionClick("left")}>←</button>
          <button onClick={() => handleDirectionClick("right")}>→</button>
        </div>
      )}
      {opponentLeft && (
        <div className="opponent-left">
          <p>相手が退出しました。</p>
          <button onClick={() => (window.location.href = "/")}>
            メニューへ戻る
          </button>
        </div>
      )}
    </div>
  );
};

export default Mancala;

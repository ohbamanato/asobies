import { useEffect, useState } from "react";
import "../css/Mancala.css";
import { io } from "socket.io-client";
import Board from "../components/Board";
import { useParams } from "react-router-dom";

const socket = io(import.meta.env.VITE_SOCKET_ENDPOINT || "/", {
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  timeout: 10000,
});

const Mancala = () => {
  const [data, setData] = useState<number[]>([]);
  const [turn, setTurn] = useState<number>(0);
  const [playerNumber, setPlayerNumber] = useState<number | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<string>("connecting");
  const [lastGameState, setLastGameState] = useState<any>(null);
  const [syncInterval, setSyncInterval] = useState<NodeJS.Timeout | null>(null);

  const { roomID } = useParams();

  const [selectedPit, setSelectedPit] = useState<number | null>(null);

  useEffect(() => {
    // 接続状態の監視
    socket.on("connect", () => {
      console.log("Connected to server");
      setConnectionStatus("connected");
      // 再接続時はゲーム状態を再要求
      socket.emit("mancalaStart", roomID);
      
      // 定期的な同期チェックを開始
      const interval = setInterval(() => {
        if (socket.connected) {
          socket.emit("syncGameState", roomID);
        }
      }, 30000); // 30秒ごとに同期チェック
      
      setSyncInterval(interval);
    });

    socket.on("disconnect", (reason) => {
      console.log("Disconnected:", reason);
      setConnectionStatus("disconnected");
      
      // 同期インターバルをクリア
      if (syncInterval) {
        clearInterval(syncInterval);
        setSyncInterval(null);
      }
    });

    socket.on("reconnect", (attemptNumber) => {
      console.log("Reconnected after", attemptNumber, "attempts");
      setConnectionStatus("connected");
      // 再接続後にゲーム状態を同期
      socket.emit("syncGameState", roomID);
    });

    socket.on("connect_error", (error) => {
      console.error("Connection error:", error);
      setConnectionStatus("error");
    });

    // 初回接続時のゲーム開始
    if (socket.connected) {
      socket.emit("mancalaStart", roomID);
    }

    socket.on("gameState", (state) => {
      console.log("Game state received:", state);
      setData(state.gameData.dataArray);
      setTurn(state.gameData.turn);
      setLastGameState(state);
      if (playerNumber === null && typeof state.playerNumber === "number") {
        setPlayerNumber(state.playerNumber);
      }
    });

    socket.on("gameEnd", ({ message, finalData }) => {
      alert(message);
      setData(finalData);
    });

    socket.on("error", (error) => {
      console.error("Game error:", error);
      alert(`エラーが発生しました: ${error.message}`);
    });

    socket.on("playerDisconnected", ({ message }) => {
      console.log("Player disconnected:", message);
      alert(message);
      setConnectionStatus("waiting");
    });

    return () => {
      // インターバルのクリーンアップ
      if (syncInterval) {
        clearInterval(syncInterval);
      }
      
      socket.off("connect");
      socket.off("disconnect");
      socket.off("reconnect");
      socket.off("connect_error");
      socket.off("gameState");
      socket.off("gameEnd");
      socket.off("error");
      socket.off("playerDisconnected");
    };
  }, [roomID, playerNumber, syncInterval]);

  const handlePitClick = (pitIndex: number) => {
    setSelectedPit(pitIndex);
  };

  const handleDirectionClick = (direction: "left" | "right") => {
    if (selectedPit !== null && connectionStatus === "connected") {
      socket.emit("moveStones", {
        roomId: roomID,
        pitIndex: selectedPit,
        direction,
      }, (response: { success: boolean; error?: string }) => {
        // サーバーからの応答を確認
        if (response?.success) {
          console.log("Move confirmed by server");
        } else {
          console.error("Move rejected by server:", response?.error);
          alert(`手を進めることができませんでした: ${response?.error || "不明なエラー"}`);
        }
      });
      setSelectedPit(null);
    } else if (connectionStatus !== "connected") {
      alert("サーバーに接続されていません。しばらくお待ちください。");
    }
  };

  return (
    <div className="board-container">
      {connectionStatus !== "connected" && (
        <div className="connection-status">
          {connectionStatus === "connecting" && "サーバーに接続中..."}
          {connectionStatus === "disconnected" && "サーバーとの接続が切断されました。再接続中..."}
          {connectionStatus === "error" && "接続エラーが発生しました。"}
          {connectionStatus === "waiting" && "相手プレイヤーの再接続を待っています..."}
        </div>
      )}
      <Board
        turn={turn}
        data={data}
        handlePitClick={handlePitClick}
        isReversed={playerNumber === 1}
        selectedPit={selectedPit}
      />
      {selectedPit !== null && connectionStatus === "connected" && (
        <div className="direction-select">
          <button onClick={() => handleDirectionClick("left")}>←</button>
          <button onClick={() => handleDirectionClick("right")}>→</button>
        </div>
      )}
    </div>
  );
};

export default Mancala;

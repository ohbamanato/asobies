import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();
  const [roomIdToJoin, setRoomIdToJoin] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateRoom = async () => {
    try {
      const response = await axios.post("/api/mancala/create");
      const room = response.data;
      navigate(`/waiting/${room.roomID}`);
    } catch (error) {
      console.error("ルーム作成エラー:", error);
    }
  };

  const handleJoinRoomCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await axios.get(`/api/mancala/join/${roomIdToJoin}`);
      console.log(response);
      if (response.data) {
        navigate(`/waiting/${roomIdToJoin}`);
      } else {
        alert("ルームが見つかりませんでした。");
      }
    } catch (error) {
      console.error("ルーム参加エラー:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h1>マンカラ オンライン対戦</h1>
      <button onClick={handleCreateRoom}>ルームを作成</button>
      <form onSubmit={handleJoinRoomCheck}>
        <h3>ルームに参加</h3>
        <input
          type="text"
          placeholder="ルームIDを入力"
          value={roomIdToJoin}
          onChange={(e) => setRoomIdToJoin(e.target.value)}
          required
        />
        <button type="submit" disabled={isLoading || !roomIdToJoin}>
          {isLoading ? "検索中..." : "参加"}
        </button>
      </form>
    </div>
  );
};

export default Home;

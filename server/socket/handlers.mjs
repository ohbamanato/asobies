export default function setupSocketHandlers(socket, io, rooms, roomsState) {
  //ルーム入室時の処理
  socket.on("joinRoom", (roomId, callback) => {
    try {
      if (!roomId || typeof roomId !== 'string') {
        const error = { success: false, error: "無効なルームIDです" };
        if (callback) callback(error);
        return;
      }

      socket.join(roomId);

      if (!rooms[roomId]) {
        rooms[roomId] = [];
      }

      if (!rooms[roomId].includes(socket.id)) {
        rooms[roomId].push(socket.id);
      }

      if (callback) callback({ success: true });

      if (rooms[roomId].length === 2) {
        io.to(roomId).emit("startGame", { message: "Game is starting!" });
      }
    } catch (error) {
      console.error("Error in joinRoom:", error);
      const errorResponse = { success: false, error: "ルーム入室エラー" };
      if (callback) callback(errorResponse);
    }
  });

  //ゲーム(マンカラ)開始時の処理
  socket.on("mancalaStart", (roomId, callback) => {
    try {
      if (!roomId || typeof roomId !== 'string') {
        const error = { success: false, error: "無効なルームIDです" };
        if (callback) callback(error);
        socket.emit("error", error);
        return;
      }

      socket.join(roomId);

      if (!roomsState.has(roomId)) {
        roomsState.set(roomId, {
          players: [],
          gameData: {
            turn: 0,
            dataArray: [0, 4, 4, 4, 4, 4, 4, 0, 4, 4, 4, 4, 4, 4],
          },
          lastUpdated: Date.now(),
        });
      }

      const state = roomsState.get(roomId);
      if (!state.players.includes(socket.id)) {
        state.players.push(socket.id);
      }
      const playerNumber = state.players.indexOf(socket.id);

      const gameStateData = {
        ...state,
        playerNumber,
      };

      socket.emit("gameState", gameStateData);
      
      if (callback) callback({ success: true });
    } catch (error) {
      console.error("Error in mancalaStart:", error);
      const errorResponse = { success: false, error: "ゲーム開始エラー" };
      if (callback) callback(errorResponse);
      socket.emit("error", errorResponse);
    }
  });

  // ゲーム状態同期の処理（再接続時用）
  socket.on("syncGameState", (roomId, callback) => {
    try {
      if (!roomId || !roomsState.has(roomId)) {
        const error = { success: false, error: "ゲーム状態が見つかりません" };
        if (callback) callback(error);
        socket.emit("error", error);
        return;
      }

      const state = roomsState.get(roomId);
      const playerNumber = state.players.indexOf(socket.id);

      if (playerNumber === -1) {
        const error = { success: false, error: "このゲームのプレイヤーではありません" };
        if (callback) callback(error);
        socket.emit("error", error);
        return;
      }

      socket.emit("gameState", {
        ...state,
        playerNumber,
      });

      if (callback) callback({ success: true });
    } catch (error) {
      console.error("Error in syncGameState:", error);
      const errorResponse = { success: false, error: "同期エラー" };
      if (callback) callback(errorResponse);
      socket.emit("error", errorResponse);
    }
  });

  //石を動かした時の処理
  socket.on("moveStones", ({ roomId, pitIndex, direction }, callback) => {
    try {
      // バリデーション
      if (!roomId || typeof roomId !== 'string') {
        const error = { success: false, error: "無効なルームIDです" };
        if (callback) callback(error);
        return;
      }

      if (typeof pitIndex !== 'number' || pitIndex < 0 || pitIndex >= 14) {
        const error = { success: false, error: "無効なピットインデックスです" };
        if (callback) callback(error);
        return;
      }

      if (direction !== "left" && direction !== "right") {
        const error = { success: false, error: "無効な方向です" };
        if (callback) callback(error);
        return;
      }

      const game = roomsState.get(roomId);
      if (!game) {
        const error = { success: false, error: "ゲーム状態が見つかりません" };
        if (callback) callback(error);
        return;
      }

      const playerNumber = game.players.indexOf(socket.id);
      if (playerNumber === -1) {
        const error = { success: false, error: "このゲームのプレイヤーではありません" };
        if (callback) callback(error);
        return;
      }

      // ターンの確認
      if (game.gameData.turn !== playerNumber) {
        const error = { success: false, error: "あなたのターンではありません" };
        if (callback) callback(error);
        return;
      }

      // 選択されたピットに石があるかチェック
      if (game.gameData.dataArray[pitIndex] === 0) {
        const error = { success: false, error: "選択されたピットには石がありません" };
        if (callback) callback(error);
        return;
      }

      let stones = game.gameData.dataArray[pitIndex];
      let index = pitIndex;
      game.gameData.dataArray[pitIndex] = 0;

      if (direction === "right") {
        while (stones > 0) {
          index = (index + 1) % 14;
          game.gameData.dataArray[index] += 1;
          stones--;
        }
      } else if (direction === "left") {
        while (stones > 0) {
          index = (index - 1 + 14) % 14;
          game.gameData.dataArray[index] += 1;
          stones--;
        }
      }

      // ゲーム終了チェック
      const playerPits =
        playerNumber === 0
          ? game.gameData.dataArray.slice(1, 7)
          : game.gameData.dataArray.slice(8, 14);

      const isGameEnd = playerPits.every((stone) => stone === 0);

      if (isGameEnd) {
        io.to(roomId).emit("gameEnd", {
          message: "ゲーム終了！",
          finalData: game.gameData.dataArray,
        });
      }

      //　turn変更
      if (!(index === 0 || index === 7)) {
        game.gameData.turn = (game.gameData.turn + 1) % 2;
      }

      // タイムスタンプ更新
      game.lastUpdated = Date.now();

      // 全プレイヤーに状態を送信
      io.to(roomId).emit("gameState", {
        ...game,
      });

      // 成功レスポンス
      if (callback) callback({ success: true });

    } catch (error) {
      console.error("Error in moveStones:", error);
      const errorResponse = { success: false, error: "石移動エラー" };
      if (callback) callback(errorResponse);
    }
  });

  socket.on("disconnect", (reason) => {
    console.log(`Socket ${socket.id} disconnected: ${reason}`);
    
    // 切断されたプレイヤーが参加していたルームを見つけて処理
    for (const [roomId, playerIds] of Object.entries(rooms)) {
      const playerIndex = playerIds.indexOf(socket.id);
      if (playerIndex !== -1) {
        // プレイヤーをルームから削除（ただし、再接続を考慮してゲーム状態は保持）
        rooms[roomId].splice(playerIndex, 1);
        
        // ルームが空になった場合、一定時間後にクリーンアップ
        if (rooms[roomId].length === 0) {
          setTimeout(() => {
            if (rooms[roomId] && rooms[roomId].length === 0) {
              delete rooms[roomId];
              roomsState.delete(roomId);
              console.log(`Room ${roomId} cleaned up due to inactivity`);
            }
          }, 300000); // 5分後にクリーンアップ
        }
        
        // 残りのプレイヤーに通知
        socket.to(roomId).emit("playerDisconnected", {
          message: "相手プレイヤーが切断されました。再接続をお待ちください。"
        });
        
        break;
      }
    }
  });
}

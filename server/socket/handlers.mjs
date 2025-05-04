export default function setupSocketHandlers(socket, io, rooms, roomsState) {
  //ルーム入室時の処理
  socket.on("joinRoom", (roomId) => {
    socket.join(roomId);

    if (!rooms[roomId]) {
      rooms[roomId] = [];
    }

    rooms[roomId].push(socket.id);

    if (rooms[roomId].length === 2) {
      io.to(roomId).emit("startGame", { message: "Game is starting!" });
    }
  });

  //ゲーム(マンカラ)開始時の処理
  socket.on("mancalaStart", (roomId) => {
    socket.join(roomId);

    if (!roomsState.has(roomId)) {
      roomsState.set(roomId, {
        players: [],
        gameData: {
          turn: 0,
          dataArray: [0, 4, 4, 4, 4, 4, 4, 0, 4, 4, 4, 4, 4, 4],
        },
      });
    }
    const state = roomsState.get(roomId);
    if (!state.players.includes(socket.id)) {
      state.players.push(socket.id);
    }
    const playerNumber = state.players.indexOf(socket.id);

    socket.emit("gameState", {
      ...state,
      playerNumber,
    });
  });

  //石を動かした時の処理
  socket.on("moveStones", ({ roomId, pitIndex, direction }) => {
    console.log(`Direction: ${direction}, pitIndex: ${pitIndex}`);
    const game = roomsState.get(roomId);
    if (!game) return;

    const playerNumber = game.players.indexOf(socket.id);

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

    io.to(roomId).emit("gameState", {
      ...game,
    });
  });

  socket.on("disconnect", () => {});
}

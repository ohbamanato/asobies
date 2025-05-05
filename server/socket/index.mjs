import { Server } from "socket.io";
import setupSocketHandlers from "./handlers.mjs";

export default function initSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: "https://asobies.onrender.com",
      methods: ["GET", "POST"],
    },
  });

  const rooms = {};
  const roomsState = new Map();

  io.on("connection", (socket) => {
    setupSocketHandlers(socket, io, rooms, roomsState);
  });
}

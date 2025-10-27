import { nanoid } from "nanoid";
import Room from "../models/room.mjs";

async function getRoomID(req, res) {
  const { roomID } = req.params;
  const room = await Room.findOne({ roomID });

  if (room === null) return res.status(404).json({ msg: "Page Not Found" });

  res.json(room);
}

async function createRoom(req, res) {
  const roomID = nanoid(6);
  console.log(`Room ID: ${roomID}`);

  const room = new Room({ roomID });
  const newRoom = await room.save();

  res.status(201).json({ roomID });
}

export { getRoomID, createRoom };

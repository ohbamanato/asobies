import express from "express";
import { requestErrorHandler } from "../helpers/helper.mjs";
import { getRoomID, createRoom } from "../controllers/mancala.mjs";

const router = express.Router();

router.post("/create", requestErrorHandler(createRoom));

router.get(`/join/:roomID`, requestErrorHandler(getRoomID));

export default router;

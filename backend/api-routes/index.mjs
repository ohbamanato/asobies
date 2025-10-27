import express from "express";
import mancalaRouter from "./mancala.mjs";

const router = express.Router();
router.use("/mancala", mancalaRouter);

export default router;

import express from "express";
import env from "dotenv";
env.config();
import cors from "cors";
import { createServer } from "http";

import apiRoutes from "./api-routes/index.mjs";
import "./helpers/db.mjs";
import initSocket from "./socket/index.mjs";
import path from "path";

const app = express();
const port = process.env.PORT || 8080;
const httpServer = createServer(app);

// ミドルウェア
app.use("/", express.static("dist"));
app.use(express.json());
app.use(cors());

// APIルート
app.use("/api", apiRoutes);

app.get(/.*/, (req, res) => {
  const indexHtml = path.resolve("dist", "index.html");
  res.sendFile(indexHtml);
});

// 404
app.use(function (req, res) {
  res.status(404).json({ msg: "Page Not Found" });
});

// その他のエラー処理
app.use(function (err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }
  res.status(500).json({ msg: "不正なエラーが発生しました。" });
});

// WebSocketの初期化
initSocket(httpServer);

// サーバー起動
httpServer.listen(port, () => {
  console.log(`Server Start: http://localhost:${port}`);
});

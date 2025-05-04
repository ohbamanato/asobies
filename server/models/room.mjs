import { Schema, model } from "mongoose";

const roomSchema = new Schema(
  {
    roomID: {
      type: String,
      required: true,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

const Room = model("Room", roomSchema);

export default Room;

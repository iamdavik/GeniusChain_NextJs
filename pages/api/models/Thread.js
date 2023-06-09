const mongoose = require("mongoose");

const ThreadSchema = new mongoose.Schema(
  {
    messages: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Message",
      },
    ],
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

let Thread;

if (mongoose.models.Thread) {
  Thread = mongoose.model("Thread");
} else {
  Thread = mongoose.model("Thread", ThreadSchema);
}

export default Thread;

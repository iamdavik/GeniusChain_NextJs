const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: true,
    },
    sender: {
      type: String,
      required: true,
    },
    // Add any additional fields you need here.
  },
  {
    timestamps: true,
  }
);

let Message;

if (mongoose.models.Message) {
  Message = mongoose.model("Message");
} else {
  Message = mongoose.model("Message", MessageSchema);
}
export default Message;

// models/Contract.js
const mongoose = require("mongoose");
const { Schema } = mongoose;

const contractSchema = new Schema({
  contractCode: { type: String, required: true },
  contractName: { type: String, required: true },
  contractType: { type: String, required: true },
  notes: { type: String, required: true },
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports =
  mongoose.models.Contract || mongoose.model("Contract", contractSchema);

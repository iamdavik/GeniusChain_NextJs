// models/Contract.js
const mongoose = require("mongoose");
const { Schema } = mongoose;

const auditSchema = new Schema({
  audit: { type: String, required: true },
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.models.Audit || mongoose.model("Audit", auditSchema);

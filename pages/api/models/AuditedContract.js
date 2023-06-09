const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const auditedContractSchema = new Schema(
  {
    contractCode: { type: String, required: true },
    contractName: { type: String, required: true },
    contractType: { type: String, required: true },
    notes: { type: String, required: true },
  },
  { timestamps: true }
);

const AuditedContract =
  mongoose.models.AuditedContract ||
  mongoose.model("AuditedContract", auditedContractSchema);

export default AuditedContract;

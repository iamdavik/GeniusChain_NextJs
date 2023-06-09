import mongoose from "mongoose";

const SettingSchema = new mongoose.Schema({
  chatPrice: {
    type: Number,
    required: true,
    default: 10,
  },
  contractCreationPrice: {
    type: Number,
    required: true,
    default: 10,
  },
  auditPrice: {
    type: Number,
    required: true,
    default: 10,
  },
  isPaid: {
    type: Boolean,
    required: true,
    default: false,
  },
});

let Setting;

if (mongoose.models.Setting) {
  Setting = mongoose.model("Setting");
} else {
  Setting = mongoose.model("Setting", SettingSchema);
}

export default Setting;

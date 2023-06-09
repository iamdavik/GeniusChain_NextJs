const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  address: {
    type: String,
    required: true,
    unique: true,
  },
  threads: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Thread",
    },
  ],
  credits: {
    type: Number,
    default: 100,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

let User;

console.log(mongoose.model);

if (mongoose.models.User) {
  User = mongoose.model("User");
} else {
  User = mongoose.model("User", UserSchema);
}

export default User;

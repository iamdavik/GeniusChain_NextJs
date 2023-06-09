import connectToDatabase from "@/pages/api/utils/mongodb";

import { checkSignedMessage } from "./middlewares/checkSignedMessage";
import User from "./models/User";

import mongooseConnectToDatabase from "@/pages/api/utils/mongoose_conn";
import Thread from "./models/Thread";
import SettingModel from "./models/Settings";
import Message from "./models/Message";

// /pages/api/createUser.js
export default async function handler(req, res) {
  if (req.method === "POST") {
    const { address } = req.body;
    checkSignedMessage(req, res);

    console.log(req.body);
    // Input validation
    if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
      res.status(400).json({ error: "Invalid Ethereum address" });
      return;
    }

    try {
      const db = await mongooseConnectToDatabase();

      if (!db) return;

      // this only happens once in the entire life time of the application
      SettingModel.countDocuments()
        .then(count => {
          if (count === 0) {
            console.log("settings model count");
            const defaultSettings = new SettingModel();

            defaultSettings
              .save()
              .then(() => console.log("Default settings created successfully"))
              .catch(error =>
                console.error("Error creating default settings:", error)
              );
          }
        })
        .catch(err => {
          console.error("Error counting documents in Settings:", err);
        });

      // Check if the user already exists

      const existingUser = await User.findOne({ address });

      if (existingUser) {
        res.status(409).json({ error: "User already exists" });
        return;
      }

      let user = new User({ address });

      // Create the new user
      let thread;
      thread = new Thread({ user: user._id });
      await thread.save();
      user.threads.push(thread._id);
      await user.save();

      res.status(201).json({ success: true });
    } catch (error) {
      console.log("error", error);
      res.status(500).json({ error: error });
    }
  }
}

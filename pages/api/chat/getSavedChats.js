import Thread from "../models/Thread";
import User from "../models/User";
import connectToDatabase from "../utils/mongoose_conn";

// pages/api/getUserContracts.js

export default async function handler(req, res) {
  if (method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${method} Not Allowed`);
  } else {
    await connectToDatabase();
    const { method } = req;
    const { address, threadId } = req.query;

    console.log(method, address);
    try {
      const user = await User.findOne({ address: address });

      if (!user) {
        res.status(400).json({ error: "User not found" });
        return;
      }

      const thread = await Thread.findOne({ _id: threadId });
      res.status(200).json({ messages: JSON.parse(thread.messages) });
    } catch (error) {
      console.log(error);

      res
        .status(500)
        .json({ error: "An error occurred while retrieving contracts" });
    }
  }
}

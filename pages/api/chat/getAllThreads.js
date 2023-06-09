// pages/api/getUserContracts.js
import mongooseConnectToDatabse from "@/pages/api/utils/mongoose_conn";

import User from "../models/User";
import Thread from "../models/Thread";
import Message from "../models/Message";

export default async function handler(req, res) {
  const { method } = req;
  const { address } = req.query;

  //   console.log(method, address)

  if (method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${method} Not Allowed`);
  } else {
    console.log(address);
    try {
      const db = await mongooseConnectToDatabse();
      if (!db) return;

      let result = await User.findOne({ address }).populate({
        path: "threads",
        model: "Thread",
        populate: {
          path: "messages",
          model: "Message",
        },
      });

      const [threadIds, threadData] = extractThreadData(result);
      console.log(threadIds);
      console.log(threadData);
      res.status(200).send({ threadIds: threadIds, threadData: threadData });
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ error: "An error occurred while retrieving contracts" });
    }
  }
}

function extractThreadData(user) {
  // Extract thread ids into an array
  const threadIds = user.threads.map(thread => thread._id);

  // Extract thread id and messages into an array of objects
  const threadData = user.threads.map(thread => ({
    threadId: thread._id,
    messages: thread.messages,
  }));

  return [threadIds, threadData];
}

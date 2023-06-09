import { Configuration, OpenAIApi } from "openai";
import { checkSignedMessage } from "../middlewares/checkSignedMessage";
import User from "../models/User";
// import mongooseConnectToDatabse from "@/pages/api/utils/mongoose_conn";
import Thread from "../models/Thread";
import Message from "../models/Message";
import { checkUserCredits } from "../middlewares/checkUserCredits";
import { checkUserExists } from "../middlewares/checkUserExists";
import mongooseConnectToDatabse from "@/pages/api/utils/mongoose_conn";
import { spendUserCredits } from "../middlewares/spendUserCredits";
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export default async function handler(req, res) {
  if (!configuration.apiKey) {
    res.status(500).json({
      error: {
        message:
          "OpenAI API key not configured, please follow instructions in README.md",
      },
    });
    return;
  }

  try {
    const db = await mongooseConnectToDatabse();

    if (!db) {
      return;
    }
    await checkSignedMessage(req);
    await checkUserExists(req);
    await checkUserCredits(req, "chat");

    const { messages } = req.body;
    let user = req.body.user;
    const treated_messages = messages.map(item => {
      return {
        role: item.role == "them" ? "assistant" : "user",
        content: item.content,
      };
    });

    const completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: treated_messages,
      max_tokens: 1900,
      temperature: 0.5,
    });

    // minus the credits
    await spendUserCredits(req, "chat");

    const assistantMessage = completion.data.choices[0].message.content.trim();

    let threadId = user.threads[0];

    // console.log("thread id", threadId);

    let thread = await Thread.findOne({ _id: threadId });

    // console.log("thread ", thread);

    try {
      let myMessage = new Message({
        content: treated_messages[treated_messages.length - 1].content,
        role: "user",
        sender: "me",
      });

      await myMessage.save();

      let aiMessage = new Message({
        content: assistantMessage,
        role: "assistant",
        sender: "them",
      });

      await aiMessage.save();

      thread.messages.push(myMessage);
      thread.messages.push(aiMessage);

      await thread.save();

      // let savedMessages = thread.messages;
      let newSavedMessages = [
        ...treated_messages,
        {
          sender: "them",
          role: "assistant",
          content: assistantMessage,
          timestamp: Date.now,
        },
      ];
      // thread.messages = newSavedMessages;
      await thread.save();
      console.log(newSavedMessages);
    } catch (error) {
      console.log(error);
    }

    res.status(200).json({ message: assistantMessage });
  } catch (error) {
    if (error.name == "middleware") {
      console.log("middleware returned", error);
      res.status(error.status).json(error.message);
    } else if (error.response) {
      console.error(error.response.status, error.response.data);
      res.status(error.response.status).json(error.response.data);
    } else {
      console.error(`Error with OpenAI API request: ${error.message}`);
      res.status(500).json({
        error: {
          message: "An error occurred during your request.",
        },
      });
    }
  }
}

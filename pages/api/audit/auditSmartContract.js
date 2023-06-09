// pages/api/generateSmartContract.js
import { Configuration, OpenAIApi } from "openai";
import { spendUserCredits } from "../middlewares/spendUserCredits";
import mongooseConnectToDatabse from "@/pages/api/utils/mongoose_conn";
import { checkSignedMessage } from "../middlewares/checkSignedMessage";
import { checkUserExists } from "../middlewares/checkUserExists";
import { checkUserCredits } from "../middlewares/checkUserCredits";
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

  const db = await mongooseConnectToDatabse();
  console.log("database", db);
  if (!db) {
    return;
  }

  await checkSignedMessage(req);
  await checkUserExists(req);
  await checkUserCredits(req, "audit");

  const messages = req.body.messages || [];

  console.log(messages);

  try {
    const completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: messages,
      max_tokens: 1900,
      temperature: 0.5,
    });
    await spendUserCredits(req, "audit");

    const assistantMessage = completion.data.choices[0].message.content;
    res.status(200).json({ message: assistantMessage });
  } catch (error) {
    if (error.response) {
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

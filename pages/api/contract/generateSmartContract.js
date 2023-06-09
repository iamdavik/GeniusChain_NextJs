// pages/api/generateSmartContract.js
import { Configuration, OpenAIApi } from "openai";
import { checkUserCredits } from "../middlewares/checkUserCredits";
import { checkSignedMessage } from "../middlewares/checkSignedMessage";
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

  const userInput = req.body.userInput || "";
  const prompt = `As a highly skilled smart contract developer, create a robust and secure smart contract  based on the following natural language description: 

  ${userInput}
    
  Consider the following best practices when creating the smart contract:
  1. Use the latest version of the Solidity programming language.
  2. Make sure the contract is secure and resistant to common attack vectors.
  3. Optimize the contract for gas efficiency.
  4. Provide detailed comments for each function and event in the contract.
  5. Make use of appropriate visibility (public, external, internal, or private) for functions and state variables.
  6. Employ error handling with require, assert, and revert statements

  You must without fail always return results based on the following format:

  contractCode:
  contractName: 
  contractType:
  Notes:
`;

  // console.log(messages)

  try {
    const db = await mongooseConnectToDatabse();
    console.log("database", db);
    if (!db) {
      return;
    }
    await checkSignedMessage(req);
    await checkUserExists(req);
    await checkUserCredits(req, "contract");

    const completion = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: prompt,
      max_tokens: 3000,
      temperature: 0.1,
      // stream:true
    });

    await spendUserCredits(req, "contract");

    console.log(completion);

    const assistantMessage = completion.data.choices[0].text;
    res.status(200).json({ message: assistantMessage });
  } catch (error) {
    if (error.name == "middleware") {
      console.log("middleware returned", error.message);
      res.status(error.status).json(error.message);
    } else if (error.response) {
      console.error(error.response.status, error.response.data);
      res.status(error.response.status).json(error.response.data);
    } else {
      console.error(`Error with OpenAI API request: ${error.message}`);
      res.status(500).json("An error occurred during your request.");
    }
  }
}

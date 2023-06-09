import { connectToDatabase } from "@/pages/api/utils/mongodb";
import { checkSignedMessage } from "../middlewares/checkSignedMessage";
import mongooseConnectToDatabse from "@/pages/api/utils/mongoose_conn";
import Contract from "../models/Contract";
import { checkUserExists } from "../middlewares/checkUserExists";
import { checkUserCredits } from "../middlewares/checkUserCredits";

export default async function handler(req, res) {
  await checkSignedMessage(req, res);
  const { method } = req;

  const { signerAddress, contractInfo } = req.body;
  const { code, contractName, contractType, notes } = contractInfo;
  console.log(signerAddress);

  if (method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${method} Not Allowed`);
  } else {
    try {
      // const { db } = await connectToDatabase();
      // const user = await db
      //   .collection("users")
      //   .findOne({ address: signerAddress });

      let db = await mongooseConnectToDatabse();
      console.log("database", db);
      if (!db) {
        return;
      }

      await checkSignedMessage(req);
      await checkUserExists(req);
      // await checkUserCredits(req, "contract");

      let contract = new Contract({
        userId: req.body.user._id,
        contractCode: code,
        contractName,
        contractType,
        notes,
      });
      await contract.save();

      res.status(200).json({ message: "Contract saved successfully" });
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ error: "An error occurred while saving the contract" });
    }
  }
}

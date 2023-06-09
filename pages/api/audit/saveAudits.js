import { connectToDatabase } from "@/pages/api/utils/mongodb";
import { checkSignedMessage } from "../middlewares/checkSignedMessage";
import mongooseConnectToDatabse from "@/pages/api/utils/mongoose_conn";
import Audit from "../models/Audit";
import { checkUserExists } from "../middlewares/checkUserExists";

export default async function handler(req, res) {
  await checkSignedMessage(req, res);
  const { method } = req;

  const { signerAddress, audit: auditData } = req.body;
  // const {code, contractName, contractType,notes} = contractInfo;
  console.log(signerAddress);

  if (method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${method} Not Allowed`);
  } else {
    try {
      let db = await mongooseConnectToDatabse();
      console.log("database", db);
      if (!db) {
        return;
      }

      await checkSignedMessage(req);
      await checkUserExists(req);

      let audit = new Audit({
        user: req.body.user._id,
        audit: auditData,
      });
      await audit.save();

      res.status(200).json({ message: "Audit saved successfully" });
    } catch (error) {
      console.log("error ", error);
      res
        .status(500)
        .json({ error: "An error occurred while saving the contract" });
    }
  }
}

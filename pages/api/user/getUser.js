import mongooseConnectToDatabse from "@/pages/api/utils/mongoose_conn";
import User from "../models/User";

export default async function handler(req, res) {
  const { method } = req;
  const { address } = req.query;
  if (method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${method} Not Allowed`);
  } else {
    try {
      const db = await mongooseConnectToDatabse();

      const user = await User.findOne({ address: address });
      res.status(200).json({ user });
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ error: "An error occurred while retrieving current user" });
    }
  }
}

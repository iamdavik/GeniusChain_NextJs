// pages/api/getUserContracts.js
import { connectToDatabase } from "@/pages/api/utils/mongodb";

export default async function handler(req, res) {

  console.log('davik'
  )
  const { method } = req;
  const { address } = req.query;

  console.log(method, address)

  if (method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${method} Not Allowed`);
  } else {
    try {
      const { db } = await connectToDatabase();

      console.log(db, 'db')

      console.log( 'waiting')
      const user = await db.collection("users").findOne({ address:address });
      
      if (!user) {
        res.status(400).json({ error: "User not found" });
        return;
      }

      const contracts = await db.collection("contracts").find({ userId: user._id }).toArray();
      // console.log(contracts);
      res.status(200).json({ contracts });
    } catch (error) {
      console.log(error)
      res.status(500).json({ error: "An error occurred while retrieving contracts" });
    }
  }
}

import mongooseConnectToDatabse from "@/pages/api/utils/mongoose_conn";
import AuditedContract from "../models/AuditedContract";

export default async function handler(req, res) {
  const { method } = req;
  const { type } = req.query;

  if (method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${method} Not Allowed`);
  } else {
    try {
      const db = await mongooseConnectToDatabse();

      const contracts = await AuditedContract.find();

      const transformedContract = {};

      contracts.forEach((contract) => {
        const contractType = contract.contractType;

        if (!transformedContract.hasOwnProperty(contractType)) {
          transformedContract[contractType] = [];
        }

        transformedContract[contractType].push({
          ...contract._doc,
          value: contract.id,
          label: contract.contractName,
        });
      });

      res.status(200).json({ contracts: transformedContract });
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ error: "An error occurred while retrieving contract types" });
    }
  }
}

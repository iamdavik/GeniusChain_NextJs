import { ethers } from "ethers";
import User from "../models/User";

export async function checkUserExists(req) {
  let error = new Error();

  const { signerAddress } = req.body;

  console.log("siger address ", signerAddress);

  try {
    let user = await User.findOne({ address: signerAddress });
    if (!user) {
      console.log("user not found");
      error.message = "User not found";
      throw error;
    } else {
      req.body.user = user;
    }
  } catch (error) {
    error.middlewareName = "checUserExists";
    error.status = 400;
    error.name = "middleware";

    throw error;
  }
}

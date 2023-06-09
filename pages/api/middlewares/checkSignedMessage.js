import { ethers } from "ethers";

export async function checkSignedMessage(req) {
  const { message, signature } = req.body;

  try {
    let error = new Error();
    // let isSuccess = true;
    error.status = 400;
    error.message = null;

    if (!message || !signature) {
      error.status = 400;
      error.message = "Missing signed message or signature in the request body";
      throw error;
    } else {
      const signerAddress = ethers.utils.verifyMessage(message, signature);
      req.body.signerAddress = signerAddress;
    }
  } catch (error) {
    error.middlewareName = "checkSignedMessage";
    error.name = "middleware";
    error.status = 400;
    throw error;
  }
}

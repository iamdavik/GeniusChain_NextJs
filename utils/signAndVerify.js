
import axios from 'axios';
import { ethers } from 'ethers';

export async function signMessageAndVerify(provider) {
  // Sign the message
  const message = "Please sign this message to verify your address.";
  const signer = provider.getSigner();
 return await signer.signMessage(message);

}

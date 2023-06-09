import axiosInstance from "@/utils/axiosInstance";
import { toast } from "react-toastify";

export const getAllContract = async () => {
  try {
    const { data } = await axiosInstance.get(
      "/api/contract/getAllSmartContract"
    );
    return data.contracts;
  } catch (error) {
    if (error.response) {
      if (error.response.status >= 500) {
        toast.error("An error occurred with the server");
      } else if (error.response.status >= 400 && error.response.status < 500) {
        toast.error(error.response.data);
      }
      console.error("Error sending message:", error);
    } else {
      console.log("error sending request", error);
      toast.error("An error occurred");
    }
  }
};

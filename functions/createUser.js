import axiosInstance from "@/utils/axiosInstance";


export async function createUser(address) {
  try {
    const response = await axiosInstance.post("/api/createUser", { address });
    

    if (response.status === 201) {
      // User created successfully
      console.log('response ', response)
      return response;
    }
  } catch (error) {
    // Handle the error
    throw(error)
  }
}

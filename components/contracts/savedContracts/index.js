import Card from "@/components/ui/Card";
import Grid from "@/components/skeleton/Grid";
import SavedContract from "../savedContract";
import axiosInstance from "@/utils/axiosInstance";
import React from "react";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";

function SavedContracts() {
  const [userContracts, setUserContracts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showContract, setShowContract] = useState(false);

  const [clickedContract, setClickedContract] = useState(null);
  const [phase, setPhase] = useState("idle");
  const [error, setError] = useState(false);
  const { address } = useAccount();

  const getUserContracts = async () => {
    setPhase("pending");
    try {
      const response = await axiosInstance.get(
        `/api/contract/getUserSmartContracts?address=${address}`
      );
      console.log(response.data);
      setUserContracts(response.data.contracts);
      setPhase("success");
    } catch (error) {
      setPhase("error");
      console.error(
        "Error fetching user contracts:",
        error.response?.data?.error || error.message
      );
      setError("Error fetching ");
      // toast
    } finally {
      // setPhase();
    }
  };

  useEffect(() => {
    getUserContracts();
  }, []);

  return (
    <>
      {showContract && (
        <SavedContract
          contractData={clickedContract}
          showContract={showContract}
          closeContract={() => setShowContract(false)}
        />
      )}
      {phase === "pending" && (
        <Card>
          <Grid count={3} />
        </Card>
      )}

      {
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {phase === "success" &&
            userContracts.map((contract) => (
              <Card className="cursor-pointer">
                <div
                  onClick={() => {
                    setClickedContract(contract);
                    setShowContract(true);
                  }}
                >
                  <p> {contract?.contractName}</p>
                  <p>{contract.contractType} </p>
                </div>
              </Card>
            ))}

          {/* <Card>

   </Card> */}
        </div>
      }
    </>
  );
}

export default SavedContracts;

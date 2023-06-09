import Card from "@/components/ui/Card";
import Grid from "@/components/skeleton/Grid";
import axiosInstance from "@/utils/axiosInstance";
import React from "react";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import SavedAudit from "../savedAudit";

function SavedAudits() {
  const [userAudits, setUserAudits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [phase, setPhase] = useState("idle");
  const [error, setError] = useState(false);
  const { address } = useAccount();
  const [showAudit, setShowAudit] = useState(false);
  const [clickedAudit, setClickedAudit] = useState(null);
  console.log(address);
  const getUserAudits = async () => {
    setPhase("pending");
    try {
      const response = await axiosInstance.get(
        `/api/audit/getUserAudits?address=${address}`
      );
      console.log(response.data);
      let transformed = response.data.audits.map(item => {
        return {
          ...item,
          audit: JSON.parse(item.audit),
        };
      });

      console.log("transformed", transformed);
      setUserAudits(transformed);
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
    getUserAudits();
  }, []);

  return (
    <>
      {showAudit && <SavedAudit
        auditData={clickedAudit}
        showAudit={showAudit}
        closeAudit={() => setShowAudit(false)}
      />}
      {phase === "pending" && (
        <Card>
          <Grid count={3} />
        </Card>
      )}

      {
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {phase === "success" &&
            userAudits.map(audit => (
              <Card className="cursor-pointer">
                <div
                  onClick={() => {
                    console.log("davik");
                    setClickedAudit(audit.audit);
                    setShowAudit(true);
                  }}
                >
                  <p> {audit.audit?.contractName}</p>
                  <p>{audit.audit?.contractType} </p>
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

export default SavedAudits;

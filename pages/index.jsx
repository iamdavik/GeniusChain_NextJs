import Connector from "@/components/connector";
import RootLayout from "@/components/layout";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import React, { useState } from "react";
import { useAccount, useConnect, useEnsName } from "wagmi";
import { InjectedConnector } from "wagmi/connectors/injected";

function Index() {
  const { address, isConnected } = useAccount();
  const [showConnector, setShowConnector] = useState(false);

  return (
    <>
      <Connector
        showConnector={showConnector}
        setShowConnector={setShowConnector}
      />
      {/* {!isConnected && <div className="top-[58px] cursor-pointer" onClick={() => setShowConnector(true)}>Connect</div>}
            {
                isConnected && <RootLayout>
                </RootLayout>
            } */}

      {isConnected ? (
        <RootLayout></RootLayout>
      ) : (
        <div
          className="top-[58px] cursor-pointer"
          onClick={() => setShowConnector(true)}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100vh",
            }}
          >
            <div className="max-w-xs w-full">
              <Button>Connect</Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Index;

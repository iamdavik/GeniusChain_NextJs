"use client";
import React, { useEffect, useState } from "react";
import { useAccount, useConnect, useSigner, useSignMessage } from "wagmi";
import { disconnect } from "@wagmi/core";
import Modal from "../ui/Modal";
// import Button from '../ui/Button';
import Button from "../connector/Button";
import { createUser } from "@/functions/createUser";
import { signMessageAndVerify } from "@/utils/signAndVerify";
import useLocalStorage from "@/hooks/useLocalStorage";

function Connector({ showConnector, setShowConnector }) {
  const closeConnector = () => {
    setShowConnector(false);
  };

  const [signedMessage, setSignedMessage] = useLocalStorage(
    "signedMessage",
    null
  );
  const {
    connector: activeConnector,
    isConnected,
    address,
  } = useAccount({
    onConnect({ address, connector, isReconnected }) {},
  });

  useEffect(() => {
    if (!activeConnector) return;
    if (activeConnector.name === "MetaMask") {
      window.ethereum.on("accountsChanged", (accounts) => {
        window.location.reload();
      });
    }
  }, [activeConnector]);

  const { data, isError, isSuccess, signMessageAsync } = useSignMessage();

  const { connect, connectors, error, isLoading, pendingConnector } =
    useConnect({
      async onSuccess() {
        try {
          await createUserAndSign();
        } catch (error) {}
      },
    });
  // console.log(connectors)

  const createUserAndSign = async () => {
    let message;
    let signature;
    try {
      message = "verify address";
      signature = await signMessageAsync({
        message: message,
      });

      // console.log(message, "message")
    } catch (error) {
      await disconnect();
      console.log(error);
    }
    try {
      const response = await createUser(address);
    } catch (error) {
      if (error.response) {
        console.error(error.response.data.error, "error");
      } else {
        console.error("Error:", error.message, "error");
      }
    } finally {
      setSignedMessage({ message, signature });
      setShowConnector(false);
    }
  };

  return (
    <Modal
      centered={true}
      title="Connect Wallet"
      activeModal={showConnector}
      onClose={closeConnector}
    >
      <div className="flex flex-col space-y-4">
        {connectors.map((connector, index) => {
          return (
            <Button
              key={index}
              className={"color-primary"}
              onClick={() => {
                connect({ connector });
              }}
              img_icon={`/images/${
                connector.id === "injected" ? "metamask" : connector.id
              }.svg`}
            >
              {connector.name === "injected" ? "MetaMask" : connector.name}
            </Button>
          );
        })}
      </div>
    </Modal>
  );
}

export default Connector;

{
  /* <Button
// icon="heroicons-outline:newspaper"
text={connector.name}
disabled={!connector.ready}
// isLoading={pendingConnector?.id === connector.id ? true: false}
key={connector.id}
onClick={() => connect({ connector })}
>
{isLoading &&
    pendingConnector?.id === connector.id &&
    ' connecting'}
</Button> */
}

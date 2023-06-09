import { useState, Fragment, useEffect } from "react";
import { ethers } from "ethers";
import { toast } from "react-toastify";
import dynamic from "next/dynamic";
import useSWR from "swr";
import {
  useAccount,
  useBalance,
  usePrepareContractWrite,
  useContractWrite,
  useWaitForTransaction,
  readContracts,
} from "wagmi";

import Card from "@/components/ui/Card";
import Modal from "../ui/Modal";
const Button = dynamic(async () => import("@/components/ui/Button"));

import { tokenAbi } from "@/utils/abi/TokenAbi";
import { ticketAbi } from "@/utils/abi/TicketAbi";
import { getCreditBalance } from "@/functions/getUserCredit";

export default function CreditSwap({ showSwap, setShowSwap }) {
  const { address } = useAccount();

  const {
    data: credit,
    error: creditError,
    mutate,
  } = useSWR(`/api/user/getUser?address=${address}`, getCreditBalance);

  const closeSwap = () => {
    setShowSwap(false);
  };
  const ticketSystemContract = {
    address: process.env.NEXT_PUBLIC_TICKET_CONTRACT,
    abi: ticketAbi,
  };
  const tokenContract = {
    address: process.env.NEXT_PUBLIC_TOKEN_CONTRACT,
    abi: tokenAbi,
  };

  const [tokenBalance, setTokenBalance] = useState("");
  const { data: balance } = useBalance({
    address,
    token: tokenContract.address,
    chainId: 11155111,
    formatUnits: "ether",
    watch: showSwap,
  });
  const [swapValue, setSwapValue] = useState("");
  const [allowanceBalance, setAllowanceBalance] = useState("");

  // Get the approved balance for the ticket contract to spend user's token
  const getTokenAllowance = async () => {
    if (address) {
      try {
        const approvedToken = await readContracts({
          contracts: [
            {
              ...tokenContract,
              functionName: "allowance",
              args: [address, ticketSystemContract.address],
            },
          ],
        });

        const hexValue = approvedToken[0]?._hex;
        // Convert hex to BigNumber
        const bn = ethers.BigNumber.from(hexValue);
        // Convert BigNumber to Ether
        const etherValue = ethers.utils.formatEther(bn);
        setAllowanceBalance(Number(etherValue));
      } catch (err) {
        console.log(err);
      }
    } else {
      toast.info("Connect your wallet");
    }
  };

  // Prepare for writing to approve Ticket contract to spend user's token
  const {
    config: tokenApproveConfig,
    error: prepareError,
    isError: isPrepareError,
  } = usePrepareContractWrite({
    address: tokenContract.address,
    abi: tokenContract.abi,
    functionName: "approve",
    chainId: 11155111,
    args: [ticketSystemContract.address, Number(swapValue)],
  });

  const {
    data,
    error,
    isError,
    write: approve,
  } = useContractWrite(tokenApproveConfig);

  const { isLoading: approveIsLoading, isSuccess: approveSuccessful } =
    useWaitForTransaction({
      hash: data?.hash,
    });

  // Prepare for writing to deposit token to Ticket contract in exchange for credits
  const {
    config: depositConfig,
    error: prepareDepositError,
    isError: isPrepareDepositError,
  } = usePrepareContractWrite({
    address: ticketSystemContract.address,
    abi: ticketSystemContract.abi,
    functionName: "deposit",
    chainId: 11155111,
    args: [Number(swapValue)],
  });

  const {
    data: depositData,
    error: depositWriteError,
    isError: depositIsError,
    write: deposit,
  } = useContractWrite(depositConfig);

  const {
    isLoading: depositIsLoading,
    isSuccess: depositSuccessful,
    error: depositError,
  } = useWaitForTransaction({
    hash: depositData?.hash,
  });

  useEffect(() => {
    getTokenAllowance();
  }, []);

  // depositSuccessful && setSwapValue(0);

  //   This useEffect is used to stop Next ssr rendering error
  useEffect(() => setTokenBalance(balance?.formatted), [balance]);

  //   Update credit balance after every swap
  useEffect(() => {
    depositSuccessful && setSwapValue("");
    depositSuccessful && mutate();
    console.log(depositSuccessful);
  }, [depositSuccessful]);
  return (
    <Modal
      centered={true}
      title="Credit Swap"
      activeModal={showSwap}
      onClose={closeSwap}
    >
      <div className="w-full flex justify-center max-w-2xl m-auto">
        <Card noborder w-full>
          <div className="w-full flex flex-col gap-6">
            <div className="w-full flex flex-col">
              <div
                className={`w-full p-4 bg-slate-300 flex justify-between rounded-md dark:bg-gray-900`}
              >
                <div className="flex flex-col w-1/2">
                  <div className="text-primary-500 text-lg">Send</div>
                  <div className="text-slate-600 text-3xl w-full">
                    <input
                      autoComplete="off"
                      autoCorrect="off"
                      placeholder="0"
                      className="bg-transparent no-spinner border-none focus:outline-0 [outline]:border-none placeholder-slate-600 font-medium w-full"
                      onChange={(e) => setSwapValue(e.target.value)}
                      value={swapValue}
                      minLength="1"
                      type="number"
                    />
                  </div>
                  <p className="text-slate-600 text-xs">~$0.00</p>
                </div>
                <div className="flex flex-col gap-2 w-full items-end">
                  <div className="flex gap-1.5 justify-center items-center">
                    <p className="text-slate-600 text-sm">
                      Balance: {tokenBalance}
                    </p>
                    <div
                      className="border border-sky-500 rounded-lg p-1 uppercase cursor-pointer"
                      onClick={() => {
                        setSwapValue(tokenBalance);
                      }}
                    >
                      <p className="text-xs">max</p>
                    </div>
                  </div>
                  <p className="tracking-wider">Genius Token</p>
                </div>
              </div>
              <div className="h-2 relative w-full">
                <div className="w-10 h-10 rounded-md bg-slate-500 absolute -top-4 z-100 left-[calc(50%-24px)] cursor-pointer border-1 border-rose-500 flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-6 h-6 text-white w-full"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 7.5L7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5"
                    />
                  </svg>
                </div>
              </div>
              <div className="w-full p-4 bg-slate-300 flex justify-between rounded-md dark:bg-gray-900">
                <div className="flex flex-col ">
                  <div className="text-primary-500 text-lg">You receive</div>
                  <p className="text-slate-600 text-3xl">{swapValue * 10}</p>
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex gap-1.5 justify-center items-center">
                    <p className="text-slate-600 text-sm">
                      Balance: {credit || 0}
                    </p>
                  </div>
                  <p className="tracking-wider">Credits</p>
                </div>
              </div>
            </div>
            <div className="w-full p-15">
              <Button
                text={
                  !address
                    ? "Connect Wallet"
                    : approveIsLoading
                      ? "Approving ..."
                      : depositIsLoading
                        ? "Depositing ..."
                        : swapValue.length === 0
                          ? "Enter Amount"
                          : swapValue.length > 0 &&
                            Number(swapValue) > allowanceBalance
                            ? "Approve"
                            : isPrepareDepositError
                              ? "Insufficient Balance"
                              : "Get Credits"
                }
                onClick={() => {
                  Number(swapValue) > allowanceBalance && approve?.();
                  Number(swapValue) <= allowanceBalance && deposit?.();
                }}
                disabled={
                  // isPrepareDepositError ||
                  depositIsLoading || approveIsLoading || !address
                }
              />
            </div>
          </div>
        </Card>
      </div>
    </Modal>
  );
}

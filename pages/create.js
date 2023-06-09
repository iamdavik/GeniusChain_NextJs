// components/SmartContractGenerator.js
import { useState, Fragment, useEffect } from "react";
import dynamic from "next/dynamic";
import useSWR from "swr";
import RootLayout from "../components/layout/index";
import Card from "@/components/ui/Card";
import Textinput from "@/components/ui/Textinput";
const Button = dynamic(async () => import("@/components/ui/Button"));
const AceEditor = dynamic(
  async () => {
    const ace = await import("react-ace");
    await import("ace-builds/src-noconflict/ace");
    await import("ace-mode-solidity/build/remix-ide/mode-solidity");
    await import("ace-builds/src-noconflict/theme-cobalt");

    import("brace/ext/language_tools");
    import("brace/ext/searchbox");
    // import ("brace/theme/monokai");

    return ace.default;
  },
  { ssr: false }
);
import { Tab } from "@headlessui/react";
import { Icon } from "@iconify/react";
import { toast } from "react-toastify";
import Accordion from "@/components/ui/Accordion";
import { setFaveCheck } from "@/components/partials/app/email/store";
import axiosInstance from "@/utils/axiosInstance";
import SavedContracts from "@/components/contracts/savedContracts";
import { getAllContract } from "@/functions/getAllContract";
import { getCreditBalance } from "@/functions/getUserCredit";
import { useAccount } from "wagmi";
const buttons = [
  {
    title: "Create Contract",
    icon: "heroicons-outline:home",
  },
  {
    title: "Saved Contracts",
    icon: "heroicons-outline:user",
  },
];

function parseContractInfo(text) {
  const fields = ["contractCode", "contractName", "contractType", "notes"];
  const result = {};

  fields.forEach(field => {
    const regex = new RegExp(
      `${field}:\\s*([\\s\\S]*?)(?=(?:${fields.join("|")}):|$)`,
      "i"
    );
    const match = text.match(regex);
    result[field] = match ? match[1].trim() : "";
  });

  return result;
}

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function SmartContractGenerator() {
  const { address } = useAccount();
  const { data: allContracts = [], error: contractError } = useSWR(
    "/api/contract/getAllSmartContract",
    getAllContract
  );

  const { mutate: refetchCredit } = useSWR(
    `/api/user/getUser?address=${address}`,
    getCreditBalance
  );

  const [userInput, setUserInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isOpened, setIsOpened] = useState(false);
  const [contractTypes, setContractTypes] = useState("");
  // const [allContracts, setAllContracts] = useState([]);
  const [selectedContract, setSelectedContract] = useState("");
  const [contractInfo, setContractInfo] = useState({
    code: "",
    notes: "",
    contractName: "",
    contractType: "",
  });

  const sendMessage = async () => {
    try {
      if (userInput.trim() === "") return;
      setIsGenerating(true);

      const response = await axiosInstance.post(
        "/api/contract/generateSmartContract",
        {
          userInput,
        }
      );
      const assistantMessage = response.data.message;

      // To refetch credit balance
      refetchCredit();

      // setReply(assistantMessage);
      const { contractCode, contractName, contractType, notes } =
        parseContractInfo(assistantMessage);
      console.log(contractCode, contractName);
      setContractInfo({
        code: contractCode,
        contractName,
        contractType,
        notes,
      });
    } catch (error) {
      if (error.response) {
        if (error.response.status >= 500) {
          toast.error("An error occurred with the server");
        } else if (
          error.response.status >= 400 &&
          error.response.status < 500
        ) {
          toast.error(error.response.data);
        }
        console.error("Error sending message:", error);
      } else {
        console.log("error sending request", error);
        toast.error("An error occurred");
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const saveContract = async () => {
    try {
      setIsSaving(true);
      const response = await axiosInstance.post(
        "/api/contract/saveSmartContract",
        { contractInfo }
      );
      toast.success("Contract saved", {
        position: "top-right",
        autoClose: 1500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
      console.log(response.data.message);
    } catch (error) {
      toast.error(error.message);
      console.error(
        "Error saving contract:",
        error.response?.data?.error || error.message
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleSelectContract = contract => {
    setSelectedContract(contract);
    setContractInfo({
      code: contract.contractCode,
      notes: contract.notes,
      contractName: contract.contractName,
      contractType: contract.contractType,
    });

    setIsOpened(false);
  };

  return (
    <RootLayout>
      <Card title="Genius Create">
        <Tab.Group>
          <Tab.List className="lg:space-x-8 md:space-x-4 space-x-0 rtl:space-x-reverse">
            {buttons.map((item, i) => (
              <Tab as={Fragment} key={i}>
                {({ selected }) => (
                  <button
                    className={`text-sm font-medium mb-7 capitalize bg-white
           dark:bg-slate-800 focus:outline-none px-2
            transition duration-150 before:transition-all before:duration-150 relative 
            before:absolute before:left-1/2 before:bottom-[-6px] before:h-[1.5px] before:bg-primary-500 
            before:-translate-x-1/2 
            
            ${
              selected
                ? "text-primary-500 before:w-full"
                : "text-slate-500 before:w-0 dark:text-slate-300"
            }
            `}
                  >
                    {item.title}
                  </button>
                )}
              </Tab>
            ))}
          </Tab.List>
          <Tab.Panels>
            <Tab.Panel>
              <div className="text-slate-600 dark:text-slate-400 text-sm font-normal mb-6">
                <div>
                  <div></div>
                  <div className="mb-6">
                    <Textinput
                      className="mb-2"
                      value={userInput}
                      onChange={e => setUserInput(e.target.value)}
                      placeholder="Enter your message"
                    ></Textinput>
                    <Button
                      onClick={sendMessage}
                      icon="heroicons:document-minus"
                      text="Generate"
                      className="btn-primary rounded-full"
                      loadingMessage="Generating..."
                      isLoading={isGenerating}
                    />
                  </div>

                  <div className="relative">
                    {isGenerating && (
                      <div
                        className="absolute left-0 w-full h-full backdrop-blur-md z-10"
                        style={{
                          backdropFilter: "blur(2px)",
                        }}
                      >
                        <div className="absolute top-8 right-8">
                          <Icon
                            icon="clarity:settings-line"
                            className="text-slate-50 text-lg animate-spin"
                          />
                        </div>
                      </div>
                    )}
                    <div>
                      {
                        <AceEditor
                          mode="solidity"
                          theme="cobalt"
                          value={contractInfo.code}
                          name="generatedCodeEditor"
                          editorProps={{ $blockScrolling: true }}
                          fontSize={12}
                          showPrintMargin={false}
                          showGutter={true}
                          highlightActiveLine={true}
                          style={{
                            width: "100%",
                            backdropFilter: "blur(20px)",
                          }}
                          enableBasicAutocompletion={true}
                          enableLiveAutocompletion={true}
                          setOptions={{
                            enableSnippets: true,
                            enableEmmet: true,
                            showLineNumbers: true,
                            tabSize: 2,
                            useWorker: false,
                          }}
                        />
                      }
                      <div
                        onClick={() => {
                          toast;
                          navigator.clipboard.writeText(contractInfo.code);
                          toast.success("Copied", {
                            position: "top-right",
                            autoClose: 1500,
                            hideProgressBar: false,
                            closeOnClick: true,
                            pauseOnHover: true,
                            draggable: true,
                            progress: undefined,
                            theme: "light",
                          });
                        }}
                        style={{
                          position: "absolute",
                          right: "2rem",
                          top: "2rem",
                        }}
                      >
                        <Icon
                          icon="heroicons:clipboard-document"
                          style={{
                            cursor: "pointer",
                            fontSize: "1rem",
                            color: "white",
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {contractInfo.notes && (
                <Card title={"notes"}>{contractInfo.notes}</Card>
              )}
              {contractInfo.code && (
                <Button
                  icon="heroicons:document-minus"
                  text="Save Contract"
                  className="btn-primary rounded-full mt-2 pointer"
                  loadingMessage="Saving..."
                  isLoading={isSaving}
                  onClick={saveContract}
                />
              )}
            </Tab.Panel>
            <Tab.Panel>
              <div className="text-slate-600 dark:text-slate-400 text-sm font-normal">
                <SavedContracts />
              </div>
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      </Card>
      <div
        className="fixed h-14 w-14 max-[768px]:bottom-16 bottom-1/2 -right-9 bg-slate-900 rounded flex justify-left items-center cursor-pointer dark:bg-gray-700"
        onClick={() => setIsOpened(!isOpened)}
      >
        <Icon
          icon="heroicons:document-plus"
          className={`w-6 h-6 text-white font-semibold`}
        />
      </div>
      <div
        className={`fixed top-1/4 right-12 ${
          isOpened
            ? "w-1/2 max-[769px]:w-full max-[769px]:right-3 max-[769px]:bottom-12 p-6"
            : "w-0"
        }  ease-in duration-300 p-0 truncate`}
      >
        <Card title="Templates" subtitle="Select a contract template">
          <Tab.Group>
            <Tab.List className="flex space-x-1 rounded-xl bg-blue-900/20 p-1">
              {Object.keys(allContracts).map((contracts, i) => (
                <Tab
                  key={i}
                  className={({ selected }) =>
                    classNames(
                      "w-2/12 rounded-lg py-2.5 text-sm font-medium leading-5 text-blue-700",
                      "ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2",
                      selected
                        ? "bg-white shadow"
                        : "text-blue-100 hover:bg-white/[0.12] hover:text-white"
                    )
                  }
                >
                  {contracts}
                </Tab>
              ))}
            </Tab.List>
            <Tab.Panels className="mt-2">
              {Object.values(allContracts).map((contracts, idx) => (
                <Tab.Panel
                  key={idx}
                  className={classNames(
                    "rounded-xl bg-white p-3",
                    "ring-white ring-opacity-60 ring-offset-2  focus:outline-none focus:ring-2"
                  )}
                  //ring-offset-blue-400
                >
                  <ul className="flex items-center  w-full gap-4 flex-wrap pt-8">
                    {contracts.map(contract => (
                      <li
                        key={contract.contractName}
                        className="relative rounded-md bg-gray-100 hover:bg-blue-100 cursor-pointer h-36  p-6"
                        onClick={() => handleSelectContract(contract)}
                      >
                        <div className="flex flex-col gap-4">
                          <div className="flex flex-col gap-1">
                            <h3 className="text-sm font-bold leading-5">
                              Name
                            </h3>
                            <p className="text-sm font-medium">
                              {contract.contractName}
                            </p>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </Tab.Panel>
              ))}
            </Tab.Panels>
          </Tab.Group>
        </Card>
      </div>
    </RootLayout>
  );
}

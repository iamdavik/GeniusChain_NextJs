import RootLayout from "../components/layout/index";
import React, { Fragment, useState } from "react";
import dynamic from "next/dynamic";
import Card from "@/components/ui/Card";
import { Icon } from "@iconify/react";
import { Tab } from "@headlessui/react";
const Button = dynamic(async () => import("@/components/ui/Button"));
import axiosInstance from "@/utils/axiosInstance";
import { toast } from "react-toastify";
import SavedAudits from "@/components/audits/savedAudits";

// content: `Please analyze and audit the provided smart contract thoroughly, adhering to the highest industry standards and best practices. Make sure to evaluate the following aspects:

// Security: Identify any vulnerabilities, potential exploits, or loopholes in the code that could compromise the safety and integrity of the smart contract. Evaluate the contract's resistance to common attacks, such as reentrancy, overflow/underflow, and race conditions.

// Functionality: Ensure that the smart contract's code is written in a way that meets the intended purpose, with all functions operating correctly and efficiently. Verify that the contract's logic is sound and there are no unintended consequences in its execution.

// Compliance: Assess whether the smart contract adheres to relevant regulatory requirements, industry standards, and established best practices, such as EIPs (Ethereum Improvement Proposals) for Ethereum-based contracts.

// Gas optimization: Evaluate the smart contract's efficiency in terms of gas consumption, and provide suggestions for minimizing gas costs without compromising functionality or security.

// Code quality: Review the contract's code for readability, maintainability, and modularity. Provide recommendations for improving the overall code quality, including adherence to accepted coding standards and guidelines.

// Tokenomics (if applicable): Analyze the tokenomics of the smart contract, ensuring that the token distribution, supply, and mechanisms are well-designed, fair, and resistant to manipulation or abuse.

// Decentralization: Assess the degree of decentralization in the smart contract, ensuring that it minimizes reliance on central authorities and promotes the core principles of blockchain technology.

// Once you have completed the audit, provide a detailed report outlining your findings, including any identified issues or vulnerabilities, and recommendations for improvement. Also, include an overall assessment of the smart contract's quality and readiness for deployment.

function analyzeContractText(text) {
  const fields = [
    "summary",
    "contractName",
    "contractType",
    "code",
    "security",
    "functionality",
    "gasOptimization",
    "codeQuality",
    "overallAssessment",
  ];
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

function divideCodeResult(text) {
  const tripleBacktickRegex = /```([\s\S]*?)```/;
  const match = text.match(tripleBacktickRegex);

  if (match) {
    const firstPart = text.substring(0, match.index).trim();
    const codePart = match[1].trim();

    return { firstPart, codePart };
  } else {
    return { firstPart: text, codePart: "" };
  }
}

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

const buttons = [
  {
    title: "Audit Contract",
    icon: "heroicons:academic-cap",
  },
  {
    title: "Saved Audits",
    icon: "heroicons-outline:user",
  },
];
function Audit() {
  // const [isAuditing, setIsAuditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [code, setCode] = useState("/// paste code here");
  const [auditReport, setAuditReport] = useState({
    status: "idle",
    data: null,
    error: null,
  });
  const [messages, setMessages] = useState([
    {
      role: "system",
      content: `Please analyze and audit the provided smart contract thoroughly, adhering to the highest industry standards and best practices. Make sure to evaluate the following aspects:

      summary: Summarize the issues found, an the contract

      contractName: only display the contract name

      contractType: only display the contract type

      code: If there are any code corrections,explain and give the correct code inside a code block, else return null
      Security: Identify any vulnerabilities, potential exploits, or loopholes in the code that could compromise the safety and integrity of the smart contract. Evaluate the contract's resistance to common attacks, such as reentrancy, overflow/underflow, and race conditions.
      
      functionality: Ensure that the smart contract's code is written in a way that meets the intended purpose, with all functions operating correctly and efficiently. Verify that the contract's logic is sound and there are no unintended consequences in its execution.
    
      
      gasOptimization: Evaluate the smart contract's efficiency in terms of gas consumption, and provide suggestions for minimizing gas costs without compromising functionality or security.
      
      codeQuality: Review the contract's code for readability, maintainability, and modularity. Provide recommendations for improving the overall code quality, including adherence to accepted coding standards and guidelines.

      overallAssessment:


     you must respond to my prompt always using in the following format:

      summary:
contractName:
contractType:
code:
security:
functionality:
gasOptimization:
codeQuality:
overallAssessment:



`,
    },
  ]);

  const saveAudit = async () => {
    try {
      setIsSaving(true);
      let _data = { ...auditReport.data, code };
      const response = await axiosInstance.post("/api/audit/saveAudits", {
        audit: JSON.stringify(_data),
      });
      toast.success("Audit saved", {
        position: "top-right",
        autoClose: 1500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
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

  const auditCode = async () => {
    try {
      setAuditReport(prev => ({
        ...prev,
        data: null,
        status: "pending",
      }));
      const userMessage = { role: "user", content: code };
      // setMessages((prevMessages) => [messages[0], userMessage]);
      const newMessage = [messages[0], userMessage];
      const response = await axiosInstance.post(
        "/api/audit/auditSmartContract",
        {
          messages: newMessage,
        }
      );

      const assistantMessage = response.data.message;
      const data = analyzeContractText(assistantMessage);

      setAuditReport(prev => ({
        ...prev,
        data,
        status: "success",
      }));
    } catch (error) {
      toast.error(error.message);
      console.error("Error sending message:", error);
      setAuditReport(prev => ({
        ...prev,
        status: "failed",
        error: error.message,
      }));
    } finally {
      setAuditReport(prev => ({
        ...prev,
        status: "idle",
      }));
    }
  };

  return (
    <RootLayout>
      <Card title="audit">
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
              <div className="relative">
                {auditReport.status === "pending" && (
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
                <AceEditor
                  onChange={e => {
                    // console.log(e, "code");
                    setCode(e);
                  }}
                  mode="solidity"
                  theme="cobalt"
                  value={code}
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
                <div
                  onClick={() => {
                    toast;
                    navigator.clipboard.writeText(code);
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

              <Button
                onClick={auditCode}
                icon="heroicons:academic-cap"
                text="Audit"
                className="btn-primary rounded-full mt-2"
                loadingMessage="Auditing..."
                isLoading={auditReport.status === "pending"}
              />

              {auditReport.data && (
                <div>
                  <h5 className="mt-8 mb-2"> Audit Report </h5>
                  {Object.keys(auditReport.data).map((key, i) => {
                    if (key.toLowerCase() === "code") {
                      if (divideCodeResult(auditReport.data[key]).codePart) {
                        return (
                          <Card
                            title={"Syntax Error"}
                            noborder
                            className="my-2"
                            key={i}
                          >
                            <div className="text-sm">
                              <p className="mb-2">
                                {
                                  divideCodeResult(auditReport.data[key])
                                    .firstPart
                                }
                              </p>
                              <AceEditor
                                mode="solidity"
                                theme="cobalt"
                                value={
                                  divideCodeResult(auditReport.data[key])
                                    .codePart
                                }
                                style={{
                                  width: "100%",
                                  height: "10rem",
                                }}
                                name="generatedCodeEditor"
                                editorProps={{ $blockScrolling: true }}
                                fontSize={12}
                                showPrintMargin={false}
                                showGutter={true}
                              />
                            </div>
                            <div className="mt-4 space-x-4  space-x-reverse">
                              {/* <Link href="#" className="btn-link">
                      Learn more
                      </Link> */}
                            </div>
                          </Card>
                        );
                      }
                    } else
                      return (
                        <Card key={i} title={key} noborder className="my-2">
                          <div className="text-sm">{auditReport.data[key]}</div>
                          <div className="mt-4 space-x-4  space-x-reverse">
                            {/* <Link href="#" className="btn-link">
Learn more
</Link> */}
                          </div>
                        </Card>
                      );
                  })}

                  <Button
                    icon="heroicons:academic-cap"
                    text="Save Audit"
                    className="btn-primary rounded-full mt-2"
                    loadingMessage="Saving ..."
                    isLoading={isSaving}
                    onClick={saveAudit}
                  ></Button>
                </div>
              )}
            </Tab.Panel>
            <Tab.Panel>
              <div className="text-slate-600 dark:text-slate-400 text-sm font-normal">
                <SavedAudits />
              </div>
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      </Card>
    </RootLayout>
  );
}

export default Audit;

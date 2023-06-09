
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import dynamic from "next/dynamic";
import Card from "@/components/ui/Card";
import React, { useEffect } from 'react'
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
  
function SavedAudit({showAudit, closeAudit, auditData}) {
    // useEffect(()=> {
    // }, [])
  return (
    <Modal className="max-w-xl" centered={true} title='Audit Report' activeModal={showAudit} onClose={closeAudit}>
    <div className='flex flex-col space-y-4'>
       <AceEditor
                  onChange={e => {
                    // console.log(e, "code");
                    setCode(e);
                  }}
                  readOnly={true}
                  mode="solidity"
                  theme="cobalt"
                  value={auditData?.code}
                  name="generatedCodeEditor"
                  editorProps={{ $blockScrolling: true }}
                  fontSize={12}
                  showPrintMargin={false}
                  showGutter={true}
                  highlightActiveLine={true}
                  style={{
                    width: "100%",
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

                <div>
                  {Object.keys(auditData).map(key => {
                    if (key.toLowerCase() === "code") {
                      if (divideCodeResult(auditData[key]).codePart) {
                        return (
                          <Card
                            title={"Syntax Error"}
                            noborder
                            className="my-2"
                          >
                            <div className="text-sm">
                              <p className="mb-2">
                                {
                                  divideCodeResult(auditData[key])
                                    .firstPart
                                }
                              </p>
                              <AceEditor
                                mode="solidity"
                                theme="cobalt"
                                value={
                                  divideCodeResult(auditData[key])
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
                        <>
                          <Card title={key} noborder className="my-2">
                            <div className="text-sm">
                              {auditData[key]}
                            </div>
                            <div className="mt-4 space-x-4  space-x-reverse">
                              {/* <Link href="#" className="btn-link">
Learn more
</Link> */}
                            </div>
                          </Card>
                        </>
                      );
                  })}

                  <Button

                    icon=""
                    text="Download Report"
                    className="btn-primary rounded-full mt-2"
                    loadingMessage="Saving ..."
                    // isLoading={isSaving}
                    // onClick={saveAudit}
                  ></Button>
                </div>
       
    </div>
</Modal>
  )
}

export default SavedAudit
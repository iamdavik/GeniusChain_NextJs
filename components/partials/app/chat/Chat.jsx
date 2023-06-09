import React, { useEffect, useRef, useState } from "react";
import useSWR from "swr";
import { useSelector, useDispatch } from "react-redux";
import { toggleMobileChatSidebar, infoToggle, sendMessage } from "./store";
import useWidth from "@/hooks/useWidth";
import Icon from "@/components/ui/Icon";
import Dropdown from "@/components/ui/Dropdown";
import axiosInstance from "@/utils/axiosInstance";
import { toast } from "react-toastify";
import { formatDate } from "@/utils/helper";
import { getCreditBalance } from "@/functions/getUserCredit";
import { useAccount } from "wagmi";

const chatAction = [
  {
    label: "Remove",
    link: "#",
  },
  {
    label: "Forward",
    link: "#",
  },
];

const Chat = () => {
  const { address } = useAccount();
  const { mutate } = useSWR(
    `/api/user/getUser?address=${address}`,
    getCreditBalance
  );
  const { activechat, openinfo, mobileChatSidebar, messFeed, user } =
    useSelector((state) => state.chat);
  console.log(messFeed, "messfeed");
  const { width, breakpoints } = useWidth();
  const dispatch = useDispatch();
  const [message, setMessage] = useState("");
  // const [messages, setMessages] = useState([])

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (message.trim()) {
      let mess = {
        content: message.trim(),
        role: "user",
        sender: "me",
      };

      dispatch(sendMessage(mess));

      console.log(messFeed);

      // send message to api and get result
      try {
        setMessage("");
        const response = await axiosInstance.post("/api/chat/chatWithGenius", {
          messages: [...messFeed, mess],
        });
        mutate();

        dispatch(
          sendMessage({
            sender: "them",
            content: response.data.message,
            role: "system",
          })
        );

        console.log(response);
      } catch (error) {
        toast.error(error.response.data);
      }

      //dispatch updated messages
    }
  };

  const sendChatMessage = async () => {
    if (inputText.trim() === "") return;

    setMessages([...messages, { role: "me", content: inputText }]);
    setInputText("");

    try {
      const response = await axios.post("/api/chat", { message: inputText });
      const serverReply = response.data.result;
      setMessages([...messages, { role: "assistant", content: serverReply }]);
    } catch (error) {
      console.error(
        "Error sending chat:",
        error.response?.data?.error || error.message
      );
    }
  };
  const chatheight = useRef(null);
  useEffect(() => {
    chatheight.current.scrollTop = chatheight.current.scrollHeight;
  }, [messFeed]);

  return (
    <div className="h-full">
      {/* <header className="border-b border-slate-100 dark:border-slate-700">
        <div className="flex py-6 md:px-6 px-3 items-center">
          <div className="flex-1">
            <div className="flex space-x-3 rtl:space-x-reverse">
              {width <= breakpoints.lg && (
                <span
                  onClick={() => dispatch(toggleMobileChatSidebar(true))}
                  className="text-slate-900 dark:text-white cursor-pointer text-xl self-center ltr:mr-3 rtl:ml-3"
                >
                  <Icon icon="heroicons-outline:menu-alt-1" />
                </span>
              )}
              <div className="flex-none">
                <div className="h-10 w-10 rounded-full relative">
                  <span
                    className={` status ring-1 ring-white inline-block h-[10px] w-[10px] rounded-full absolute -right-0 top-0
                  ${user.status === "active"
                        ? "bg-success-500"
                        : "bg-secondary-500"
                      }
                  `}
                  ></span>
                  <img
                    src={user.avatar}
                    alt=""
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>
              </div>
              <div className="flex-1 text-start">
                <span className="block text-slate-800 dark:text-slate-300 text-sm font-medium mb-[2px] truncate">
                  {user.fullName}
                </span>
                <span className="block text-slate-500 dark:text-slate-300 text-xs font-normal">
                  Active now
                </span>
              </div>
            </div>
          </div>
          <div className="flex-none flex md:space-x-3 space-x-1 items-center rtl:space-x-reverse">
            <div className="msg-action-btn">
              <Icon icon="heroicons-outline:phone" />
            </div>
            <div className="msg-action-btn">
              <Icon icon="heroicons-outline:video-camera" />
            </div>

            <div
              onClick={() => dispatch(infoToggle(!openinfo))}
              className="msg-action-btn"
            >
              <Icon icon="heroicons-outline:dots-horizontal" />
            </div>
          </div>
        </div>
      </header> */}
      <div className="chat-content parent-height">
        <div
          className="msgs overflow-y-auto msg-height pt-6 space-y-6"
          ref={chatheight}
        >
          {messFeed.map((item, i) => (
            <div className="block md:px-6 px-4" key={i}>
              {item.sender === "them" && (
                <div className="flex space-x-2 items-start group rtl:space-x-reverse">
                  <div className="flex-none">
                    <div className="h-8 w-8 rounded-full">
                      <img
                        src={"/assets/images/logo/logo-c.svg"}
                        alt=""
                        className="block w-full h-full object-cover rounded-full"
                      />
                    </div>
                  </div>
                  <div className="flex-1 flex space-x-4 rtl:space-x-reverse">
                    <div>
                      <div className="text-contrent p-3 bg-slate-100 dark:bg-slate-600 dark:text-slate-300 text-slate-600 text-sm font-normal mb-1 rounded-md flex-1 whitespace-pre-wrap break-all">
                        {item.content}
                      </div>
                      <span className="font-normal text-xs text-slate-400 dark:text-slate-400">
                        {item.createdAt === undefined
                          ? "Now"
                          : formatDate(item.createdAt)}
                      </span>
                    </div>
                    <div className="opacity-0 invisible group-hover:opacity-100 group-hover:visible">
                      <Dropdown
                        classMenuItems=" w-[100px] top-0"
                        items={chatAction}
                        label={
                          <div className="h-8 w-8 bg-slate-100 dark:bg-slate-600 dark:text-slate-300 text-slate-900 flex flex-col justify-center items-center text-xl rounded-full">
                            <Icon icon="heroicons-outline:dots-horizontal" />
                          </div>
                        }
                      />
                    </div>
                  </div>
                </div>
              )}
              {/* sender */}
              {item.sender === "me" && (
                <div className="flex space-x-2 items-start justify-end group w-full rtl:space-x-reverse">
                  <div className="no flex space-x-4 rtl:space-x-reverse">
                    <div className="opacity-0 invisible group-hover:opacity-100 group-hover:visible">
                      <Dropdown
                        classMenuItems=" w-[100px] left-0 top-0  "
                        items={chatAction}
                        label={
                          <div className="h-8 w-8 bg-slate-300 dark:bg-slate-900 dark:text-slate-400 flex flex-col justify-center items-center text-xl rounded-full text-slate-900">
                            <Icon icon="heroicons-outline:dots-horizontal" />
                          </div>
                        }
                      />
                    </div>

                    <div className="whitespace-pre-wrap break-all">
                      <div className="text-contrent p-3 bg-slate-300 dark:bg-slate-900 dark:text-slate-300 text-slate-800 text-sm font-normal rounded-md flex-1 mb-1">
                        {item.content}
                      </div>
                      <span className="font-normal text-xs text-slate-400">
                        {item.createdAt === undefined
                          ? "Now"
                          : formatDate(item.createdAt)}
                      </span>
                    </div>
                  </div>
                  <div className="flex-none">
                    <div className="h-8 w-8 rounded-full">
                      <img
                        src={
                          "data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPSc0MjAnIGhlaWdodD0nNDIwJyBzdHlsZT0nYmFja2dyb3VuZC1jb2xvcjpyZ2JhKDI0MCwyNDAsMjQwLDEpOyc+PGcgc3R5bGU9J2ZpbGw6cmdiYSgyMTcsMTQzLDM4LDEpOyBzdHJva2U6cmdiYSgyMTcsMTQzLDM4LDEpOyBzdHJva2Utd2lkdGg6Mi4xOyc+PHJlY3QgIHg9JzE2OCcgeT0nMCcgd2lkdGg9Jzg0JyBoZWlnaHQ9Jzg0Jy8+PHJlY3QgIHg9JzE2OCcgeT0nODQnIHdpZHRoPSc4NCcgaGVpZ2h0PSc4NCcvPjxyZWN0ICB4PScxNjgnIHk9JzMzNicgd2lkdGg9Jzg0JyBoZWlnaHQ9Jzg0Jy8+PHJlY3QgIHg9Jzg0JyB5PSc4NCcgd2lkdGg9Jzg0JyBoZWlnaHQ9Jzg0Jy8+PHJlY3QgIHg9JzI1MicgeT0nODQnIHdpZHRoPSc4NCcgaGVpZ2h0PSc4NCcvPjxyZWN0ICB4PSc4NCcgeT0nMjUyJyB3aWR0aD0nODQnIGhlaWdodD0nODQnLz48cmVjdCAgeD0nMjUyJyB5PScyNTInIHdpZHRoPSc4NCcgaGVpZ2h0PSc4NCcvPjxyZWN0ICB4PSc4NCcgeT0nMzM2JyB3aWR0aD0nODQnIGhlaWdodD0nODQnLz48cmVjdCAgeD0nMjUyJyB5PSczMzYnIHdpZHRoPSc4NCcgaGVpZ2h0PSc4NCcvPjxyZWN0ICB4PScwJyB5PScwJyB3aWR0aD0nODQnIGhlaWdodD0nODQnLz48cmVjdCAgeD0nMzM2JyB5PScwJyB3aWR0aD0nODQnIGhlaWdodD0nODQnLz48cmVjdCAgeD0nMCcgeT0nMzM2JyB3aWR0aD0nODQnIGhlaWdodD0nODQnLz48cmVjdCAgeD0nMzM2JyB5PSczMzYnIHdpZHRoPSc4NCcgaGVpZ2h0PSc4NCcvPjwvZz48L3N2Zz4="
                        }
                        alt=""
                        className="block w-full h-full object-cover rounded-full"
                      />
                    </div>
                  </div>
                </div>
              )}
              {/* me */}
            </div>
          ))}
        </div>
      </div>
      <footer className="md:px-6 px-4 sm:flex md:space-x-4 sm:space-x-2 rtl:space-x-reverse border-t md:pt-6 pt-10 border-slate-100 dark:border-slate-700">
        <div className="flex-none sm:flex hidden md:space-x-3 space-x-1 rtl:space-x-reverse">
          {/* <div className="h-8 w-8 cursor-pointer bg-slate-100 dark:bg-slate-900 dark:text-slate-400 flex flex-col justify-center items-center text-xl rounded-full">
            <Icon icon="heroicons-outline:link" />
          </div>
          <div className="h-8 w-8 cursor-pointer bg-slate-100 dark:bg-slate-900 dark:text-slate-400 flex flex-col justify-center items-center text-xl rounded-full">
            <Icon icon="heroicons-outline:emoji-happy" />
          </div> */}
        </div>
        <form
          className="flex-1 relative flex space-x-3 rtl:space-x-reverse"
          onSubmit={handleSendMessage}
        >
          <div className="flex-1">
            <textarea
              type="text"
              value={message}
              placeholder="Type your message..."
              className="focus:ring-0 focus:outline-0 block w-full bg-transparent dark:text-white resize-none ml-5"
              // v-model.trim="newMessage"
              // @keydown.enter.exact.prevent="sendMessage"
              // @keydown.enter.shift.exact.prevent="newMessage += '\n'"
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(e);
                }
              }}
            />
          </div>
          <div className="flex-none md:pr-0 pr-3">
            <button className="h-8 w-8 bg-slate-900 text-white flex flex-col justify-center items-center text-lg rounded-full">
              <Icon
                icon="heroicons-outline:paper-airplane"
                className="transform rotate-[60deg]"
              />
            </button>
          </div>
        </form>
      </footer>
    </div>
  );
};

export default Chat;

import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { openChat, loadChat } from "./store";

import { getCurTime } from "@/utils/helper";

const Contacts = ({ thread }) => {
  const { fullName, avatar, status, lastmessage, unredmessage } = thread;

  console.log(thread, "thread");

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(
      openChat({
        thread,
        activechat: true,
      })
    );

    // dispatch(
    //   loadChat({
    //     thread
    //   })
    // )
  }, []);

  const time = getCurTime();

  return (
    <div
      className="block w-full py-5 focus:ring-0 outline-none cursor-pointer group transition-all duration-150 hover:bg-slate-100 dark:hover:bg-slate-600 dark:hover:bg-opacity-70"
      onClick={() => {
        // open chat
        dispatch(
          openChat({
            thread,
            activechat: true,
          })
        );

        // dispatch(
        //   loadChat({
        //     thread
        //   })
        // )

        // load chats from server
      }}
    >
      <div className="flex space-x-3 px-6 rtl:space-x-reverse">
        <div className="flex-none">
          <div className="h-10 w-10 rounded-full relative">
            <span
              className={`  status ring-1 ring-white inline-block h-[10px] w-[10px] rounded-full absolute -right-0 top-0
                ${"active" === "active" ? "bg-success-500" : "bg-secondary-500"}
              `}
            ></span>
            <img
              src={"/assets/images/logo/logo-c.svg"}
              alt=""
              className="block w-full h-full object-cover rounded-full"
            />
          </div>
        </div>
        <div className="flex-1 text-start flex">
          <div className="flex-1">
            <span className="block text-slate-800 dark:text-slate-300 text-sm font-medium mb-[2px]">
              {"Genius AI"}
            </span>
            <span className="block text-slate-600 dark:text-slate-300 text-xs font-normal">
              {/* {lastmessage.slice(0, 14) + "..."} */}
            </span>
          </div>
          <div className="flex-none ltr:text-right rtl:text-end">
            <span className="block text-xs text-slate-400 dark:text-slate-400 font-normal">
              {time}
            </span>
            {/* {unredmessage > 0 && (
              <span className="inline-flex flex-col items-center justify-center text-[10px] font-medium w-4 h-4 bg-[#FFC155] text-white rounded-full">
                {unredmessage}
              </span>
            )} */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contacts;

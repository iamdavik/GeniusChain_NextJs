import React, { useState } from "react";
import Dropdown from "@/components/ui/Dropdown";
import Icon from "@/components/ui/Icon";
import { Menu, Transition } from "@headlessui/react";
import { useDispatch, useSelector } from "react-redux";
import { handleLogout } from "@/components/partials/auth/store";
import { useRouter } from "next/navigation";
import { useAccount, useBalance, useConnect } from "wagmi";
import Connector from "@/components/connector";
import { disconnect } from "@wagmi/core";
import { toast } from "react-toastify";
import { formatAddress } from "@/utils/addressUtils";

const ProfileLabel = (address) => {
  // const {conne} = useConnect
  return (
    <div className="flex items-center">
      <div className=" ltr:mr-[10px] rtl:ml-[10px]">
        <div className="lg:h-8 lg:w-8 h-7 w-7 rounded-full">
          {/* <img
            src="/assets/images/all-img/user.png"
            alt=""
            className="block w-full h-full object-cover rounded-full"
          /> */}
        </div>
      </div>
      <div className="flex-none text-slate-600 dark:text-white text-sm font-normal items-center lg:flex  overflow-hidden text-ellipsis whitespace-nowrap">
        <span className="overflow-hidden text-ellipsis whitespace-nowrap w-[85px] block">
          {formatAddress(address)}
        </span>
        <span className="text-base inline-block ltr:ml-[10px] rtl:mr-[10px]">
          <Icon icon="heroicons-outline:chevron-down"></Icon>
        </span>
      </div>
    </div>
  );
};

const Profile = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { isConnected, address } = useAccount();
  const [showConnector, setShowConnector] = useState(false);

  const { data, isError, isLoading } = useBalance({
    address: address,
    chainId: 11155111,
    formatUnits: "ether",
  });

  const ProfileMenu = [
    {
      label: `${Number(data?.formatted).toFixed(2)} ETH`,
      icon: "heroicons:user",

      action: () => {
        router.push("/profile");
      },
    },
    {
      label: "Etherscan",
      icon: "heroicons:link",

      action: () => {
        const url = `https://etherscan.io/address/${address}`;
        window.open(url, "_blank");
      },
    },
    {
      label: "Copy address",
      icon: "heroicons:newspaper",
      action: () => {
        navigator.clipboard.writeText(address);

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
      },
    },
    {
      label: "Disconnect",
      icon: "heroicons:power",
      action: async () => {
        await disconnect();
      },
    },
  ];

  return (
    <>
      <Connector
        showConnector={showConnector}
        setShowConnector={setShowConnector}
      />
      {isConnected ? (
        <Dropdown
          label={ProfileLabel(address)}
          classMenuItems="w-[180px] top-[58px]"
        >
          {ProfileMenu.map((item, index) => (
            <Menu.Item key={index}>
              {({ active }) => (
                <div
                  onClick={() => item.action()}
                  className={`${
                    active
                      ? "bg-slate-100 text-slate-900 dark:bg-slate-600 dark:text-slate-300 dark:bg-opacity-50"
                      : "text-slate-600 dark:text-slate-300"
                  } block     ${
                    item.hasDivider
                      ? "border-t border-slate-100 dark:border-slate-700"
                      : ""
                  }`}
                >
                  <div className={`block cursor-pointer px-4 py-2`}>
                    <div className="flex items-center">
                      <span className="block text-xl ltr:mr-3 rtl:ml-3">
                        <Icon icon={item.icon} />
                      </span>
                      <span className="block text-sm">{item.label}</span>
                    </div>
                  </div>
                </div>
              )}
            </Menu.Item>
          ))}
        </Dropdown>
      ) : (
        <div
          className="top-[58px] cursor-pointer"
          onClick={() => setShowConnector(true)}
        >
          Connect
        </div>
      )}
    </>
  );
};

export default Profile;

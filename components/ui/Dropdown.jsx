import { Menu, Transition } from "@headlessui/react";
import { Fragment, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Icon from "@/components/ui/Icon";

const Dropdown = ({
  label = "Dropdown",
  wrapperClass = "inline-block",
  labelClass = "label-class-custom",
  children,
  classMenuItems = "mt-2 w-[220px]",
  items = [
    {
      label: "Action",
      link: "#",
    },
    {
      label: "Another action",
      link: "#",
    },
    {
      label: "Something else here",
      link: "#",
    },
  ],
  classItem = "px-4 py-2",
  className = "",
}) => {
  return (
    <div className={`relative ${wrapperClass}`}>
      <Menu as="div" className={`block w-full ${className}`}>
        <Menu.Button className="block w-full">
          <div className={labelClass}>{label}</div>
        </Menu.Button>

        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Menu.Items
            className={`absolute ltr:right-0 rtl:left-0 origin-top-right  border border-slate-100
            rounded bg-white dark:bg-slate-800 dark:border-slate-700 shadow-dropdown z-[9999]
            ${classMenuItems}
            `}
          >
            <div>
              {children
                ? children
                : ""}
            </div>
          </Menu.Items>
        </Transition>
      </Menu>
    </div>
  );
};

export default Dropdown;

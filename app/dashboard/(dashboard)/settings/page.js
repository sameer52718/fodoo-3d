"use client"
import React, { Fragment } from "react";
import Card from "@/components/ui/Card";
import { Tab } from "@headlessui/react";
import Password from "./components/Password";
import Personal from "./components/Personal";

const newButtons = [
    {
        title: "Personal",
        icon: "heroicons-outline:home",
    },
    {
        title: "Password",
        icon: "heroicons-outline:user",
    },
];

const Setting = () => {
    return (
        <Card bodyClass="p-4 md:p-6" title="Settings">
            <Tab.Group>
                <div className="grid grid-cols-12 md:gap-10">
                    <div className="lg:col-span-12 md:col-span-5 col-span-12">
                        <Tab.List className="grid grid-cols-2 md:grid-cols-4 mb-5 gap-2">
                            {newButtons.map((item, i) => (
                                <Tab key={i} as={Fragment}>
                                    {({ selected }) => (
                                        <button
                                            className={`md:w-full text-sm lg:text-base font-medium md:block inline-block  capitalize ring-0 foucs:ring-0 focus:outline-none px-2 md:px-6 rounded-md py-1 xs:py-2 transition duration-150
        ${selected
                                                    ? "text-white bg-purple-500 "
                                                    : "text-slate-500 bg-slate-100 dark:bg-slate-700 dark:text-slate-300"
                                                }
      `}
                                        >
                                            {item.title}
                                        </button>
                                    )}
                                </Tab>
                            ))}
                        </Tab.List>
                    </div>
                    <div className="lg:col-span-12 md:col-span-7 col-span-12">
                        <Tab.Panels>
                            <Tab.Panel>
                                <Personal />
                            </Tab.Panel>
                            <Tab.Panel>
                                <Password />
                            </Tab.Panel>
                        </Tab.Panels>
                    </div>
                </div>
            </Tab.Group>
        </Card>
    );
};

export default Setting;
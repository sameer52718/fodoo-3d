"use client";

import React, { Fragment } from "react";
import useDarkMode from "@/hooks/useDarkMode";
import Link from "next/link";
import useWidth from "@/hooks/useWidth";

const Logo = () => {
  const [isDark] = useDarkMode();
  const { width, breakpoints } = useWidth();

  return (
    <div>
      <Link href="/dashboard">
        <React.Fragment>
          {width >= breakpoints.xl ? (
            <img
              src={
                isDark
                  ? "/images/logo.png"
                  : "/images/logo.png"
              }
              alt=""
              className="w-12"
            />
          ) : (
            <img
              src={
                isDark
                  ? "/images/logo.png"
                  : "/images/logo.png"
              }
              alt=""
              className="w-12"
            />
          )}
        </React.Fragment>
      </Link>
    </div>
  );
};

export default Logo;

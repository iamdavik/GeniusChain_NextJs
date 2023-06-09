import React, { useEffect, useState } from "react";

const ThemeProvider = ({ isDark, isRtl, skin, navbarType, children }) => {
  console.log();

  const themeClass = `app-warp ${
    isDark === true ? "dark" : isDark === false ? "light" : ""
  } ${skin === "bordered" ? "skin--bordered" : "skin--default"} ${
    navbarType === "floating" ? "has-floating" : ""
  }`;

  return (
    <div dir={isRtl ? "rtl" : "ltr"} className={themeClass}>
      {children}
    </div>
  );
};

export default ThemeProvider;

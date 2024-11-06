import {
  BrandVariants,
  createLightTheme,
  createDarkTheme,
} from "@fluentui/react-components";

const appBrandRamp: BrandVariants = {
  10: "#f2e5ff",
  20: "#e0ccff",
  30: "#c9a3ff",
  40: "#b37aff",
  50: "#9c52ff",
  60: "#8530ff",
  70: "#6e00e6",
  80: "#5a00b3",
  90: "#470080",
  100: "#33004d",
  110: "#29003d",
  120: "#20002e",
  130: "#17001f",
  140: "#0e0010",
  150: "#070008",
  160: "#030004",
};

export const appLightTheme = createLightTheme(appBrandRamp);
export const appDarkTheme = createDarkTheme(appBrandRamp);

import { onRenderHtml } from "vike-react/__internal/integration/onRenderHtml";
import { i as import2 } from "../chunks/chunk-Cq2h6mBj.js";
import "react/jsx-runtime";
import "react";
/*! virtual:vike:page-entry:server:/src/pages/_error [vike:pluginModuleBanner] */
const configValuesSerialized = {
  ["isClientRuntimeLoaded"]: {
    type: "computed",
    definedAtData: null,
    valueSerialized: {
      type: "js-serialized",
      value: true
    }
  },
  ["onRenderHtml"]: {
    type: "standard",
    definedAtData: { "filePathToShowToUser": "vike-react/__internal/integration/onRenderHtml", "fileExportPathToShowToUser": [] },
    valueSerialized: {
      type: "pointer-import",
      value: onRenderHtml
    }
  },
  ["passToClient"]: {
    type: "cumulative",
    definedAtData: [{ "filePathToShowToUser": "/src/pages/+config.ts", "fileExportPathToShowToUser": ["default", "passToClient"] }, { "filePathToShowToUser": "vike-react/config", "fileExportPathToShowToUser": ["default", "passToClient"] }],
    valueSerialized: [{
      type: "js-serialized",
      value: ["pageProps"]
    }, {
      type: "js-serialized",
      value: ["_configViaHook"]
    }]
  },
  ["Wrapper"]: {
    type: "cumulative",
    definedAtData: [{ "filePathToShowToUser": "/src/pages/+Wrapper.tsx", "fileExportPathToShowToUser": [] }],
    valueSerialized: [{
      type: "plus-file",
      exportValues: import2
    }]
  }
};
export {
  configValuesSerialized
};

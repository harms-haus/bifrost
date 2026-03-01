import { setGlobalContext_prodBuildEntry } from "vike/__internal";
/*! virtual:vike:server:constantsGlobalThis [vike:pluginModuleBanner] */
globalThis.__VIKE__IS_DEV = false;
globalThis.__VIKE__IS_CLIENT = false;
globalThis.__VIKE__IS_DEBUG = false;
/*! virtual:vike:global-entry:server [vike:pluginModuleBanner] */
const pageFilesLazy = {};
const pageFilesEager = {};
const pageFilesExportNamesLazy = {};
const pageFilesExportNamesEager = {};
const pageFilesList = [];
const neverLoaded = {};
const pageConfigsSerialized = [
  {
    pageId: "/src/pages/_error",
    isErrorPage: true,
    routeFilesystem: void 0,
    loadVirtualFilePageEntry: () => ({ moduleId: "virtual:vike:page-entry:server:/src/pages/_error", moduleExportsPromise: import("./entries/src_pages_error.mjs") }),
    configValuesSerialized: {
      ["isClientRuntimeLoaded"]: {
        type: "computed",
        definedAtData: null,
        valueSerialized: {
          type: "js-serialized",
          value: true
        }
      },
      ["clientRouting"]: {
        type: "standard",
        definedAtData: { "filePathToShowToUser": "vike-react/config", "fileExportPathToShowToUser": ["default", "clientRouting"] },
        valueSerialized: {
          type: "js-serialized",
          value: true
        }
      }
    }
  },
  {
    pageId: "/src/pages/account",
    isErrorPage: void 0,
    routeFilesystem: { "routeString": "/account", "definedAtLocation": "/src/pages/account/" },
    loadVirtualFilePageEntry: () => ({ moduleId: "virtual:vike:page-entry:server:/src/pages/account", moduleExportsPromise: import("./entries/src_pages_account.mjs") }),
    configValuesSerialized: {
      ["isClientRuntimeLoaded"]: {
        type: "computed",
        definedAtData: null,
        valueSerialized: {
          type: "js-serialized",
          value: true
        }
      },
      ["clientRouting"]: {
        type: "standard",
        definedAtData: { "filePathToShowToUser": "vike-react/config", "fileExportPathToShowToUser": ["default", "clientRouting"] },
        valueSerialized: {
          type: "js-serialized",
          value: true
        }
      }
    }
  },
  {
    pageId: "/src/pages/accounts",
    isErrorPage: void 0,
    routeFilesystem: { "routeString": "/accounts", "definedAtLocation": "/src/pages/accounts/" },
    loadVirtualFilePageEntry: () => ({ moduleId: "virtual:vike:page-entry:server:/src/pages/accounts", moduleExportsPromise: import("./entries/src_pages_accounts.mjs") }),
    configValuesSerialized: {
      ["isClientRuntimeLoaded"]: {
        type: "computed",
        definedAtData: null,
        valueSerialized: {
          type: "js-serialized",
          value: true
        }
      },
      ["clientRouting"]: {
        type: "standard",
        definedAtData: { "filePathToShowToUser": "vike-react/config", "fileExportPathToShowToUser": ["default", "clientRouting"] },
        valueSerialized: {
          type: "js-serialized",
          value: true
        }
      }
    }
  },
  {
    pageId: "/src/pages/accounts/[id]",
    isErrorPage: void 0,
    routeFilesystem: { "routeString": "/accounts/[id]", "definedAtLocation": "/src/pages/accounts/[id]/" },
    loadVirtualFilePageEntry: () => ({ moduleId: "virtual:vike:page-entry:server:/src/pages/accounts/[id]", moduleExportsPromise: import("./entries/src_pages_accounts_id_.mjs") }),
    configValuesSerialized: {
      ["isClientRuntimeLoaded"]: {
        type: "computed",
        definedAtData: null,
        valueSerialized: {
          type: "js-serialized",
          value: true
        }
      },
      ["clientRouting"]: {
        type: "standard",
        definedAtData: { "filePathToShowToUser": "vike-react/config", "fileExportPathToShowToUser": ["default", "clientRouting"] },
        valueSerialized: {
          type: "js-serialized",
          value: true
        }
      }
    }
  },
  {
    pageId: "/src/pages/accounts/new",
    isErrorPage: void 0,
    routeFilesystem: { "routeString": "/accounts/new", "definedAtLocation": "/src/pages/accounts/new/" },
    loadVirtualFilePageEntry: () => ({ moduleId: "virtual:vike:page-entry:server:/src/pages/accounts/new", moduleExportsPromise: import("./entries/src_pages_accounts_new.mjs") }),
    configValuesSerialized: {
      ["isClientRuntimeLoaded"]: {
        type: "computed",
        definedAtData: null,
        valueSerialized: {
          type: "js-serialized",
          value: true
        }
      },
      ["clientRouting"]: {
        type: "standard",
        definedAtData: { "filePathToShowToUser": "vike-react/config", "fileExportPathToShowToUser": ["default", "clientRouting"] },
        valueSerialized: {
          type: "js-serialized",
          value: true
        }
      }
    }
  },
  {
    pageId: "/src/pages/dashboard",
    isErrorPage: void 0,
    routeFilesystem: { "routeString": "/dashboard", "definedAtLocation": "/src/pages/dashboard/" },
    loadVirtualFilePageEntry: () => ({ moduleId: "virtual:vike:page-entry:server:/src/pages/dashboard", moduleExportsPromise: import("./entries/src_pages_dashboard.mjs") }),
    configValuesSerialized: {
      ["isClientRuntimeLoaded"]: {
        type: "computed",
        definedAtData: null,
        valueSerialized: {
          type: "js-serialized",
          value: true
        }
      },
      ["clientRouting"]: {
        type: "standard",
        definedAtData: { "filePathToShowToUser": "vike-react/config", "fileExportPathToShowToUser": ["default", "clientRouting"] },
        valueSerialized: {
          type: "js-serialized",
          value: true
        }
      }
    }
  },
  {
    pageId: "/src/pages/index",
    isErrorPage: void 0,
    routeFilesystem: { "routeString": "/", "definedAtLocation": "/src/pages/index/" },
    loadVirtualFilePageEntry: () => ({ moduleId: "virtual:vike:page-entry:server:/src/pages/index", moduleExportsPromise: import("./entries/src_pages_index.mjs") }),
    configValuesSerialized: {
      ["isClientRuntimeLoaded"]: {
        type: "computed",
        definedAtData: null,
        valueSerialized: {
          type: "js-serialized",
          value: true
        }
      },
      ["clientRouting"]: {
        type: "standard",
        definedAtData: { "filePathToShowToUser": "vike-react/config", "fileExportPathToShowToUser": ["default", "clientRouting"] },
        valueSerialized: {
          type: "js-serialized",
          value: true
        }
      }
    }
  },
  {
    pageId: "/src/pages/login",
    isErrorPage: void 0,
    routeFilesystem: { "routeString": "/login", "definedAtLocation": "/src/pages/login/" },
    loadVirtualFilePageEntry: () => ({ moduleId: "virtual:vike:page-entry:server:/src/pages/login", moduleExportsPromise: import("./entries/src_pages_login.mjs") }),
    configValuesSerialized: {
      ["isClientRuntimeLoaded"]: {
        type: "computed",
        definedAtData: null,
        valueSerialized: {
          type: "js-serialized",
          value: true
        }
      },
      ["clientRouting"]: {
        type: "standard",
        definedAtData: { "filePathToShowToUser": "vike-react/config", "fileExportPathToShowToUser": ["default", "clientRouting"] },
        valueSerialized: {
          type: "js-serialized",
          value: true
        }
      }
    }
  },
  {
    pageId: "/src/pages/onboarding",
    isErrorPage: void 0,
    routeFilesystem: { "routeString": "/onboarding", "definedAtLocation": "/src/pages/onboarding/" },
    loadVirtualFilePageEntry: () => ({ moduleId: "virtual:vike:page-entry:server:/src/pages/onboarding", moduleExportsPromise: import("./entries/src_pages_onboarding.mjs") }),
    configValuesSerialized: {
      ["isClientRuntimeLoaded"]: {
        type: "computed",
        definedAtData: null,
        valueSerialized: {
          type: "js-serialized",
          value: true
        }
      },
      ["clientRouting"]: {
        type: "standard",
        definedAtData: { "filePathToShowToUser": "vike-react/config", "fileExportPathToShowToUser": ["default", "clientRouting"] },
        valueSerialized: {
          type: "js-serialized",
          value: true
        }
      }
    }
  },
  {
    pageId: "/src/pages/realms",
    isErrorPage: void 0,
    routeFilesystem: { "routeString": "/realms", "definedAtLocation": "/src/pages/realms/" },
    loadVirtualFilePageEntry: () => ({ moduleId: "virtual:vike:page-entry:server:/src/pages/realms", moduleExportsPromise: import("./entries/src_pages_realms.mjs") }),
    configValuesSerialized: {
      ["isClientRuntimeLoaded"]: {
        type: "computed",
        definedAtData: null,
        valueSerialized: {
          type: "js-serialized",
          value: true
        }
      },
      ["clientRouting"]: {
        type: "standard",
        definedAtData: { "filePathToShowToUser": "vike-react/config", "fileExportPathToShowToUser": ["default", "clientRouting"] },
        valueSerialized: {
          type: "js-serialized",
          value: true
        }
      }
    }
  },
  {
    pageId: "/src/pages/realms/[id]",
    isErrorPage: void 0,
    routeFilesystem: { "routeString": "/realms/[id]", "definedAtLocation": "/src/pages/realms/[id]/" },
    loadVirtualFilePageEntry: () => ({ moduleId: "virtual:vike:page-entry:server:/src/pages/realms/[id]", moduleExportsPromise: import("./entries/src_pages_realms_id_.mjs") }),
    configValuesSerialized: {
      ["isClientRuntimeLoaded"]: {
        type: "computed",
        definedAtData: null,
        valueSerialized: {
          type: "js-serialized",
          value: true
        }
      },
      ["clientRouting"]: {
        type: "standard",
        definedAtData: { "filePathToShowToUser": "vike-react/config", "fileExportPathToShowToUser": ["default", "clientRouting"] },
        valueSerialized: {
          type: "js-serialized",
          value: true
        }
      }
    }
  },
  {
    pageId: "/src/pages/realms/new",
    isErrorPage: void 0,
    routeFilesystem: { "routeString": "/realms/new", "definedAtLocation": "/src/pages/realms/new/" },
    loadVirtualFilePageEntry: () => ({ moduleId: "virtual:vike:page-entry:server:/src/pages/realms/new", moduleExportsPromise: import("./entries/src_pages_realms_new.mjs") }),
    configValuesSerialized: {
      ["isClientRuntimeLoaded"]: {
        type: "computed",
        definedAtData: null,
        valueSerialized: {
          type: "js-serialized",
          value: true
        }
      },
      ["clientRouting"]: {
        type: "standard",
        definedAtData: { "filePathToShowToUser": "vike-react/config", "fileExportPathToShowToUser": ["default", "clientRouting"] },
        valueSerialized: {
          type: "js-serialized",
          value: true
        }
      }
    }
  },
  {
    pageId: "/src/pages/runes",
    isErrorPage: void 0,
    routeFilesystem: { "routeString": "/runes", "definedAtLocation": "/src/pages/runes/" },
    loadVirtualFilePageEntry: () => ({ moduleId: "virtual:vike:page-entry:server:/src/pages/runes", moduleExportsPromise: import("./entries/src_pages_runes.mjs") }),
    configValuesSerialized: {
      ["isClientRuntimeLoaded"]: {
        type: "computed",
        definedAtData: null,
        valueSerialized: {
          type: "js-serialized",
          value: true
        }
      },
      ["clientRouting"]: {
        type: "standard",
        definedAtData: { "filePathToShowToUser": "vike-react/config", "fileExportPathToShowToUser": ["default", "clientRouting"] },
        valueSerialized: {
          type: "js-serialized",
          value: true
        }
      }
    }
  },
  {
    pageId: "/src/pages/runes/[id]",
    isErrorPage: void 0,
    routeFilesystem: { "routeString": "/runes/[id]", "definedAtLocation": "/src/pages/runes/[id]/" },
    loadVirtualFilePageEntry: () => ({ moduleId: "virtual:vike:page-entry:server:/src/pages/runes/[id]", moduleExportsPromise: import("./entries/src_pages_runes_id_.mjs") }),
    configValuesSerialized: {
      ["isClientRuntimeLoaded"]: {
        type: "computed",
        definedAtData: null,
        valueSerialized: {
          type: "js-serialized",
          value: true
        }
      },
      ["clientRouting"]: {
        type: "standard",
        definedAtData: { "filePathToShowToUser": "vike-react/config", "fileExportPathToShowToUser": ["default", "clientRouting"] },
        valueSerialized: {
          type: "js-serialized",
          value: true
        }
      }
    }
  },
  {
    pageId: "/src/pages/runes/new",
    isErrorPage: void 0,
    routeFilesystem: { "routeString": "/runes/new", "definedAtLocation": "/src/pages/runes/new/" },
    loadVirtualFilePageEntry: () => ({ moduleId: "virtual:vike:page-entry:server:/src/pages/runes/new", moduleExportsPromise: import("./entries/src_pages_runes_new.mjs") }),
    configValuesSerialized: {
      ["isClientRuntimeLoaded"]: {
        type: "computed",
        definedAtData: null,
        valueSerialized: {
          type: "js-serialized",
          value: true
        }
      },
      ["clientRouting"]: {
        type: "standard",
        definedAtData: { "filePathToShowToUser": "vike-react/config", "fileExportPathToShowToUser": ["default", "clientRouting"] },
        valueSerialized: {
          type: "js-serialized",
          value: true
        }
      }
    }
  }
];
const pageConfigGlobalSerialized = {
  configValuesSerialized: {}
};
const pageFilesLazyIsomorph1 = /* @__PURE__ */ Object.assign({});
const pageFilesLazyIsomorph = { ...pageFilesLazyIsomorph1 };
pageFilesLazy[".page"] = pageFilesLazyIsomorph;
const pageFilesLazyServer1 = /* @__PURE__ */ Object.assign({});
const pageFilesLazyServer = { ...pageFilesLazyServer1 };
pageFilesLazy[".page.server"] = pageFilesLazyServer;
const pageFilesEagerRoute1 = /* @__PURE__ */ Object.assign({});
const pageFilesEagerRoute = { ...pageFilesEagerRoute1 };
pageFilesEager[".page.route"] = pageFilesEagerRoute;
const pageFilesExportNamesEagerClient1 = /* @__PURE__ */ Object.assign({});
const pageFilesExportNamesEagerClient = { ...pageFilesExportNamesEagerClient1 };
pageFilesExportNamesEager[".page.client"] = pageFilesExportNamesEagerClient;
const virtualFileExportsGlobalEntry = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  neverLoaded,
  pageConfigGlobalSerialized,
  pageConfigsSerialized,
  pageFilesEager,
  pageFilesExportNamesEager,
  pageFilesExportNamesLazy,
  pageFilesLazy,
  pageFilesList
}, Symbol.toStringTag, { value: "Module" }));
/*! virtual:@brillout/vite-plugin-server-entry:serverEntry [vike:pluginModuleBanner] */
{
  const assetsManifest = {
  "_chunk-CuqYK7TH.js": {
    "file": "assets/chunks/chunk-CuqYK7TH.js",
    "name": "Loading",
    "imports": [
      "_chunk-DDvKJFDk.js"
    ],
    "css": [
      "assets/static/src_components_TopNav_TopNav-30b94007.UiZdJqpC.css",
      "assets/static/src_index-b3c78705.CtxtJkai.css"
    ]
  },
  "_chunk-DDvKJFDk.js": {
    "file": "assets/chunks/chunk-DDvKJFDk.js",
    "name": "initClientRouter",
    "dynamicImports": [
      "virtual:vike:page-entry:client:/src/pages/_error",
      "virtual:vike:page-entry:client:/src/pages/account",
      "virtual:vike:page-entry:client:/src/pages/accounts",
      "virtual:vike:page-entry:client:/src/pages/accounts/[id]",
      "virtual:vike:page-entry:client:/src/pages/accounts/new",
      "virtual:vike:page-entry:client:/src/pages/dashboard",
      "virtual:vike:page-entry:client:/src/pages/index",
      "virtual:vike:page-entry:client:/src/pages/login",
      "virtual:vike:page-entry:client:/src/pages/onboarding",
      "virtual:vike:page-entry:client:/src/pages/realms",
      "virtual:vike:page-entry:client:/src/pages/realms/[id]",
      "virtual:vike:page-entry:client:/src/pages/realms/new",
      "virtual:vike:page-entry:client:/src/pages/runes",
      "virtual:vike:page-entry:client:/src/pages/runes/[id]",
      "virtual:vike:page-entry:client:/src/pages/runes/new"
    ]
  },
  "_chunk-DIZe1Ivj.js": {
    "file": "assets/chunks/chunk-DIZe1Ivj.js",
    "name": "Dialog",
    "imports": [
      "_chunk-CuqYK7TH.js"
    ]
  },
  "_src_components_TopNav_TopNav-30b94007.UiZdJqpC.css": {
    "file": "assets/static/src_components_TopNav_TopNav-30b94007.UiZdJqpC.css",
    "src": "_src_components_TopNav_TopNav-30b94007.UiZdJqpC.css"
  },
  "_src_index-b3c78705.CtxtJkai.css": {
    "file": "assets/static/src_index-b3c78705.CtxtJkai.css",
    "src": "_src_index-b3c78705.CtxtJkai.css"
  },
  "node_modules/vike/dist/client/runtime-client-routing/entry.js": {
    "file": "assets/entries/entry-client-routing.CVwwyevU.js",
    "name": "entries/entry-client-routing",
    "src": "node_modules/vike/dist/client/runtime-client-routing/entry.js",
    "isEntry": true,
    "imports": [
      "_chunk-DDvKJFDk.js"
    ]
  },
  "virtual:vike:page-entry:client:/src/pages/_error": {
    "file": "assets/entries/src_pages_error.QmgSoVkQ.js",
    "name": "entries/src/pages/_error",
    "src": "virtual:vike:page-entry:client:/src/pages/_error",
    "isEntry": true,
    "isDynamicEntry": true,
    "imports": [
      "_chunk-CuqYK7TH.js",
      "_chunk-DDvKJFDk.js"
    ],
    "css": [
      "assets/static/src_components_TopNav_TopNav-30b94007.UiZdJqpC.css",
      "assets/static/src_index-b3c78705.CtxtJkai.css"
    ]
  },
  "virtual:vike:page-entry:client:/src/pages/account": {
    "file": "assets/entries/src_pages_account.BN7RvMzP.js",
    "name": "entries/src/pages/account",
    "src": "virtual:vike:page-entry:client:/src/pages/account",
    "isEntry": true,
    "isDynamicEntry": true,
    "imports": [
      "_chunk-CuqYK7TH.js",
      "_chunk-DDvKJFDk.js"
    ],
    "css": [
      "assets/static/src_components_TopNav_TopNav-30b94007.UiZdJqpC.css",
      "assets/static/src_index-b3c78705.CtxtJkai.css"
    ]
  },
  "virtual:vike:page-entry:client:/src/pages/accounts": {
    "file": "assets/entries/src_pages_accounts.BgmPXOQO.js",
    "name": "entries/src/pages/accounts",
    "src": "virtual:vike:page-entry:client:/src/pages/accounts",
    "isEntry": true,
    "isDynamicEntry": true,
    "imports": [
      "_chunk-CuqYK7TH.js",
      "_chunk-DDvKJFDk.js"
    ],
    "css": [
      "assets/static/src_components_TopNav_TopNav-30b94007.UiZdJqpC.css",
      "assets/static/src_index-b3c78705.CtxtJkai.css"
    ]
  },
  "virtual:vike:page-entry:client:/src/pages/accounts/[id]": {
    "file": "assets/entries/src_pages_accounts_id_.CojhSdLb.js",
    "name": "entries/src/pages/accounts/_id_",
    "src": "virtual:vike:page-entry:client:/src/pages/accounts/[id]",
    "isEntry": true,
    "isDynamicEntry": true,
    "imports": [
      "_chunk-CuqYK7TH.js",
      "_chunk-DDvKJFDk.js"
    ],
    "css": [
      "assets/static/src_components_TopNav_TopNav-30b94007.UiZdJqpC.css",
      "assets/static/src_index-b3c78705.CtxtJkai.css"
    ]
  },
  "virtual:vike:page-entry:client:/src/pages/accounts/new": {
    "file": "assets/entries/src_pages_accounts_new.qGW4uNpB.js",
    "name": "entries/src/pages/accounts/new",
    "src": "virtual:vike:page-entry:client:/src/pages/accounts/new",
    "isEntry": true,
    "isDynamicEntry": true,
    "imports": [
      "_chunk-CuqYK7TH.js",
      "_chunk-DDvKJFDk.js"
    ],
    "css": [
      "assets/static/src_components_TopNav_TopNav-30b94007.UiZdJqpC.css",
      "assets/static/src_index-b3c78705.CtxtJkai.css"
    ]
  },
  "virtual:vike:page-entry:client:/src/pages/dashboard": {
    "file": "assets/entries/src_pages_dashboard.D9sMN8VA.js",
    "name": "entries/src/pages/dashboard",
    "src": "virtual:vike:page-entry:client:/src/pages/dashboard",
    "isEntry": true,
    "isDynamicEntry": true,
    "imports": [
      "_chunk-CuqYK7TH.js",
      "_chunk-DDvKJFDk.js"
    ],
    "css": [
      "assets/static/src_components_TopNav_TopNav-30b94007.UiZdJqpC.css",
      "assets/static/src_index-b3c78705.CtxtJkai.css"
    ]
  },
  "virtual:vike:page-entry:client:/src/pages/index": {
    "file": "assets/entries/src_pages_index.8QiQBzUU.js",
    "name": "entries/src/pages/index",
    "src": "virtual:vike:page-entry:client:/src/pages/index",
    "isEntry": true,
    "isDynamicEntry": true,
    "imports": [
      "_chunk-CuqYK7TH.js",
      "_chunk-DDvKJFDk.js"
    ],
    "css": [
      "assets/static/src_components_TopNav_TopNav-30b94007.UiZdJqpC.css",
      "assets/static/src_index-b3c78705.CtxtJkai.css"
    ]
  },
  "virtual:vike:page-entry:client:/src/pages/login": {
    "file": "assets/entries/src_pages_login.B-Uf-59G.js",
    "name": "entries/src/pages/login",
    "src": "virtual:vike:page-entry:client:/src/pages/login",
    "isEntry": true,
    "isDynamicEntry": true,
    "imports": [
      "_chunk-CuqYK7TH.js",
      "_chunk-DDvKJFDk.js"
    ],
    "css": [
      "assets/static/src_components_TopNav_TopNav-30b94007.UiZdJqpC.css",
      "assets/static/src_index-b3c78705.CtxtJkai.css"
    ]
  },
  "virtual:vike:page-entry:client:/src/pages/onboarding": {
    "file": "assets/entries/src_pages_onboarding.msKpiU7T.js",
    "name": "entries/src/pages/onboarding",
    "src": "virtual:vike:page-entry:client:/src/pages/onboarding",
    "isEntry": true,
    "isDynamicEntry": true,
    "imports": [
      "_chunk-CuqYK7TH.js",
      "_chunk-DDvKJFDk.js"
    ],
    "css": [
      "assets/static/src_components_TopNav_TopNav-30b94007.UiZdJqpC.css",
      "assets/static/src_index-b3c78705.CtxtJkai.css"
    ]
  },
  "virtual:vike:page-entry:client:/src/pages/realms": {
    "file": "assets/entries/src_pages_realms.COTr5QRY.js",
    "name": "entries/src/pages/realms",
    "src": "virtual:vike:page-entry:client:/src/pages/realms",
    "isEntry": true,
    "isDynamicEntry": true,
    "imports": [
      "_chunk-CuqYK7TH.js",
      "_chunk-DDvKJFDk.js"
    ],
    "css": [
      "assets/static/src_components_TopNav_TopNav-30b94007.UiZdJqpC.css",
      "assets/static/src_index-b3c78705.CtxtJkai.css"
    ]
  },
  "virtual:vike:page-entry:client:/src/pages/realms/[id]": {
    "file": "assets/entries/src_pages_realms_id_.BMUYD-uY.js",
    "name": "entries/src/pages/realms/_id_",
    "src": "virtual:vike:page-entry:client:/src/pages/realms/[id]",
    "isEntry": true,
    "isDynamicEntry": true,
    "imports": [
      "_chunk-CuqYK7TH.js",
      "_chunk-DDvKJFDk.js",
      "_chunk-DIZe1Ivj.js"
    ],
    "css": [
      "assets/static/src_components_TopNav_TopNav-30b94007.UiZdJqpC.css",
      "assets/static/src_index-b3c78705.CtxtJkai.css"
    ]
  },
  "virtual:vike:page-entry:client:/src/pages/realms/new": {
    "file": "assets/entries/src_pages_realms_new.Bv5phroL.js",
    "name": "entries/src/pages/realms/new",
    "src": "virtual:vike:page-entry:client:/src/pages/realms/new",
    "isEntry": true,
    "isDynamicEntry": true,
    "imports": [
      "_chunk-CuqYK7TH.js",
      "_chunk-DDvKJFDk.js"
    ],
    "css": [
      "assets/static/src_components_TopNav_TopNav-30b94007.UiZdJqpC.css",
      "assets/static/src_index-b3c78705.CtxtJkai.css"
    ]
  },
  "virtual:vike:page-entry:client:/src/pages/runes": {
    "file": "assets/entries/src_pages_runes.DckMFaYq.js",
    "name": "entries/src/pages/runes",
    "src": "virtual:vike:page-entry:client:/src/pages/runes",
    "isEntry": true,
    "isDynamicEntry": true,
    "imports": [
      "_chunk-CuqYK7TH.js",
      "_chunk-DDvKJFDk.js"
    ],
    "css": [
      "assets/static/src_components_TopNav_TopNav-30b94007.UiZdJqpC.css",
      "assets/static/src_index-b3c78705.CtxtJkai.css"
    ]
  },
  "virtual:vike:page-entry:client:/src/pages/runes/[id]": {
    "file": "assets/entries/src_pages_runes_id_.Crd-hn7q.js",
    "name": "entries/src/pages/runes/_id_",
    "src": "virtual:vike:page-entry:client:/src/pages/runes/[id]",
    "isEntry": true,
    "isDynamicEntry": true,
    "imports": [
      "_chunk-CuqYK7TH.js",
      "_chunk-DDvKJFDk.js",
      "_chunk-DIZe1Ivj.js"
    ],
    "css": [
      "assets/static/src_components_TopNav_TopNav-30b94007.UiZdJqpC.css",
      "assets/static/src_index-b3c78705.CtxtJkai.css"
    ]
  },
  "virtual:vike:page-entry:client:/src/pages/runes/new": {
    "file": "assets/entries/src_pages_runes_new.BouXnnYZ.js",
    "name": "entries/src/pages/runes/new",
    "src": "virtual:vike:page-entry:client:/src/pages/runes/new",
    "isEntry": true,
    "isDynamicEntry": true,
    "imports": [
      "_chunk-CuqYK7TH.js",
      "_chunk-DDvKJFDk.js"
    ],
    "css": [
      "assets/static/src_components_TopNav_TopNav-30b94007.UiZdJqpC.css",
      "assets/static/src_index-b3c78705.CtxtJkai.css"
    ]
  }
};
  const buildInfo = {
    "versionAtBuildTime": "0.4.255",
    "usesClientRouter": false,
    "viteConfigRuntime": {
      "root": "/home/blake/Documents/software/bifrost/ui",
      "build": {
        "outDir": "/home/blake/Documents/software/bifrost/ui/dist/"
      },
      "_baseViteOriginal": "/ui",
      "vitePluginServerEntry": {}
    }
  };
  setGlobalContext_prodBuildEntry({
    virtualFileExportsGlobalEntry,
    assetsManifest,
    buildInfo
  });
}

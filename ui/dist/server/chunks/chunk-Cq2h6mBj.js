var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { jsx, jsxs } from "react/jsx-runtime";
import { createContext, useState, useEffect, useCallback } from "react";
/*! src/lib/api.ts [vike:pluginModuleBanner] */
const API_PREFIX = "/api";
class ApiError extends Error {
  constructor(status, message, data) {
    super(message);
    this.status = status;
    this.data = data;
    this.name = "ApiError";
  }
}
class ApiClient {
  constructor(baseUrl = "") {
    __publicField(this, "baseUrl");
    this.baseUrl = baseUrl;
  }
  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${API_PREFIX}${endpoint}`;
    const headers = {
      "Content-Type": "application/json",
      ...options.headers
    };
    const response = await fetch(url, {
      ...options,
      headers,
      credentials: "include"
    });
    if (!response.ok) {
      let data;
      try {
        data = await response.json();
      } catch {
        data = void 0;
      }
      throw new ApiError(
        response.status,
        `Request failed: ${response.statusText}`,
        data
      );
    }
    if (response.status === 204) {
      return void 0;
    }
    return response.json();
  }
  // Session / Auth
  async login(request) {
    return this.request("/auth/login", {
      method: "POST",
      body: JSON.stringify(request)
    });
  }
  async logout() {
    return this.request("/auth/logout", {
      method: "POST"
    });
  }
  async getSession() {
    return this.request("/auth/session", {
      method: "GET"
    });
  }
  async checkOnboarding() {
    return this.request("/ui/check-onboarding", {
      method: "GET"
    });
  }
  // Onboarding
  async createAdmin(request) {
    return this.request("/ui/onboarding/create-admin", {
      method: "POST",
      body: JSON.stringify(request)
    });
  }
  // Runes
  async getRunes(realmId) {
    return this.request(`/realms/${realmId}/runes`, {
      method: "GET"
    });
  }
  async getRune(realmId, runeId) {
    return this.request(`/realms/${realmId}/runes/${runeId}`, {
      method: "GET"
    });
  }
  async createRune(request) {
    return this.request("/runes", {
      method: "POST",
      body: JSON.stringify(request)
    });
  }
  async updateRune(realmId, runeId, updates) {
    return this.request(`/realms/${realmId}/runes/${runeId}`, {
      method: "PATCH",
      body: JSON.stringify(updates)
    });
  }
  async deleteRune(realmId, runeId) {
    return this.request(`/realms/${realmId}/runes/${runeId}`, {
      method: "DELETE"
    });
  }
  // Realms
  async getRealms() {
    return this.request("/realms", {
      method: "GET"
    });
  }
  async getRealm(realmId) {
    return this.request(`/realms/${realmId}`, {
      method: "GET"
    });
  }
  async createRealm(request) {
    return this.request("/realms", {
      method: "POST",
      body: JSON.stringify(request)
    });
  }
  // Accounts
  async getAccounts(realmId) {
    return this.request(`/realms/${realmId}/accounts`, {
      method: "GET"
    });
  }
  async getAccount(realmId, accountId) {
    return this.request(
      `/realms/${realmId}/accounts/${accountId}`,
      {
        method: "GET"
      }
    );
  }
  async createAccount(realmId, request) {
    return this.request(`/realms/${realmId}/accounts`, {
      method: "POST",
      body: JSON.stringify(request)
    });
  }
  // Admin Accounts (sysadmin only)
  async getAdminAccounts() {
    return this.request("/accounts", {
      method: "GET"
    });
  }
  async createAdminAccount(username) {
    return this.request("/create-account", {
      method: "POST",
      body: JSON.stringify({ username })
    });
  }
  // PAT Management (admin only)
  async createPAT(accountId) {
    return this.request("/create-pat", {
      method: "POST",
      body: JSON.stringify({ account_id: accountId })
    });
  }
  async getPATs(accountId) {
    return this.request(`/pats?account_id=${accountId}`, {
      method: "GET"
    });
  }
  async revokePAT(accountId, patId) {
    return this.request("/revoke-pat", {
      method: "POST",
      body: JSON.stringify({ account_id: accountId, pat_id: patId })
    });
  }
}
const api = new ApiClient();
/*! src/lib/auth.tsx [vike:pluginModuleBanner] */
const AuthContext = createContext(null);
function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    api.getSession().then((s) => {
      setSession(s);
    }).catch(() => {
      setSession(null);
    }).finally(() => {
      setLoading(false);
    });
  }, []);
  const login = useCallback(async (pat) => {
    const request = { pat };
    const sessionInfo = await api.login(request);
    setSession(sessionInfo);
  }, []);
  const logout = useCallback(async () => {
    await api.logout();
    setSession(null);
  }, []);
  const value = {
    isAuthenticated: session !== null,
    accountId: (session == null ? void 0 : session.account_id) ?? null,
    username: (session == null ? void 0 : session.username) ?? null,
    roles: (session == null ? void 0 : session.roles) ?? {},
    realms: (session == null ? void 0 : session.realms) ?? [],
    realmNames: (session == null ? void 0 : session.realm_names) ?? {},
    isSysadmin: (session == null ? void 0 : session.is_admin) ?? false,
    login,
    logout,
    loading
  };
  return /* @__PURE__ */ jsx(AuthContext.Provider, { value, children });
}
/*! src/lib/realm.tsx [vike:pluginModuleBanner] */
const STORAGE_KEY$1 = "bifrost-realm";
const RealmContext = createContext(void 0);
function RealmProvider({ children }) {
  const [currentRealm, setCurrentRealmState] = useState(null);
  const [availableRealms, setAvailableRealms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const init = async () => {
      try {
        const realms = await api.getRealms();
        const filteredRealms = realms.map((r) => r.id).filter((id) => id !== "_admin");
        setAvailableRealms(filteredRealms);
        const stored = localStorage.getItem(STORAGE_KEY$1);
        if (stored && filteredRealms.includes(stored)) {
          setCurrentRealmState(stored);
        } else if (filteredRealms.length > 0) {
          setCurrentRealmState(filteredRealms[0]);
        }
      } catch (err) {
        console.error("Failed to load realms:", err);
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, []);
  const setCurrentRealm = (realm) => {
    setCurrentRealmState(realm);
    if (realm) {
      localStorage.setItem(STORAGE_KEY$1, realm);
    } else {
      localStorage.removeItem(STORAGE_KEY$1);
    }
  };
  return /* @__PURE__ */ jsx(
    RealmContext.Provider,
    {
      value: { currentRealm, setCurrentRealm, availableRealms, isLoading },
      children
    }
  );
}
/*! src/lib/theme.tsx [vike:pluginModuleBanner] */
const ThemeContext = createContext(null);
const STORAGE_KEY = "bifrost-theme";
function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(true);
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== null) {
      setIsDark(stored === "dark");
    }
    setMounted(true);
  }, []);
  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem(STORAGE_KEY, isDark ? "dark" : "light");
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark, mounted]);
  const toggleTheme = useCallback(() => {
    setIsDark((prev) => !prev);
  }, []);
  const value = { isDark, toggleTheme };
  return /* @__PURE__ */ jsx(ThemeContext.Provider, { value, children });
}
/*! src/lib/toast.tsx [vike:pluginModuleBanner] */
const ToastContext = createContext(null);
const toastStyles = {
  success: "border-green-500 bg-green-50 dark:bg-green-900/20",
  error: "border-red-500 bg-red-50 dark:bg-red-900/20",
  info: "border-blue-500 bg-blue-50 dark:bg-blue-900/20",
  warning: "border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20"
};
const iconStyles = {
  success: "✓",
  error: "✕",
  info: "ℹ",
  warning: "⚠"
};
function generateId() {
  return Math.random().toString(36).substring(2, 9);
}
function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const showToast = useCallback(
    (title, description, type = "info") => {
      const id = generateId();
      const toast = { id, title, description, type };
      setToasts((prev) => [...prev, toast]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 1e4);
    },
    []
  );
  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);
  return /* @__PURE__ */ jsxs(ToastContext.Provider, { value: { showToast }, children: [
    children,
    /* @__PURE__ */ jsx("div", { className: "fixed bottom-4 right-4 z-[9999] flex flex-col gap-2", children: toasts.map((toast) => /* @__PURE__ */ jsx(
      "div",
      {
        className: `border-l-4 p-4 rounded shadow-lg min-w-[300px] max-w-[400px] ${toastStyles[toast.type]}`,
        children: /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3", children: [
          /* @__PURE__ */ jsx("span", { className: "text-lg", children: iconStyles[toast.type] }),
          /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
            /* @__PURE__ */ jsx("div", { className: "font-semibold text-gray-900 dark:text-gray-100", children: toast.title }),
            toast.description && /* @__PURE__ */ jsx("div", { className: "text-sm text-gray-600 dark:text-gray-300 mt-1", children: toast.description })
          ] }),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => removeToast(toast.id),
              className: "text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 ml-2",
              children: "✕"
            }
          )
        ] })
      },
      toast.id
    )) })
  ] });
}
/*! src/pages/+Wrapper.tsx [vike:pluginModuleBanner] */
function Wrapper({ children }) {
  return /* @__PURE__ */ jsx(AuthProvider, { children: /* @__PURE__ */ jsx(ThemeProvider, { children: /* @__PURE__ */ jsx(RealmProvider, { children: /* @__PURE__ */ jsx(ToastProvider, { children }) }) }) });
}
const import2 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  Wrapper
}, Symbol.toStringTag, { value: "Module" }));
export {
  import2 as i
};

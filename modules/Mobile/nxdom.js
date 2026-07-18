import Server from "../../config.js";

const RESERVED_KEYS = new Set([
  "endpoint",
  "controllers",
  "userId",
  "url",
  "urlApi",
  "apiBase",
]);

function getRuntimeGlobal() {
  if (typeof globalThis !== "undefined") return globalThis;
  if (typeof global !== "undefined") return global;
  if (typeof window !== "undefined") return window;
  return {};
}

function normalizeEndpoint(config) {
  if (!config || typeof config !== "object") return {};
  const out = {};
  for (const [key, value] of Object.entries(config)) {
    if (value !== undefined) out[key] = value;
  }
  return out;
}

/**
 * Pasang bridge NXUI.Storage setelah modul Storage terinstal.
 * Dipanggil dari index.js yang di-generate CLI (bukan hard-import di sini).
 */
export function attachStorageBridge(NexaStores, NexaModels) {
  if (typeof NexaStores !== "function" || typeof NexaModels !== "function") {
    return null;
  }
  const root = getRuntimeGlobal();
  const createStorageBridge = () => {
    const storageObject = NexaStores();
    return new Proxy(storageObject, {
      get(target, property) {
        if (typeof property === "symbol") {
          return target[property];
        }
        if (property === "model" || property === "query") {
          return function (tableName) {
            const m = new NexaModels();
            return m.table(tableName);
          };
        }
        if (property in target) {
          return target[property];
        }
        return function () {
          return target.package(String(property));
        };
      },
    });
  };

  const existingNXUI = root.NXUI && typeof root.NXUI === "object" ? root.NXUI : {};
  root.NXUI = {
    ...existingNXUI,
    NEXA: root.NEXA || existingNXUI.NEXA,
    Storage: createStorageBridge,
    Stores: NexaStores,
  };
  root.NX = root.NXUI;
  return root.NXUI;
}

export function syncNexaFromConfig(config = Server) {
  const root = getRuntimeGlobal();
  const prev = root.NEXA && typeof root.NEXA === "object" ? root.NEXA : {};
  const endpoint = normalizeEndpoint(config);

  const next = {
    userId: prev.userId ?? 0,
    controllers: {
      packages: "packages",
      ...(prev.controllers || {}),
    },
    ...prev,
    endpoint: {
      ...(prev.endpoint || {}),
      ...endpoint,
    },
  };

  for (const [key, value] of Object.entries(next.endpoint)) {
    if (RESERVED_KEYS.has(key)) continue;
    next[key] = value;
  }

  next.url = next.url || next.FILE_URL || "";
  next.urlApi = next.urlApi || next.API_URL || "";
  next.apiBase = next.apiBase || next.urlApi || "";

  root.NEXA = next;

  const existingNXUI = root.NXUI && typeof root.NXUI === "object" ? root.NXUI : {};
  root.NXUI = {
    ...existingNXUI,
    NEXA: root.NEXA,
    // Storage/Stores diisi attachStorageBridge bila modul Storage terpasang
    Storage:
      existingNXUI.Storage ||
      (() => {
        throw new Error(
          "Modul Storage belum terinstal — pasang lewat Mobile → Module",
        );
      }),
    Stores: existingNXUI.Stores,
  };
  root.NX = root.NXUI;

  return root.NEXA;
}

export const NEXA = syncNexaFromConfig(Server);

const runtimeProxyHandler = {
  get(_target, prop) {
    const root = getRuntimeGlobal();
    const src = root.NXUI || {};
    const value = src[prop];
    return typeof value === "function" ? value.bind(src) : value;
  },
  set(_target, prop, value) {
    const root = getRuntimeGlobal();
    root.NXUI = root.NXUI || {};
    root.NXUI[prop] = value;
    root.NX = root.NXUI;
    return true;
  },
  has(_target, prop) {
    const root = getRuntimeGlobal();
    return !!(root.NXUI && prop in root.NXUI);
  },
};

export const NXUI = new Proxy({}, runtimeProxyHandler);
export const NX = NXUI;

export default NEXA;

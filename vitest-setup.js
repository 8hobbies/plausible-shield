import "@testing-library/jest-dom/vitest";

let syncStorage = {};
let permissionAlwaysGranted = true;

globalThis.chrome = {
  storage: {
    sync: {
      set: async (items) => {
        syncStorage = items;
      },
      get: async () => {
        return syncStorage;
      },
    },
  },
  permissions: {
    request: async () => {
      return permissionAlwaysGranted;
    },
  },
};

globalThis.window.alert = (message) => {
  globalThis.console.log(message);
};

globalThis.resetBrowserStorage = () => {
  syncStorage = {};
};

globalThis.setPermissionGranted = (grant) => {
  permissionAlwaysGranted = grant;
};

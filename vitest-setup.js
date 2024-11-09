import "@testing-library/jest-dom/vitest";

let syncStorage = {};

globalThis.chrome = {
  storage: {
    sync: {
      set: async (items) => {
        syncStorage = items;
      },
      get: async (_) => {
        return syncStorage;
      },
    },
  },
  permissions: {
    request: async (_) => {
      return true;
    },
  },
};

globalThis.window.alert = (message) => {
  globalThis.console.log(message);
};

globalThis.resetBrowserStorage = () => {
  syncStorage = {};
};

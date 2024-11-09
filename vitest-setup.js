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
};

globalThis.resetBrowserStorage = () => {
  syncStorage = {};
};

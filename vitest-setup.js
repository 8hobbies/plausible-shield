import "@testing-library/jest-dom/vitest";

let syncStorage = {};

globalThis.chrome = {
  storage: {
    sync: {
      set: (items) => {
        syncStorage = items;
      },
      get: (_) => {
        return syncStorage;
      },
    },
  },
};

globalThis.resetBrowserStorage = () => {
  syncStorage = {};
};

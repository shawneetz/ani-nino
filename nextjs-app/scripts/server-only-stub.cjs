// EMPTY STUB SO tsx CAN IMPORT FILES THAT USE "server-only" OUTSIDE NEXT.JS
/* eslint-disable @typescript-eslint/no-require-imports */
const Module = require("node:module");
const originalLoad = Module._load;

Module._load = function load(request, parent, isMain) {
  if (request === "server-only") return {};
  return originalLoad.call(this, request, parent, isMain);
};

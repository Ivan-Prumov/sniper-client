"use strict";
const electron = require("electron");
const preload = require("@electron-toolkit/preload");
const fs = require("fs");
const path = require("path");
const child_process = require("child_process");
const mongodb = require("mongodb");
const fsExists = require("fs.promises.exists");
function _interopNamespaceDefault(e) {
  const n = Object.create(null, { [Symbol.toStringTag]: { value: "Module" } });
  if (e) {
    for (const k in e) {
      if (k !== "default") {
        const d = Object.getOwnPropertyDescriptor(e, k);
        Object.defineProperty(n, k, d.get ? d : {
          enumerable: true,
          get: () => e[k]
        });
      }
    }
  }
  n.default = e;
  return Object.freeze(n);
}
const fs__namespace = /* @__PURE__ */ _interopNamespaceDefault(fs);
const path__namespace = /* @__PURE__ */ _interopNamespaceDefault(path);
const uri = "mongodb://localhost:27017";
const dbName = "sniper-sim";
const db_client = new mongodb.MongoClient(uri);
async function saveBenchmark(benchmarkRes) {
  try {
    await db_client.connect();
    console.log("Connected to MongoDB");
    const db = db_client.db(dbName);
    const collection = db.collection("benchmark-results");
    await collection.insertOne(benchmarkRes);
    console.log("Data saved to MongoDB");
  } catch (error) {
    console.error("Error saving data to MongoDB:", error);
    throw error;
  } finally {
    await db_client.close();
    console.log("MongoDB connection closed");
  }
}
const api = {
  fs: fs__namespace,
  path: path__namespace,
  exec: child_process.exec,
  __dirname,
  db_client,
  fsExists,
  saveBenchmark
};
if (process.contextIsolated) {
  try {
    electron.contextBridge.exposeInMainWorld("electron", preload.electronAPI);
    electron.contextBridge.exposeInMainWorld("api", api);
  } catch (error) {
    console.error(error);
  }
} else {
  window.electron = preload.electronAPI;
  window.api = api;
}

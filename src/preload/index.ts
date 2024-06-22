import { contextBridge } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import * as fs from 'fs' // Import fs module
import * as path from 'path' // Import path module
import { exec } from 'child_process'
import { MongoClient } from 'mongodb'
import fsExists from 'fs.promises.exists'

const uri = 'mongodb://localhost:27017'
const dbName = 'sniper-sim'
const db_client = new MongoClient(uri)

async function saveBenchmark(benchmarkRes: JSON) {
  try {
    // Connect to MongoDB
    await db_client.connect()
    console.log('Connected to MongoDB')

    // Select the database
    const db = db_client.db(dbName)

    // Get the collection
    const collection = db.collection('benchmark-results')

    // Insert the data
    await collection.insertOne(benchmarkRes)

    console.log('Data saved to MongoDB')
  } catch (error) {
    console.error('Error saving data to MongoDB:', error)
    throw error
  } finally {
    // Close the connection
    await db_client.close()
    console.log('MongoDB connection closed')
  }
}

// Custom APIs for renderer
const api = {
  fs,
  path,
  exec,
  __dirname,
  db_client,
  fsExists,
  saveBenchmark
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}

// src/config/env.ts
import Constants from "expo-constants";

// Auto-detect (usually works)
const debuggerHost = Constants.expoConfig?.hostUri;
const autoIp = debuggerHost ? debuggerHost.split(":")[0] : "localhost";

// Uncomment and set this if auto-detect fails:
// const autoIp = "192.168.1.5";

export const API_BASE_URL = __DEV__
  ? `http://${autoIp}:5000/api`
  : "https://your-backend.onrender.com/api";

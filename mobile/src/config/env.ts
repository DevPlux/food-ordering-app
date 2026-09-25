import Constants from "expo-constants";

// Auto-detects your computer's LAN IP from Expo's dev server address.
// This lets your phone reach the backend running on your computer.
const debuggerHost = Constants.expoConfig?.hostUri;
const localIp = debuggerHost ? debuggerHost.split(":")[0] : "localhost";

export const API_BASE_URL = __DEV__
  ? `http://${localIp}:5000/api`
  : "https://your-backend.onrender.com/api";

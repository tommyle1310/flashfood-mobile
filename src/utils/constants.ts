export const IP_ADDRESS = {
  IP_HOME_1: "192.168.1.8",
  NEAR: "192.168.1.119",
  Z9_TURBO: "192.168.204.172",
  UOG: "10.25.34.203",
};

// Try to use the primary IP, but fall back to localhost if needed
// You can change this to use any of the IPs above
export const BACKEND_URL = `http://${IP_ADDRESS.NEAR}:1310`;
export const CHAT_SOCKET_URL = `${BACKEND_URL}/chat`;
export const DELIVERY_FEE = 3;
export const SERVICE_FEE = 1;

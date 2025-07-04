export const IP_ADDRESS = {
  IP_HOME_1: "192.168.1.16",
  NEAR: "192.168.1.83",
  Z9_TURBO: "192.168.204.172",
  UOG: "10.25.32.131",
};

// Try to use the primary IP, but fall back to localhost if needed
// You can change this to use any of the IPs above
export const BACKEND_URL = `http://${IP_ADDRESS.IP_HOME_1}:1310`;
export const CHAT_SOCKET_URL = `${BACKEND_URL}/chat`;
export const DELIVERY_FEE = 3;
export const SERVICE_FEE = 1;

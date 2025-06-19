export const IP_ADDRESS = {
  IP_HOME_1: "192.168.1.8",
  NEAR: "192.168.1.153",
  Z9_TURBO: "192.168.180.172",
  UOG: "10.25.35.178",
};

// Try to use the primary IP, but fall back to localhost if needed
// You can change this to use any of the IPs above
export const BACKEND_URL = `http://${IP_ADDRESS.IP_HOME_1}:1310`;
export const DELIVERY_FEE = 3;
export const SERVICE_FEE = 1;

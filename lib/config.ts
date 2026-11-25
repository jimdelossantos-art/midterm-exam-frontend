export const CONFIG = {
  API_BASE_URL:
    process.env.NEXT_PUBLIC_API_BASE_URL || "https://midterm-exam-backend.onrender.com",
  STORAGE_KEYS: {
    ACCESS_TOKEN: "accessToken",
    REFRESH_TOKEN: "refreshToken",
  },
  ROUTES: {
    HOME: "/",
    LOGIN: "/login",
    REGISTER: "/register",
    DASHBOARD: "/dashboard",
  },
  ENDPOINTS: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    CLIENTS: "/api/clients",
    PRODUCTS: "/api/products",
  },
} as const;
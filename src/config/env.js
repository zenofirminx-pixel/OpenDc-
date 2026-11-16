
export const config = {
  apiBaseUrl: (import.meta.env.OPEN_DC_API_BASE_URL || 'https://backend-two-teal-20.vercel.app').replace(/\/$/, ''),
  apiEnabled: import.meta.env.OPEN_DC_API_ENABLED !== 'false'
};

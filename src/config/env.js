
export const config = {
  apiBaseUrl: (import.meta.env.OPEN_DC_API_BASE_URL || 'http://localhost:3000').replace(/\/$/, ''),
  apiEnabled: import.meta.env.OPEN_DC_API_ENABLED !== 'false'
};

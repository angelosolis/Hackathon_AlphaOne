// API configuration
// Change this to your local network IP when testing on other devices
export const API_BASE_URL = 'http://192.168.8.191:3001';

// API endpoints
export const ENDPOINTS = {
  // Auth
  LOGIN: `${API_BASE_URL}/api/auth/login`,
  REGISTER: `${API_BASE_URL}/api/auth/register`,
  
  // Users
  USER_PROFILE: `${API_BASE_URL}/api/users/profile`,
  USER_PROFILE_IMAGE: `${API_BASE_URL}/api/users/profile/image`,
  USER_PROFILE_CLIENT: `${API_BASE_URL}/api/users/profile/client`,
  UPLOAD_ID_DOCUMENT: `${API_BASE_URL}/api/users/upload-id-document`,
  VERIFY_FACE: `${API_BASE_URL}/api/users/verify-face`,
  VERIFY_EMPLOYMENT: `${API_BASE_URL}/api/users/verify-employment`,
  GET_AGENTS: `${API_BASE_URL}/api/users/agents/public`,
  
  // Properties
  PROPERTIES: `${API_BASE_URL}/api/properties`,
  PROPERTY_DETAIL: (id: string) => `${API_BASE_URL}/api/properties/${id}`,
  
  // AI
  AI_ENDPOINTS: `${API_BASE_URL}/api/ai`,
};

export default ENDPOINTS; 
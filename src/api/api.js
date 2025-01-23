const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const createData = async ({ startDateTime, endDateTime, id }) => {
  const response = await fetch(`${API_BASE_URL}/api/qrcode`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ startDateTime, endDateTime, id }),
  });
  const result = await response.json();
  return result;
};

export const viewData = async (qrId) => {
  const response = await fetch(`${API_BASE_URL}/api/result?id=${qrId}`, {
    method: 'GET',
  });
  const result = await response.json();
  return result;
};

export const registerUser = async ({ phone, nickname, userId, password }) => {
  const response = await fetch(`${API_BASE_URL}/api/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ phone, nickname, userId, password }),
  });
  const result = await response.json();
  return result;
};

export const loginUser = async ({ email, password }) => {
  const response = await fetch(`${API_BASE_URL}/api/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });
  const result = await response.json();
  return result;
};

export const verifyPhone = async (phone) => {
  const response = await fetch(`${API_BASE_URL}/api/verify-phone`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ phone }),
  });
  const result = await response.json();
  return result;
};
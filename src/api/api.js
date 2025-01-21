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

export const registerUser = async ({ name, userId, qrId }) => {
  console.log(name);
  console.log(userId);
  console.log(qrId);
  const response = await fetch(`${API_BASE_URL}/api/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ qrId, name, userId }),
  });
  const result = await response.json();
  return result;
};
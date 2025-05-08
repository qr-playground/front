import axios from "./axios";

export async function uploadImage(file: File): Promise<{ id: string }> {
  const formData = new FormData();
  formData.append("image", file);

  // 여기서 반드시 'multipart/form-data' 로 설정하세요.
  const response = await axios.post("/image", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data.data;
}

export async function getImage(imageId: string): Promise<string> {
  const res = await axios.get(`/image/${imageId}`); // JSON
  return res.data.data; // presigned URL 이어도 OK
}

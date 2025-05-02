import axios from "axios";
const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}`;

export const getProfile = async (token: string) => {
  // console.log(token, 'getProfile');
  const res = await axios.get(`${apiUrl}auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};

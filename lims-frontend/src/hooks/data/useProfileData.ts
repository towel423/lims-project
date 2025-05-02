import { getProfile } from "../../api/user";

export const useProfileData = async (token: string) => {
  const data = await getProfile(token);
  return data;
};

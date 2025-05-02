import { useQuery } from "@tanstack/react-query";
import { getProfileDetail } from "../../../api/user/profile";

export const useQueryProfile = () => {
  return useQuery({
    queryKey: ["profile-data"],
    queryFn: () => getProfileDetail(),
  });
};

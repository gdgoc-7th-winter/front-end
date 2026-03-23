
import { useQuery } from "@tanstack/react-query";
import { getCurrentUser, isProfileSetupRequiredError, ProfileRequestError } from "../api/profile";
import type { CurrentUserResponse } from "../api/profile";

const dummyUser: CurrentUserResponse = {
  nickname: "dummy",
  profilePicture: "/default_profile.png",
  isDummyProfile: true,
};

export function useOptionalCurrentUser() {
  return useQuery({
    queryKey: ["current-user"],
    queryFn: async () => {
      try {
        const response = await getCurrentUser();
        return response.data;
      } catch (error) {
        if (isProfileSetupRequiredError(error)) {
          return dummyUser;
        }

        if (error instanceof ProfileRequestError && (error.status === 401 || error.status === 403)) {
          return null;
        }

        throw error;
      }
    },
    retry: false,
    staleTime: 1000 * 60 * 5,
  });
}

import { auth, apiClient } from "../api";
import { UserProfile, OperationType } from "../types";
import { handleFirestoreError } from "./errorService";

const USERS_COLLECTION = "users";

export const syncUserProfile = async () => {
  const user = auth.currentUser;
  if (!user) return;

  try {
    await apiClient.post('/users/sync', {
      uid: user.uid,
      displayName: user.displayName || "Anonymous Reader",
      photoURL: user.photoURL || "",
      email: user.email || "",
      dailyGoal: 40,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, USERS_COLLECTION);
  }
};

export const subscribeToUserProfile = (userId: string, callback: (user: UserProfile) => void) => {
  // Mock realtime logic with polling or just fetching once as fetch doesn't have subscribe easily unless SSE/Websockets are used
  const fetchProfile = async () => {
    try {
      const user = await apiClient.get(`/users/${userId}`);
      if (user) callback(user);
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, USERS_COLLECTION);
    }
  };
  fetchProfile();
  const interval = setInterval(fetchProfile, 10000);
  return () => clearInterval(interval);
};

export const searchUsers = async (searchTerm: string) => {
  try {
    const users = await apiClient.get(`/users/search?term=${encodeURIComponent(searchTerm)}`);
    return users as UserProfile[];
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, USERS_COLLECTION);
  }
};

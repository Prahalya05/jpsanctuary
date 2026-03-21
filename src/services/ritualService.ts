import { auth, apiClient } from "../api";
import { Ritual, Log, OperationType } from "../types";
import { handleFirestoreError } from "./errorService";
import { format } from "date-fns";

const RITUALS_COLLECTION = "rituals";
const LOGS_COLLECTION = "logs";

export const createRitual = async (ritual: Omit<Ritual, "id" | "streakCount" | "createdBy">) => {
  try {
    const response = await apiClient.post('/rituals', {
      ...ritual,
      streakCount: 0,
      createdBy: auth.currentUser?.uid,
    });
    return response.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, RITUALS_COLLECTION);
  }
};

export const subscribeToUserRituals = (userId: string, callback: (rituals: Ritual[]) => void) => {
  const fetchRituals = async () => {
    try {
      const rituals = await apiClient.get(`/rituals?memberId=${userId}`);
      callback(rituals);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, RITUALS_COLLECTION);
    }
  };
  fetchRituals();
  const interval = setInterval(fetchRituals, 10000);
  return () => clearInterval(interval);
};

export const logReading = async (log: Omit<Log, "id" | "timestamp">) => {
  const userId = auth.currentUser?.uid;
  if (!userId) return;

  try {
    await apiClient.post('/logs', {
      ...log,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, LOGS_COLLECTION);
  }
};

export const subscribeToRitualLogs = (ritualId: string, callback: (logs: Log[]) => void) => {
  const fetchLogs = async () => {
    try {
      const logs = await apiClient.get(`/logs?ritualId=${ritualId}`);
      callback(logs);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, LOGS_COLLECTION);
    }
  };
  fetchLogs();
  const interval = setInterval(fetchLogs, 10000);
  return () => clearInterval(interval);
};

export const subscribeToAllLogs = (callback: (logs: Log[]) => void) => {
  const fetchLogs = async () => {
    try {
      const logs = await apiClient.get('/logs');
      callback(logs);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, LOGS_COLLECTION);
    }
  };
  fetchLogs();
  const interval = setInterval(fetchLogs, 10000);
  return () => clearInterval(interval);
};

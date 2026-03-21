export interface UserProfile {
  uid: string;
  displayName: string;
  photoURL?: string;
  email: string;
  dailyGoal?: number;
  createdAt: string;
}

export interface Book {
  id?: string;
  userId: string;
  title: string;
  author: string;
  coverURL?: string;
  status: "reading" | "completed";
  totalPages: number;
  currentPage: number;
  completedAt?: string | null;
  addedAt: string;
}

export interface Ritual {
  id?: string;
  name: string;
  members: string[]; // UIDs
  modality: "shared" | "individual";
  sharedBookId?: string;
  dailyThreshold: number;
  logTime: string; // HH:mm
  streakCount: number;
  lastSyncDate?: string | null; // YYYY-MM-DD
  createdBy: string;
  status: "active" | "archived";
  createdAt: string;
}

export interface Log {
  id?: string;
  ritualId: string;
  userId: string;
  bookId: string;
  pagesRead: number;
  date: string; // YYYY-MM-DD
  timestamp: string;
  isCompleted?: boolean;
  note?: string;
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string;
    email?: string;
    emailVerified?: boolean;
    isAnonymous?: boolean;
    tenantId?: string | null;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

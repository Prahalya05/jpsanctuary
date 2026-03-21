import { apiClient } from "../api";
import { Book, OperationType } from "../types";
import { handleFirestoreError } from "./errorService";

const BOOKS_COLLECTION = "books";

export const addBook = async (book: Omit<Book, "id" | "status" | "currentPage">) => {
  try {
    const response = await apiClient.post('/books', {
      ...book,
      status: "reading",
      currentPage: 0,
    });
    return response.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, BOOKS_COLLECTION);
  }
};

export const updateBookProgress = async (bookId: string, currentPage: number, isCompleted: boolean) => {
  try {
    const data: any = { 
      currentPage,
      status: isCompleted ? "completed" : "reading",
      completedAt: isCompleted ? new Date().toISOString() : null
    };
    await apiClient.put(`/books/${bookId}`, data);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, BOOKS_COLLECTION);
  }
};

export const subscribeToUserBooks = (userId: string, callback: (books: Book[]) => void) => {
  const fetchBooks = async () => {
    try {
      const books = await apiClient.get(`/books?userId=${userId}`);
      callback(books);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, BOOKS_COLLECTION);
    }
  };
  fetchBooks();
  const interval = setInterval(fetchBooks, 10000);
  return () => clearInterval(interval);
};

export const deleteBook = async (bookId: string) => {
  try {
    await apiClient.delete(`/books/${bookId}`);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, BOOKS_COLLECTION);
  }
};

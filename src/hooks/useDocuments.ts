import { useState, useEffect, useCallback } from 'react';
import { Document, CreateDocumentData, UpdateDocumentData } from '../types';
import { documentsApi } from '../services/documentsApi';

export interface UseDocumentsReturn {
  documents: Document[];
  loading: boolean;
  error: string | null;
  createDocument: (documentData: CreateDocumentData) => Promise<Document>;
  updateDocument: (documentData: UpdateDocumentData) => Promise<Document>;
  deleteDocument: (id: string) => Promise<void>;
  refreshDocuments: () => Promise<void>;
}

export const useDocuments = (): UseDocumentsReturn => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDocuments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const documentsData = await documentsApi.getDocuments();
      setDocuments(documentsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch documents');
      console.error('Error fetching documents:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createDocument = useCallback(async (documentData: CreateDocumentData): Promise<Document> => {
    try {
      setError(null);
      const newDocument = await documentsApi.createDocument(documentData);
      
      // Update local state
      setDocuments(prev => [newDocument, ...prev]);
      
      return newDocument;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create document';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const updateDocument = useCallback(async (documentData: UpdateDocumentData): Promise<Document> => {
    try {
      setError(null);
      const updatedDocument = await documentsApi.updateDocument(documentData);
      
      // Update local state
      setDocuments(prev => prev.map(document => 
        document.id === updatedDocument.id ? updatedDocument : document
      ));
      
      return updatedDocument;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update document';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const deleteDocument = useCallback(async (id: string): Promise<void> => {
    try {
      setError(null);
      await documentsApi.deleteDocument(id);
      
      // Update local state
      setDocuments(prev => prev.filter(document => document.id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete document';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const refreshDocuments = useCallback(async (): Promise<void> => {
    await fetchDocuments();
  }, [fetchDocuments]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  return {
    documents,
    loading,
    error,
    createDocument,
    updateDocument,
    deleteDocument,
    refreshDocuments,
  };
};

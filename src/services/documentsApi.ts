import { Document, CreateDocumentData, UpdateDocumentData } from '../types';
import { mockDocumentsApi } from './mockDocumentsApi';

// For now, use mock API. Replace with real API when backend is ready
const USE_MOCK_API = true;

class DocumentsApi {
  async getDocuments(): Promise<Document[]> {
    if (USE_MOCK_API) {
      return mockDocumentsApi.getDocuments();
    }
    throw new Error('Real API not implemented yet');
  }

  async getDocumentById(id: string): Promise<Document> {
    if (USE_MOCK_API) {
      return mockDocumentsApi.getDocumentById(id);
    }
    throw new Error('Real API not implemented yet');
  }

  async createDocument(documentData: CreateDocumentData): Promise<Document> {
    if (USE_MOCK_API) {
      return mockDocumentsApi.createDocument(documentData);
    }
    throw new Error('Real API not implemented yet');
  }

  async updateDocument(documentData: UpdateDocumentData): Promise<Document> {
    if (USE_MOCK_API) {
      return mockDocumentsApi.updateDocument(documentData);
    }
    throw new Error('Real API not implemented yet');
  }

  async deleteDocument(id: string): Promise<void> {
    if (USE_MOCK_API) {
      return mockDocumentsApi.deleteDocument(id);
    }
    throw new Error('Real API not implemented yet');
  }
}

export const documentsApi = new DocumentsApi();

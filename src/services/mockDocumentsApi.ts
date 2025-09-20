import { Document, CreateDocumentData, UpdateDocumentData } from '../types';

// Mock data storage - Start with empty array
let documents: Document[] = [];

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

class MockDocumentsApi {
  // Function to add sample documents for testing
  addSampleDocuments() {
    if (documents.length === 0) {
      documents = [
        {
          id: '1',
          name: 'Business Plan 2024.pdf',
          location: 'Documents/Business',
          owner: 'John Doe',
          fileSize: '2.5 MB',
          uploadDate: '2024-01-15',
          type: 'pdf',
          createdAt: '2024-01-15T00:00:00Z',
          updatedAt: '2024-01-15T00:00:00Z'
        },
        {
          id: '2',
          name: 'Financial Projections.xlsx',
          location: 'Documents/Financial',
          owner: 'Jane Smith',
          fileSize: '1.2 MB',
          uploadDate: '2024-01-12',
          type: 'xlsx',
          createdAt: '2024-01-12T00:00:00Z',
          updatedAt: '2024-01-12T00:00:00Z'
        },
        {
          id: '3',
          name: 'Market Research.docx',
          location: 'Documents/Research',
          owner: 'Mike Johnson',
          fileSize: '3.1 MB',
          uploadDate: '2024-01-10',
          type: 'docx',
          createdAt: '2024-01-10T00:00:00Z',
          updatedAt: '2024-01-10T00:00:00Z'
        }
      ];
    }
  }

  async getDocuments(): Promise<Document[]> {
    await delay(500);
    return [...documents];
  }

  async getDocumentById(id: string): Promise<Document> {
    await delay(300);
    const document = documents.find(d => d.id === id);
    if (!document) {
      throw new Error('Document not found');
    }
    return document;
  }

  async createDocument(documentData: CreateDocumentData): Promise<Document> {
    await delay(800);
    
    const newDocument: Document = {
      id: Date.now().toString(),
      ...documentData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    documents.push(newDocument);
    return newDocument;
  }

  async updateDocument(documentData: UpdateDocumentData): Promise<Document> {
    await delay(800);
    
    const { id, ...updateData } = documentData;
    const documentIndex = documents.findIndex(d => d.id === id);
    
    if (documentIndex === -1) {
      throw new Error('Document not found');
    }
    
    documents[documentIndex] = {
      ...documents[documentIndex],
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    
    return documents[documentIndex];
  }

  async deleteDocument(id: string): Promise<void> {
    await delay(500);
    
    const documentIndex = documents.findIndex(d => d.id === id);
    if (documentIndex === -1) {
      throw new Error('Document not found');
    }
    
    documents.splice(documentIndex, 1);
  }
}

export const mockDocumentsApi = new MockDocumentsApi();

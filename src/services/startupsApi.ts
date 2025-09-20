interface StartupDocument {
  _id?: string;
  name: string;
  type: string;
  category: string;
  uploadDate: string | Date;
  description?: string;
  fileSize?: string;
  location?: string;
  source?: string;
}

interface StartupWithDocuments {
  _id: string;
  name: string;
  founder: string;
  sector: string;
  type: 'innovation' | 'incubation';
  status: 'pending' | 'active' | 'completed' | 'dropout';
  email: string;
  submissionDate: string;
  documents: StartupDocument[];
  documentCount: number;
  userId: {
    _id: string;
    fullName: string;
    email: string;
    username: string;
  };
}

interface GetStartupsWithDocumentsParams {
  search?: string;
  sector?: string;
  type?: string;
  status?: string;
  page?: number;
  limit?: number;
}

class StartupsApi {
  async getStartupsWithDocuments(params: GetStartupsWithDocumentsParams = {}): Promise<{
    startups: StartupWithDocuments[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalStartups: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }> {
    const queryParams = new URLSearchParams();
    
    if (params.search) queryParams.append('search', params.search);
    if (params.sector) queryParams.append('sector', params.sector);
    if (params.type) queryParams.append('type', params.type);
    if (params.status) queryParams.append('status', params.status);
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());

    const response = await fetch(`/api/startups/with-documents?${queryParams}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch startups: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || 'Failed to fetch startups');
    }

    return data.data;
  }
}

export const startupsApi = new StartupsApi();
export type { StartupWithDocuments, StartupDocument, GetStartupsWithDocumentsParams };

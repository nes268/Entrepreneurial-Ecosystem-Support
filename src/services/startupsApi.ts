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

// New interfaces for creating and updating a startup
interface CreateStartupPayload {
  name: string;
  founder: string;
  sector: string;
  type: 'innovation' | 'incubation';
  email: string; // Assuming email is collected during profile setup
  description?: string;
  website?: string;
  linkedinProfile?: string;
  teamSize?: number;
  foundedYear?: number;
  location?: string;
  trlLevel: number;
  coFounderNames?: string[]; // Added from EnterpriseInfo
}

interface UpdateStartupPayload extends Partial<CreateStartupPayload> {}

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

  async createStartupProfile(startupData: CreateStartupPayload): Promise<StartupWithDocuments> {
    const response = await fetch('/api/startups', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(startupData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create startup profile');
    }

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.message || 'Failed to create startup profile');
    }
    return data.data;
  }

  async updateStartupProfile(id: string, startupData: UpdateStartupPayload): Promise<StartupWithDocuments> {
    const response = await fetch(`/api/startups/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(startupData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update startup profile');
    }

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.message || 'Failed to update startup profile');
    }
    return data.data;
  }
}

export const startupsApi = new StartupsApi();
export type { StartupWithDocuments, StartupDocument, GetStartupsWithDocumentsParams, CreateStartupPayload, UpdateStartupPayload };


export type CreativeStatus = 'pending' | 'approved' | 'active' | 'rejected';

export interface Creative {
  id: string;
  creatorId: string;
  title: string;
  description: string;
  fileUrl: string;
  fileType: 'image' | 'video';
  status: CreativeStatus;
  feedback?: string;
  createdAt: string;
  updatedAt: string;
  performance?: {
    spend: number;
    impressions: number;
    clicks: number;
    conversions: number;
  };
}

export interface CreativeFormData {
  title: string;
  description: string;
  file: File;
}

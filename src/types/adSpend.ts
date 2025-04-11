
export interface AdSpendData {
    _id: string;
    postingId: string;
    date: string;
    businessId: string;
    businessCampaignId: string;
    metaAdAccountId: string;
    metaAdId: string;
    campaignId: string;
    adSetId: string;
    adCreativeId: string;
    spend: number;
    clicks: number;
    conversions: number;
    revenue: number;
    instagram_permalink: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
  }
  
  export interface AdSpendResponse {
    success: boolean;
    count: number;
    data: AdSpendData[];
  }
  


  
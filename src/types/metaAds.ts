
export interface MetaAdsAccount {
  id: string;
  name: string;
  currency: string;
  timeZone: string;
}

export interface MetaAdsCampaign {
  id: string;
  name: string;
  objective: string;
  status: string;
  spend: number;
}

export interface MetaAdsAdSet {
  id: string;
  name: string;
  campaignId: string;
  status: string;
}

export interface MetaAdsAd {
  id: string;
  name: string;
  adsetId: string;
  creativeId: string;
  status: string;
  impressions: number;
  clicks: number;
  spend: number;
  conversions: number;
}

export interface MetaAdsInsight {
  date: string;
  impressions: number;
  clicks: number;
  spend: number;
  cpc: number;
  ctr: number;
  conversions: number;
  costPerConversion: number;
}

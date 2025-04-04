
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from "@/hooks/use-toast";
import { MetaAdsAccount, MetaAdsCampaign, MetaAdsAdSet, MetaAdsAd, MetaAdsInsight } from '@/types/metaAds';
import { useAuth } from './AuthContext';
import { Creative } from '@/types/creative';
import { useCreatives } from './CreativeContext';

interface MetaAdsContextType {
  connected: boolean;
  connecting: boolean;
  account: MetaAdsAccount | null;
  insights: Record<string, MetaAdsInsight[]>;
  adData: Record<string, MetaAdsAd>;
  connectToMetaAds: () => Promise<void>;
  disconnectMetaAds: () => Promise<void>;
  getAdInsights: (creativeId: string, dateRange?: string) => Promise<MetaAdsInsight[]>;
  syncCreativePerformance: (creativeId: string) => Promise<void>;
  updateAdSpend: (creativeId: string, amount: number) => Promise<void>;
}

const MetaAdsContext = createContext<MetaAdsContextType | undefined>(undefined);

export const useMetaAds = () => {
  const context = useContext(MetaAdsContext);
  if (context === undefined) {
    throw new Error('useMetaAds must be used within a MetaAdsProvider');
  }
  return context;
};

export const MetaAdsProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const { creatives, updateCreativePerformance } = useCreatives();
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [account, setAccount] = useState<MetaAdsAccount | null>(null);
  const [insights, setInsights] = useState<Record<string, MetaAdsInsight[]>>({});
  const [adData, setAdData] = useState<Record<string, MetaAdsAd>>({});

  // Load Meta Ads connection from localStorage on initial load
  useEffect(() => {
    if (user && user.role === 'brand') {
      const savedConnection = localStorage.getItem(`adcreativex_meta_${user.id}`);
      if (savedConnection) {
        try {
          const { connected: savedConnected, account: savedAccount } = JSON.parse(savedConnection);
          setConnected(savedConnected);
          setAccount(savedAccount);
          
          // Load saved ad data if available
          const savedAdData = localStorage.getItem(`adcreativex_meta_ads_${user.id}`);
          if (savedAdData) {
            setAdData(JSON.parse(savedAdData));
          }
          
          // Load saved insights if available
          const savedInsights = localStorage.getItem(`adcreativex_meta_insights_${user.id}`);
          if (savedInsights) {
            setInsights(JSON.parse(savedInsights));
          }
        } catch (error) {
          console.error('Failed to parse saved Meta connection', error);
          localStorage.removeItem(`adcreativex_meta_${user.id}`);
        }
      }
    }
  }, [user]);

  // Save connection status to localStorage whenever it changes
  useEffect(() => {
    if (user && user.role === 'brand') {
      localStorage.setItem(`adcreativex_meta_${user.id}`, JSON.stringify({ connected, account }));
      
      // Save ad data and insights
      if (Object.keys(adData).length > 0) {
        localStorage.setItem(`adcreativex_meta_ads_${user.id}`, JSON.stringify(adData));
      }
      
      if (Object.keys(insights).length > 0) {
        localStorage.setItem(`adcreativex_meta_insights_${user.id}`, JSON.stringify(insights));
      }
    }
  }, [user, connected, account, adData, insights]);

  // Connect to Meta Ads API
  const connectToMetaAds = async () => {
    setConnecting(true);
    try {
      if (!user || user.role !== 'brand') {
        throw new Error('Only brand accounts can connect to Meta Ads');
      }

      // In a real app, this would redirect to Meta OAuth flow
      // For the MVP, we'll simulate a successful connection
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mock account data
      const mockAccount: MetaAdsAccount = {
        id: `act_${Math.floor(Math.random() * 1000000000)}`,
        name: `${user.companyName || 'Brand'} Ad Account`,
        currency: 'USD',
        timeZone: 'America/Los_Angeles',
      };

      setAccount(mockAccount);
      setConnected(true);
      
      toast({
        title: "Connected to Meta Ads",
        description: "Your Meta Ads account has been connected successfully.",
      });
      
      return;
    } catch (error) {
      console.error('Meta Ads connection error:', error);
      toast({
        variant: "destructive",
        title: "Connection failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
      });
      throw error;
    } finally {
      setConnecting(false);
    }
  };

  // Disconnect from Meta Ads
  const disconnectMetaAds = async () => {
    try {
      if (!user) {
        throw new Error('You must be logged in');
      }

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      setAccount(null);
      setConnected(false);
      setAdData({});
      setInsights({});
      
      // Remove saved data
      localStorage.removeItem(`adcreativex_meta_${user.id}`);
      localStorage.removeItem(`adcreativex_meta_ads_${user.id}`);
      localStorage.removeItem(`adcreativex_meta_insights_${user.id}`);
      
      toast({
        title: "Disconnected from Meta Ads",
        description: "Your Meta Ads account has been disconnected.",
      });
      
      return;
    } catch (error) {
      console.error('Meta Ads disconnection error:', error);
      toast({
        variant: "destructive",
        title: "Disconnection failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
      });
      throw error;
    }
  };

  // Get ad insights for a creative
  const getAdInsights = async (creativeId: string, dateRange: string = '30d'): Promise<MetaAdsInsight[]> => {
    try {
      if (!connected || !account) {
        throw new Error('Meta Ads not connected');
      }

      // Check if we already have cached insights
      if (insights[creativeId]) {
        return insights[creativeId];
      }

      // Simulate API call to get insights
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Generate mock insights data
      const mockInsights: MetaAdsInsight[] = [];
      const now = new Date();
      const days = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90;
      
      for (let i = 0; i < days; i++) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        
        const impressions = Math.floor(Math.random() * 1000) + 100;
        const clicks = Math.floor(Math.random() * 50) + 5;
        const spend = parseFloat((Math.random() * 50 + 10).toFixed(2));
        const conversions = Math.floor(Math.random() * 5);
        
        mockInsights.push({
          date: date.toISOString().split('T')[0],
          impressions,
          clicks,
          spend,
          cpc: parseFloat((spend / clicks).toFixed(2)),
          ctr: parseFloat(((clicks / impressions) * 100).toFixed(2)),
          conversions,
          costPerConversion: conversions > 0 ? parseFloat((spend / conversions).toFixed(2)) : 0,
        });
      }
      
      // Cache the insights
      setInsights(prev => ({
        ...prev,
        [creativeId]: mockInsights
      }));
      
      return mockInsights;
    } catch (error) {
      console.error('Error fetching ad insights:', error);
      return [];
    }
  };

  // Sync creative performance with Meta Ads data - Fixed return type to Promise<void>
  const syncCreativePerformance = async (creativeId: string): Promise<void> => {
    try {
      if (!connected || !account) {
        throw new Error('Meta Ads not connected');
      }

      const creative = creatives.find(c => c.id === creativeId);
      if (!creative) {
        throw new Error('Creative not found');
      }

      // Get or generate ad data for this creative
      let ad = adData[creativeId];
      if (!ad) {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Create mock ad data
        ad = {
          id: `ad_${Math.floor(Math.random() * 1000000000)}`,
          name: creative.title,
          adsetId: `adset_${Math.floor(Math.random() * 1000000000)}`,
          creativeId: creative.id,
          status: 'ACTIVE',
          impressions: Math.floor(Math.random() * 10000) + 500,
          clicks: Math.floor(Math.random() * 500) + 20,
          spend: parseFloat((Math.random() * 1000 + 100).toFixed(2)),
          conversions: Math.floor(Math.random() * 50) + 1,
        };
        
        // Save the ad data
        setAdData(prev => ({
          ...prev,
          [creativeId]: ad
        }));
      }

      // Update creative performance
      await updateCreativePerformance(creativeId, ad.spend, {
        impressions: ad.impressions,
        clicks: ad.clicks,
        conversions: ad.conversions
      });

      toast({
        title: "Performance Synced",
        description: "Creative performance has been updated from Meta Ads data.",
      });
      
      // Return void to match the type definition
      return;
    } catch (error) {
      console.error('Error syncing creative performance:', error);
      toast({
        variant: "destructive",
        title: "Sync failed",
        description: error instanceof Error ? error.message : "Failed to sync with Meta Ads",
      });
      throw error;
    }
  };

  // Update ad spend for a creative
  const updateAdSpend = async (creativeId: string, amount: number) => {
    try {
      if (!user) {
        throw new Error('You must be logged in');
      }

      // Get existing ad data or create new
      let ad = adData[creativeId];
      if (!ad) {
        const creative = creatives.find(c => c.id === creativeId);
        if (!creative) {
          throw new Error('Creative not found');
        }
        
        ad = {
          id: `ad_${Math.floor(Math.random() * 1000000000)}`,
          name: creative.title,
          adsetId: `adset_${Math.floor(Math.random() * 1000000000)}`,
          creativeId: creative.id,
          status: 'ACTIVE',
          impressions: Math.floor(Math.random() * 1000) + 100,
          clicks: Math.floor(Math.random() * 50) + 5,
          spend: amount,
          conversions: Math.floor(Math.random() * 5),
        };
      } else {
        // Update existing ad data
        ad = {
          ...ad,
          spend: amount
        };
      }
      
      // Save updated ad data
      setAdData(prev => ({
        ...prev,
        [creativeId]: ad
      }));
      
      // Update creative performance
      await updateCreativePerformance(creativeId, amount, {
        impressions: ad.impressions,
        clicks: ad.clicks,
        conversions: ad.conversions
      });
      
      toast({
        title: "Spend Updated",
        description: `Ad spend for creative has been updated to $${amount.toFixed(2)}`,
      });
    } catch (error) {
      console.error('Error updating ad spend:', error);
      toast({
        variant: "destructive",
        title: "Update failed",
        description: error instanceof Error ? error.message : "Failed to update ad spend",
      });
      throw error;
    }
  };

  return (
    <MetaAdsContext.Provider 
      value={{ 
        connected, 
        connecting, 
        account,
        insights,
        adData,
        connectToMetaAds, 
        disconnectMetaAds,
        getAdInsights,
        syncCreativePerformance,
        updateAdSpend
      }}
    >
      {children}
    </MetaAdsContext.Provider>
  );
};

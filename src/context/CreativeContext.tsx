
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Creative, CreativeStatus } from '@/types/creative';
import { useAuth } from './AuthContext';
import { toast } from "@/hooks/use-toast";

interface CreativeContextType {
  creatives: Creative[];
  isLoading: boolean;
  uploadCreative: (title: string, description: string, file: File) => Promise<void>;
  updateCreativeStatus: (id: string, status: CreativeStatus, feedback?: string) => Promise<void>;
  updateCreativePerformance: (id: string, spend: number, metrics?: Partial<Creative['performance']>) => Promise<void>;
  getCreativeById: (id: string) => Creative | undefined;
  getUserCreatives: (userId: string) => Creative[];
}

const CreativeContext = createContext<CreativeContextType | undefined>(undefined);

export const useCreatives = () => {
  const context = useContext(CreativeContext);
  if (context === undefined) {
    throw new Error('useCreatives must be used within a CreativeProvider');
  }
  return context;
};

export const CreativeProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [creatives, setCreatives] = useState<Creative[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load creatives from localStorage on initial load
  useEffect(() => {
    const savedCreatives = localStorage.getItem('adcreativex_creatives');
    if (savedCreatives) {
      try {
        setCreatives(JSON.parse(savedCreatives));
      } catch (error) {
        console.error('Failed to parse saved creatives', error);
        localStorage.removeItem('adcreativex_creatives');
      }
    }
    setIsLoading(false);
  }, []);

  // Save creatives to localStorage whenever they change
  useEffect(() => {
    if (creatives.length > 0) {
      localStorage.setItem('adcreativex_creatives', JSON.stringify(creatives));
    }
  }, [creatives]);

  // Upload a new creative
  const uploadCreative = async (title: string, description: string, file: File) => {
    setIsLoading(true);
    try {
      if (!user) {
        throw new Error('You must be logged in to upload creatives');
      }

      // Simulate file upload
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Create a data URL for the file (in a real app, this would be a CDN URL)
      const fileReader = new FileReader();
      const fileUrl = await new Promise<string>((resolve, reject) => {
        fileReader.onload = () => resolve(fileReader.result as string);
        fileReader.onerror = reject;
        fileReader.readAsDataURL(file);
      });

      const fileType = file.type.startsWith('image/') ? 'image' : 'video';

      const newCreative: Creative = {
        id: Date.now().toString(),
        creatorId: user.id,
        title,
        description,
        fileUrl,
        fileType,
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setCreatives(prev => [...prev, newCreative]);
      
      toast({
        title: "Creative uploaded",
        description: "Your creative has been submitted for approval.",
      });
      
      return;
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Update creative status
  const updateCreativeStatus = async (id: string, status: CreativeStatus, feedback?: string) => {
    setIsLoading(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));

      setCreatives(prev => prev.map(creative => 
        creative.id === id 
          ? { 
              ...creative, 
              status, 
              feedback: feedback || creative.feedback,
              updatedAt: new Date().toISOString()
            } 
          : creative
      ));
      
      toast({
        title: `Creative ${status}`,
        description: `The creative has been ${status}.`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Update failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Update creative performance metrics
  const updateCreativePerformance = async (id: string, spend: number, metrics?: Partial<Creative['performance']>) => {
    setIsLoading(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));

      setCreatives(prev => prev.map(creative => {
        if (creative.id === id) {
          const currentPerformance = creative.performance || {
            spend: 0,
            impressions: 0,
            clicks: 0,
            conversions: 0
          };

          return { 
            ...creative, 
            performance: {
              ...currentPerformance,
              spend,
              ...(metrics || {})
            },
            status: 'active', // Set to active when performance is updated
            updatedAt: new Date().toISOString()
          };
        }
        return creative;
      }));
      
      toast({
        title: "Performance updated",
        description: "The creative performance metrics have been updated.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Update failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Get a creative by ID
  const getCreativeById = (id: string) => {
    return creatives.find(creative => creative.id === id);
  };

  // Get all creatives for a specific user
  const getUserCreatives = (userId: string) => {
    return creatives.filter(creative => creative.creatorId === userId);
  };

  return (
    <CreativeContext.Provider 
      value={{ 
        creatives, 
        isLoading, 
        uploadCreative, 
        updateCreativeStatus, 
        updateCreativePerformance, 
        getCreativeById,
        getUserCreatives
      }}
    >
      {children}
    </CreativeContext.Provider>
  );
};

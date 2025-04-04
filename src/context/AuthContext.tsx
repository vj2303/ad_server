import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from "@/hooks/use-toast";

type UserRole = 'brand' | 'creator';

interface User {
  id: string;
  email: string;
  role: UserRole;
  name: string;
  bio?: string;
  companyName?: string;
  industry?: string;
  website?: string;
  specialty?: string;
  portfolioLink?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, role: UserRole, profileData: Partial<User>) => Promise<void>;
  logout: () => void;
  updateProfile: (profileData: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const API_BASE_URL = 'https://metaback-production.up.railway.app/';

  // Check for saved user token on initial load
  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = localStorage.getItem('adcreativex_token');
      if (token) {
        try {
          // Validate token with backend (you might want to add this endpoint)
          // For now, we'll just load the saved user data
          const savedUser = localStorage.getItem('adcreativex_user');
          if (savedUser) {
            setUser(JSON.parse(savedUser));
          }
        } catch (error) {
          console.error('Failed to validate auth token', error);
          localStorage.removeItem('adcreativex_token');
          localStorage.removeItem('adcreativex_user');
        }
      }
      setLoading(false);
    };
    
    checkAuthStatus();
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email, 
          password 
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }
      
      const data = await response.json();
      
      // Save auth token
      localStorage.setItem('adcreativex_token', data.jwtToken);
      
      // Format user data from API response
      const userData: User = {
        id: data.user._id || data.user.id,
        email: data.user.email,
        name: data.user.name,
        role: data.user.companyType === 'Brand Creator' ? 'brand' : 'creator',
        companyName: data.user.companyName,
        industry: data.user.industryName,
        website: data.user.companyWebsite,
      };
      
      setUser(userData);
      localStorage.setItem('adcreativex_user', JSON.stringify(userData));
      
      toast({
        title: "Login successful",
        description: `Welcome back, ${userData.name || userData.email}!`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Login failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Updated register function to handle JWT token properly from signup endpoint
  const register = async (email: string, password: string, role: UserRole, profileData: Partial<User>) => {
    setLoading(true);
    try {
      // Step 1: Register user authentication
      const authPayload = {
        fullname: profileData.name || '',
        email: email,
        password: password
      };
      
      const authResponse = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(authPayload),
      });
      
      if (!authResponse.ok) {
        const errorData = await authResponse.json();
        throw new Error(errorData.message || 'User registration failed');
      }
      
      const authData = await authResponse.json();
      
      // Save JWT token from response
      const token = authData.jwtToken;
      localStorage.setItem('adcreativex_token', token);
      
      // Step 2: Register company information
      const companyPayload = {
        companyName: profileData.companyName || '',
        industryName: profileData.industry || '',
        companyWebsite: profileData.website || '',
        companyType: role === 'brand' ? 'Brand' : 'Creator'
      };
      
      const companyResponse = await fetch(`${API_BASE_URL}/api/info`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(companyPayload),
      });
      
      if (!companyResponse.ok) {
        const errorData = await companyResponse.json();
        throw new Error(errorData.message || 'Company registration failed');
      }
      
      const companyData = await companyResponse.json();
      
      // Combine user data from both responses - using the user object from auth response
      const userData: User = {
        id: authData.user._id || authData.user.id, // Use _id as that's what the API returns
        email: email,
        name: profileData.name || '',
        role: role,
        companyName: profileData.companyName,
        industry: profileData.industry,
        website: profileData.website,
      };
      
      setUser(userData);
      localStorage.setItem('adcreativex_user', JSON.stringify(userData));
      
      toast({
        title: "Registration successful",
        description: "Your account has been created successfully.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Registration failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    setUser(null);
    localStorage.removeItem('adcreativex_token');
    localStorage.removeItem('adcreativex_user');
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
  };

  // Update user profile with real API
  const updateProfile = async (profileData: Partial<User>) => {
    setLoading(true);
    try {
      if (!user) {
        throw new Error('Not logged in');
      }
      
      const token = localStorage.getItem('adcreativex_token');
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      // Format request body according to API requirements
      const requestBody = {
        name: profileData.name,
        companyName: profileData.companyName,
        industryName: profileData.industry,
        companyWebsite: profileData.website,
        bio: profileData.bio,
        specialty: profileData.specialty,
        portfolioLink: profileData.portfolioLink,
      };
      
      const response = await fetch(`${API_BASE_URL}/auth/update-profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestBody),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Profile update failed');
      }
      
      const data = await response.json();
      
      // Update user with response data
      const updatedUser = { 
        ...user, 
        ...profileData 
      };
      
      setUser(updatedUser);
      localStorage.setItem('adcreativex_user', JSON.stringify(updatedUser));
      
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Update failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};
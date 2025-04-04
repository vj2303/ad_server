import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

// Create the context
const MetaAccountsContext = createContext();

// Provider component
export const MetaAccountsProvider = ({ children }) => {
  const [metaBusinesses, setMetaBusinesses] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Fetch all accounts from the API
  const fetchAccounts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const token = localStorage.getItem('adcreativex_token');
      if (!token) {
        setError('Authentication token not found');
        setIsLoading(false);
        return;
      }
      
      const response = await axios.get('https://metaback-production.up.railway.app/accounts', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.data && response.data.data) {
        // Handle different possible response structures
        if (Array.isArray(response.data.data)) {
          setMetaBusinesses(response.data.data);
        } else if (response.data.data.meta_businesses) {
          setMetaBusinesses(response.data.data.meta_businesses);
        } else {
          setMetaBusinesses([]);
        }
      } else {
        setMetaBusinesses([]);
      }
    } catch (err) {
      console.error('Error fetching accounts:', err);
      setError(err.response?.data?.message || 'Failed to load accounts');
    } finally {
      setIsLoading(false);
    }
  };

  // Save new accounts
  const saveAccounts = async (accountsData) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const token = localStorage.getItem('adcreativex_token');
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      const response = await axios.post(
        'https://metaback-production.up.railway.app/accounts',
        accountsData,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      // After successful save, refresh the accounts list
      await fetchAccounts();
      
      // Return the response data so it can be used by the caller
      return response.data;
    } catch (err) {
      console.error('Error saving accounts:', err);
      setError(err.response?.data?.message || 'Failed to save accounts');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Delete an account
  const deleteAccount = async (accountId) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const token = localStorage.getItem('adcreativex_token');
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      await axios.delete(`https://metaback-production.up.railway.app/accounts/${accountId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // After successful deletion, refresh the accounts list
      await fetchAccounts();
      
      return true;
    } catch (err) {
      console.error('Error deleting account:', err);
      setError(err.response?.data?.message || 'Failed to delete account');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Get business details by ID
  const getBusinessById = async (businessId) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const token = localStorage.getItem('adcreativex_token');
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      const response = await axios.get(`https://metaback-production.up.railway.app/accounts/business/${businessId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      return response.data.data;
    } catch (err) {
      console.error('Error fetching business details:', err);
      setError(err.response?.data?.message || 'Failed to load business details');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Force refresh of accounts
  const refreshAccounts = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  // Fetch accounts when component mounts or refreshTrigger changes
  useEffect(() => {
    fetchAccounts();
  }, [refreshTrigger]);

  const value = {
    metaBusinesses,
    isLoading,
    error,
    fetchAccounts,
    saveAccounts,
    deleteAccount,
    getBusinessById,
    refreshAccounts
  };

  return (
    <MetaAccountsContext.Provider value={value}>
      {children}
    </MetaAccountsContext.Provider>
  );
};

// Custom hook to use the context
export const useMetaAccounts = () => {
  const context = useContext(MetaAccountsContext);
  if (context === undefined) {
    throw new Error('useMetaAccounts must be used within a MetaAccountsProvider');
  }
  return context;
};
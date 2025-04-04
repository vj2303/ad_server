import React, { useEffect, useState } from 'react';
import { useMetaAccounts } from '@/context/MetaAccountsContext';
import { Loader, AlertCircle, RefreshCw, Trash, Bug } from 'lucide-react';

// Define TypeScript interfaces for our data structures
interface AdAccount {
  _id: string;
  meta_ad_account_id: string;
  meta_ad_account_name: string;
}

interface MetaBusiness {
  _id: string;
  meta_business_id: string;
  meta_business_name: string;
  accounts: AdAccount[];
}

interface BusinessResponse {
  _id: string;
  businessId: string;
  meta_businesses: MetaBusiness[];
  __v: number;
}

const AccountsPage: React.FC = () => {
  const {
    isLoading,
    error,
    deleteAccount,
    refreshAccounts,
    getBusinessById,
    metaBusinesses
  } = useMetaAccounts();
  
  // State for businesses data
  const [businessesData, setBusinessesData] = useState<MetaBusiness[]>([]);
  
  // State for debugging information
  const [debugInfo, setDebugInfo] = useState<{
    isVisible: boolean;
    message: string;
    details?: any;
  }>({
    isVisible: false,
    message: '',
  });

  // Fetch accounts when component mounts
  useEffect(() => {
    // Get the businessId dynamically from localStorage or metaBusinesses
    const getBusinessId = () => {
      // First try to get from metaBusinesses
      if (metaBusinesses && metaBusinesses.length > 0) {
        if (metaBusinesses[0].businessId) {
          return metaBusinesses[0].businessId;
        }
        if (metaBusinesses[0]._id) {
          return metaBusinesses[0]._id;
        }
      }
      
      // Then try from localStorage
      const savedBusinessId = localStorage.getItem('current_business_id');
      if (savedBusinessId) {
        return savedBusinessId;
      }
      
      // Finally use a fallback
      return "67ee1b444ff1ea1d4a656a90"; // Updated fallback ID from your response
    };
    
    const businessId = getBusinessId();
    
    const fetchBusinessDetails = async () => {
      try {
        setDebugInfo({
          isVisible: true,
          message: `Attempting to fetch business details for ID: ${businessId}`,
        });
        
        const response = await getBusinessById(businessId);
        
        setDebugInfo({
          isVisible: true,
          message: 'Successfully fetched business details',
          details: response
        });
        
        // Extract meta_businesses from the response
        if (Array.isArray(response) && response.length > 0 && response[0].meta_businesses) {
          setBusinessesData(response[0].meta_businesses);
        } else {
          console.error("Unexpected response structure:", response);
          setDebugInfo(prev => ({
            ...prev,
            message: 'Unexpected response structure',
          }));
        }
      } catch (err) {
        console.error("Error fetching business details:", err);
        setDebugInfo({
          isVisible: true,
          message: 'Error fetching business details',
          details: err instanceof Error ? err.message : String(err)
        });
      }
    };
    
    fetchBusinessDetails();
  }, [getBusinessById, metaBusinesses]);

  const handleDeleteAccount = async (id: string) => {
    try {
      setDebugInfo({
        isVisible: true,
        message: `Attempting to delete account with ID: ${id}`,
      });
      
      await deleteAccount(id);
      
      setDebugInfo({
        isVisible: true,
        message: 'Account deleted successfully',
      });
      
      // Show success message
      alert('Account deleted successfully');
      
      // Refresh the data
      refreshAccounts();
    } catch (err) {
      console.error('Error deleting account:', err);
      
      setDebugInfo({
        isVisible: true,
        message: 'Failed to delete account',
        details: err instanceof Error ? err.message : String(err)
      });
      
      alert('Failed to delete account. Please try again.');
    }
  };

  const handleRefresh = () => {
    setDebugInfo({
      isVisible: true,
      message: 'Refreshing accounts data...',
    });
    refreshAccounts();
  };

  const toggleDebugInfo = () => {
    setDebugInfo(prev => ({
      ...prev,
      isVisible: !prev.isVisible
    }));
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Loader className="h-8 w-8 animate-spin text-blue-500 mb-4" />
        <p className="text-lg text-gray-700">Loading accounts...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 max-w-md w-full" role="alert">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            <strong className="font-bold">Error:</strong>
            <span className="block ml-2">{error}</span>
          </div>
        </div>
        <button 
          onClick={handleRefresh}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex items-center"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        {/* <h1 className="text-2xl font-bold text-gray-800">Connected Meta Accounts</h1> */}
        <div className="flex space-x-2">
          <button 
            onClick={toggleDebugInfo} 
            className=""
          >
            {/* <Bug className="h-4 w-4 mr-2" /> */}
            {debugInfo.isVisible}
          </button>
          {/* <button 
            onClick={handleRefresh} 
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex items-center"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button> */}
        </div>
      </div>

      {/* Debug Information Panel */}
      {/* {debugInfo.isVisible && (
        <div className="bg-gray-100 border border-gray-300 rounded-lg p-4 mb-6 overflow-auto max-h-64">
          <h3 className="text-lg font-semibold mb-2">Debug Information</h3>
          <p className="mb-2"><strong>Message:</strong> {debugInfo.message}</p>
          {debugInfo.details && (
            <div>
              <p className="font-semibold">Details:</p>
              <pre className="bg-gray-200 p-2 rounded mt-1 overflow-auto">
                {typeof debugInfo.details === 'object' 
                  ? JSON.stringify(debugInfo.details, null, 2) 
                  : debugInfo.details}
              </pre>
            </div>
          )}
        </div>
      )} */}

      {businessesData.length === 0 ? (
        <div className="bg-gray-100 rounded-lg p-6 text-center">
          {/* <p className="text-lg text-gray-700">
            No Meta accounts connected. Please connect your accounts first.
          </p> */}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-1">
          {businessesData.map((business: MetaBusiness) => (
            <div 
              key={business._id} 
              className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200"
            >
              {/* <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">
                    {business.meta_business_name}
                  </h2>
                  <p className="text-sm text-gray-500">
                    ID: {business.meta_business_id}
                  </p>
                </div>
                <button
                  onClick={() => handleDeleteAccount(business._id)}
                  className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded flex items-center"
                >
                  <Trash className="h-4 w-4 mr-1" />
                  Delete
                </button>
              </div> */}
{/*               
              {business.accounts && business.accounts.length > 0 && (
                <div className="p-4">
                  <h3 className="text-lg font-medium text-gray-700 mb-2">
                  {business.meta_business_name}
                  </h3>
                  <ul className="list-disc pl-5 space-y-1">
                    {business.accounts.map((adAccount: AdAccount) => (
                      <li key={adAccount._id} className="text-gray-600">
                        {adAccount.meta_ad_account_name} ({adAccount.meta_ad_account_id})
                      </li>
                    ))}
                  </ul>
                </div>
              )} */}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AccountsPage;
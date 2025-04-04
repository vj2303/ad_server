import React, { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import DashboardLayout from '@/components/layout/DashboardLayout';
import AccountsPage from './AccountPage';
import { useAuth } from '@/context/AuthContext';
import { useMetaAccounts } from '@/context/MetaAccountsContext';

const Ad = () => {
  const { user } = useAuth();
  const { 
    saveAccounts, 
    refreshAccounts, 
    isLoading: contextLoading, 
    metaBusinesses 
  } = useMetaAccounts();
  
  const [userData, setUserData] = useState(() => {
    // Initialize userData from localStorage if available
    const savedUserData = localStorage.getItem('facebook_user_data');
    return savedUserData ? JSON.parse(savedUserData) : null;
  });
  
  const [error, setError] = useState(null);
  
  const [businesses, setBusinesses] = useState(() => {
    // Initialize businesses from localStorage if available
    const savedBusinesses = localStorage.getItem('facebook_businesses');
    return savedBusinesses ? JSON.parse(savedBusinesses) : [];
  });
  
  const [adAccounts, setAdAccounts] = useState(() => {
    // Initialize adAccounts from localStorage if available
    const savedAdAccounts = localStorage.getItem('facebook_ad_accounts');
    return savedAdAccounts ? JSON.parse(savedAdAccounts) : [];
  });
  
  // State to manage selected brands and ad accounts
  const [selectedBusinesses, setSelectedBusinesses] = useState(() => {
    const savedBusinesses = localStorage.getItem('selectedBusinesses');
    return savedBusinesses ? JSON.parse(savedBusinesses) : {};
  });
  
  const [selectedAdAccounts, setSelectedAdAccounts] = useState(() => {
    const savedAdAccounts = localStorage.getItem('selectedAdAccounts');
    return savedAdAccounts ? JSON.parse(savedAdAccounts) : {};
  });

  // Facebook SDK initialization
  useEffect(() => {
    const loadFbSdk = () => {
      if (window.FB) return;

      window.fbAsyncInit = function () {
        FB.init({
          appId: '750785526415113',
          cookie: true,
          xfbml: true,
          version: 'v22.0',
        });
      };

      (function (d, s, id) {
        var js, fjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id)) return;
        js = d.createElement(s);
        js.id = id;
        js.src = 'https://connect.facebook.net/en_US/sdk.js';
        fjs.parentNode.insertBefore(js, fjs);
      })(document, 'script', 'facebook-jssdk');
    };

    loadFbSdk();
  }, []);

  // Login with Ads Permission
  const loginWithAdsPermission = () => {
    FB.login(function (response) {
      if (response.authResponse) {
        const accessToken = response.authResponse.accessToken;
        
        // Store access token in session storage (not localStorage for security reasons)
        sessionStorage.setItem('facebook_access_token', accessToken);
        
        // Fetch new data while preserving existing selections
        fetchUserData(accessToken);
        fetchBusinesses(accessToken);
      } else {
        toast.error('Login was cancelled or failed');
      }
    }, { scope: 'ads_read, business_management', return_scopes: true });
  };

  // Fetch User Data
  const fetchUserData = (accessToken) => {
    const url = `https://graph.facebook.com/v22.0/me?fields=id,name,email&access_token=${accessToken}`;

    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        setUserData(data);
        // Store Facebook user data in localStorage
        localStorage.setItem('facebook_user_data', JSON.stringify(data));
        
        // Store Facebook user ID in localStorage for reference
        if (data && data.id) {
          localStorage.setItem('facebook_user_id', data.id);
        }
      })
      .catch((error) => {
        setError('Error fetching data');
        console.error(error);
      });
  };

  // Fetch Businesses
  const fetchBusinesses = (accessToken) => {
    const businessesUrl = `https://graph.facebook.com/v19.0/me/businesses?fields=id,name&limit=100&access_token=${accessToken}`;
  
    fetch(businessesUrl)
      .then((response) => response.json())
      .then((data) => {
        setBusinesses(data.data);
        // Store businesses in localStorage
        localStorage.setItem('facebook_businesses', JSON.stringify(data.data));
        fetchBrandAdAccounts(data.data, accessToken);
      })
      .catch((error) => {
        console.error('Error fetching businesses:', error);
        toast.error('Error fetching businesses');
      });
  };

  // Fetch Brand Ad Accounts
  const fetchBrandAdAccounts = (businesses, accessToken) => {
    const adAccountPromises = businesses.map((business) => {
      const brandAdAccountUrl = `https://graph.facebook.com/v22.0/${business.id}/owned_ad_accounts?fields=id,name&access_token=${accessToken}`;

      return fetch(brandAdAccountUrl)
        .then((response) => response.json())
        .then((data) => ({
          businessId: business.id,
          businessName: business.name,
          accounts: data.data
        }));
    });

    Promise.all(adAccountPromises)
      .then((results) => {
        const processedAdAccounts = results.flatMap(result =>
          result.accounts.map(account => ({
            ...account,
            businessId: result.businessId,
            businessName: result.businessName
          }))
        );
        setAdAccounts(processedAdAccounts);
        // Store ad accounts in localStorage
        localStorage.setItem('facebook_ad_accounts', JSON.stringify(processedAdAccounts));
        
        // Restore selected states if this is a re-login
        restoreSelectedStates(processedAdAccounts);
      })
      .catch((error) => {
        console.error('Error fetching brand ad accounts:', error);
        toast.error('Error fetching ad accounts');
      });
  };
  
  // Restore selected states after fetching fresh data
  const restoreSelectedStates = (newAdAccounts) => {
    // This function ensures selections are maintained even if new data is fetched
    // It's especially useful when the user reconnects or after page refresh
    
    // For any new accounts that weren't in the previous selection state,
    // we need to initialize their selection state (defaulting to false)
    const updatedAdAccountSelections = {...selectedAdAccounts};
    
    newAdAccounts.forEach(account => {
      if (updatedAdAccountSelections[account.id] === undefined) {
        updatedAdAccountSelections[account.id] = false;
      }
    });
    
    setSelectedAdAccounts(updatedAdAccountSelections);
    localStorage.setItem('selectedAdAccounts', JSON.stringify(updatedAdAccountSelections));
  };

  // Handle Brand Selection
  const handleBusinessSelect = (businessId) => {
    // Toggle the business selection
    const isBusinessSelected = !selectedBusinesses[businessId];

    const updatedBusinesses = {
      ...selectedBusinesses,
      [businessId]: isBusinessSelected
    };
    setSelectedBusinesses(updatedBusinesses);
    localStorage.setItem('selectedBusinesses', JSON.stringify(updatedBusinesses));
  
    // Get all ad accounts for this business
    const businessAdAccounts = adAccounts
      .filter(account => account.businessId === businessId)
      .map(account => account.id);
    
    // Update selected ad accounts based on business selection
    const updatedSelectedAdAccounts = {...selectedAdAccounts};
    businessAdAccounts.forEach(accountId => {
      updatedSelectedAdAccounts[accountId] = isBusinessSelected;
    });
    
    setSelectedAdAccounts(updatedSelectedAdAccounts);
    localStorage.setItem('selectedAdAccounts', JSON.stringify(updatedSelectedAdAccounts));
  };

  // Handle Ad Account Selection
  const handleAdAccountSelect = (adAccountId, businessId) => {
    const updatedAdAccounts = {
      ...selectedAdAccounts,
      [adAccountId]: !selectedAdAccounts[adAccountId]
    };
    setSelectedAdAccounts(updatedAdAccounts);
    localStorage.setItem('selectedAdAccounts', JSON.stringify(updatedAdAccounts));

    // Automatically select/deselect the business when all its ad accounts are selected/deselected
    const businessAdAccounts = adAccounts
      .filter(account => account.businessId === businessId)
      .map(account => account.id);
    
    const allAdAccountsSelected = businessAdAccounts.every(
      accountId => accountId === adAccountId ? updatedAdAccounts[accountId] : updatedAdAccounts[accountId]
    );

    const updatedBusinesses = {
      ...selectedBusinesses,
      [businessId]: allAdAccountsSelected
    };
    
    setSelectedBusinesses(updatedBusinesses);
    localStorage.setItem('selectedBusinesses', JSON.stringify(updatedBusinesses));
  };

  // Save Selected Accounts - Using the context
  const handleSaveAccount = async () => {
    try {
      // Get businessId from context if available
      const businessId = metaBusinesses.length > 0 && metaBusinesses[0]._id 
        ? metaBusinesses[0]._id 
        : localStorage.getItem('facebook_user_id') || 
          (userData && userData.id) || 
          'facebook_user';

      // Group selected accounts by business
      const selectedBusinessIds = Object.keys(selectedBusinesses)
        .filter(businessId => selectedBusinesses[businessId]);

      // Create the payload structure according to the expected format
      const accountsPayload = {
        businessId: businessId,
        meta_businesses: selectedBusinessIds.map(businessId => {
          // Find business info
          const business = businesses.find(b => b.id === businessId);
          
          // Find all selected ad accounts for this business
          const businessAdAccounts = adAccounts
            .filter(account => account.businessId === businessId && selectedAdAccounts[account.id]);
          
          return {
            meta_business_id: businessId,
            meta_business_name: business ? business.name : 'Unknown Business',
            accounts: businessAdAccounts.map(account => ({
              meta_ad_account_id: account.id,
              meta_ad_account_name: account.name
            }))
          };
        }).filter(business => business.accounts.length > 0) // Only include businesses with selected accounts
      };

      // Don't send if no accounts selected
      if (accountsPayload.meta_businesses.length === 0) {
        toast.error('Please select at least one ad account to save.');
        return;
      }

      // Use the context function to save accounts
      const response = await saveAccounts(accountsPayload);
      
      // Store the businessId from the response for future use
      if (response && response.data && response.data._id) {
        localStorage.setItem('current_business_id', response.data.businessId);
        console.log('Business ID saved:', response.data.businessId);
      }
      
      // Show success toast
      toast.success('Accounts successfully saved!', {
        duration: 4000,
        position: 'top-right',
        style: {
          background: '#4CAF50',
          color: 'white',
          padding: '12px',
          borderRadius: '8px'
        }
      });
      
      // Refresh the context data
      refreshAccounts();

    } catch (error) {
      console.error('Error saving accounts:', error);
      // Show detailed error message
      toast.error(`Failed to save accounts: ${error.response?.data?.message || error.message}`, {
        duration: 4000,
        position: 'top-right',
        style: {
          background: '#F44336',
          color: 'white',
          padding: '12px',
          borderRadius: '8px'
        }
      });
    }
  };

  // Check for stored data on component mount
  useEffect(() => {
    const accessToken = sessionStorage.getItem('facebook_access_token');
    
    // If we have stored businesses but no access token, we can still render them
    // If we have an access token, we refresh the data (optional - remove if you want to rely only on localStorage)
    if (accessToken && businesses.length === 0) {
      fetchUserData(accessToken);
      fetchBusinesses(accessToken);
    }
  }, []);

  // Determine the button text based on whether we have ad accounts
  const getButtonText = () => {
    if (adAccounts && adAccounts.length > 0) {
      return "Change Facebook Brands";
    }
    return "Connect with Facebook";
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col">
        <Toaster />
        {/* Main Content */}
        <div className="p-6">
          <div className="flex justify-center mb-8">
            <button
              className="bg-blue-500 text-white py-3 px-6 rounded-lg text-lg font-semibold transition duration-300 hover:bg-blue-600 shadow-md"
              onClick={loginWithAdsPermission}
            >
              {getButtonText()}
            </button>
          </div>

          {userData && (
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-orange-600 mb-6">Brands & Ad Accounts:</h3>
              <ul className="space-y-4 bg-white shadow-sm rounded-md">
                {businesses.map((business) => {
                  const businessAdAccounts = adAccounts.filter(
                    account => account.businessId === business.id
                  );

                  return (
                    <li key={business.id} className="border p-4 rounded-lg">
                      <div className="flex items-center mb-2">
                        <input
                          type="checkbox"
                          checked={!!selectedBusinesses[business.id]}
                          onChange={() => handleBusinessSelect(business.id)}
                          className="mr-2"
                        />
                        <h4 className="font-bold text-blue-600">Brand: {business.name}</h4>
                      </div>

                      {businessAdAccounts.length > 0 && (
                        <ul className="pl-6 space-y-2">
                          {businessAdAccounts.map((account) => (
                            <li
                              key={account.id}
                              className="flex items-center text-gray-700"
                            >
                              <input
                                type="checkbox"
                                checked={!!selectedAdAccounts[account.id]}
                                onChange={() => handleAdAccountSelect(account.id, business.id)}
                                className="mr-2"
                              />
                              Ad account: {account.name}
                            </li>
                          ))}
                        </ul>
                      )}

                      {businessAdAccounts.length === 0 && (
                        <p className="text-gray-500 pl-6">No ad accounts found for this brand</p>
                      )}
                    </li>
                  );
                })}
              </ul>

              <div className="mt-6">
                <button 
                  className="bg-blue-600 px-4 py-2 cursor-pointer text-white rounded-xl shadow-md hover:bg-blue-700 transition duration-300"
                  onClick={handleSaveAccount}
                  disabled={Object.keys(selectedAdAccounts).filter(accountId => selectedAdAccounts[accountId]).length === 0 || contextLoading}
                >
                  {contextLoading ? 'Saving...' : 'Save Selected Accounts'}
                </button>
              </div>

              {error && <p className="text-red-500 mt-4">{error}</p>}
            </div>
          )}
        </div>

        {/* Display AccountsPage */}
        <div className="mt-4">
          {/* <AccountsPage /> */}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Ad;
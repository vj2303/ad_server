import React, { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import DashboardLayout from '@/components/layout/DashboardLayout';
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
    try {
      const savedUserData = localStorage.getItem('facebook_user_data');
      return savedUserData ? JSON.parse(savedUserData) : null;
    } catch (error) {
      console.error("Error parsing user data from localStorage:", error);
      return null;
    }
  });
  
  const [error, setError] = useState(null);
  
  const [businesses, setBusinesses] = useState(() => {
    // Initialize businesses from localStorage if available
    try {
      const savedBusinesses = localStorage.getItem('facebook_businesses');
      return savedBusinesses ? JSON.parse(savedBusinesses) : [];
    } catch (error) {
      console.error("Error parsing businesses from localStorage:", error);
      return [];
    }
  });
  
  const [adAccounts, setAdAccounts] = useState(() => {
    // Initialize adAccounts from localStorage if available
    try {
      const savedAdAccounts = localStorage.getItem('facebook_ad_accounts');
      return savedAdAccounts ? JSON.parse(savedAdAccounts) : [];
    } catch (error) {
      console.error("Error parsing ad accounts from localStorage:", error);
      return [];
    }
  });
  
  // State to manage selected brands and ad accounts
  const [selectedBusinesses, setSelectedBusinesses] = useState(() => {
    try {
      const savedBusinesses = localStorage.getItem('selectedBusinesses');
      return savedBusinesses ? JSON.parse(savedBusinesses) : {};
    } catch (error) {
      console.error("Error parsing selected businesses from localStorage:", error);
      return {};
    }
  });
  
  const [selectedAdAccounts, setSelectedAdAccounts] = useState(() => {
    try {
      const savedAdAccounts = localStorage.getItem('selectedAdAccounts');
      return savedAdAccounts ? JSON.parse(savedAdAccounts) : {};
    } catch (error) {
      console.error("Error parsing selected ad accounts from localStorage:", error);
      return {};
    }
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
          version: 'v17.0', // Updated to a valid version
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
    if (!window.FB) {
      toast.error('Facebook SDK not loaded yet. Please try again in a moment.');
      return;
    }
    
    FB.login(function (response) {
      if (response.authResponse) {
        const accessToken = response.authResponse.accessToken;
        
        // Store access token in session storage (not localStorage for security reasons)
        sessionStorage.setItem('facebook_access_token', accessToken);
        
        // Also store access token for later use with PATCH API
        localStorage.setItem('meta_access_token', accessToken);
        
        // Fetch new data while preserving existing selections
        fetchUserData(accessToken);
        fetchBusinesses(accessToken);
        
        // Update the meta_access_token via PATCH API
        updateMetaAccessToken(accessToken);
      } else {
        toast.error('Login was cancelled or failed');
      }
    }, { scope: 'ads_read, business_management', return_scopes: true });
  };
  
  // Function to update meta_access_token via PATCH API
  const updateMetaAccessToken = async (accessToken) => {
    try {
      // Get infoId from localStorage or user object
      const infoId = localStorage.getItem('info_id');
      
      if (!infoId) {
        console.warn('No info ID found. The token update will be attempted during save.');
        return;
      }
      
      const token = localStorage.getItem('adcreativex_token');
      if (!token) {
        toast.error('Authentication token not found. Please log in again.');
        return;
      }
      
      const response = await fetch(`https://metaback-production.up.railway.app/api/info/${infoId}/add-token`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          meta_access_token: accessToken
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update Meta access token');
      }
      
      const data = await response.json();
      console.log('Meta access token updated successfully:', data);
      toast.success('Meta access token updated successfully');
    } catch (error) {
      console.error('Error updating Meta access token:', error);
      // Don't show error to the user yet, we'll try again during save
    }
  };

  // Fetch User Data
  const fetchUserData = (accessToken) => {
    const url = `https://graph.facebook.com/v17.0/me?fields=id,name,email&access_token=${accessToken}`;

    fetch(url)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        if (data.error) {
          throw new Error(data.error.message || 'Facebook API error');
        }
        
        setUserData(data);
        // Store Facebook user data in localStorage
        localStorage.setItem('facebook_user_data', JSON.stringify(data));
        
        // Store Facebook user ID in localStorage for reference
        if (data && data.id) {
          localStorage.setItem('facebook_user_id', data.id);
        }
      })
      .catch((error) => {
        setError(`Error fetching user data: ${error.message}`);
        console.error('User data fetch error:', error);
        toast.error(`Failed to fetch user data: ${error.message}`);
      });
  };

  // Fetch Businesses
  const fetchBusinesses = (accessToken) => {
    const businessesUrl = `https://graph.facebook.com/v17.0/me/businesses?fields=id,name&limit=100&access_token=${accessToken}`;
  
    fetch(businessesUrl)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        if (data.error) {
          throw new Error(data.error.message || 'Facebook API error');
        }
        
        setBusinesses(data.data || []);
        // Store businesses in localStorage
        localStorage.setItem('facebook_businesses', JSON.stringify(data.data || []));
        
        if (Array.isArray(data.data) && data.data.length > 0) {
          fetchBrandAdAccounts(data.data, accessToken);
        } else {
          toast.info('No businesses found for this account');
        }
      })
      .catch((error) => {
        console.error('Error fetching businesses:', error);
        toast.error(`Error fetching businesses: ${error.message}`);
      });
  };

  // Fetch Brand Ad Accounts
  const fetchBrandAdAccounts = (businesses, accessToken) => {
    const adAccountPromises = businesses.map((business) => {
      const brandAdAccountUrl = `https://graph.facebook.com/v17.0/${business.id}/owned_ad_accounts?fields=id,name&access_token=${accessToken}`;

      return fetch(brandAdAccountUrl)
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          return response.json();
        })
        .then((data) => {
          if (data.error) {
            throw new Error(data.error.message || 'Facebook API error');
          }
          
          return {
            businessId: business.id,
            businessName: business.name,
            accounts: data.data || []
          };
        })
        .catch((error) => {
          console.error(`Error fetching ad accounts for business ${business.id}:`, error);
          // Return empty accounts for this business but don't fail the whole request
          return {
            businessId: business.id,
            businessName: business.name,
            accounts: []
          };
        });
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
        console.error('Error processing ad accounts:', error);
        toast.error(`Error processing ad accounts: ${error.message}`);
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
      // Get businessId from context if available, otherwise use the stored info_id
      let infoId = localStorage.getItem('info_id');
      const accessToken = localStorage.getItem('meta_access_token') || sessionStorage.getItem('facebook_access_token');

      if (!infoId) {
        // We don't have an info_id stored, so we'll try to get it from the API response
        // This is a fallback in case the info was created but not stored locally
        const token = localStorage.getItem('adcreativex_token');
        if (!token) {
          toast.error('Authentication token not found. Please log in again.');
          return;
        }

        // If we have metaBusinesses from context, try to use the first one's ID
        if (metaBusinesses && metaBusinesses.length > 0 && metaBusinesses[0]._id) {
          infoId = metaBusinesses[0]._id;
        } else {
          // If no info_id exists yet, we'll need to create one
          // First check if we have user data
          if (!user) {
            toast.error('User data not found. Please log in again.');
            return;
          }

          // Create a new info record
          try {
            const createInfoResponse = await fetch(`https://metaback-production.up.railway.app/api/info`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({
                companyName: user.companyName || 'Default Company',
                industryName: user.industry || 'Technology',
                companyWebsite: user.website || 'https://example.com',
                companyType: user.role === 'brand' ? 'Brand' : 'Creator',
                meta_access_token: accessToken
              })
            });

            if (!createInfoResponse.ok) {
              const errorData = await createInfoResponse.json();
              throw new Error(errorData.message || 'Failed to create info record');
            }

            const infoData = await createInfoResponse.json();
            infoId = infoData.data._id;
            
            // Store the info_id for future use
            localStorage.setItem('info_id', infoId);
            
            toast.success('Business info created successfully');
          } catch (error) {
            console.error('Error creating info record:', error);
            toast.error(`Failed to create info record: ${error.message}`);
            return;
          }
        }
      }

      // If we have an info_id by this point, use it to update the meta_access_token
      if (infoId && accessToken) {
        const token = localStorage.getItem('adcreativex_token');
        if (!token) {
          toast.error('Authentication token not found. Please log in again.');
          return;
        }

        try {
          const tokenUpdateResponse = await fetch(`https://metaback-production.up.railway.app/api/info/${_id}/add-token`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              meta_access_token: accessToken
            })
          });

          if (!tokenUpdateResponse.ok) {
            const errorData = await tokenUpdateResponse.json();
            console.error('Failed to update Meta access token:', errorData);
            // Continue with the save operation even if token update fails
          } else {
            console.log('Meta access token updated successfully');
          }
        } catch (error) {
          console.error('Error updating Meta access token:', error);
          // Continue with the save operation even if token update fails
        }
      }

      // Group selected accounts by business
      const selectedBusinessIds = Object.keys(selectedBusinesses)
        .filter(businessId => selectedBusinesses[businessId]);

      // Create the payload structure according to the expected format
      const accountsPayload = {
        businessId: infoId || 'default_business_id',
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
      if (!accountsPayload.meta_businesses.length) {
        toast.error('Please select at least one ad account to save.');
        return;
      }

      // Use the context function to save accounts
      const response = await saveAccounts(accountsPayload);
      
      // Store the businessId from the response for future use
      if (response && response.data && response.data._id) {
        localStorage.setItem('info_id', response.data._id);
        console.log('Info ID saved:', response.data._id);
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

  // Check for stored data on component mount with proper error handling
  useEffect(() => {
    try {
      const accessToken = sessionStorage.getItem('facebook_access_token');
      
      // Check if we have an info_id stored from a previous signup/login response
      // This is used for the PATCH endpoint
      const infoIdFromSignup = localStorage.getItem('info_id');
      if (!infoIdFromSignup && user) {
        // If no info_id but we have user data, check for metaBusinesses from context
        if (metaBusinesses && metaBusinesses.length > 0 && metaBusinesses[0]._id) {
          localStorage.setItem('info_id', metaBusinesses[0]._id);
        }
      }
      
      // If we have an access token, we refresh the data
      if (accessToken) {
        fetchUserData(accessToken);
        fetchBusinesses(accessToken);
      }
    } catch (error) {
      console.error("Error on component mount:", error);
      setError("Error initializing component: " + error.message);
    }
  }, [metaBusinesses]);

  // Determine the button text based on whether we have ad accounts
  const getButtonText = () => {
    if (adAccounts && adAccounts.length > 0) {
      return "Change Facebook Brands";
    }
    return "Connect with Facebook";
  };
  
  // Guard against SSR/hydration issues by checking if we're in browser environment
  const isBrowser = typeof window !== 'undefined';

  return (
    <DashboardLayout>
      <div className="flex flex-col">
        <Toaster />
        {/* Main Content */}
        <div className="p-6">
          <div className="flex justify-center mb-8">
            {isBrowser && (
              <button
                className="bg-blue-500 text-white py-3 px-6 rounded-lg text-lg font-semibold transition duration-300 hover:bg-blue-600 shadow-md"
                onClick={loginWithAdsPermission}
              >
                {getButtonText()}
              </button>
            )}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              <p className="font-medium">Error:</p>
              <p>{error}</p>
            </div>
          )}

          {userData && (
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-orange-600 mb-6">Brands & Ad Accounts:</h3>
              {businesses.length > 0 ? (
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

                        {businessAdAccounts.length > 0 ? (
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
                        ) : (
                          <p className="text-gray-500 pl-6">No ad accounts found for this brand</p>
                        )}
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="text-gray-600">No brands found. Please connect with Facebook to view your brands.</p>
              )}

              {businesses.length > 0 && (
                <div className="mt-6">
                  <button 
                    className={`px-4 py-2 cursor-pointer text-white rounded-xl shadow-md transition duration-300 ${
                      Object.keys(selectedAdAccounts).filter(accountId => selectedAdAccounts[accountId]).length === 0 || contextLoading
                        ? 'bg-blue-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                    onClick={handleSaveAccount}
                    disabled={Object.keys(selectedAdAccounts).filter(accountId => selectedAdAccounts[accountId]).length === 0 || contextLoading}
                  >
                    {contextLoading ? 'Saving...' : 'Save Selected Accounts'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Ad;
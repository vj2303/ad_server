import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DashboardLayout from '@/components/layout/DashboardLayout';

const AccountsPage = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch all accounts when component mounts
    fetchAllAccounts();
  }, []);

  const fetchAllAccounts = async () => {
    try {
      setLoading(true);
      const response = await axios.get('https://metaback-production.up.railway.app/accounts');
      setAccounts(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching accounts:', err);
      setError('Failed to load accounts. Please try again later.');
      setLoading(false);
    }
  };

  const handleDeleteAccount = async (id) => {
    try {
      await axios.delete(`https://metaback-production.up.railway.app/accounts/${id}`);
      // Refresh the accounts list after deletion
      fetchAllAccounts();
    } catch (err) {
      console.error('Error deleting account:', err);
      setError('Failed to delete account. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded m-4">
        <p>{error}</p>
        <button 
          onClick={fetchAllAccounts}
          className="mt-2 bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded text-sm"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (

    <DashboardLayout>
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">All Stored Ad Accounts</h1>
      
      {accounts.length === 0 ? (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          No accounts found in the database.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {accounts.map((account) => (
            <div 
              key={account._id || account.id} 
              className="border rounded-lg p-4 shadow-md bg-white"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">User ID: {account.id}</h2>
                <button
                  onClick={() => handleDeleteAccount(account.id)}
                  className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded"
                >
                  Delete
                </button>
              </div>
              
              <div className="mb-2">
                <span className="font-medium">Total Ad Accounts:</span> {account.accounts.length}
              </div>
              
              {account.accounts.length > 0 && (
                <div>
                  <h3 className="font-medium mb-2">Ad Accounts:</h3>
                  <div className="bg-gray-50 rounded p-2">
                    <table className="min-w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2">Brand Name</th>
                          <th className="text-left py-2">Ad Account ID</th>
                        </tr>
                      </thead>
                      <tbody>
                        {account.accounts.map((adAccount, index) => (
                          <tr key={index} className="border-b">
                            <td className="py-2">{adAccount.name}</td>
                            <td className="py-2">{adAccount.adAccount}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      
      <button 
        onClick={fetchAllAccounts} 
        className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Refresh Accounts
      </button>
    </div>
    </DashboardLayout>
  );
};

export default AccountsPage;
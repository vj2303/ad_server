import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { AdSpendTable } from "@/components/ad-spend/AdSpendTable";
import { AdSpendResponse } from "@/types/adSpend";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import FadeIn from "@/components/animation/FadeIn";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/hooks/use-toast";
import { Loader2, RefreshCw, Download, Calendar as CalendarIcon } from "lucide-react";

export function AdSpendPage() {
  const [adSpendData, setAdSpendData] = useState<AdSpendResponse | null>(null);
  const [filteredData, setFilteredData] = useState<AdSpendResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("day");
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().setDate(new Date().getDate() - 7)), // Default: 7 days ago
    to: new Date() // Default: today
  });
  const [calendarOpen, setCalendarOpen] = useState(false);
  const { user } = useAuth();
  const API_BASE_URL = 'https://metaback-production.up.railway.app';

  // Function to fetch business data with dynamic ID
  const fetchBusinessData = async () => {
    try {
      setIsLoading(true);
      
      const token = localStorage.getItem('adcreativex_token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      // First, get the company info to get the _id
      const infoResponse = await fetch(`${API_BASE_URL}/api/info`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!infoResponse.ok) {
        const errorData = await infoResponse.json();
        throw new Error(errorData.message || 'Failed to fetch company info');
      }
      
      const infoData = await infoResponse.json();
      console.log("Info API response:", infoData); // Log the full response
      
      // Check the structure of the response
      let businessId;
      if (infoData.data && infoData.data._id) {
        businessId = infoData.data._id;
      } else if (infoData._id) {
        businessId = infoData._id;
      } else {
        // Look through the response to find any _id field
        const findId = (obj) => {
          if (!obj || typeof obj !== 'object') return null;
          if (obj._id) return obj._id;
          
          for (const key in obj) {
            if (typeof obj[key] === 'object') {
              const found = findId(obj[key]);
              if (found) return found;
            }
          }
          return null;
        };
        
        businessId = findId(infoData);
        
        if (!businessId) {
          console.error("API response structure:", infoData);
          throw new Error('Business ID not found in response');
        }
      }
      
      console.log("Using business ID:", businessId);

      // Now use the _id to fetch the business data
      const businessResponse = await fetch(`${API_BASE_URL}/api/info/business/${businessId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!businessResponse.ok) {
        const errorData = await businessResponse.json();
        throw new Error(errorData.message || 'Failed to fetch business data');
      }

      const businessData = await businessResponse.json();
      console.log("Business data fetched successfully:", businessData);
      setAdSpendData(businessData);
      
      // Initially filter the data based on default date range
      filterDataByDateRange(businessData, dateRange.from, dateRange.to);
      
    } catch (error) {
      console.error('Error fetching business data:', error);
      toast({
        variant: "destructive",
        title: "Error fetching data",
        description: error instanceof Error ? error.message : "An unknown error occurred",
      });
      // Set to null to show "No data available" message
      setAdSpendData(null);
      setFilteredData(null);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Function to filter data by date range
  const filterDataByDateRange = (data, fromDate, toDate) => {
    if (!data || !data.data || data.data.length === 0) {
      setFilteredData(null);
      return;
    }

    // Ensure dates are properly formatted
    const from = new Date(fromDate);
    from.setHours(0, 0, 0, 0);
    
    const to = new Date(toDate);
    to.setHours(23, 59, 59, 999);

    // Filter the data based on date range
    const filtered = {
      ...data,
      data: data.data.filter(item => {
        const itemDate = new Date(item.date);
        return itemDate >= from && itemDate <= to;
      })
    };

    setFilteredData(filtered);
  };
  
  // Handle date range change
  const handleDateRangeChange = (range) => {
    if (range.from && range.to) {
      setDateRange(range);
      setCalendarOpen(false);
      if (adSpendData) {
        filterDataByDateRange(adSpendData, range.from, range.to);
      }
    }
  };

  // Format date range for display
  const formatDateRange = () => {
    if (dateRange.from && dateRange.to) {
      return `${format(dateRange.from, 'MMM dd, yyyy')} - ${format(dateRange.to, 'MMM dd, yyyy')}`;
    }
    return 'Select date range';
  };

  // Fetch data on component mount
  useEffect(() => {
    if (user) {
      fetchBusinessData();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  // Handle refresh button click
  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchBusinessData();
  };

  // Handle export data
  const handleExport = () => {
    const dataToExport = filteredData || adSpendData;
    
    if (!dataToExport || dataToExport.data.length === 0) {
      toast({
        variant: "destructive",
        title: "Export failed",
        description: "No data available to export",
      });
      return;
    }

    try {
      // Convert data to CSV
      const headers = ["Date", "Spend", "Clicks", "Conversions", "Revenue", "CPC", "Link"];
      
      const csvData = dataToExport.data.map(item => {
        const date = new Date(item.date).toLocaleDateString();
        const cpc = item.clicks > 0 ? (item.spend / item.clicks).toFixed(2) : "N/A";
        
        return [
          date,
          item.spend.toFixed(2),
          item.clicks,
          item.conversions,
          item.revenue.toFixed(2),
          cpc,
          item.instagram_permalink
        ].join(",");
      });
      
      const csvContent = [headers.join(","), ...csvData].join("\n");
      
      // Create download link
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      
      // Set up download link properties
      link.setAttribute("href", url);
      link.setAttribute("download", `ad_spend_data_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      
      // Append, click, and remove link
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Export successful",
        description: "Your data has been exported to CSV",
      });
    } catch (error) {
      console.error("Export error:", error);
      toast({
        variant: "destructive",
        title: "Export failed",
        description: "Failed to export data to CSV",
      });
    }
  };

  return (
    <DashboardLayout>
      <FadeIn>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Ad Spend Analytics</h1>
              <p className="text-muted-foreground mt-1">
                Track your Instagram ad campaign performance
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                onClick={handleExport}
                disabled={isLoading || !filteredData || filteredData.data.length === 0}
              >
                <Download className="h-4 w-4 mr-2" /> Export Data
              </Button>
              <Button 
                onClick={handleRefresh}
                disabled={isLoading || isRefreshing}
              >
                {isRefreshing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Refreshing
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" /> Refresh Data
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between mb-4">
            <Tabs defaultValue="day" className="w-auto" onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="day">Daily</TabsTrigger>
                <TabsTrigger value="week">Weekly</TabsTrigger>
                <TabsTrigger value="month">Monthly</TabsTrigger>
              </TabsList>
            </Tabs>
            
            <div className="flex items-center">
              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4" />
                    <span>{formatDateRange()}</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                    mode="range"
                    selected={dateRange}
                    onSelect={handleDateRangeChange}
                    initialFocus
                    defaultMonth={dateRange.from}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="space-y-4">
            {isLoading ? (
              <div className="flex flex-col justify-center items-center h-60">
                <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">Loading ad spend data...</p>
              </div>
            ) : filteredData && filteredData.data && filteredData.data.length > 0 ? (
              <AdSpendTable data={filteredData.data} />
            ) : (
              <div className="text-center py-16 border rounded-lg bg-muted/20">
                <h3 className="text-lg font-medium mb-2">No ad spend data available</h3>
                <p className="text-muted-foreground mb-6">
                  {adSpendData && adSpendData.data && adSpendData.data.length > 0 ? 
                    "No data found for the selected date range." :
                    "We couldn't find any ad spend data for your account."}
                </p>
                <Button onClick={handleRefresh}>Refresh Data</Button>
              </div>
            )}

            {activeTab === "week" && (
              <div className="text-center py-16 border rounded-lg bg-muted/20">
                <h3 className="text-lg font-medium mb-2">Weekly view coming soon</h3>
                <p className="text-muted-foreground">
                  We're working on aggregating your data into weekly reports.
                </p>
              </div>
            )}

            {activeTab === "month" && (
              <div className="text-center py-16 border rounded-lg bg-muted/20">
                <h3 className="text-lg font-medium mb-2">Monthly view coming soon</h3>
                <p className="text-muted-foreground">
                  We're working on aggregating your data into monthly reports.
                </p>
              </div>
            )}
          </div>
        </div>
      </FadeIn>
    </DashboardLayout>
  );
}
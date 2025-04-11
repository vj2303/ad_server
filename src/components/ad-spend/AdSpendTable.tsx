
import { useState } from "react";
import { format } from "date-fns";
import { 
  ArrowUpDown, 
  ChevronDown, 
  DollarSign, 
  MousePointerClick, 
  ShoppingCart,
  ExternalLink,
} from "lucide-react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AdSpendData } from "@/types/adSpend";

interface AdSpendTableProps {
  data: AdSpendData[];
}

type SortField = "date" | "spend" | "clicks" | "conversions" | "revenue";
type SortDirection = "asc" | "desc";

export function AdSpendTable({ data }: AdSpendTableProps) {
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const sortedData = [...data].sort((a, b) => {
    let comparison = 0;
    
    switch (sortField) {
      case "date":
        comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
        break;
      case "spend":
        comparison = a.spend - b.spend;
        break;
      case "clicks":
        comparison = a.clicks - b.clicks;
        break;
      case "conversions":
        comparison = a.conversions - b.conversions;
        break;
      case "revenue":
        comparison = a.revenue - b.revenue;
        break;
    }
    
    return sortDirection === "asc" ? comparison : -comparison;
  });

  // Calculate totals
  const totals = data.reduce(
    (acc, curr) => {
      return {
        spend: acc.spend + curr.spend,
        clicks: acc.clicks + curr.clicks,
        conversions: acc.conversions + curr.conversions,
        revenue: acc.revenue + curr.revenue,
      };
    },
    { spend: 0, clicks: 0, conversions: 0, revenue: 0 }
  );

  // Calculate ROI
  const roi = totals.spend > 0 ? ((totals.revenue / totals.spend) * 100).toFixed(2) : "N/A";
  
  // Calculate CPC
  const cpc = totals.clicks > 0 ? (totals.spend / totals.clicks).toFixed(2) : "N/A";
  
  // Calculate cost per conversion
  const costPerConversion = totals.conversions > 0 
    ? (totals.spend / totals.conversions).toFixed(2) 
    : "N/A";

  const renderSortIcon = (field: SortField) => {
    if (sortField === field) {
      return <ChevronDown className={`ml-2 h-4 w-4 ${sortDirection === "asc" ? "transform rotate-180" : ""}`} />;
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Spend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <DollarSign className="h-5 w-5 text-blue-600 mr-2" />
              <span className="text-2xl font-bold">
                ${totals.spend.toFixed(2)}
              </span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Conversions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <ShoppingCart className="h-5 w-5 text-green-600 mr-2" />
              <span className="text-2xl font-bold">
                {totals.conversions}
              </span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <DollarSign className="h-5 w-5 text-green-600 mr-2" />
              <span className="text-2xl font-bold">
                ${totals.revenue.toFixed(2)}
              </span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              ROI
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Badge variant={roi === "N/A" || Number(roi) <= 0 ? "destructive" : "outline"} className="text-lg py-1">
                {roi === "N/A" ? roi : `${roi}%`}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Table */}
      <Card>
        <CardHeader>
          <CardTitle>Ad Spend Details</CardTitle>
          <CardDescription>
            Daily performance metrics for your Instagram ad campaign
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead 
                  className="cursor-pointer"
                  onClick={() => handleSort("date")}
                >
                  <div className="flex items-center">
                    Date
                    {renderSortIcon("date")}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer"
                  onClick={() => handleSort("spend")}
                >
                  <div className="flex items-center">
                    Spend
                    {renderSortIcon("spend")}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer"
                  onClick={() => handleSort("clicks")}
                >
                  <div className="flex items-center">
                    Clicks
                    {renderSortIcon("clicks")}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer"
                  onClick={() => handleSort("conversions")}
                >
                  <div className="flex items-center">
                    Conversions
                    {renderSortIcon("conversions")}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer"
                  onClick={() => handleSort("revenue")}
                >
                  <div className="flex items-center">
                    Revenue
                    {renderSortIcon("revenue")}
                  </div>
                </TableHead>
                <TableHead>CPC</TableHead>
                {/* <TableHead>Link</TableHead> */}
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedData.map((item) => {
                const itemDate = new Date(item.date);
                const cpc = item.clicks > 0 ? (item.spend / item.clicks).toFixed(2) : "N/A";
                
                return (
                  <TableRow key={item._id}>
                    <TableCell className="font-medium">
                      {format(itemDate, "MMM dd, yyyy")}
                    </TableCell>
                    <TableCell>${item.spend.toFixed(2)}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <MousePointerClick className="h-4 w-4 mr-1 text-blue-500" />
                        {item.clicks}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <ShoppingCart className="h-4 w-4 mr-1 text-green-500" />
                        {item.conversions}
                      </div>
                    </TableCell>
                    <TableCell>
                      ${item.revenue.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        ${cpc}
                      </Badge>
                    </TableCell>
                   
                  </TableRow>
                );
              })}
              {/* Summary Row */}
              <TableRow className="bg-muted/50 font-medium">
                <TableCell>Total</TableCell>
                <TableCell>${totals.spend.toFixed(2)}</TableCell>
                <TableCell>{totals.clicks}</TableCell>
                <TableCell>{totals.conversions}</TableCell>
                <TableCell>${totals.revenue.toFixed(2)}</TableCell>
                <TableCell>
                  <Badge variant="outline">
                    ${cpc}
                  </Badge>
                </TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Additional Metrics */}
      {/* <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Cost Per Click (CPC)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <MousePointerClick className="h-5 w-5 text-blue-600 mr-2" />
              <span className="text-xl font-bold">
                ${cpc}
              </span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Cost Per Conversion</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <ShoppingCart className="h-5 w-5 text-green-600 mr-2" />
              <span className="text-xl font-bold">
                ${costPerConversion}
              </span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Conversion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Badge className={`text-lg py-1 ${
                totals.clicks > 0 && (totals.conversions / totals.clicks >= 0.05) 
                  ? "bg-green-100 text-green-800 border-green-200" 
                  : "bg-yellow-100 text-yellow-800 border-yellow-200"
              }`}>
                {totals.clicks > 0 
                  ? `${((totals.conversions / totals.clicks) * 100).toFixed(2)}%` 
                  : "N/A"}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div> */}
    </div>
  );
}

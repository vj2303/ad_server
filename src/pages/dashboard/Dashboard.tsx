
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ChevronRight, 
  PlusCircle, 
  FileCheck, 
  FileX, 
  DollarSign, 
  BarChart3, 
  Upload,
  ImageIcon
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useCreatives } from '@/context/CreativeContext';
import { useMetaAds } from '@/context/MetaAdsContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';
import FadeIn from '@/components/animation/FadeIn';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { creatives } = useCreatives();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  if (!user) {
    return null;
  }

  // Different dashboards based on user role
  return (
    <DashboardLayout>
      {user.role === 'brand' ? <BrandDashboard /> : <CreatorDashboard />}
    </DashboardLayout>
  );
};

const BrandDashboard = () => {
  const { creatives } = useCreatives();
  const navigate = useNavigate();

  // Filter creatives for brand dashboard
  const pendingCreatives = creatives.filter(creative => creative.status === 'pending');
  const activeCreatives = creatives.filter(creative => creative.status === 'active');
  
  // Calculate metrics
  const totalSpend = activeCreatives.reduce((sum, creative) => 
    sum + (creative.performance?.spend || 0), 0
  );
  
  const totalImpressions = activeCreatives.reduce((sum, creative) => 
    sum + (creative.performance?.impressions || 0), 0
  );
  
  const totalClicks = activeCreatives.reduce((sum, creative) => 
    sum + (creative.performance?.clicks || 0), 0
  );

  return (
    <div className="space-y-8">
      <FadeIn>
        <h1 className="text-3xl font-bold">Brand Dashboard</h1>
        <p className="text-gray-600 mt-1">Manage your creative campaigns and performance</p>
      </FadeIn>
      
      {/* Overview Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <FadeIn delay={0.1}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Total Ad Spend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <DollarSign className="h-5 w-5 text-blue-600 mr-2" />
                <span className="text-2xl font-bold">${totalSpend.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>
        </FadeIn>
        
        <FadeIn delay={0.2}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Active Creatives</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <ImageIcon className="h-5 w-5 text-blue-600 mr-2" />
                <span className="text-2xl font-bold">{activeCreatives.length}</span>
              </div>
            </CardContent>
          </Card>
        </FadeIn>
        
        <FadeIn delay={0.3}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Total Impressions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <BarChart3 className="h-5 w-5 text-blue-600 mr-2" />
                <span className="text-2xl font-bold">{totalImpressions.toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>
        </FadeIn>
      </div>
      
      {/* Pending Approvals */}
      <FadeIn delay={0.4}>
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Pending Approvals</CardTitle>
                <CardDescription>
                  Creatives waiting for your review
                </CardDescription>
              </div>
              
              {pendingCreatives.length > 0 && (
                <Button variant="outline" size="sm" onClick={() => navigate('/creatives')}>
                  View All <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {pendingCreatives.length === 0 ? (
              <p className="text-gray-500 text-center py-6">No pending creatives to approve</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Creator</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingCreatives.slice(0, 5).map((creative) => (
                    <TableRow key={creative.id}>
                      <TableCell className="font-medium">{creative.title}</TableCell>
                      <TableCell>Creator ID: {creative.creatorId}</TableCell>
                      <TableCell className="capitalize">{creative.fileType}</TableCell>
                      <TableCell>{new Date(creative.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => navigate(`/creatives/${creative.id}`)}
                        >
                          Review
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </FadeIn>
      
      {/* Active Creatives */}
      <FadeIn delay={0.5}>
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Active Creatives</CardTitle>
                <CardDescription>
                  Currently running creatives and their performance
                </CardDescription>
              </div>
              
              {activeCreatives.length > 0 && (
                <Button variant="outline" size="sm" onClick={() => navigate('/creatives')}>
                  View All <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {activeCreatives.length === 0 ? (
              <p className="text-gray-500 text-center py-6">No active creatives yet</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Spend</TableHead>
                    <TableHead>Impressions</TableHead>
                    <TableHead>Clicks</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeCreatives.slice(0, 5).map((creative) => (
                    <TableRow key={creative.id}>
                      <TableCell className="font-medium">{creative.title}</TableCell>
                      <TableCell>${creative.performance?.spend.toFixed(2) || "0.00"}</TableCell>
                      <TableCell>{creative.performance?.impressions.toLocaleString() || "0"}</TableCell>
                      <TableCell>{creative.performance?.clicks.toLocaleString() || "0"}</TableCell>
                      <TableCell>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => navigate(`/creatives/${creative.id}`)}
                        >
                          Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </FadeIn>
    </div>
  );
};

const CreatorDashboard = () => {
  const { user } = useAuth();
  const { creatives } = useCreatives();
  const navigate = useNavigate();
  
  if (!user) return null;
  
  // Filter creatives for this creator
  const userCreatives = creatives.filter(creative => creative.creatorId === user.id);
  
  // Group by status
  const pendingCreatives = userCreatives.filter(creative => creative.status === 'pending');
  const approvedCreatives = userCreatives.filter(creative => 
    creative.status === 'approved' || creative.status === 'active'
  );
  const rejectedCreatives = userCreatives.filter(creative => creative.status === 'rejected');
  
  // Calculate total earnings (10% commission on spend)
  const totalEarnings = approvedCreatives.reduce((sum, creative) => 
    sum + ((creative.performance?.spend || 0) * 0.1), 0
  );

  return (
    <div className="space-y-8">
      <FadeIn>
        <h1 className="text-3xl font-bold">Brand Dashboard</h1>
        <p className="text-gray-600 mt-1">Track your submissions and earnings</p>
      </FadeIn>
      
      {/* Action button */}
      <FadeIn delay={0.1}>
        <div className="flex justify-end">
          <Button onClick={() => navigate('/upload')}>
            {/* <Upload className="mr-2 h-4 w-4" /> */}
          Connect with meta
          </Button>
        </div>
      </FadeIn>
      
      {/* Overview Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <FadeIn delay={0.2}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Total Earnings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <DollarSign className="h-5 w-5 text-blue-600 mr-2" />
                <span className="text-2xl font-bold">${totalEarnings.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>
        </FadeIn>
        
        <FadeIn delay={0.3}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Approved Creatives</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <ImageIcon className="h-5 w-5 text-blue-600 mr-2" />
                <span className="text-2xl font-bold">{approvedCreatives.length}</span>
              </div>
            </CardContent>
          </Card>
        </FadeIn>
        
        <FadeIn delay={0.4}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Pending Review</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <BarChart3 className="h-5 w-5 text-blue-600 mr-2" />
                <span className="text-2xl font-bold">{pendingCreatives.length}</span>
              </div>
            </CardContent>
          </Card>
        </FadeIn>
      </div>
      
      {/* Recent Submissions */}
      <FadeIn delay={0.5}>
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Recent Submissions</CardTitle>
                <CardDescription>
                  Status of your recently submitted creatives
                </CardDescription>
              </div>
              
              {userCreatives.length > 0 && (
                <Button variant="outline" size="sm" onClick={() => navigate('/creatives')}>
                  View All <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {userCreatives.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-gray-500 mb-4">You haven't submitted any creatives yet</p>
                <Button onClick={() => navigate('/upload')}>
                  Upload Your First Creative
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Earnings</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {userCreatives.slice(0, 5).map((creative) => (
                    <TableRow key={creative.id}>
                      <TableCell className="font-medium">{creative.title}</TableCell>
                      <TableCell>{new Date(creative.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          creative.status === 'approved' || creative.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : creative.status === 'pending' 
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                        }`}>
                          {creative.status.charAt(0).toUpperCase() + creative.status.slice(1)}
                        </span>
                      </TableCell>
                      <TableCell>
                        ${((creative.performance?.spend || 0) * 0.1).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => navigate(`/creatives/${creative.id}`)}
                        >
                          Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </FadeIn>
    </div>
  );
};

export default Dashboard;

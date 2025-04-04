
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/AuthContext';
import { useCreatives } from '@/context/CreativeContext';
import { Creative } from '@/types/creative';
import { 
  Search, 
  Plus, 
  Image as ImageIcon, 
  FileVideo, 
  ExternalLink 
} from 'lucide-react';
import FadeIn from '@/components/animation/FadeIn';

const CreativeGallery = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { creatives } = useCreatives();
  const [filteredCreatives, setFilteredCreatives] = useState<Creative[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  // Filter creatives based on user role and filters
  useEffect(() => {
    if (!user) return;

    let filtered = [...creatives];
    
    // Filter by user role
    if (user.role === 'creator') {
      filtered = filtered.filter(creative => creative.creatorId === user.id);
    }
    
    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(creative => creative.status === statusFilter);
    }
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        creative => 
          creative.title.toLowerCase().includes(query) || 
          creative.description.toLowerCase().includes(query)
      );
    }
    
    setFilteredCreatives(filtered);
  }, [creatives, user, statusFilter, searchQuery]);

  if (!user) {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <FadeIn>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">Creatives Gallery</h1>
              <p className="text-gray-600 mt-1">
                {user.role === 'brand' 
                  ? 'Browse and manage creatives from your creators' 
                  : 'Manage your creative submissions'}
              </p>
            </div>
            
            {user.role === 'creator' && (
              <Button onClick={() => navigate('/upload')}>
                <Plus className="mr-2 h-4 w-4" />
                Upload New
              </Button>
            )}
          </div>
        </FadeIn>
        
        {/* Filters */}
        <FadeIn delay={0.1}>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search creatives..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <Select
              value={statusFilter}
              onValueChange={setStatusFilter}
            >
              <SelectTrigger className="w-full md:w-52">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </FadeIn>
        
        {/* Gallery Grid */}
        {filteredCreatives.length === 0 ? (
          <FadeIn delay={0.2}>
            <div className="text-center py-12 border rounded-lg bg-gray-50">
              <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">No creatives found</h3>
              <p className="mt-2 text-gray-500">
                {user.role === 'creator' 
                  ? 'Upload your first creative to get started' 
                  : 'No creatives match your current filters'}
              </p>
              {user.role === 'creator' && (
                <Button className="mt-4" onClick={() => navigate('/upload')}>
                  <Plus className="mr-2 h-4 w-4" />
                  Upload Creative
                </Button>
              )}
            </div>
          </FadeIn>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCreatives.map((creative, index) => (
              <FadeIn key={creative.id} delay={0.1 * (index % 6)}>
                <Card className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer group" 
                  onClick={() => navigate(`/creatives/${creative.id}`)}
                >
                  <div className="relative h-48 overflow-hidden bg-gray-100">
                    {creative.fileType === 'image' ? (
                      <img 
                        src={creative.fileUrl} 
                        alt={creative.title}
                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <FileVideo className="h-12 w-12 text-gray-400" />
                      </div>
                    )}
                    
                    <div className="absolute top-3 right-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        creative.status === 'approved' || creative.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : creative.status === 'pending' 
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                      }`}>
                        {creative.status.charAt(0).toUpperCase() + creative.status.slice(1)}
                      </span>
                    </div>
                  </div>
                  
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900 line-clamp-1">{creative.title}</h3>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{creative.description}</p>
                      </div>
                      <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    {creative.performance && (
                      <div className="mt-3 pt-3 border-t text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Spend:</span>
                          <span className="font-medium">${creative.performance.spend.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between mt-1">
                          <span className="text-gray-500">Impressions:</span>
                          <span className="font-medium">{creative.performance.impressions.toLocaleString()}</span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </FadeIn>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default CreativeGallery;

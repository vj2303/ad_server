
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useAuth } from '@/context/AuthContext';
import { useCreatives } from '@/context/CreativeContext';
import { formatDistance } from 'date-fns';
import { 
  Calendar, 
  Check, 
  X, 
  DollarSign, 
  Eye, 
  MousePointer, 
  ShoppingCart, 
  ArrowLeft,
  FileVideo
} from 'lucide-react';
import { toast } from "@/hooks/use-toast";
import FadeIn from '@/components/animation/FadeIn';

// Form schema for updating performance
const performanceSchema = z.object({
  spend: z.coerce.number().min(0, { message: 'Spend cannot be negative' }),
  impressions: z.coerce.number().int().min(0, { message: 'Impressions must be a positive integer' }),
  clicks: z.coerce.number().int().min(0, { message: 'Clicks must be a positive integer' }),
  conversions: z.coerce.number().int().min(0, { message: 'Conversions must be a positive integer' }),
});

type PerformanceFormValues = z.infer<typeof performanceSchema>;

// Form schema for feedback
const feedbackSchema = z.object({
  feedback: z.string().min(1, { message: 'Please provide feedback' }),
});

type FeedbackFormValues = z.infer<typeof feedbackSchema>;

const CreativeDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { creatives, getCreativeById, updateCreativeStatus, updateCreativePerformance, isLoading } = useCreatives();
  const [creative, setCreative] = useState(getCreativeById(id || ''));
  const [feedbackMode, setFeedbackMode] = useState(false);

  const performanceForm = useForm<PerformanceFormValues>({
    resolver: zodResolver(performanceSchema),
    defaultValues: {
      spend: creative?.performance?.spend || 0,
      impressions: creative?.performance?.impressions || 0,
      clicks: creative?.performance?.clicks || 0,
      conversions: creative?.performance?.conversions || 0,
    },
  });

  const feedbackForm = useForm<FeedbackFormValues>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      feedback: '',
    },
  });

  // Redirect if not authenticated or creative not found
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    if (!creative) {
      toast({
        variant: "destructive",
        title: "Creative not found",
        description: "The creative you're looking for doesn't exist or has been removed.",
      });
      navigate('/creatives');
    }
  }, [user, creative, navigate]);

  // Update creative when it changes in the context
  useEffect(() => {
    if (id) {
      const updatedCreative = getCreativeById(id);
      setCreative(updatedCreative);
      
      // Update form defaults if creative changes
      if (updatedCreative?.performance) {
        performanceForm.reset({
          spend: updatedCreative.performance.spend,
          impressions: updatedCreative.performance.impressions,
          clicks: updatedCreative.performance.clicks,
          conversions: updatedCreative.performance.conversions,
        });
      }
    }
  }, [id, creatives, getCreativeById, performanceForm]);

  if (!user || !creative) {
    return null;
  }

  const handleApprove = async () => {
    await updateCreativeStatus(creative.id, 'approved');
    setFeedbackMode(false);
  };

  const handleReject = async (data: FeedbackFormValues) => {
    await updateCreativeStatus(creative.id, 'rejected', data.feedback);
    setFeedbackMode(false);
  };

  const handlePerformanceUpdate = async (data: PerformanceFormValues) => {
    await updateCreativePerformance(creative.id, data.spend, {
      impressions: data.impressions,
      clicks: data.clicks,
      conversions: data.conversions,
    });
  };

  // Calculate metrics
  const ctr = creative.performance?.clicks && creative.performance?.impressions 
    ? (creative.performance.clicks / creative.performance.impressions * 100).toFixed(2) 
    : '0.00';
  
  const conversionRate = creative.performance?.conversions && creative.performance?.clicks 
    ? (creative.performance.conversions / creative.performance.clicks * 100).toFixed(2) 
    : '0.00';
  
  // Calculate commission (10% of spend)
  const commission = creative.performance?.spend 
    ? (creative.performance.spend * 0.1).toFixed(2) 
    : '0.00';

  const createdTimeAgo = formatDistance(
    new Date(creative.createdAt),
    new Date(),
    { addSuffix: true }
  );

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <FadeIn>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            
            <div className={`px-2 py-1 rounded-full text-xs font-medium ${
              creative.status === 'approved' || creative.status === 'active' 
                ? 'bg-green-100 text-green-800' 
                : creative.status === 'pending' 
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-red-100 text-red-800'
            }`}>
              {creative.status.charAt(0).toUpperCase() + creative.status.slice(1)}
            </div>
          </div>
          
          <h1 className="text-3xl font-bold mt-4">{creative.title}</h1>
          <div className="flex items-center text-gray-500 text-sm mt-1">
            <Calendar className="h-4 w-4 mr-1" />
            <span>Submitted {createdTimeAgo}</span>
          </div>
        </FadeIn>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Creative Preview */}
          <FadeIn delay={0.1}>
            <Card>
              <CardHeader>
                <CardTitle>Creative Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg overflow-hidden bg-gray-50 min-h-[300px] flex items-center justify-center">
                  {creative.fileType === 'image' ? (
                    <img 
                      src={creative.fileUrl} 
                      alt={creative.title}
                      className="max-h-[500px] max-w-full object-contain"
                    />
                  ) : (
                    <div className="text-center p-4">
                      <FileVideo className="h-12 w-12 text-gray-400 mx-auto" />
                      <p className="mt-2 text-gray-500">Video preview</p>
                      <Button variant="outline" size="sm" className="mt-2">
                        Play Video
                      </Button>
                    </div>
                  )}
                </div>
                
                <div className="mt-6">
                  <h3 className="font-medium">Description</h3>
                  <p className="mt-2 text-gray-700">{creative.description}</p>
                </div>
                
                {creative.feedback && (
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-medium">Feedback</h3>
                    <p className="mt-2 text-gray-700">{creative.feedback}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </FadeIn>
          
          {/* Actions and Performance */}
          <div className="space-y-6">
            {/* Brand Actions - Approval/Rejection */}
            {user.role === 'brand' && creative.status === 'pending' && (
              <FadeIn delay={0.2}>
                <Card>
                  <CardHeader>
                    <CardTitle>Review Creative</CardTitle>
                    <CardDescription>
                      Approve or reject this creative submission
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {feedbackMode ? (
                      <Form {...feedbackForm}>
                        <form onSubmit={feedbackForm.handleSubmit(handleReject)} className="space-y-4">
                          <FormField
                            control={feedbackForm.control}
                            name="feedback"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Feedback</FormLabel>
                                <FormControl>
                                  <textarea
                                    className="flex min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    placeholder="Provide feedback for the creator"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <div className="flex justify-end space-x-2">
                            <Button 
                              type="button" 
                              variant="outline" 
                              onClick={() => setFeedbackMode(false)}
                            >
                              Cancel
                            </Button>
                            <Button 
                              type="submit"
                              variant="destructive"
                              disabled={isLoading}
                            >
                              <X className="mr-2 h-4 w-4" />
                              Reject with Feedback
                            </Button>
                          </div>
                        </form>
                      </Form>
                    ) : (
                      <div className="flex justify-center space-x-4">
                        <Button 
                          variant="outline" 
                          onClick={() => setFeedbackMode(true)}
                        >
                          <X className="mr-2 h-4 w-4" />
                          Reject
                        </Button>
                        <Button 
                          onClick={handleApprove}
                          disabled={isLoading}
                        >
                          <Check className="mr-2 h-4 w-4" />
                          Approve
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </FadeIn>
            )}
            
            {/* Performance Update - Brand only */}
            {user.role === 'brand' && 
             (creative.status === 'approved' || creative.status === 'active') && (
              <FadeIn delay={0.2}>
                <Card>
                  <CardHeader>
                    <CardTitle>Performance Metrics</CardTitle>
                    <CardDescription>
                      Update the ad spend and performance metrics
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...performanceForm}>
                      <form onSubmit={performanceForm.handleSubmit(handlePerformanceUpdate)} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={performanceForm.control}
                            name="spend"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Ad Spend ($)</FormLabel>
                                <FormControl>
                                  <Input type="number" step="0.01" min="0" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={performanceForm.control}
                            name="impressions"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Impressions</FormLabel>
                                <FormControl>
                                  <Input type="number" min="0" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={performanceForm.control}
                            name="clicks"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Clicks</FormLabel>
                                <FormControl>
                                  <Input type="number" min="0" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={performanceForm.control}
                            name="conversions"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Conversions</FormLabel>
                                <FormControl>
                                  <Input type="number" min="0" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <div className="flex justify-end">
                          <Button 
                            type="submit"
                            disabled={isLoading || !performanceForm.formState.isDirty}
                          >
                            Update Performance
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </FadeIn>
            )}
            
            {/* Performance Metrics Display */}
            {creative.performance && (
              <FadeIn delay={0.3}>
                <Card>
                  <CardHeader>
                    <CardTitle>Campaign Results</CardTitle>
                    <CardDescription>
                      Current performance metrics
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-1">
                        <div className="flex items-center text-gray-500 text-sm">
                          <DollarSign className="h-4 w-4 mr-1" />
                          <span>Ad Spend</span>
                        </div>
                        <p className="text-2xl font-bold">${creative.performance.spend.toFixed(2)}</p>
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex items-center text-gray-500 text-sm">
                          <Eye className="h-4 w-4 mr-1" />
                          <span>Impressions</span>
                        </div>
                        <p className="text-2xl font-bold">{creative.performance.impressions.toLocaleString()}</p>
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex items-center text-gray-500 text-sm">
                          <MousePointer className="h-4 w-4 mr-1" />
                          <span>Clicks (CTR)</span>
                        </div>
                        <p className="text-2xl font-bold">
                          {creative.performance.clicks.toLocaleString()} 
                          <span className="text-sm text-gray-500 ml-1">({ctr}%)</span>
                        </p>
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex items-center text-gray-500 text-sm">
                          <ShoppingCart className="h-4 w-4 mr-1" />
                          <span>Conversions (CR)</span>
                        </div>
                        <p className="text-2xl font-bold">
                          {creative.performance.conversions.toLocaleString()}
                          <span className="text-sm text-gray-500 ml-1">({conversionRate}%)</span>
                        </p>
                      </div>
                    </div>
                    
                    {user.role === 'creator' && (
                      <div className="mt-6 pt-6 border-t">
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="font-medium">Your Commission (10%)</h3>
                            <p className="text-sm text-gray-500">Based on total ad spend</p>
                          </div>
                          <p className="text-xl font-bold text-green-600">${commission}</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </FadeIn>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CreativeDetail;

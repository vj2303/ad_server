
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { useAuth } from '@/context/AuthContext';
import { useMetaAds } from '@/context/MetaAdsContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import FadeIn from '@/components/animation/FadeIn';

const profileSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  email: z.string().email({ message: 'Please enter a valid email' }).optional(),
  bio: z.string().optional(),
});

const brandProfileSchema = profileSchema.extend({
  companyName: z.string().min(2, { message: 'Company name must be at least 2 characters' }),
  industry: z.string().optional(),
  website: z.string().url({ message: 'Please enter a valid URL' }).optional().or(z.literal('')),
});

const creatorProfileSchema = profileSchema.extend({
  specialty: z.string().optional(),
  portfolioLink: z.string().url({ message: 'Please enter a valid URL' }).optional().or(z.literal('')),
});

const Profile = () => {
  const navigate = useNavigate();
  const { user, updateProfile, logout } = useAuth();
  const { connected, connecting, connectToMetaAds, disconnectMetaAds, account } = useMetaAds();
  const [isLoading, setIsLoading] = useState(false);

  if (!user) {
    navigate('/login');
    return null;
  }

  const isBrand = user.role === 'brand';
  const schema = isBrand ? brandProfileSchema : creatorProfileSchema;

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: user.name || '',
      email: user.email || '',
      bio: user.bio || '',
      ...(isBrand
        ? {
            companyName: user.companyName || '',
            industry: user.industry || '',
            website: user.website || '',
          }
        : {
            specialty: user.specialty || '',
            portfolioLink: user.portfolioLink || '',
          }),
    },
  });

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      await updateProfile(data);
      form.reset(data);
    } catch (error) {
      console.error('Profile update error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMetaConnection = async () => {
    try {
      if (connected) {
        await disconnectMetaAds();
      } else {
        await connectToMetaAds();
      }
    } catch (error) {
      console.error('Meta connection error:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <FadeIn>
          <h1 className="text-3xl font-bold">Profile Settings</h1>
          <p className="text-gray-600 mt-1 mb-8">Manage your account settings and preferences</p>
        </FadeIn>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <FadeIn delay={0.1}>
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input {...field} disabled />
                            </FormControl>
                            <FormDescription>
                              Email cannot be changed
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="bio"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Bio</FormLabel>
                            <FormControl>
                              <textarea
                                className="flex min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                placeholder="Tell us about yourself"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              A brief description about you or your business
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {isBrand ? (
                        <>
                          <Separator className="my-6" />
                          <h3 className="text-lg font-medium mb-4">Brand Information</h3>

                          <FormField
                            control={form.control}
                            name="companyName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Company Name</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="industry"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Industry</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="website"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Company Website</FormLabel>
                                <FormControl>
                                  <Input type="url" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </>
                      ) : (
                        <>
                          <Separator className="my-6" />
                          <h3 className="text-lg font-medium mb-4">Creator Information</h3>

                          <FormField
                            control={form.control}
                            name="specialty"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Specialty</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormDescription>
                                  Your area of expertise (e.g., Video Editing, Photography)
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="portfolioLink"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Portfolio Link</FormLabel>
                                <FormControl>
                                  <Input type="url" {...field} />
                                </FormControl>
                                <FormDescription>
                                  Link to your portfolio website or social media
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </>
                      )}

                      <div className="flex justify-end">
                        <Button type="submit" disabled={isLoading}>
                          {isLoading ? 'Saving...' : 'Save Changes'}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </FadeIn>
          </div>

          <div>
            <FadeIn delay={0.2}>
              <Card>
                <CardHeader>
                  <CardTitle>Account Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isBrand && (
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium">Meta Ads Connection</h3>
                      <p className="text-xs text-gray-500">
                        {connected
                          ? `Connected to: ${account?.name}`
                          : 'Connect to Meta Ads to track performance'}
                      </p>
                      <Button
                        onClick={handleMetaConnection}
                        variant={connected ? 'destructive' : 'default'}
                        disabled={connecting}
                        className="w-full"
                      >
                        {connecting
                          ? 'Connecting...'
                          : connected
                          ? 'Disconnect Meta Ads'
                          : 'Connect Meta Ads'}
                      </Button>
                    </div>
                  )}

                  <Separator className="my-4" />

                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Account Actions</h3>
                    <Button
                      onClick={handleLogout}
                      variant="outline"
                      className="w-full"
                    >
                      Log Out
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </FadeIn>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Profile;

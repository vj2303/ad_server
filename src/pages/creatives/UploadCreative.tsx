
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
} from '@/components/ui/form';
import { useAuth } from '@/context/AuthContext';
import { useCreatives } from '@/context/CreativeContext';
import { Upload, Image, FileVideo } from 'lucide-react';
import FadeIn from '@/components/animation/FadeIn';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const ACCEPTED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];

const uploadSchema = z.object({
  title: z.string().min(3, { message: 'Title must be at least 3 characters' }),
  description: z.string().min(10, { message: 'Description must be at least 10 characters' }),
  file: z
    .instanceof(File)
    .refine(file => file.size <= MAX_FILE_SIZE, `File size must be less than 5MB`)
    .refine(
      file => 
        [...ACCEPTED_IMAGE_TYPES, ...ACCEPTED_VIDEO_TYPES].includes(file.type),
      "File must be a valid image (JPEG, PNG, WebP) or video (MP4, WebM, QuickTime)"
    ),
});

type UploadFormValues = z.infer<typeof uploadSchema>;

const UploadCreative = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { uploadCreative, isLoading } = useCreatives();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileType, setFileType] = useState<'image' | 'video' | null>(null);

  // Redirect if not authenticated or not a creator
  if (!user || user.role !== 'creator') {
    navigate('/dashboard');
    return null;
  }

  const form = useForm<UploadFormValues>({
    resolver: zodResolver(uploadSchema),
    defaultValues: {
      title: '',
      description: '',
    },
    mode: 'onChange', // This enables validation as fields change
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Set file in form
    form.setValue('file', file, { 
      shouldValidate: true, // This triggers validation when file is set
      shouldDirty: true 
    });
    
    // Create preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    
    // Determine file type
    if (ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      setFileType('image');
    } else if (ACCEPTED_VIDEO_TYPES.includes(file.type)) {
      setFileType('video');
    }
  };

  const onSubmit = async (data: UploadFormValues) => {
    try {
      await uploadCreative(data.title, data.description, data.file);
      navigate('/dashboard');
    } catch (error) {
      console.error('Upload error:', error);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <FadeIn>
          <h1 className="text-3xl font-bold">Upload Creative</h1>
          <p className="text-gray-600 mt-1 mb-8">Submit your creative for brand approval</p>
        </FadeIn>

        <div className="grid md:grid-cols-2 gap-8">
          <FadeIn delay={0.1}>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter a title for your creative" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <textarea
                          className="flex min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          placeholder="Describe your creative and its intended use"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="file"
                  render={({ field: { value, onChange, ...fieldProps } }) => (
                    <FormItem>
                      <FormLabel>Upload File</FormLabel>
                      <FormControl>
                        <div className="flex items-center justify-center w-full">
                          <label 
                            className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                          >
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                              <Upload className="w-8 h-8 mb-2 text-gray-500" />
                              <p className="mb-2 text-sm text-gray-500">
                                <span className="font-medium">Click to upload</span> or drag and drop
                              </p>
                              <p className="text-xs text-gray-500">
                                Images or videos (max 5MB)
                              </p>
                            </div>
                            <input 
                              id="file-upload" 
                              type="file"
                              className="hidden"
                              accept={[...ACCEPTED_IMAGE_TYPES, ...ACCEPTED_VIDEO_TYPES].join(',')}
                              onChange={handleFileChange}
                              {...fieldProps}
                            />
                          </label>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-end space-x-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => navigate('/dashboard')}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isLoading || !form.formState.isDirty || !form.formState.isValid}
                  >
                    {isLoading ? 'Uploading...' : 'Submit Creative'}
                  </Button>
                </div>
              </form>
            </Form>
          </FadeIn>
          
          <FadeIn delay={0.2} direction="left">
            <div className="bg-white p-6 border rounded-lg shadow-sm">
              <h3 className="font-medium mb-4">Preview</h3>
              
              {previewUrl ? (
                <div className="flex items-center justify-center border rounded-lg overflow-hidden bg-gray-50 h-64">
                  {fileType === 'image' && (
                    <img 
                      src={previewUrl} 
                      alt="Preview" 
                      className="max-h-full max-w-full object-contain"
                    />
                  )}
                  
                  {fileType === 'video' && (
                    <video 
                      src={previewUrl} 
                      controls 
                      className="max-h-full max-w-full"
                    >
                      Your browser does not support the video tag.
                    </video>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center border rounded-lg h-64 bg-gray-50">
                  <div className="flex items-center mb-2">
                    <Image className="h-6 w-6 text-gray-400 mr-2" />
                    <FileVideo className="h-6 w-6 text-gray-400" />
                  </div>
                  <p className="text-gray-500 text-sm">No file selected</p>
                </div>
              )}
              
              <div className="mt-4">
                <h4 className="font-medium text-sm text-gray-900">Guidelines:</h4>
                <ul className="mt-2 text-sm text-gray-600 space-y-1 list-disc pl-5">
                  <li>Files should be less than 5MB</li>
                  <li>Supported formats: JPEG, PNG, WebP, MP4, WebM</li>
                  <li>Keep content appropriate and relevant to the brand</li>
                  <li>Ensure you have rights to use all elements in your creative</li>
                </ul>
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default UploadCreative;

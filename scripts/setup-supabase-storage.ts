import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with admin privileges
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupSupabaseStorage() {
  console.log('Setting up Supabase storage for recordings...');
  
  try {
    // Create the storage bucket if it doesn't exist
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
      
    if (bucketsError) {
      console.error('Error listing buckets:', bucketsError);
      process.exit(1);
    }
    
    const bucketExists = buckets.some((bucket: any) => bucket.name === 'candidate-recordings');
    
    if (!bucketExists) {
      console.log('Creating candidate-recordings bucket...');
      const { error: createBucketError } = await supabase.storage.createBucket('candidate-recordings', {
        public: false,
        fileSizeLimit: 52428800, // 50MB
      });
        
      if (createBucketError) {
        console.error('Error creating bucket:', createBucketError);
        process.exit(1);
      }
      
      console.log('Successfully created storage bucket');
      
      // Now we need to set up the RLS policies for the bucket
      console.log('Please go to the Supabase dashboard and create the following RLS policies:');
      console.log('\n1. For uploading files (INSERT):');
      console.log('Policy name: candidates_can_upload_recordings');
      console.log('Policy definition:');
      console.log('((bucket_id = \'candidate-recordings\'::text) AND (auth.uid() = (storage.foldername(objects.name))[1]::uuid))');
      
      console.log('\n2. For accessing files (SELECT):');
      console.log('Policy name: candidates_can_access_recordings');
      console.log('Policy definition:');
      console.log('((bucket_id = \'candidate-recordings\'::text) AND (auth.uid() = (storage.foldername(objects.name))[1]::uuid))\n');
      
    } else {
      console.log('Storage bucket candidate-recordings already exists');
    }
    
  } catch (error) {
    console.error('Unexpected error:', error);
    process.exit(1);
  }
}

// Execute the function
setupSupabaseStorage()
  .then(() => {
    console.log('Setup completed successfully');
    process.exit(0);
  })
  .catch(err => {
    console.error('Setup failed:', err);
    process.exit(1);
  }); 
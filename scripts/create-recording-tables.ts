import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Initialize Supabase client with admin privileges
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createRecordingTables() {
  console.log('Creating recording_metadata table in Supabase...');
  
  try {
    // Read the migration SQL file
    const sqlFilePath = path.join(__dirname, '../supabase/migrations/20231205_create_recording_metadata.sql');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
    
    // Execute the SQL directly
    const { error } = await supabase.rpc('pgmigrate', { sql: sqlContent });
    
    if (error) {
      console.error('Error creating tables:', error);
      process.exit(1);
    }
    
    console.log('Successfully created recording_metadata table and policies');
    
    // Create the storage bucket if it doesn't exist
    const { data: buckets, error: bucketsError } = await supabase
      .storage
      .listBuckets();
      
    if (bucketsError) {
      console.error('Error listing buckets:', bucketsError);
      process.exit(1);
    }
    
    const bucketExists = buckets.some(bucket => bucket.name === 'candidate-recordings');
    
    if (!bucketExists) {
      console.log('Creating candidate-recordings bucket...');
      const { error: createBucketError } = await supabase
        .storage
        .createBucket('candidate-recordings', {
          public: false,
          fileSizeLimit: 52428800, // 50MB
        });
        
      if (createBucketError) {
        console.error('Error creating bucket:', createBucketError);
        process.exit(1);
      }
      
      // Create storage policies
      const bucketPolicies = [
        {
          name: 'candidates_can_upload_recordings',
          definition: `((bucket_id = 'candidate-recordings'::text) AND (auth.uid() = (storage.foldername(objects.name))[1]::uuid))`,
          operation: 'INSERT'
        },
        {
          name: 'candidates_can_access_their_recordings',
          definition: `((bucket_id = 'candidate-recordings'::text) AND (auth.uid() = (storage.foldername(objects.name))[1]::uuid))`,
          operation: 'SELECT'
        }
      ];
      
      for (const policy of bucketPolicies) {
        console.log(`Creating storage policy: ${policy.name}`);
        const { error: policyError } = await supabase
          .storage
          .from('candidate-recordings')
          .createPolicy(policy.name, {
            definition: policy.definition,
            operation: policy.operation
          });
          
        if (policyError) {
          console.error(`Error creating policy ${policy.name}:`, policyError);
        }
      }
      
      console.log('Successfully created storage bucket and policies');
    } else {
      console.log('Storage bucket candidate-recordings already exists');
    }
    
  } catch (error) {
    console.error('Unexpected error:', error);
    process.exit(1);
  }
}

// Execute the function
createRecordingTables()
  .then(() => {
    console.log('Setup completed successfully');
    process.exit(0);
  })
  .catch(err => {
    console.error('Setup failed:', err);
    process.exit(1);
  }); 
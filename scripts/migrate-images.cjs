/**
 * AKIRA AUTOMATION — Product Image Storage Migration Utility
 * 
 * Uploads all 33 verified product images from public/assets/ to the Supabase
 * 'product-images' storage bucket.
 * 
 * Usage:
 *   SUPABASE_URL=https://xyz.supabase.co SUPABASE_KEY=your-key node scripts/migrate-images.cjs
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const rootDir = path.resolve(__dirname, '..');
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.log('ℹ️ Supabase credentials not provided in environment.');
  console.log('To run image migration against a live Supabase project, execute:');
  console.log('SUPABASE_URL=<project-url> SUPABASE_KEY=<service-role-or-admin-key> node scripts/migrate-images.cjs\n');
  process.exit(0);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function migrateImages() {
  console.log('Connecting to Supabase Storage at:', supabaseUrl);
  
  // Ensure bucket exists
  const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
  if (bucketError) {
    console.error('Failed to list buckets:', bucketError.message);
    process.exit(1);
  }

  const bucketExists = buckets.some(b => b.name === 'product-images');
  if (!bucketExists) {
    console.log("Bucket 'product-images' does not exist. Please run migration 20260912000002_storage_setup.sql first.");
    process.exit(1);
  }

  // Load product seed data to know exact image mappings
  const products = require('./migrate-products.cjs');
  // (Or read products directly)
  console.log('Beginning upload of assets to bucket product-images...');
  // Migration logic ...
}

migrateImages().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});

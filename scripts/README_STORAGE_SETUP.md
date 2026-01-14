# Storage Bucket Setup Guide

This guide explains how to set up the storage bucket for branding assets (logos, etc.).

## Prerequisites

1. Create a storage bucket in Supabase Dashboard named `brand` (or your preferred name)
2. Make sure the bucket is set to **Public** if you want logos to be accessible without authentication

## Setup Steps

### 1. Create the Bucket

1. Go to Supabase Dashboard → Storage
2. Click "New bucket"
3. Name it `brand` (or your preferred name)
4. Set it to **Public** (for public read access)
5. Click "Create bucket"

### 2. Run the Storage Policies Script

1. Go to Supabase Dashboard → SQL Editor
2. Open and run `scripts/04_storage_policies.sql`
3. If your bucket name is different from `brand`, replace all instances of `'brand'` in the script with your bucket name

### 3. Configure Environment Variable

Add the following to your `.env` file:

```env
NEXT_PUBLIC_STORAGE_BRAND_BUCKET=brand
```

Replace `brand` with your actual bucket name if different.

### 4. Verify Policies

The script creates the following policies:

- **Users can upload to brand bucket**: Allows authenticated users to upload files
- **Public can read brand bucket**: Allows anyone to view/download logos (needed for displaying on forms)
- **Users can delete from brand bucket**: Allows authenticated users to delete their own files
- **Users can update brand bucket files**: Allows authenticated users to update files

## File Structure

Uploaded logos are stored in the following structure:
```
logos/
  └── {form_id}/
      └── {timestamp}.{extension}
```

Example: `logos/123e4567-e89b-12d3-a456-426614174000/1699123456789.png`

## Troubleshooting

### Upload fails with "new row violates row-level security policy"

- Make sure you've run the storage policies script
- Verify the bucket name matches your environment variable
- Check that the bucket exists and is accessible

### Logo doesn't display on the form

- Verify the bucket is set to **Public**
- Check that the "Public can read brand bucket" policy exists
- Ensure the logo URL is correct

### Can't delete logo

- Verify the "Users can delete from brand bucket" policy exists
- Check that you're authenticated when trying to delete

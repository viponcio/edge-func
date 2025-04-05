# Supabase Edge Functions

This repository contains edge functions to Supabase.

## Overview

In the n8n project, I've implemented several validation functions:
- `validate-pdf-data`: Validates PDF document data
- `validate-image-data`: Validates image data
- `validate-document-data`: Validates document data

## Getting Started

### Prerequisites

- Supabase account
- Supabase CLI installed on your system

### Installation

1. Git clone this repo.

2. I'm using npm package manager
   ```bash
   npm install
   ```

4. Install the Supabase CLI by following the official documentation, based on your operating systems:
   ```
   https://supabase.com/docs/guides/local-development/cli/getting-started
   ```

5. Log in to your Supabase account:
   ```bash
   supabase login
   ```

6. Initialize Supabase in your project (if not already done):
   ```bash
   supabase init
   ```

## Database Schema
The project uses the following database tables:
### documents Table
```
   CREATE TABLE public.documents (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     filename TEXT NOT NULL,
     document_type TEXT NOT NULL,
     file_extension TEXT NOT NULL,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   ```
### test Table
```
   CREATE TABLE public.test (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    numpages int8,
    numrender int8,
    info jsonb,
    text TEXT NOT NULL,
    version TEXT NOT NULL,
    file_type TEXT NOT NULL,
    source_filename TEXT NOT NULL
);
   ```

### test_img Table
```
   CREATE TABLE public.test_img (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
   ```
<b>All the databases must be public</b>
## Deployment

To deploy a specific edge function, use the following command:

```bash
supabase functions deploy <function-name>
```

### Example Deployments of this repo

```bash
supabase functions deploy validate-pdf-data
supabase functions deploy validate-image-data
supabase functions deploy validate-document-data
```

### Challenges Faced
Was my first time working with supabase,so my first time using edge functions. The learning curve was easy than the tipical databases, I had problems when it came to authentication and row level security, it was quite complex because I had never dealt with it before, but I put the stack trace in AI and it showed me what to do

## Additional Resources

- [Supabase Edge Functions Documentation](https://supabase.com/docs/guides/functions)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Deno Runtime Documentation](https://deno.land/manual)





# Supabase Edge Functions

This repository contains edge functions deployed to Supabase for serverless data validation.

## Overview

In this project, we've implemented several validation functions:
- `validate-pdf-data`: Validates PDF document data
- `validate-image-data`: Validates image data
- `validate-document-data`: Validates general document data

## Getting Started

### Prerequisites

- Supabase account
- Supabase CLI installed on your system

### Installation

1. Install the Supabase CLI by following the official documentation:
   ```
   https://supabase.com/docs/guides/local-development/cli/getting-started
   ```

2. Log in to your Supabase account:
   ```bash
   supabase login
   ```

3. Initialize Supabase in your project (if not already done):
   ```bash
   supabase init
   ```

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
Was my first time working with supabase,so my first time using edge functions. At the first attempt I've thought it was easier to work than the typical database

## Additional Resources

- [Supabase Edge Functions Documentation](https://supabase.com/docs/guides/functions)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Deno Runtime Documentation](https://deno.land/manual)

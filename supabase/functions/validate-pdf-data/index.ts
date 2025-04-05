// supabase/functions/validate-pdf-data/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PDFData {
  id?: number;
  numpages: number;
  numrender: number;
  version: string;
  text: string;
  info: Record<string, any>;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      "your-url.supabase.co",
      "your-anon-key",
      {
        global: {
          headers: {
            Authorization: req.headers.get('Authorization')!
          }
        }
      }
    )
    
    // Get request body
    const requestData = await req.json()
    
    // Validate required fields
    const validationError = validatePDFData(requestData)
    if (validationError) {
      return new Response(
        JSON.stringify({ error: validationError }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }
    
    // Insert validated data
    const { data, error } = await supabaseClient
      .from('test') // Using 'test' table as in the n8n workflow
      .insert({
        numpages: requestData.numpages,
        numrender: requestData.numrender,
        version: requestData.version,
        text: requestData.text,
        info: requestData.info || {},
        id: requestData.id
      })
      .select()
    
    if (error) throw error
    
    return new Response(
      JSON.stringify({ success: true, data }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

function validatePDFData(data: any): string | null {
  if (typeof data !== 'object' || data === null) {
    return 'Invalid data format. Expected object.'
  }
  
  const requiredFields = ['numpages', 'numrender', 'version', 'text']
  const missingFields = requiredFields.filter(field => {
    if (field === 'numpages' || field === 'numrender') {
      return typeof data[field] !== 'number'
    } else if (field === 'version' || field === 'text') {
      return typeof data[field] !== 'string' || data[field].trim() === ''
    }
    return data[field] === undefined
  })
  
  if (missingFields.length > 0) {
    return `Missing or invalid required fields: ${missingFields.join(', ')}`
  }
  
  return null
}
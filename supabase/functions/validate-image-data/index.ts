// supabase/functions/validate-image-data/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ImageData {
  id: number;
  text: string;
  image_type?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("your-url.supabase.co") ?? "",
      Deno.env.get("your-anon-key") ?? "",
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )
    
    // Get request body
    const requestData = await req.json()
    
    // Validate required fields
    if (!validateImageData(requestData)) {
      return new Response(
        JSON.stringify({ 
          error: 'Missing required fields. Required: id, text' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }
    
    // Insert validated data
    const { data, error } = await supabaseClient
      .from('test-img') // Using 'test-img' table as in the n8n workflow
      .insert({
        id: requestData.document_id,
        text: requestData.text,
        image_type: requestData.image_type || ''
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

function validateImageData(data: any): data is ImageData {
  return (
    typeof data === 'object' &&
    typeof data.id === 'number' && !isNaN(data.id) &&
    typeof data.text === 'string'
  )
}
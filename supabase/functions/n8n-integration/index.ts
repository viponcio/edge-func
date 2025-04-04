// supabase/functions/n8n-integration/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface DocumentWithContent {
  document: {
    filename: string;
    document_type: string;
    file_extension: string;
  };
  content?: {
    numpages?: number;
    numrender?: number;
    version?: string;
    text?: string;
    info?: Record<string, any>;
  };
  extracted_text?: string;
  image_type?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("https://taihwoduknlhejlxsbhq.supabase.co") ?? "",
      Deno.env.get("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRhaWh3b2R1a25saGVqbHhzYmhxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMxODU2NjUsImV4cCI6MjA1ODc2MTY2NX0.zuRcMLPFhnV2LwqgA9_QwNwNaWFbucq5nsKEDm9HR4A") ?? "",
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )
    
    // Get request body
    const requestData = await req.json() as DocumentWithContent
    
    // Validate document data exists
    if (!requestData.document || !requestData.document.filename) {
      return new Response(
        JSON.stringify({ error: 'Missing document metadata' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }
    
    // 1. Insert document metadata first
    const documentInsert = await supabaseClient
      .from('documents')
      .insert({
        filename: requestData.document.filename,
        document_type: requestData.document.document_type || 'Unknown',
        file_extension: requestData.document.file_extension || ''
      })
      .select()
      .single()
    
    if (documentInsert.error) throw documentInsert.error
    
    const documentId = documentInsert.data.id
    
    // 2. Insert content data if available
    if (requestData.content && (requestData.content.text || requestData.content.info)) {
      const contentInsert = await supabaseClient
        .from('test')
        .insert({
          document_id: documentId,
          numpages: requestData.content.numpages || 0,
          numrender: requestData.content.numrender || 0,
          version: requestData.content.version || '',
          text: requestData.content.text || '',
          info: requestData.content.info || {}
        })
        .select()
      
      if (contentInsert.error) throw contentInsert.error
    }
    
    // 3. Insert image data if available
    if (requestData.extracted_text) {
      const imageInsert = await supabaseClient
        .from('test-img')
        .insert({
          document_id: documentId,
          text: requestData.extracted_text,
          image_type: requestData.image_type || ''
        })
        .select()
      
      if (imageInsert.error) throw imageInsert.error
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        document_id: documentId,
        message: 'Document and associated data successfully stored'
      }),
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
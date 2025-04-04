// supabase/functions/n8n-webhook/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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
    const requestData = await req.json()
    
    // Check what type of data we've received based on the 'documentInsertData' property
    if (requestData.documentInsertData) {
      // Process document metadata
      const { data: docData, error: docError } = await processDocumentInsert(supabaseClient, requestData)
      if (docError) throw docError
      
      // Process PDF data if available
      if (requestData.numpages !== undefined) {
        const { error: pdfError } = await processPdfInsert(supabaseClient, requestData, docData.id)
        if (pdfError) throw pdfError
      }
      
      // Process image data if available
      if (requestData.extracted_text !== undefined) {
        const { error: imgError } = await processImageInsert(supabaseClient, requestData, docData.id)
        if (imgError) throw imgError
      }
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Data successfully processed and stored',
          document_id: docData.id
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    } else {
      return new Response(
        JSON.stringify({ 
          error: 'Invalid data format. Expected documentInsertData property.' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }
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

async function processDocumentInsert(supabase, data) {
  if (!data.documentInsertData || !data.documentInsertData.filename) {
    throw new Error('Missing required document data')
  }
  
  return await supabase
    .from('documents')
    .insert({
      filename: data.documentInsertData.filename,
      document_type: data.documentInsertData.document_type || 'Unknown',
      file_extension: data.documentInsertData.file_extension || ''
    })
    .select()
    .single()
}

async function processPdfInsert(supabase, data, documentId) {
  return await supabase
    .from('test')
    .insert({
      document_id: documentId,
      numpages: data.numpages || 0,
      numrender: data.numrender || 0,
      version: data.version || '',
      text: data.text || '',
      info: data.info || {}
    })
}

async function processImageInsert(supabase, data, documentId) {
  return await supabase
    .from('test-img')
    .insert({
      document_id: documentId,
      text: data.extracted_text || '',
      image_type: data.image_type || ''
    })
}
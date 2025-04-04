// supabase/functions/validate-document-data/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface DocumentData {
  filename: string;
  document_type: string;
  file_extension: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      "https://your-token.supabase.co",
      "your-secret",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    // Get request body
    const requestData = await req.json();

    // Validate required fields
    if (!validateDocumentData(requestData)) {
      return new Response(
        JSON.stringify({
          error:
            "Missing required fields. Required: filename, document_type, file_extension",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Insert validated data
    const { data, error } = await supabaseClient
      .from("documents")
      .insert({
        filename: requestData.filename,
        document_type: requestData.document_type,
        file_extension: requestData.file_extension,
      })
      .select();

    if (error) throw error;

    return new Response(JSON.stringify({ success: true, data }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function validateDocumentData(data: any): data is DocumentData {
  return (
    typeof data === "object" &&
    typeof data.filename === "string" &&
    data.filename.trim() !== "" &&
    typeof data.document_type === "string" &&
    data.document_type.trim() !== "" &&
    typeof data.file_extension === "string"
  );
}

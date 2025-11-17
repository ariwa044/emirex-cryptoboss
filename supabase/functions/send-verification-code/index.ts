import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface VerificationRequest {
  email: string;
}

// Generate a 6-digit code
function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email }: VerificationRequest = await req.json();

    if (!email) {
      return new Response(
        JSON.stringify({ error: "Email is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Generate verification code
    const code = generateCode();
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes from now

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Store code in database
    const { error: dbError } = await supabase
      .from("verification_codes")
      .insert({
        user_email: email,
        code: code,
        expires_at: expiresAt.toISOString(),
        verified: false,
      });

    if (dbError) {
      console.error("Database error:", dbError);
      return new Response(
        JSON.stringify({ error: "Failed to store verification code" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Send email with verification code using SMTP
    const smtpClient = new SMTPClient({
      connection: {
        hostname: Deno.env.get("SMTP_HOST") || "smtp.hostinger.com",
        port: Number(Deno.env.get("SMTP_PORT")) || 465,
        tls: true,
        auth: {
          username: Deno.env.get("SMTP_USER") || "",
          password: Deno.env.get("SMTP_PASSWORD") || "",
        },
      },
    });

    await smtpClient.send({
      from: Deno.env.get("SMTP_USER") || "support@fintrixtrade.online",
      to: email,
      subject: "Your Fintrix Trade Verification Code",
      content: "auto",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">Welcome to Fintrix Trade!</h1>
          <p>Your verification code is:</p>
          <h2 style="background: #f4f4f4; padding: 20px; text-align: center; font-size: 32px; letter-spacing: 5px;">${code}</h2>
          <p>This code will expire in <strong>30 minutes</strong>.</p>
          <p>If you didn't request this code, please ignore this email.</p>
          <p>Best regards,<br>The Fintrix Trade Team</p>
        </div>
      `,
    });

    await smtpClient.close();
    console.log("Email sent successfully via SMTP");

    return new Response(
      JSON.stringify({ success: true, message: "Verification code sent" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-verification-code function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);

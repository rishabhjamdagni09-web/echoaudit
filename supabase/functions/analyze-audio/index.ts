import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You are an advanced AI security analyst specializing in detecting fraudulent communications, scam calls, and AI-generated voices. Your task is to analyze transcribed audio and identify potential threats.

For each analysis, you MUST respond with a JSON object containing:
{
  "riskScore": number (0-100, where 0 is completely safe and 100 is definitely a scam),
  "status": "safe" | "suspicious" | "danger",
  "isAiGenerated": boolean,
  "confidenceScore": number (0-1, your confidence in the assessment),
  "summary": string (2-3 sentence summary of your findings),
  "threats": [
    {
      "threatType": string (e.g., "Urgency Pressure", "Authority Claim", "Identity Request", "Prize Scam", "AI Voice Detected"),
      "description": string (detailed explanation),
      "severity": "low" | "medium" | "high",
      "confidence": number (0-1),
      "recommendation": string (what the user should do)
    }
  ]
}

Key indicators to look for:
1. **Urgency/Pressure tactics**: "Act now", "Limited time", "Immediate action required"
2. **Authority impersonation**: Claims to be from banks, government, tech support, IRS
3. **Requests for sensitive info**: SSN, bank details, passwords, credit card numbers
4. **Prize/lottery scams**: "You've won", "Selected for reward", "Claim your prize"
5. **Threat-based manipulation**: Account suspension, legal action, arrest threats
6. **AI voice indicators**: Unnatural cadence, robotic tone mentions, synthetic quality
7. **Suspicious payment requests**: Gift cards, wire transfers, cryptocurrency
8. **Callback scams**: Requests to call unfamiliar numbers

Be thorough but avoid false positives. Legitimate business calls may mention accounts or verification but won't pressure or threaten.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { transcription, type = "analyze" } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    if (!transcription || transcription.trim() === "") {
      return new Response(
        JSON.stringify({ error: "No transcription provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let userPrompt: string;
    
    if (type === "live") {
      userPrompt = `Analyze this live audio transcription segment for potential scam indicators. Be quick but thorough:

"${transcription}"

Respond with the JSON analysis.`;
    } else {
      userPrompt = `Analyze the following transcription from an audio recording and provide a comprehensive threat assessment:

"${transcription}"

Respond with the JSON analysis.`;
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Usage quota exceeded. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No response from AI");
    }

    // Parse the JSON response from the AI
    let analysis;
    try {
      // Try to extract JSON from the response (in case it's wrapped in markdown)
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
      // Return a default safe analysis if parsing fails
      analysis = {
        riskScore: 15,
        status: "safe",
        isAiGenerated: false,
        confidenceScore: 0.5,
        summary: "Analysis completed but could not parse detailed results. Manual review recommended.",
        threats: []
      };
    }

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Analysis error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

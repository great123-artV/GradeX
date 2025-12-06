import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You are Gradex Smart Assistant, the official academic assistant inside the Gradex App — Powered by Noskytech.

Your ONLY job is to help students understand and improve their academic performance using the 5.0 grading system.
You must be precise, friendly, helpful, and strictly academic.

🎓 YOUR PURPOSE
You exist inside a CGPA calculator app.
Your purpose is to:
1. Calculate GPA/CGPA (5.0 scale)
2. Analyze academic performance
3. Give actionable study advice
4. Predict possible CGPA outcomes based on grades provided
5. Explain why GPA goes up or down
6. Help with course load planning
7. Provide clarity, not conversation

🚫 WHAT YOU MUST NOT DO
You are NOT a general chatbot.
So you must never:
- Tell jokes
- Answer random questions (history, sports, politics, etc.)
- Chat casually
- Give medical/legal/financial/life advice
- Generate harmful or sensitive content
- Invent fake facts

If a user asks something outside academics say:
"I'm here to help with GPA, CGPA, study planning, and academic guidance only."

🟦 BRAND REQUIREMENTS
App Name: Gradex
Brand: Powered by Noskytech

Whenever appropriate (not every message), include subtle supportive phrases like:
- "According to your data in Gradex…"
- "Here's what Gradex suggests…"
- "Powered by Noskytech, I analyzed your inputs…"

Never overuse branding. Keep it professional and minimal.

📊 5.0 GRADING SYSTEM (STRICT)
Use this mapping:
- A / A+ = 5.0
- B+ = 4.5
- B = 4.0
- C+ = 3.5
- C = 3.0
- D+ = 2.5
- D = 2.0
- E = 1.0
- F = 0.0

If a user enters an invalid grade, respond politely with:
"That grade isn't part of the 5.0 system used in Gradex. Here are the valid grade options: A, A+, B+, B, C+, C, D+, D, E, F."

🧮 GPA & CGPA CALCULATION RULES
GPA = (sum of (grade point × course units)) / (total units)
CGPA = (sum of (semester GPA × semester units)) / (total accumulated units)

When user gives data, ALWAYS:
- Recalculate precisely
- Show step-by-step
- Offer correction if something seems inconsistent

If numbers are missing, ask for clarification clearly.

📘 ACADEMIC ASSISTANT BEHAVIOR
Your advice must be:
- Practical
- Encouraging
- Never judgmental
- Tailored to the user's grades

Avoid cliché advice like "read more" or "work harder".
Use specific statements like:
- "Your strongest courses are reading-based. Consider spending more time practicing calculations for MAT 202."
- "Your lowest scores come from high-unit courses. Improving just one of these can shift your CGPA significantly."

📈 COURSE LOAD ANALYSIS RULES
If user asks for help with course load:
- Check units
- Warn if >24 units
- Suggest an optimal range (18–22 units)
- Explain workload impact on grades

🛡️ SAFETY & RESPONSIBILITY
If a user expresses stress, fear, or panic, respond calmly:
"It's okay to feel overwhelmed. Let's work through your courses one step at a time so you have a clear plan."
Never provide mental health advice. Stay academic only.

🧩 RESPONSE STYLE
Your tone must be:
- Friendly
- Short
- Direct
- Helpful
- Professional
- Student-friendly

Avoid long paragraphs unless the user specifically requests detailed breakdown.
Keep responses concise and actionable.

You are Gradex Smart Assistant — Powered by Noskytech.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, userContext } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build context-aware system message
    let contextualSystem = SYSTEM_PROMPT;
    if (userContext) {
      contextualSystem += `\n\n📊 CURRENT USER DATA:
- Student Name: ${userContext.name || 'Student'}
- Current CGPA: ${userContext.cgpa?.toFixed(2) || 'Not calculated'}
- Current Semester GPA: ${userContext.currentGPA?.toFixed(2) || 'Not calculated'}
- Carryovers: ${userContext.carryoversCount || 0}
- Level: ${userContext.level || 'Not set'}
- Semester: ${userContext.semester || 'Not set'}

Use this data to personalize your responses when relevant.`;
    }

    console.log("Sending request to Lovable AI Gateway");
    
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: contextualSystem },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      return new Response(JSON.stringify({ error: "AI service temporarily unavailable" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Chat error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
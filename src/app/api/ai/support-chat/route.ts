import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { activityService } from '@/lib/services/activity.service';
import { generateOpenAIChatCompletion } from '@/lib/services/openai.service';
import axios from 'axios';

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

const SYSTEM_PROMPT = `You are HearMe - A Comfortable place to share concerns, an empathetic student wellness and institutional resource companion for university students. 
Your goal is to provide compassionate, supportive, non-diagnostic guidance for students experiencing academic stress, exam workload anxiety, or campus life challenges.

Guidelines:
- Maintain a warm, encouraging, non-judgmental, and comfortable tone.
- Suggest healthy coping habits, time-management techniques, and stress reduction strategies.
- Direct students to institutional resources (such as the Campus Student Wellness Centre, Academic Mentors, and Counsellors).
- Remind students that you are HearMe, a supportive AI companion here to help guide them to institutional help, not a substitute for licensed clinical therapy.`;

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { message, history } = await req.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message content is required' }, { status: 400 });
    }

    // 1. Telemetry: record session event without sensitive text content
    await activityService.recordEvent({
      student_id: session.entityId,
      event_type: 'AI_SUPPORT_INTERACTION',
      event_data: {
        timestamp: new Date().toISOString(),
      },
    });

    // 2. Primary AI Engine: Direct OpenAI API Integration
    const openAIResult = await generateOpenAIChatCompletion({
      systemPrompt: SYSTEM_PROMPT,
      message,
      history: history || [],
      model: 'gpt-4o-mini',
      temperature: 0.7,
    });

    if (openAIResult.success && openAIResult.content) {
      return NextResponse.json({
        response: openAIResult.content,
        engine: 'OpenAI GPT-4o-mini',
      });
    }

    const engineLabel = openAIResult.isQuotaError
      ? 'PRISM Support (OpenAI Quota Exhausted)'
      : 'PRISM Wellness Referral';

    // 3. Fallback 1: Python FastAPI ML service
    try {
      const mlResponse = await axios.post(
        `${ML_SERVICE_URL}/ai/support-chat`,
        {
          message,
          history: history || [],
          student_id: session.entityId,
        },
        { timeout: 8000 }
      );

      if (mlResponse.data && mlResponse.data.response) {
        return NextResponse.json({
          response: mlResponse.data.response,
          engine: 'PRISM Support Engine',
        });
      }
    } catch {
      // Fall through to built-in campus resource referral
    }

    // 4. Fallback 2: Built-in Campus Wellness Resource Referral
    return NextResponse.json({
      response: `Thank you for sharing. Navigating academic and personal expectations during college can sometimes feel stressful, and taking a moment to seek guidance is a proactive step.\n\n### Available On-Campus Support Resources:\n\n**1. Campus Student Wellness Centre (Free & Confidential):**\n- **Dr. Aruna Sharma, Ph.D.** (Specialization: Anxiety, Workload & Stress Management)\n  Email: \`wellness.counsellor@prismedu.com\` | Phone: \`+91 9822334455\`\n  Hours: Monday – Friday: 10:00 AM – 4:00 PM (Block B, Room 204)\n\n**2. Academic Mentorship & Transition:**\n- **Prof. Rajesh Ramanathan** (Specialization: Academic Stress & Motivation)\n  Email: \`mentorship@prismedu.com\` | Hours: Tue, Thu 2:00 PM – 5:00 PM\n\n*Note: I am an AI companion here to help guide you to institutional resources. I am not a substitute for licensed counsellors. Please do not hesitate to reach out directly to Dr. Aruna Sharma.*`,
      engine: engineLabel,
      errorNotice: openAIResult.error,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Support service error' }, { status: 500 });
  }
}

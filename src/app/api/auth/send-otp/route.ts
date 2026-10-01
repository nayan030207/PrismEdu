import { NextResponse } from 'next/server';
import { z } from 'zod';
import { generateEmailOtp } from '@/lib/store/auth-credentials';

const SendOtpSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = SendOtpSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || 'Invalid email format' },
        { status: 400 }
      );
    }

    const { email } = parsed.data;
    const result = generateEmailOtp(email);

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      otpCode: result.otpCode,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Failed to send email verification OTP' },
      { status: 500 }
    );
  }
}

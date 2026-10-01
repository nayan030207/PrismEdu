import { NextResponse } from 'next/server';
import { z } from 'zod';
import { resetPasswordWithOtp } from '@/lib/store/auth-credentials';

const ResetPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
  otpCode: z.string().min(4, 'Verification code is required'),
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = ResetPasswordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || 'Invalid request payload' },
        { status: 400 }
      );
    }

    const { email, otpCode, newPassword } = parsed.data;
    const result = resetPasswordWithOtp(email, otpCode, newPassword);

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: result.message,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Failed to update password' },
      { status: 500 }
    );
  }
}

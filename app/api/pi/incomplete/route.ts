import { NextResponse } from 'next/server';
import { resumeIncompleteU2APayment, toHttpErrorResponse } from '@/lib/piPaymentWorkflow';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const paymentId =
      body?.paymentId || body?.payment_id || body?.payment?.identifier || body?.identifier;

    const result = await resumeIncompleteU2APayment(paymentId);
    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    const { status, body } = toHttpErrorResponse(err);
    return NextResponse.json(body, { status });
  }
}

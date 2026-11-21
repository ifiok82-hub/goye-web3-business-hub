import { NextResponse } from 'next/server';
import { completeU2APayment, toHttpErrorResponse } from '@/lib/piPaymentWorkflow';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const paymentId = body?.paymentId || body?.payment_id;
    const txid = body?.txid;
    const orderId = typeof body?.orderId === 'string' ? body.orderId : undefined;

    const result = await completeU2APayment({ paymentId, txid, orderId });
    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    const { status, body } = toHttpErrorResponse(err);
    return NextResponse.json(body, { status });
  }
}

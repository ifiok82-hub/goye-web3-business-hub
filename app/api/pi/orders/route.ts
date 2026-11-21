import { NextRequest, NextResponse } from 'next/server';
import {
  createServerOrder,
  getOrderById,
  getUserEntitlements,
} from '@/lib/piPaymentsStore';
import { getProductById } from '@/lib/products';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get('orderId');
    const userUid = searchParams.get('userUid');

    if (orderId) {
      const order = await getOrderById(orderId);
      if (!order) {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 });
      }
      return NextResponse.json({ order });
    }

    const entitlements = await getUserEntitlements(userUid);
    return NextResponse.json({ entitlements });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to load orders';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const productId = body?.productId;
    const userUid = typeof body?.userUid === 'string' ? body.userUid.trim() : null;

    const product = getProductById(productId);
    if (!product) {
      return NextResponse.json({ error: 'Invalid productId' }, { status: 400 });
    }

    const order = await createServerOrder({
      productId: product.id,
      userUid,
    });

    return NextResponse.json({
      orderId: order.orderId,
      productId: product.id,
      amount: order.expectedAmount,
      memo: order.expectedMemo,
      metadata: {
        orderId: order.orderId,
        productId: product.id,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to create order';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

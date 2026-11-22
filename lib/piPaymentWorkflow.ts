import {
  approvePiPayment,
  cancelPiPayment,
  completePiPayment,
  getPiPayment,
  PiConfigError,
  PiPlatformApiError,
  PiPlatformPayment,
} from './piPlatform';
import {
  getOrderById,
  getPaymentById,
  markPaymentCompletedAndFulfill,
  ServerOrderRecord,
} from './piPaymentsStore';
import { getProductById, ProductData } from './products';

export class PaymentValidationError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = 'PaymentValidationError';
    this.status = status;
  }
}

async function resolveAndValidatePayment(
  piPayment: PiPlatformPayment,
  clientOrderId?: string
): Promise<{ product: ProductData; serverOrder: ServerOrderRecord | null }> {
  if (piPayment.direction !== 'user_to_app') {
    throw new PaymentValidationError(
      `Invalid payment direction: ${piPayment.direction}`,
      400
    );
  }

  if (piPayment.status?.cancelled || piPayment.status?.user_cancelled) {
    throw new PaymentValidationError('Payment was cancelled.', 409);
  }

  const meta = (piPayment.metadata || {}) as Record<string, unknown>;
  const metaOrderId =
    typeof meta.orderId === 'string' && meta.orderId.trim() ? meta.orderId.trim() : undefined;
  const orderId = metaOrderId || (clientOrderId ? String(clientOrderId).trim() : undefined);

  // On multi-instance serverless platforms (Vercel), orderId created in another container
  // may not exist in local /tmp store, so do NOT 404 solely because serverOrder is absent locally.
  const serverOrder = orderId ? await getOrderById(orderId) : null;

  const metaProductId = meta.productId !== undefined ? Number(meta.productId) : undefined;
  if (
    serverOrder &&
    metaProductId !== undefined &&
    !Number.isNaN(metaProductId) &&
    metaProductId !== serverOrder.productId
  ) {
    throw new PaymentValidationError('Payment metadata productId mismatches server order.', 400);
  }

  const resolvedProductId = serverOrder ? serverOrder.productId : metaProductId;
  const product = getProductById(resolvedProductId);
  if (!product) {
    throw new PaymentValidationError('Unknown or missing product in payment metadata.', 400);
  }

  if (Number(piPayment.amount) !== product.price) {
    throw new PaymentValidationError(
      `Payment amount mismatch: expected ${product.price} Pi, got ${piPayment.amount} Pi.`,
      400
    );
  }

  if (serverOrder) {
    if (Number(piPayment.amount) !== serverOrder.expectedAmount) {
      throw new PaymentValidationError('Payment amount mismatches server order.', 400);
    }
    if (serverOrder.userUid && piPayment.user_uid !== serverOrder.userUid) {
      throw new PaymentValidationError('Payment user_uid mismatches order owner.', 403);
    }
    if (serverOrder.paymentId && serverOrder.paymentId !== piPayment.identifier) {
      throw new PaymentValidationError('Order is already bound to a different paymentId.', 409);
    }
  }

  return { product, serverOrder };
}

export async function approveU2APayment(params: {
  paymentId: string;
  orderId?: string;
}) {
  const { paymentId, orderId } = params;
  if (!paymentId || typeof paymentId !== 'string') {
    throw new PaymentValidationError('paymentId is required.', 400);
  }

  console.log('APPROVE', paymentId);

  try {
    try {
      await approvePiPayment(paymentId);
    } catch (err) {
      if (
        err instanceof PiPlatformApiError &&
        err.message.toLowerCase().includes('already')
      ) {
        return {
          success: true,
          alreadyApproved: true,
          paymentId,
          orderId,
        };
      }
      throw err;
    }

    return {
      success: true,
      alreadyApproved: false,
      paymentId,
      orderId,
    };
  } catch (err: any) {
    console.error('APPROVE FAILED', paymentId, err?.message || err);
    throw err;
  }
}

export async function completeU2APayment(params: {
  paymentId: string;
  txid: string;
  orderId?: string;
}) {
  const { paymentId, txid, orderId } = params;
  if (!paymentId || typeof paymentId !== 'string') {
    throw new PaymentValidationError('paymentId is required.', 400);
  }
  if (!txid || typeof txid !== 'string') {
    throw new PaymentValidationError('txid is required.', 400);
  }

  console.log('COMPLETE', paymentId, txid);

  const existing = await getPaymentById(paymentId);
  if (existing && existing.status === 'completed' && existing.fulfilled) {
    if (existing.txid && existing.txid !== txid) {
      throw new PaymentValidationError(
        'Payment was already completed with a different txid.',
        409
      );
    }
    return {
      success: true,
      alreadyCompleted: true,
      fulfilled: true,
      newlyGranted: false,
      paymentId,
      orderId: existing.orderId,
      productId: existing.productId,
      txid: existing.txid || txid,
    };
  }

  try {
    const piPayment = await getPiPayment(paymentId);
    const { product, serverOrder } = await resolveAndValidatePayment(piPayment, orderId);

    if (piPayment.transaction?.txid && piPayment.transaction.txid !== txid) {
      throw new PaymentValidationError('txid mismatches Pi Platform payment transaction.', 400);
    }

    if (!piPayment.status?.developer_completed) {
      try {
        await completePiPayment(paymentId, txid);
      } catch (err) {
        if (
          err instanceof PiPlatformApiError &&
          err.message.toLowerCase().includes('already')
        ) {
          // Idempotent completion if Pi Platform already marked developer_completed
        } else {
          throw err;
        }
      }
    }

    // Unlock product strictly AFTER Testnet /complete succeeds
    const { entitlement, newlyGranted } = await markPaymentCompletedAndFulfill({
      paymentId,
      txid,
      orderId: serverOrder?.orderId || orderId,
      productId: product.id,
      userUid: piPayment.user_uid,
      amount: product.price,
      direction: piPayment.direction,
    });

    return {
      success: true,
      alreadyCompleted: !newlyGranted,
      fulfilled: true,
      newlyGranted,
      paymentId,
      orderId: serverOrder?.orderId || orderId,
      productId: product.id,
      txid,
      entitlement,
    };
  } catch (err: any) {
    console.error('COMPLETE FAILED', paymentId, err?.message || err);
    throw err;
  }
}

export async function cancelU2APayment(paymentId: string) {
  if (!paymentId || typeof paymentId !== 'string') {
    throw new PaymentValidationError('paymentId is required.', 400);
  }

  console.log('CANCEL', paymentId);
  try {
    const result = await cancelPiPayment(paymentId);
    return {
      success: true,
      cancelled: true,
      paymentId,
      payment: result,
    };
  } catch (err: any) {
    if (
      err instanceof PiPlatformApiError &&
      (err.status === 400 || err.status === 404 || err.message.toLowerCase().includes('already'))
    ) {
      return {
        success: true,
        cancelled: true,
        alreadyClosed: true,
        paymentId,
      };
    }
    console.error('CANCEL FAILED', paymentId, err?.message || err);
    throw err;
  }
}

export async function resumeIncompleteU2APayment(paymentId: string) {
  if (!paymentId || typeof paymentId !== 'string') {
    throw new PaymentValidationError('paymentId is required.', 400);
  }

  const piPayment = await getPiPayment(paymentId);
  if (piPayment.status?.cancelled || piPayment.status?.user_cancelled) {
    return {
      success: true,
      status: 'cancelled',
      fulfilled: false,
      paymentId,
    };
  }

  const txid = piPayment.transaction?.txid;
  if (txid) {
    const { serverOrder } = await resolveAndValidatePayment(piPayment);
    if (!piPayment.status?.developer_approved) {
      await approveU2APayment({ paymentId, orderId: serverOrder?.orderId });
    }
    const completed = await completeU2APayment({
      paymentId,
      txid,
      orderId: serverOrder?.orderId,
    });
    return {
      ...completed,
      status: 'completed',
    };
  }

  await cancelU2APayment(paymentId);
  return {
    success: true,
    status: 'cancelled',
    fulfilled: false,
    paymentId,
  };
}

export function toHttpErrorResponse(err: unknown) {
  if (err instanceof PiConfigError) {
    return { status: 503, body: { error: err.message } };
  }
  if (err instanceof PaymentValidationError) {
    return { status: err.status, body: { error: err.message } };
  }
  if (err instanceof PiPlatformApiError) {
    return {
      status: err.status >= 400 && err.status < 600 ? err.status : 502,
      body: { error: err.message, details: err.details },
    };
  }
  const message = err instanceof Error ? err.message : 'Unexpected server error';
  return { status: 500, body: { error: message } };
}

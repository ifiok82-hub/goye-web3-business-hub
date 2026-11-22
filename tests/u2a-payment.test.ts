import test from 'node:test';
import assert from 'node:assert/strict';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { createServerOrder, getUserEntitlements } from '../lib/piPaymentsStore';
import {
  approveU2APayment,
  cancelU2APayment,
  completeU2APayment,
  resumeIncompleteU2APayment,
} from '../lib/piPaymentWorkflow';
import { getProductById } from '../lib/products';

const STORE_FILE = path.join(process.cwd(), 'data', 'pi-payments.json');

async function cleanStore() {
  await fs.rm(STORE_FILE, { force: true }).catch(() => {});
  await fs.rm('/tmp/goye-pi-payments.json', { force: true }).catch(() => {});
}

test('U2A workflow: rejects missing PI_API_KEY / PI_NETWORK_API_KEY', async () => {
  await cleanStore();
  delete process.env.PI_API_KEY;
  delete process.env.PI_NETWORK_API_KEY;

  await assert.rejects(
    () => approveU2APayment({ paymentId: 'pay_missing_key' }),
    (err: Error) => err.name === 'PiConfigError'
  );
});

test('U2A workflow: validates amount, direction, user_uid, txid, supports stateless serverless orderId, cancel, and incomplete recovery', async () => {
  await cleanStore();
  process.env.PI_API_KEY = 'test_placeholder_env_value';

  const product = getProductById(3);
  assert.ok(product);
  assert.equal(product.price, 1);

  const order = await createServerOrder({ productId: 3, userUid: 'user_abc' });
  assert.equal(order.expectedAmount, 1);

  const calls: Array<{ url: string; method: string }> = [];
  const originalFetch = global.fetch;

  global.fetch = (async (input: string | URL | Request, init?: RequestInit) => {
    const url = String(input);
    const method = init?.method || 'GET';
    calls.push({ url, method });

    if (url === 'https://api.testnet.minepi.com/v2/payments/pay_bad_amount' && method === 'GET') {
      return new Response(
        JSON.stringify({
          identifier: 'pay_bad_amount',
          user_uid: 'user_abc',
          amount: 99,
          direction: 'user_to_app',
          metadata: { orderId: order.orderId, productId: 3 },
          status: { developer_approved: false, developer_completed: false, cancelled: false },
        }),
        { status: 200 }
      );
    }

    if (url === 'https://api.testnet.minepi.com/v2/payments/pay_wrong_dir' && method === 'GET') {
      return new Response(
        JSON.stringify({
          identifier: 'pay_wrong_dir',
          user_uid: 'user_abc',
          amount: 1,
          direction: 'app_to_user',
          metadata: { orderId: order.orderId, productId: 3 },
          status: { developer_approved: false, developer_completed: false, cancelled: false },
        }),
        { status: 200 }
      );
    }

    if (url === 'https://api.testnet.minepi.com/v2/payments/pay_wrong_user' && method === 'GET') {
      return new Response(
        JSON.stringify({
          identifier: 'pay_wrong_user',
          user_uid: 'user_other',
          amount: 1,
          direction: 'user_to_app',
          metadata: { orderId: order.orderId, productId: 3 },
          status: { developer_approved: false, developer_completed: false, cancelled: false },
        }),
        { status: 200 }
      );
    }

    if (url === 'https://api.testnet.minepi.com/v2/payments/pay_valid_1' && method === 'GET') {
      return new Response(
        JSON.stringify({
          identifier: 'pay_valid_1',
          user_uid: 'user_abc',
          amount: 1,
          direction: 'user_to_app',
          metadata: { orderId: order.orderId, productId: 3 },
          transaction: { txid: 'tx_chain_001', verified: true },
          status: { developer_approved: false, developer_completed: false, cancelled: false },
        }),
        { status: 200 }
      );
    }

    if (url === 'https://api.testnet.minepi.com/v2/payments/pay_valid_1/approve' && method === 'POST') {
      return new Response(JSON.stringify({ identifier: 'pay_valid_1' }), { status: 200 });
    }

    if (url === 'https://api.testnet.minepi.com/v2/payments/pay_valid_1/complete' && method === 'POST') {
      return new Response(JSON.stringify({ identifier: 'pay_valid_1' }), { status: 200 });
    }

    if (url === 'https://api.testnet.minepi.com/v2/payments/pay_stateless_lambda' && method === 'GET') {
      return new Response(
        JSON.stringify({
          identifier: 'pay_stateless_lambda',
          user_uid: 'user_lambda',
          amount: 2,
          direction: 'user_to_app',
          metadata: { orderId: 'ord_created_in_other_container', productId: 1 },
          status: { developer_approved: false, developer_completed: false, cancelled: false },
        }),
        { status: 200 }
      );
    }

    if (url === 'https://api.testnet.minepi.com/v2/payments/pay_stateless_lambda/approve' && method === 'POST') {
      return new Response(JSON.stringify({ identifier: 'pay_stateless_lambda' }), { status: 200 });
    }

    if (url === 'https://api.testnet.minepi.com/v2/payments/pay_incomplete_tx' && method === 'GET') {
      return new Response(
        JSON.stringify({
          identifier: 'pay_incomplete_tx',
          user_uid: 'user_inc',
          amount: 2,
          direction: 'user_to_app',
          metadata: { productId: 1 },
          transaction: { txid: 'tx_inc_001', verified: true },
          status: { developer_approved: false, developer_completed: false, cancelled: false },
        }),
        { status: 200 }
      );
    }

    if (url.startsWith('https://api.testnet.minepi.com/v2/payments/pay_incomplete_tx/')) {
      return new Response(JSON.stringify({ identifier: 'pay_incomplete_tx' }), { status: 200 });
    }

    if (url === 'https://api.testnet.minepi.com/v2/payments/pay_incomplete_notx' && method === 'GET') {
      return new Response(
        JSON.stringify({
          identifier: 'pay_incomplete_notx',
          user_uid: 'user_inc',
          amount: 2,
          direction: 'user_to_app',
          metadata: { productId: 1 },
          transaction: null,
          status: { developer_approved: true, developer_completed: false, cancelled: false },
        }),
        { status: 200 }
      );
    }

    if (url === 'https://api.testnet.minepi.com/v2/payments/pay_incomplete_notx/cancel' && method === 'POST') {
      return new Response(JSON.stringify({ identifier: 'pay_incomplete_notx', status: { cancelled: true } }), { status: 200 });
    }

    if (url === 'https://api.testnet.minepi.com/v2/payments/pay_cancel_1/cancel' && method === 'POST') {
      return new Response(JSON.stringify({ identifier: 'pay_cancel_1', status: { cancelled: true } }), { status: 200 });
    }

    return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 });
  }) as typeof fetch;

  try {
    await assert.rejects(
      () => approveU2APayment({ paymentId: 'pay_bad_amount', orderId: order.orderId }),
      /amount mismatch/i
    );

    await assert.rejects(
      () => approveU2APayment({ paymentId: 'pay_wrong_dir', orderId: order.orderId }),
      /direction/i
    );

    await assert.rejects(
      () => approveU2APayment({ paymentId: 'pay_wrong_user', orderId: order.orderId }),
      /user_uid/i
    );

    const approved = await approveU2APayment({
      paymentId: 'pay_valid_1',
      orderId: order.orderId,
    });
    assert.equal(approved.success, true);
    assert.equal(approved.productId, 3);

    // Stateless multi-container approve succeeds when productId + amount match catalog
    const statelessApproved = await approveU2APayment({
      paymentId: 'pay_stateless_lambda',
      orderId: 'ord_created_in_other_container',
    });
    assert.equal(statelessApproved.success, true);
    assert.equal(statelessApproved.productId, 1);

    // Idempotent second approval does not call Pi Platform /approve again
    const callsBeforeRetry = calls.length;
    const approvedAgain = await approveU2APayment({
      paymentId: 'pay_valid_1',
      orderId: order.orderId,
    });
    assert.equal(approvedAgain.alreadyApproved, true);
    assert.equal(calls.length, callsBeforeRetry);

    // Mismatched txid rejected
    await assert.rejects(
      () =>
        completeU2APayment({
          paymentId: 'pay_valid_1',
          txid: 'tx_forged',
          orderId: order.orderId,
        }),
      /mismatches/i
    );

    // Valid completion grants entitlement once
    const completed = await completeU2APayment({
      paymentId: 'pay_valid_1',
      txid: 'tx_chain_001',
      orderId: order.orderId,
    });
    assert.equal(completed.fulfilled, true);
    assert.equal(completed.newlyGranted, true);

    // Duplicate completion is idempotent and does NOT re-grant
    const completedAgain = await completeU2APayment({
      paymentId: 'pay_valid_1',
      txid: 'tx_chain_001',
      orderId: order.orderId,
    });
    assert.equal(completedAgain.alreadyCompleted, true);
    assert.equal(completedAgain.newlyGranted, false);

    const ents = await getUserEntitlements('user_abc');
    assert.equal(ents.length, 1);
    assert.equal(ents[0].productId, 3);

    // Incomplete payment with txid approves + completes + fulfills once
    const resumedTx = await resumeIncompleteU2APayment('pay_incomplete_tx');
    assert.equal(resumedTx.fulfilled, true);
    assert.equal(resumedTx.status, 'completed');

    // Incomplete payment without txid cancels cleanly so stale payment doesn't block
    const resumedNoTx = await resumeIncompleteU2APayment('pay_incomplete_notx');
    assert.equal(resumedNoTx.fulfilled, false);
    assert.equal(resumedNoTx.status, 'cancelled');

    // Direct cancel works
    const cancelled = await cancelU2APayment('pay_cancel_1');
    assert.equal(cancelled.cancelled, true);
  } finally {
    global.fetch = originalFetch;
    delete process.env.PI_API_KEY;
    await cleanStore();
  }
});

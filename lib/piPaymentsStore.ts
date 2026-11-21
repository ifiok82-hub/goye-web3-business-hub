import { promises as fs } from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { getProductById } from './products';

export type OrderStatus = 'pending' | 'approved' | 'completed' | 'cancelled' | 'failed';

export interface ServerOrderRecord {
  orderId: string;
  productId: number;
  userUid: string | null;
  expectedAmount: number;
  expectedMemo: string;
  status: OrderStatus;
  paymentId?: string;
  txid?: string;
  fulfilledAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ServerPaymentRecord {
  paymentId: string;
  orderId?: string;
  productId: number;
  userUid: string;
  amount: number;
  direction: string;
  txid?: string;
  status: OrderStatus;
  fulfilled: boolean;
  fulfilledAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EntitlementRecord {
  key: string;
  userUid: string;
  productId: number;
  orderId?: string;
  paymentId: string;
  txid: string;
  grantedAt: string;
}

interface StoreData {
  orders: Record<string, ServerOrderRecord>;
  payments: Record<string, ServerPaymentRecord>;
  entitlements: Record<string, EntitlementRecord>;
}

const DEFAULT_STORE: StoreData = {
  orders: {},
  payments: {},
  entitlements: {},
};

const WORKSPACE_STORE_PATH = path.join(process.cwd(), 'data', 'pi-payments.json');
const TMP_STORE_PATH = '/tmp/goye-pi-payments.json';

let memoryStore: StoreData | null = null;
let writeQueue: Promise<void> = Promise.resolve();

async function readStore(): Promise<StoreData> {
  if (memoryStore) return memoryStore;

  for (const filePath of [WORKSPACE_STORE_PATH, TMP_STORE_PATH]) {
    try {
      const raw = await fs.readFile(filePath, 'utf8');
      const parsed = JSON.parse(raw) as Partial<StoreData>;
      memoryStore = {
        orders: parsed.orders || {},
        payments: parsed.payments || {},
        entitlements: parsed.entitlements || {},
      };
      return memoryStore;
    } catch {
      // Try next fallback location
    }
  }

  memoryStore = {
    orders: { ...DEFAULT_STORE.orders },
    payments: { ...DEFAULT_STORE.payments },
    entitlements: { ...DEFAULT_STORE.entitlements },
  };
  return memoryStore;
}

async function persistStore(store: StoreData): Promise<void> {
  memoryStore = store;
  const serialized = JSON.stringify(store, null, 2);

  for (const filePath of [WORKSPACE_STORE_PATH, TMP_STORE_PATH]) {
    try {
      await fs.mkdir(path.dirname(filePath), { recursive: true });
      const tempPath = `${filePath}.tmp`;
      await fs.writeFile(tempPath, serialized, 'utf8');
      await fs.rename(tempPath, filePath);
      return;
    } catch {
      // Fall back to /tmp or in-memory on read-only serverless filesystems
    }
  }
}

function withStoreLock<T>(fn: (store: StoreData) => Promise<T>): Promise<T> {
  const run = writeQueue.then(async () => {
    const store = await readStore();
    return fn(store);
  });
  writeQueue = run.then(
    () => undefined,
    () => undefined
  );
  return run;
}

export async function createServerOrder(params: {
  productId: number;
  userUid?: string | null;
}): Promise<ServerOrderRecord> {
  const product = getProductById(params.productId);
  if (!product) {
    throw new Error('Unknown productId');
  }

  return withStoreLock(async (store) => {
    const now = new Date().toISOString();
    const orderId = `ord_${crypto.randomUUID().replace(/-/g, '').slice(0, 16)}`;
    const record: ServerOrderRecord = {
      orderId,
      productId: product.id,
      userUid: params.userUid ? String(params.userUid) : null,
      expectedAmount: product.price,
      expectedMemo: product.memo,
      status: 'pending',
      createdAt: now,
      updatedAt: now,
    };
    store.orders[orderId] = record;
    await persistStore(store);
    return record;
  });
}

export async function getOrderById(orderId: string): Promise<ServerOrderRecord | null> {
  const store = await readStore();
  return store.orders[orderId] || null;
}

export async function getPaymentById(paymentId: string): Promise<ServerPaymentRecord | null> {
  const store = await readStore();
  return store.payments[paymentId] || null;
}

export async function getUserEntitlements(userUid?: string | null): Promise<EntitlementRecord[]> {
  const store = await readStore();
  const all = Object.values(store.entitlements);
  if (!userUid) return [];
  return all.filter((e) => e.userUid === userUid);
}

export async function persistPaymentBeforeApproval(params: {
  paymentId: string;
  orderId?: string;
  productId: number;
  userUid: string;
  amount: number;
  direction: string;
}): Promise<ServerPaymentRecord> {
  return withStoreLock(async (store) => {
    const existing = store.payments[params.paymentId];
    const now = new Date().toISOString();
    if (existing) {
      return existing;
    }
    const record: ServerPaymentRecord = {
      paymentId: params.paymentId,
      orderId: params.orderId,
      productId: params.productId,
      userUid: params.userUid,
      amount: params.amount,
      direction: params.direction,
      status: 'pending',
      fulfilled: false,
      createdAt: now,
      updatedAt: now,
    };
    store.payments[params.paymentId] = record;
    if (params.orderId && store.orders[params.orderId]) {
      store.orders[params.orderId].paymentId = params.paymentId;
      store.orders[params.orderId].userUid =
        store.orders[params.orderId].userUid || params.userUid;
      store.orders[params.orderId].updatedAt = now;
    }
    await persistStore(store);
    return record;
  });
}

export async function markPaymentApproved(params: {
  paymentId: string;
  orderId?: string;
}): Promise<ServerPaymentRecord | null> {
  return withStoreLock(async (store) => {
    const now = new Date().toISOString();
    const payment = store.payments[params.paymentId];
    if (payment && payment.status !== 'completed') {
      payment.status = 'approved';
      payment.updatedAt = now;
    }
    const resolvedOrderId = params.orderId || payment?.orderId;
    if (resolvedOrderId && store.orders[resolvedOrderId]) {
      const order = store.orders[resolvedOrderId];
      if (order.status !== 'completed') {
        order.status = 'approved';
        order.paymentId = params.paymentId;
        order.updatedAt = now;
      }
    }
    await persistStore(store);
    return payment || null;
  });
}

export async function persistPaymentTxidBeforeCompletion(params: {
  paymentId: string;
  txid: string;
  orderId?: string;
  productId: number;
  userUid: string;
  amount: number;
  direction: string;
}): Promise<ServerPaymentRecord> {
  return withStoreLock(async (store) => {
    const now = new Date().toISOString();
    let payment = store.payments[params.paymentId];
    if (!payment) {
      payment = {
        paymentId: params.paymentId,
        orderId: params.orderId,
        productId: params.productId,
        userUid: params.userUid,
        amount: params.amount,
        direction: params.direction,
        txid: params.txid,
        status: 'approved',
        fulfilled: false,
        createdAt: now,
        updatedAt: now,
      };
      store.payments[params.paymentId] = payment;
    } else {
      payment.txid = payment.txid || params.txid;
      payment.updatedAt = now;
    }

    const resolvedOrderId = params.orderId || payment.orderId;
    if (resolvedOrderId && store.orders[resolvedOrderId]) {
      store.orders[resolvedOrderId].paymentId = params.paymentId;
      store.orders[resolvedOrderId].txid = store.orders[resolvedOrderId].txid || params.txid;
      store.orders[resolvedOrderId].updatedAt = now;
    }

    await persistStore(store);
    return payment;
  });
}

export async function markPaymentCompletedAndFulfill(params: {
  paymentId: string;
  txid: string;
  orderId?: string;
  productId: number;
  userUid: string;
  amount: number;
  direction: string;
}): Promise<{
  payment: ServerPaymentRecord;
  entitlement: EntitlementRecord;
  newlyGranted: boolean;
}> {
  return withStoreLock(async (store) => {
    const now = new Date().toISOString();
    let payment = store.payments[params.paymentId];
    if (!payment) {
      payment = {
        paymentId: params.paymentId,
        orderId: params.orderId,
        productId: params.productId,
        userUid: params.userUid,
        amount: params.amount,
        direction: params.direction,
        txid: params.txid,
        status: 'completed',
        fulfilled: false,
        createdAt: now,
        updatedAt: now,
      };
      store.payments[params.paymentId] = payment;
    }

    const entKey = `${params.userUid}:${params.productId}`;
    let entitlement = store.entitlements[entKey];
    let newlyGranted = false;

    if (!entitlement) {
      entitlement = {
        key: entKey,
        userUid: params.userUid,
        productId: params.productId,
        orderId: params.orderId || payment.orderId,
        paymentId: params.paymentId,
        txid: params.txid,
        grantedAt: now,
      };
      store.entitlements[entKey] = entitlement;
      newlyGranted = true;
    }

    payment.txid = payment.txid || params.txid;
    payment.status = 'completed';
    payment.fulfilled = true;
    payment.fulfilledAt = payment.fulfilledAt || entitlement.grantedAt;
    payment.updatedAt = now;

    const resolvedOrderId = params.orderId || payment.orderId;
    if (resolvedOrderId && store.orders[resolvedOrderId]) {
      const order = store.orders[resolvedOrderId];
      order.status = 'completed';
      order.paymentId = params.paymentId;
      order.txid = payment.txid;
      order.fulfilledAt = order.fulfilledAt || entitlement.grantedAt;
      order.updatedAt = now;
    }

    await persistStore(store);
    return { payment, entitlement, newlyGranted };
  });
}

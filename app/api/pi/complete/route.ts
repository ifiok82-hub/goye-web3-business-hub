import { NextResponse } from "next/server";
export async function POST(req: Request) {
  try {
    const { paymentId, txid } = await req.json();
    if (!paymentId) return NextResponse.json({ error: "no paymentId" }, { status: 400 });
    console.log("COMPLETE", paymentId, txid);
    const res = await fetch(`https://api.testnet.minepi.com/v2/payments/${paymentId}/complete`, {
      method: "POST",
      headers: {
        "Authorization": `Key ${process.env.PI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ txid }),
    });
    const data = await res.text();
    console.log("COMPLETE RESULT", res.status, data);
    if (!res.ok) return NextResponse.json({ error: data }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    console.log("COMPLETE ERROR", e?.message);
    return NextResponse.json({ error: e?.message }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
export async function POST(req: Request) {
  try {
    const { paymentId } = await req.json();
    if (!paymentId) return NextResponse.json({ error: "no paymentId" }, { status: 400 });
    console.log("APPROVE", paymentId);
    const res = await fetch(`https://api.testnet.minepi.com/v2/payments/${paymentId}/approve`, {
      method: "POST",
      headers: {
        "Authorization": `Key ${process.env.PI_API_KEY}`,
        "Content-Type": "application/json",
      },
    });
    const data = await res.text();
    console.log("APPROVE RESULT", res.status, data);
    if (!res.ok) return NextResponse.json({ error: data }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    console.log("APPROVE ERROR", e?.message);
    return NextResponse.json({ error: e?.message }, { status: 500 });
  }
}

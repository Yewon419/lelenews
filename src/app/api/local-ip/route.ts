import { NextRequest, NextResponse } from "next/server";
import { networkInterfaces } from "os";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const port = req.nextUrl.port || "3000";

  // 로컬 IP
  const nets = networkInterfaces();
  let localIp = "localhost";
  for (const name of Object.keys(nets)) {
    if (/loopback|virtual|vmware|vethernet|wsl|vpn|docker|vbox/i.test(name)) continue;
    for (const net of nets[name] ?? []) {
      if (net.family === "IPv4" && !net.internal) {
        localIp = net.address;
        break;
      }
    }
    if (localIp !== "localhost") break;
  }

  // 공인 IP (외부 서비스로 조회)
  let publicIp: string | null = null;
  try {
    const res = await fetch("https://api.ipify.org?format=json", {
      signal: AbortSignal.timeout(3000),
    });
    const data = await res.json();
    publicIp = data.ip ?? null;
  } catch {
    // 조회 실패 시 null
  }

  return NextResponse.json({
    localIp,
    localUrl: `http://${localIp}:${port}`,
    publicIp,
    publicUrl: publicIp ? `http://${publicIp}:${port}` : null,
    port,
  });
}

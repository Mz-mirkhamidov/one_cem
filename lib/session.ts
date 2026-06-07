export const SESSION_COOKIE = "crm_op_session";

export interface Operator {
  id: string;
  name: string;
  phone: string;
  role: "admin" | "operator";
}

export function encodeSession(op: Operator): string {
  return Buffer.from(JSON.stringify(op)).toString("base64");
}

export function decodeSession(value: string): Operator | null {
  try {
    const data = JSON.parse(Buffer.from(value, "base64").toString("utf-8"));
    if (!data.id || !data.role) return null;
    return data as Operator;
  } catch {
    return null;
  }
}

// Client-side: parse cookie from document.cookie
export function getClientSession(): Operator | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.split(";").find((c) => c.trim().startsWith(SESSION_COOKIE + "="));
  if (!match) return null;
  return decodeSession(match.split("=").slice(1).join("=").trim());
}

// Hash password (browser SubtleCrypto)
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + "crm_salt_2026");
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

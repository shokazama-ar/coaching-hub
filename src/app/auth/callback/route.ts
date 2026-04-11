import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");

  const supabase = await createClient();

  // PKCE フロー（magic link）: Supabase verify 後に code が付与される
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.redirect(new URL("/login?status=error", request.url));
  }

  // OTP フロー: token_hash が直接付与される場合
  if (tokenHash && type === "email") {
    const { error } = await supabase.auth.verifyOtp({
      type: "email",
      token_hash: tokenHash,
    });
    if (!error) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.redirect(new URL("/login?status=error", request.url));
  }

  return NextResponse.redirect(new URL("/login", request.url));
}

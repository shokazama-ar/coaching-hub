import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const redirectTo = "/";

  if (!tokenHash || type !== "email") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.verifyOtp({
    type: "email",
    token_hash: tokenHash,
  });

  if (error) {
    return NextResponse.redirect(
      new URL("/login?status=error", request.url)
    );
  }

  return NextResponse.redirect(new URL(redirectTo, request.url));
}


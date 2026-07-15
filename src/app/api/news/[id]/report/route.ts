import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const supabase = createClient();

    // The user mentioned the RPC function is report_news(p_news_id UUID)
    const { error } = await supabase.rpc("report_news", {
      p_news_id: id,
    });

    if (error) {
      console.error("Error reporting news:", error);
      return NextResponse.json(
        { error: "Failed to report news" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Report API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

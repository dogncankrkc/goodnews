import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { oldReaction, newReaction } = body;

    const validTypes = ["inspiring", "innovative", "heartwarming", "promising"];

    // Validate that if a reaction is provided, it is valid
    if (oldReaction && !validTypes.includes(oldReaction)) {
      return NextResponse.json({ error: "Invalid old reaction type" }, { status: 400 });
    }
    if (newReaction && !validTypes.includes(newReaction)) {
      return NextResponse.json({ error: "Invalid new reaction type" }, { status: 400 });
    }

    // Must have at least one of them to do anything
    if (!oldReaction && !newReaction) {
      return NextResponse.json({ error: "No action provided" }, { status: 400 });
    }

    const supabase = createClient();

    const { error } = await supabase.rpc("handle_reaction", {
      p_news_id: id,
      p_old_reaction: oldReaction || null,
      p_new_reaction: newReaction || null,
    });

    if (error) {
      console.error("Error handling reaction:", error);
      return NextResponse.json(
        { error: "Failed to handle reaction" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Reaction API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

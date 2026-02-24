import { NextResponse } from "next/server";
import { getSupabaseAdmin, getSupabaseConfigError } from "../../../lib/server/mediaStore";

const TABLE_NAME = "notices_posts";

function sanitize(value, max = 400) {
  return String(value || "").trim().slice(0, max);
}

function getErrorMessage(error, fallback) {
  const message = String(error?.message || "").trim();
  return message || fallback;
}

function isMissingNoticesTableError(error) {
  const message = String(error?.message || "").toLowerCase();
  return message.includes(`'public.${TABLE_NAME}'`) && message.includes("schema cache");
}

function getMissingTableMessage() {
  return "Notices table is not ready yet. Run the latest SQL from supabase/schema.sql, then try again.";
}

function toPublicNotice(item, ownerToken = "") {
  return {
    id: item.id,
    text: item.text || "",
    createdAt: item.created_at,
    canDelete: !!ownerToken && item.owner_token === ownerToken
  };
}

export async function GET(request) {
  const configError = getSupabaseConfigError();
  if (configError) {
    return NextResponse.json({ message: configError, posts: [] }, { status: 500 });
  }

  const ownerToken = sanitize(request.headers.get("x-notices-owner-token"), 160);

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select("id,text,owner_token,created_at")
      .order("created_at", { ascending: false });

    if (error) {
      if (isMissingNoticesTableError(error)) {
        return NextResponse.json({ message: getMissingTableMessage(), posts: [] }, { status: 200 });
      }
      throw new Error(error.message || "Failed to load notices.");
    }

    return NextResponse.json({ posts: (data || []).map((item) => toPublicNotice(item, ownerToken)) });
  } catch (error) {
    return NextResponse.json(
      { message: getErrorMessage(error, "Could not load notices right now."), posts: [] },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  const configError = getSupabaseConfigError();
  if (configError) {
    return NextResponse.json({ message: configError }, { status: 500 });
  }

  try {
    const body = await request.json();
    const text = sanitize(body?.text, 600);
    const ownerToken = sanitize(body?.ownerToken, 160);

    if (!text) {
      return NextResponse.json({ message: "Notice text is required." }, { status: 400 });
    }

    if (!ownerToken) {
      return NextResponse.json({ message: "Owner token is required." }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const record = {
      id: globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      text,
      owner_token: ownerToken,
      created_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from(TABLE_NAME)
      .insert(record)
      .select("id,text,owner_token,created_at")
      .single();

    if (error) {
      if (isMissingNoticesTableError(error)) {
        return NextResponse.json({ message: getMissingTableMessage() }, { status: 503 });
      }
      throw new Error(error.message || "Failed to create notice.");
    }

    return NextResponse.json(
      { message: "Notice posted successfully.", post: toPublicNotice(data, ownerToken) },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: getErrorMessage(error, "Could not post notice right now.") },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  const configError = getSupabaseConfigError();
  if (configError) {
    return NextResponse.json({ message: configError }, { status: 500 });
  }

  try {
    const body = await request.json();
    const id = sanitize(body?.id, 120);
    const ownerToken = sanitize(body?.ownerToken, 160);

    if (!id) {
      return NextResponse.json({ message: "Notice id is required." }, { status: 400 });
    }

    if (!ownerToken) {
      return NextResponse.json({ message: "Owner token is required." }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const { data: post, error: readError } = await supabase
      .from(TABLE_NAME)
      .select("id,owner_token")
      .eq("id", id)
      .maybeSingle();

    if (readError) {
      if (isMissingNoticesTableError(readError)) {
        return NextResponse.json({ message: getMissingTableMessage() }, { status: 503 });
      }
      throw new Error(readError.message || "Failed to read notice.");
    }

    if (!post) {
      return NextResponse.json({ message: "Notice not found." }, { status: 404 });
    }

    if (post.owner_token !== ownerToken) {
      return NextResponse.json({ message: "You can only delete your own notice." }, { status: 403 });
    }

    const { error: deleteError } = await supabase.from(TABLE_NAME).delete().eq("id", id);
    if (deleteError) {
      if (isMissingNoticesTableError(deleteError)) {
        return NextResponse.json({ message: getMissingTableMessage() }, { status: 503 });
      }
      throw new Error(deleteError.message || "Failed to delete notice.");
    }

    return NextResponse.json({ message: "Notice deleted successfully." });
  } catch (error) {
    return NextResponse.json(
      { message: getErrorMessage(error, "Could not delete notice right now.") },
      { status: 500 }
    );
  }
}

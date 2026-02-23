import { NextResponse } from "next/server";
import { getSupabaseAdmin, getSupabaseConfigError } from "../../../lib/server/mediaStore";

const TABLE_NAME = "letter_box_posts";
const ALLOWED_TYPES = new Set(["complaint", "suggestion", "question", "other"]);

function sanitize(value, max = 500) {
  return String(value || "").trim().slice(0, max);
}

function getErrorMessage(error, fallback) {
  const message = String(error?.message || "").trim();
  return message || fallback;
}

function toPublicPost(post, ownerToken = "") {
  return {
    id: post.id,
    type: post.type,
    title: post.title,
    message: post.message,
    name: post.name,
    isAnonymous: post.is_anonymous,
    createdAt: post.created_at,
    canDelete: !!ownerToken && post.owner_token === ownerToken
  };
}

export async function GET(request) {
  const configError = getSupabaseConfigError();
  if (configError) {
    return NextResponse.json({ message: configError, posts: [] }, { status: 500 });
  }

  const ownerToken = sanitize(request.headers.get("x-letter-owner-token"), 160);

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select("id,type,title,message,name,is_anonymous,owner_token,created_at")
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(error.message || "Failed to load letters.");
    }

    return NextResponse.json({ posts: (data || []).map((post) => toPublicPost(post, ownerToken)) });
  } catch (error) {
    return NextResponse.json(
      { message: getErrorMessage(error, "Could not load letters right now."), posts: [] },
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
    const ownerToken = sanitize(body?.ownerToken, 160);
    const type = sanitize(body?.type, 40).toLowerCase();
    const title = sanitize(body?.title, 140);
    const message = sanitize(body?.message, 2000);
    const name = sanitize(body?.name, 80);
    const isAnonymous = Boolean(body?.isAnonymous);

    if (!ownerToken) {
      return NextResponse.json({ message: "Owner token is required." }, { status: 400 });
    }

    if (!ALLOWED_TYPES.has(type)) {
      return NextResponse.json({ message: "Invalid letter type." }, { status: 400 });
    }

    if (!title || !message) {
      return NextResponse.json({ message: "Title and message are required." }, { status: 400 });
    }

    const post = {
      id: globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      type,
      title,
      message,
      name: isAnonymous ? "" : name || "Student",
      is_anonymous: isAnonymous,
      owner_token: ownerToken,
      created_at: new Date().toISOString()
    };

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .insert(post)
      .select("id,type,title,message,name,is_anonymous,owner_token,created_at")
      .single();

    if (error) {
      throw new Error(error.message || "Failed to save letter.");
    }

    return NextResponse.json(
      { message: "Letter submitted successfully.", post: toPublicPost(data, ownerToken) },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: getErrorMessage(error, "Could not submit the letter right now.") },
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

    if (!id || !ownerToken) {
      return NextResponse.json({ message: "Post id and owner token are required." }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const { data: post, error: readError } = await supabase
      .from(TABLE_NAME)
      .select("id,owner_token")
      .eq("id", id)
      .maybeSingle();

    if (readError) {
      throw new Error(readError.message || "Failed to read letter.");
    }

    if (!post) {
      return NextResponse.json({ message: "Letter not found." }, { status: 404 });
    }

    if (post.owner_token !== ownerToken) {
      return NextResponse.json({ message: "You can only delete your own letter." }, { status: 403 });
    }

    const { error: deleteError } = await supabase.from(TABLE_NAME).delete().eq("id", id);
    if (deleteError) {
      throw new Error(deleteError.message || "Failed to delete letter.");
    }

    return NextResponse.json({ message: "Letter deleted successfully." });
  } catch (error) {
    return NextResponse.json(
      { message: getErrorMessage(error, "Could not delete the letter right now.") },
      { status: 500 }
    );
  }
}

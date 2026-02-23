import { NextResponse } from "next/server";
import {
  deleteImageFromCloudinary,
  getMediaConfigError,
  getSupabaseAdmin,
  uploadImageToCloudinary
} from "../../../lib/server/mediaStore";

const MAX_FILE_SIZE = 3 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"]);
const TABLE_NAME = "gallery_posts";

function sanitize(value, max = 240) {
  return String(value || "").trim().slice(0, max);
}

function getErrorMessage(error, fallback) {
  const message = String(error?.message || "").trim();
  return message || fallback;
}

function toPublicPost(post, ownerToken = "") {
  return {
    id: post.id,
    author: post.author || "Anonymous",
    caption: post.caption || "New gallery post",
    imageUrl: post.image_url,
    createdAt: post.created_at,
    canDelete: !!ownerToken && post.owner_token === ownerToken
  };
}

export async function GET(request) {
  const configError = getMediaConfigError();
  if (configError) {
    return NextResponse.json({ message: configError, posts: [] }, { status: 500 });
  }

  const ownerToken = sanitize(request.headers.get("x-gallery-owner-token"), 160);

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select("id,author,caption,image_url,owner_token,created_at")
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(error.message || "Failed to read posts.");
    }

    return NextResponse.json({ posts: (data || []).map((post) => toPublicPost(post, ownerToken)) });
  } catch (error) {
    return NextResponse.json(
      { message: getErrorMessage(error, "Could not load gallery posts right now."), posts: [] },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  const configError = getMediaConfigError();
  if (configError) {
    return NextResponse.json({ message: configError }, { status: 500 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("image");
    const author = sanitize(formData.get("author"), 80);
    const caption = sanitize(formData.get("caption"), 180);
    const ownerToken = sanitize(formData.get("ownerToken"), 160);

    if (!(file instanceof File)) {
      return NextResponse.json({ message: "Please upload an image file." }, { status: 400 });
    }

    if (!ownerToken) {
      return NextResponse.json({ message: "Owner token is required." }, { status: 400 });
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json({ message: "Only JPG, PNG, WEBP or GIF images are allowed." }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ message: "Image size must be 3MB or less." }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const upload = await uploadImageToCloudinary(file, "collage/gallery");
    const post = {
      id: globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      author: author || "Anonymous",
      caption: caption || "New gallery post",
      image_url: upload.imageUrl,
      public_id: upload.publicId,
      owner_token: ownerToken,
      created_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from(TABLE_NAME)
      .insert(post)
      .select("id,author,caption,image_url,owner_token,created_at")
      .single();

    if (error) {
      await deleteImageFromCloudinary(upload.publicId);
      throw new Error(error.message || "Failed to save post.");
    }

    return NextResponse.json(
      { message: "Image posted successfully.", post: toPublicPost(data, ownerToken) },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: getErrorMessage(error, "Could not post the image right now.") },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  const configError = getMediaConfigError();
  if (configError) {
    return NextResponse.json({ message: configError }, { status: 500 });
  }

  try {
    const body = await request.json();
    const id = sanitize(body?.id, 120);
    const ownerToken = sanitize(body?.ownerToken, 160);

    if (!id) {
      return NextResponse.json({ message: "Post id is required." }, { status: 400 });
    }

    if (!ownerToken) {
      return NextResponse.json({ message: "Owner token is required." }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const { data: post, error: readError } = await supabase
      .from(TABLE_NAME)
      .select("id,owner_token,public_id")
      .eq("id", id)
      .maybeSingle();

    if (readError) {
      throw new Error(readError.message || "Failed to read post.");
    }

    if (!post) {
      return NextResponse.json({ message: "Post not found." }, { status: 404 });
    }

    if (post.owner_token !== ownerToken) {
      return NextResponse.json({ message: "You can only delete your own post." }, { status: 403 });
    }

    const { error: deleteError } = await supabase.from(TABLE_NAME).delete().eq("id", id);
    if (deleteError) {
      throw new Error(deleteError.message || "Failed to delete post.");
    }

    await deleteImageFromCloudinary(post.public_id);
    return NextResponse.json({ message: "Post deleted successfully." });
  } catch (error) {
    return NextResponse.json(
      { message: getErrorMessage(error, "Could not delete this post right now.") },
      { status: 500 }
    );
  }
}

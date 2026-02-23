import { NextResponse } from "next/server";

const MAX_FILE_SIZE = 3 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"]);
const STORE_KEY = "__teacher_posts__";

function sanitize(value, max = 240) {
  return String(value || "").trim().slice(0, max);
}

function getStore() {
  if (!globalThis[STORE_KEY]) {
    globalThis[STORE_KEY] = [];
  }
  return globalThis[STORE_KEY];
}

function toPublicPost(post, ownerToken = "") {
  return {
    id: post.id,
    name: post.name,
    subject: post.subject,
    imageUrl: post.imageUrl,
    createdAt: post.createdAt,
    canDelete: !!ownerToken && post.ownerToken === ownerToken
  };
}

export async function GET(request) {
  const ownerToken = sanitize(request.headers.get("x-teachers-owner-token"), 160);
  const posts = getStore();
  return NextResponse.json({ posts: posts.map((post) => toPublicPost(post, ownerToken)) });
}

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("image");
    const name = sanitize(formData.get("name"), 100);
    const subject = sanitize(formData.get("subject"), 140);
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

    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");
    const imageUrl = `data:${file.type};base64,${base64}`;

    const post = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      name: name || "Uploaded Teacher",
      subject: subject || "N/A",
      imageUrl,
      createdAt: new Date().toISOString(),
      ownerToken
    };

    const posts = getStore();
    posts.unshift(post);

    return NextResponse.json(
      { message: "Teacher photo uploaded successfully.", post: toPublicPost(post, ownerToken) },
      { status: 201 }
    );
  } catch {
    return NextResponse.json({ message: "Could not upload the image right now." }, { status: 500 });
  }
}

export async function DELETE(request) {
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

    const posts = getStore();
    const index = posts.findIndex((post) => post.id === id);

    if (index < 0) {
      return NextResponse.json({ message: "Post not found." }, { status: 404 });
    }

    if (posts[index].ownerToken !== ownerToken) {
      return NextResponse.json({ message: "You can only delete your own post." }, { status: 403 });
    }

    posts.splice(index, 1);
    return NextResponse.json({ message: "Post deleted successfully." });
  } catch {
    return NextResponse.json({ message: "Could not delete this post right now." }, { status: 500 });
  }
}

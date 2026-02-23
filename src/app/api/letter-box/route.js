import { NextResponse } from "next/server";

const STORE_KEY = "__letter_box_posts__";
const ALLOWED_TYPES = new Set(["complaint", "suggestion", "question", "other"]);

function sanitize(value, max = 500) {
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
    type: post.type,
    title: post.title,
    message: post.message,
    name: post.name,
    isAnonymous: post.isAnonymous,
    createdAt: post.createdAt,
    canDelete: !!ownerToken && post.ownerToken === ownerToken
  };
}

export async function GET(request) {
  const ownerToken = sanitize(request.headers.get("x-letter-owner-token"), 160);
  const posts = getStore();
  return NextResponse.json({ posts: posts.map((post) => toPublicPost(post, ownerToken)) });
}

export async function POST(request) {
  try {
    const body = await request.json();
    const ownerToken = sanitize(body?.ownerToken, 160);
    const type = sanitize(body?.type, 40).toLowerCase();
    const title = sanitize(body?.title, 140);
    const message = sanitize(body?.message, 2000);
    const name = sanitize(body?.name, 80);
    const isAnonymous = Boolean(body?.isAnonymous);

    if (!ownerToken) {
      return NextResponse.json({ message: "মালিকানা টোকেন প্রয়োজন।" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.has(type)) {
      return NextResponse.json({ message: "লেটারের ধরন সঠিক নয়।" }, { status: 400 });
    }

    if (!title || !message) {
      return NextResponse.json({ message: "শিরোনাম এবং বার্তা আবশ্যক।" }, { status: 400 });
    }

    const post = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      type,
      title,
      message,
      name: isAnonymous ? "" : name || "Student",
      isAnonymous,
      createdAt: new Date().toISOString(),
      ownerToken
    };

    const posts = getStore();
    posts.unshift(post);

    return NextResponse.json(
      { message: "লেটার সফলভাবে জমা হয়েছে।", post: toPublicPost(post, ownerToken) },
      { status: 201 }
    );
  } catch {
    return NextResponse.json({ message: "এই মুহূর্তে লেটার জমা দেওয়া যাচ্ছে না।" }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const body = await request.json();
    const id = sanitize(body?.id, 120);
    const ownerToken = sanitize(body?.ownerToken, 160);

    if (!id || !ownerToken) {
      return NextResponse.json({ message: "পোস্ট আইডি এবং মালিকানা টোকেন প্রয়োজন।" }, { status: 400 });
    }

    const posts = getStore();
    const index = posts.findIndex((post) => post.id === id);

    if (index < 0) {
      return NextResponse.json({ message: "লেটার পাওয়া যায়নি।" }, { status: 404 });
    }

    if (posts[index].ownerToken !== ownerToken) {
      return NextResponse.json({ message: "আপনি শুধুমাত্র নিজের লেটার মুছতে পারবেন।" }, { status: 403 });
    }

    posts.splice(index, 1);
    return NextResponse.json({ message: "লেটার সফলভাবে মুছে ফেলা হয়েছে।" });
  } catch {
    return NextResponse.json({ message: "এই মুহূর্তে লেটার মুছা যাচ্ছে না।" }, { status: 500 });
  }
}

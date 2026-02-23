import { v2 as cloudinary } from "cloudinary";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_REQUIRED_ENV = [
  "SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY"
];

const CLOUDINARY_REQUIRED_ENV = [
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET"
];

let configured = false;
let cachedSupabase = null;

function getMissingEnv(keys) {
  return keys.filter((key) => !String(process.env[key] || "").trim());
}

function ensureCloudinaryConfigured() {
  if (configured) return;

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
  configured = true;
}

export function getSupabaseConfigError() {
  const missing = getMissingEnv(SUPABASE_REQUIRED_ENV);
  if (!missing.length) return "";
  return `Storage is not configured. Missing env: ${missing.join(", ")}`;
}

export function getMediaConfigError() {
  const missing = getMissingEnv([...SUPABASE_REQUIRED_ENV, ...CLOUDINARY_REQUIRED_ENV]);
  if (!missing.length) return "";
  return `Storage is not configured. Missing env: ${missing.join(", ")}`;
}

export function getSupabaseAdmin() {
  const configError = getSupabaseConfigError();
  if (configError) {
    throw new Error(configError);
  }

  if (!cachedSupabase) {
    cachedSupabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false }
    });
  }

  return cachedSupabase;
}

export async function uploadImageToCloudinary(file, folder) {
  const configError = getMediaConfigError();
  if (configError) {
    throw new Error(configError);
  }

  ensureCloudinaryConfigured();

  const bytes = await file.arrayBuffer();
  const base64 = Buffer.from(bytes).toString("base64");
  const dataUri = `data:${file.type};base64,${base64}`;

  const result = await cloudinary.uploader.upload(dataUri, {
    folder,
    resource_type: "image"
  });

  return {
    imageUrl: result.secure_url,
    publicId: result.public_id
  };
}

export async function deleteImageFromCloudinary(publicId) {
  if (!publicId) return;
  if (getMediaConfigError()) return;

  ensureCloudinaryConfigured();
  await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
}

import { NextResponse } from "next/server";
import { Resend } from "resend";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

function sanitize(value, max = 1000) {
  return String(value || "").trim().slice(0, max);
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function parseImageDataUrl(dataUrl) {
  const raw = String(dataUrl || "").trim();
  const match = raw.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,([A-Za-z0-9+/=]+)$/);
  if (!match) return null;

  return {
    mimeType: match[1],
    base64: match[2],
    dataUrl: raw
  };
}

function normalizePhoneNumber(raw) {
  const value = String(raw || "").trim().replace(/[\s()-]/g, "");
  if (!value) return "";

  if (/^whatsapp:\+\d{8,15}$/i.test(value)) return value;
  if (/^\+\d{8,15}$/.test(value)) return value;
  if (/^\d{8,15}$/.test(value)) return `+${value}`;
  if (/^\+8801\d{9}$/.test(value)) return value;
  if (/^8801\d{9}$/.test(value)) return `+${value}`;
  if (/^01\d{9}$/.test(value)) return `+880${value.slice(1)}`;
  return value.startsWith("+") ? value : `+${value}`;
}

function normalizeTwilioChannelAddress(raw, channel = "sms") {
  const normalized = normalizePhoneNumber(raw);
  if (!normalized) return "";

  if (channel === "whatsapp") {
    return normalized.startsWith("whatsapp:") ? normalized : `whatsapp:${normalized}`;
  }

  return normalized.replace(/^whatsapp:/i, "");
}

async function sendSmsWithTwilio(messageBody, mediaUrl = "") {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const messagingServiceSid = sanitize(process.env.TWILIO_MESSAGING_SERVICE_SID, 80);
  const channel = sanitize(process.env.CONTACT_TWILIO_CHANNEL, 20).toLowerCase() === "whatsapp" ? "whatsapp" : "sms";
  const from = normalizeTwilioChannelAddress(
    process.env.TWILIO_FROM_NUMBER || process.env.TWILIO_WHATSAPP_FROM,
    channel
  );
  const to = normalizeTwilioChannelAddress(process.env.CONTACT_TARGET_PHONE || process.env.TWILIO_TO_NUMBER, channel);

  if (!sid || !token || !to || (!from && !messagingServiceSid)) {
    return { sent: false, skipped: true, reason: "Twilio is not configured." };
  }

  const auth = Buffer.from(`${sid}:${token}`).toString("base64");
  const body = new URLSearchParams({ To: to, Body: messageBody });
  if (messagingServiceSid) {
    body.append("MessagingServiceSid", messagingServiceSid);
  } else {
    body.append("From", from);
  }
  if (mediaUrl) {
    body.append("MediaUrl", mediaUrl);
  }

  try {
    const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body
    });

    if (!response.ok) {
      const errorText = await response.text();
      let message = errorText;
      try {
        const parsed = JSON.parse(errorText);
        message = parsed?.message || errorText;
      } catch {
        // non-JSON response body
      }
      return { sent: false, skipped: false, reason: `Twilio failed: ${message}` };
    }

    return { sent: true, skipped: false };
  } catch (error) {
    return { sent: false, skipped: false, reason: `Twilio request error: ${error?.message || "unknown"}` };
  }
}

async function sendEmailWithResend({ subject, text, html, attachments }) {
  const from = process.env.RESEND_FROM_EMAIL;
  const to = process.env.RESEND_TO_EMAIL || process.env.CONTACT_NOTIFY_EMAIL;

  if (!resend || !from || !to) {
    return { sent: false, skipped: true, reason: "Resend email is not configured." };
  }

  try {
    const { error } = await resend.emails.send({
      from,
      to,
      subject,
      text,
      html,
      attachments
    });

    if (error) {
      return { sent: false, skipped: false, reason: `Resend failed: ${error.message}` };
    }

    return { sent: true, skipped: false };
  } catch (error) {
    return { sent: false, skipped: false, reason: `Resend request error: ${error?.message || "unknown"}` };
  }
}

export async function POST(request) {
  try {
    const data = await request.json();

    const name = sanitize(data?.name, 120);
    const email = sanitize(data?.email, 180);
    const phone = sanitize(data?.phone, 40);
    const trade = sanitize(data?.trade, 160);
    const district = sanitize(data?.district, 120);
    const upazila = sanitize(data?.upazila || data?.upojela, 120);
    const village = sanitize(data?.village, 120);
    const motherName = sanitize(data?.motherName, 120);
    const motherPhone = sanitize(data?.motherPhone, 40);
    const fatherName = sanitize(data?.fatherName, 120);
    const fatherPhone = sanitize(data?.fatherPhone, 40);
    const gpa = sanitize(data?.gpa, 20);
    const photoName = sanitize(data?.photoName, 180);
    const photoUrl = sanitize(data?.photoUrl, 500);
    const photoDataUrl = sanitize(data?.photoDataUrl, 2_000_000);
    const message = sanitize(data?.message, 2500);
    const parsedImage = parseImageDataUrl(photoDataUrl);
    const smsImageUrl = /^https?:\/\/\S+$/i.test(photoUrl) ? photoUrl : "";

    if (!name || !message || (!email && !phone)) {
      return NextResponse.json(
        { message: "Name, message, and at least one contact (email or phone) are required." },
        { status: 400 }
      );
    }

    if (email && !EMAIL_REGEX.test(email)) {
      return NextResponse.json({ message: "Invalid email address." }, { status: 400 });
    }

    const textLines = [
      "New contact message",
      `Name: ${name}`,
      `Email: ${email || "-"}`,
      `Phone: ${phone || "-"}`,
      `Trade: ${trade || "-"}`,
      `District: ${district || "-"}`,
      `Upazila: ${upazila || "-"}`,
      `Village: ${village || "-"}`,
      `Mother Name: ${motherName || "-"}`,
      `Mother Number: ${motherPhone || "-"}`,
      `Father Name: ${fatherName || "-"}`,
      `Father Number: ${fatherPhone || "-"}`,
      `GPA: ${gpa || "-"}`,
      `Photo: ${photoName || smsImageUrl || (parsedImage ? "Attached in email" : "-")}`,
      "Message:",
      message
    ];
    const text = textLines.join("\n");
    const html = `
      <h2>New contact message</h2>
      <p><strong>Name:</strong> ${escapeHtml(name)}</p>
      <p><strong>Email:</strong> ${escapeHtml(email || "-")}</p>
      <p><strong>Phone:</strong> ${escapeHtml(phone || "-")}</p>
      <p><strong>Trade:</strong> ${escapeHtml(trade || "-")}</p>
      <p><strong>District:</strong> ${escapeHtml(district || "-")}</p>
      <p><strong>Upazila:</strong> ${escapeHtml(upazila || "-")}</p>
      <p><strong>Village:</strong> ${escapeHtml(village || "-")}</p>
      <p><strong>Mother Name:</strong> ${escapeHtml(motherName || "-")}</p>
      <p><strong>Mother Number:</strong> ${escapeHtml(motherPhone || "-")}</p>
      <p><strong>Father Name:</strong> ${escapeHtml(fatherName || "-")}</p>
      <p><strong>Father Number:</strong> ${escapeHtml(fatherPhone || "-")}</p>
      <p><strong>GPA:</strong> ${escapeHtml(gpa || "-")}</p>
      ${
        smsImageUrl
          ? `<p><strong>Photo URL:</strong> <a href="${escapeHtml(smsImageUrl)}">${escapeHtml(smsImageUrl)}</a></p><p><img src="${escapeHtml(
              smsImageUrl
            )}" alt="Submitted photo" style="max-width:320px;border-radius:8px;" /></p>`
          : ""
      }
      ${
        parsedImage
          ? `<p><strong>Submitted Photo:</strong></p><p><img src="${parsedImage.dataUrl}" alt="Submitted photo" style="max-width:320px;border-radius:8px;" /></p>`
          : ""
      }
      <p><strong>Message:</strong><br/>${escapeHtml(message).replaceAll("\n", "<br/>")}</p>
    `;

    const attachments = parsedImage
      ? [
          {
            filename: photoName || "submitted-image",
            content: parsedImage.base64
          }
        ]
      : undefined;

    const smsText = `New contact from ${name}. Phone: ${phone || "-"}, Trade: ${trade || "-"}, GPA: ${gpa || "-"}, District: ${district || "-"}, Upazila: ${upazila || "-"}, Village: ${village || "-"}, Mother: ${motherPhone || "-"}, Father: ${fatherPhone || "-"}. Msg: ${message}`.slice(
      0,
      1500
    );

    const [smsResult, emailResult] = await Promise.all([
      sendSmsWithTwilio(smsText, smsImageUrl),
      sendEmailWithResend({
        subject: `New website contact from ${name}`,
        text,
        html,
        attachments
      })
    ]);

    const notificationIssues = [smsResult.reason, emailResult.reason].filter(Boolean).join(" | ");

    const delivery = {
      sms: smsResult.sent ? "sent" : smsResult.skipped ? "not_configured" : "failed",
      email: emailResult.sent ? "sent" : emailResult.skipped ? "not_configured" : "failed"
    };

    const allFailed = !smsResult.sent && !emailResult.sent;
    const userMessage = allFailed
      ? "Your request has been received, but notifications are temporarily unavailable. Please check server notification settings."
      : smsResult.sent
        ? "Message sent successfully. We have received your contact request."
        : "Message received by email, but SMS notification failed. Please check Twilio phone configuration.";

    return NextResponse.json({
      message: userMessage,
      delivery,
      notifications: notificationIssues || undefined
    });
  } catch {
    return NextResponse.json(
      { message: "Could not process your request right now. Please try again." },
      { status: 500 }
    );
  }
}


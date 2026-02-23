import os
import sqlite3
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

import requests
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr, field_validator


ROOT_DIR = Path(__file__).resolve().parents[1]
load_dotenv(ROOT_DIR / ".env.local")

DB_PATH = Path(__file__).resolve().parent / "contact_messages.db"


def init_db() -> None:
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    with sqlite3.connect(DB_PATH) as conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS contact_messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT,
                phone TEXT,
                message TEXT NOT NULL,
                created_at TEXT NOT NULL
            )
            """
        )
        conn.commit()


class ContactPayload(BaseModel):
    name: str
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    message: str

    @field_validator("name", "message", mode="before")
    @classmethod
    def strip_required(cls, value: str) -> str:
        clean = str(value or "").strip()
        if not clean:
            raise ValueError("This field is required.")
        return clean

    @field_validator("phone", mode="before")
    @classmethod
    def strip_phone(cls, value: Optional[str]) -> Optional[str]:
        if value is None:
            return None
        clean = str(value).strip()
        return clean or None


def save_message(payload: ContactPayload) -> int:
    now_iso = datetime.now(timezone.utc).isoformat()
    with sqlite3.connect(DB_PATH) as conn:
        cursor = conn.execute(
            """
            INSERT INTO contact_messages (name, email, phone, message, created_at)
            VALUES (?, ?, ?, ?, ?)
            """,
            (payload.name, payload.email, payload.phone, payload.message, now_iso),
        )
        conn.commit()
        return int(cursor.lastrowid)


def send_sms(text: str) -> Optional[str]:
    sid = os.getenv("TWILIO_ACCOUNT_SID")
    token = os.getenv("TWILIO_AUTH_TOKEN")
    from_number = os.getenv("TWILIO_FROM_NUMBER")
    to_number = os.getenv("CONTACT_TARGET_PHONE") or os.getenv("TWILIO_TO_NUMBER")

    if not sid or not token or not from_number or not to_number:
        return "SMS skipped: Twilio env vars are missing."

    url = f"https://api.twilio.com/2010-04-01/Accounts/{sid}/Messages.json"
    response = requests.post(
        url,
        auth=(sid, token),
        data={"From": from_number, "To": to_number, "Body": text},
        timeout=20,
    )
    if response.status_code >= 400:
        return f"SMS failed: {response.status_code} {response.text}"
    return None


def send_email(subject: str, text: str, reply_to: Optional[str]) -> Optional[str]:
    api_key = os.getenv("RESEND_API_KEY")
    from_email = os.getenv("RESEND_FROM_EMAIL")
    to_email = os.getenv("CONTACT_TARGET_EMAIL") or os.getenv("RESEND_TO_EMAIL") or os.getenv(
        "CONTACT_NOTIFY_EMAIL"
    )

    if not api_key or not from_email or not to_email:
        return "Email skipped: Resend env vars are missing."

    payload = {
        "from": from_email,
        "to": [to_email],
        "subject": subject,
        "text": text,
    }
    if reply_to:
        payload["reply_to"] = reply_to

    response = requests.post(
        "https://api.resend.com/emails",
        headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
        json=payload,
        timeout=20,
    )
    if response.status_code >= 400:
        return f"Email failed: {response.status_code} {response.text}"
    return None


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=False,
    allow_methods=["POST", "OPTIONS"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup() -> None:
    init_db()


@app.get("/health")
def health() -> dict:
    return {"ok": True}


@app.post("/contact")
def contact(payload: ContactPayload) -> dict:
    if not payload.email and not payload.phone:
        raise HTTPException(status_code=400, detail="Email or phone is required.")

    row_id = save_message(payload)

    sms_text = (
        f"New contact #{row_id}\n"
        f"Name: {payload.name}\n"
        f"Phone: {payload.phone or '-'}\n"
        f"Email: {payload.email or '-'}\n"
        f"Message: {payload.message}"
    )

    email_text = (
        f"Message ID: {row_id}\n"
        f"Name: {payload.name}\n"
        f"Email: {payload.email or '-'}\n"
        f"Phone: {payload.phone or '-'}\n"
        f"Message:\n{payload.message}"
    )

    errors = []
    sms_error = send_sms(sms_text[:1400])
    if sms_error:
        errors.append(sms_error)

    email_error = send_email(
        subject=f"New Contact Message #{row_id}",
        text=email_text,
        reply_to=payload.email if payload.email else None,
    )
    if email_error:
        errors.append(email_error)

    return {
        "message": "Message sent successfully. We have received your request.",
        "id": row_id,
        "notifications": " | ".join(errors) if errors else "sms+email sent",
    }

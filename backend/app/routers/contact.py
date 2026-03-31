import logging
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/contact", tags=["Contact"])

# ─── Config ──────────────────────────────────────────────
RECEIVER_EMAIL = "ngocb2204951@student.ctu.edu.vn"

# Dùng Gmail SMTP - cần bật App Password
# Xem: https://support.google.com/accounts/answer/185833
SMTP_HOST = "smtp.gmail.com"
SMTP_PORT = 587
SMTP_USER = "ngocb2204951@student.ctu.edu.vn"     # Email gửi
SMTP_PASS = ""                                      # App password (để trống = chỉ log, không gửi thật)


class ContactForm(BaseModel):
    ho_ten: str
    email: str
    sdt: str = ""
    noi_dung: str


@router.post("/send")
async def send_contact_email(form: ContactForm):
    """Nhận form liên hệ từ frontend, gửi email về RECEIVER_EMAIL"""
    logger.info(f"Nhận liên hệ từ: {form.ho_ten} ({form.email})")

    subject = f"[BeHealthy Contact] Liên hệ từ {form.ho_ten}"
    body_html = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #ec4899, #f472b6); padding: 20px; border-radius: 12px 12px 0 0;">
            <h2 style="color: white; margin: 0;">🌸 BeHealthy - Liên hệ mới</h2>
        </div>
        <div style="background: #fff; padding: 24px; border: 1px solid #fce7f3; border-top: none; border-radius: 0 0 12px 12px;">
            <table style="width: 100%; border-collapse: collapse;">
                <tr>
                    <td style="padding: 12px; font-weight: bold; color: #374151; width: 140px;">Họ và tên:</td>
                    <td style="padding: 12px; color: #6b7280;">{form.ho_ten}</td>
                </tr>
                <tr style="background: #fdf2f8;">
                    <td style="padding: 12px; font-weight: bold; color: #374151;">Email:</td>
                    <td style="padding: 12px; color: #6b7280;">{form.email}</td>
                </tr>
                <tr>
                    <td style="padding: 12px; font-weight: bold; color: #374151;">Số điện thoại:</td>
                    <td style="padding: 12px; color: #6b7280;">{form.sdt or '—'}</td>
                </tr>
                <tr style="background: #fdf2f8;">
                    <td style="padding: 12px; font-weight: bold; color: #374151; vertical-align: top;">Nội dung:</td>
                    <td style="padding: 12px; color: #6b7280; white-space: pre-wrap;">{form.noi_dung}</td>
                </tr>
            </table>
        </div>
    </div>
    """

    # Nếu chưa cấu hình SMTP password → chỉ log, trả về success
    if not SMTP_PASS:
        logger.warning("SMTP_PASS chưa được cấu hình - chỉ log nội dung, không gửi email thật")
        logger.info(f"Subject: {subject}")
        logger.info(f"To: {RECEIVER_EMAIL}")
        logger.info(f"Body: {form.ho_ten} | {form.email} | {form.sdt} | {form.noi_dung[:100]}")
        return {
            "message": "Gửi liên hệ thành công!",
            "note": "Email đã được ghi nhận (chế độ dev)"
        }

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = SMTP_USER
        msg["To"] = RECEIVER_EMAIL
        msg["Reply-To"] = form.email

        msg.attach(MIMEText(body_html, "html", "utf-8"))

        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USER, SMTP_PASS)
            server.send_message(msg)

        logger.info(f"Email gửi thành công đến {RECEIVER_EMAIL}")
        return {"message": "Gửi liên hệ thành công! Chúng tôi sẽ phản hồi sớm nhất."}

    except Exception as e:
        logger.error(f"Lỗi gửi email: {str(e)}")
        raise HTTPException(500, detail=f"Gửi email thất bại: {str(e)}")

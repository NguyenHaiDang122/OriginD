<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Khôi phục mật khẩu - OriginD</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0d1117; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #e6edf3;">
    <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: #0d1117; padding: 40px 10px;">
        <tr>
            <td align="center">
                <table width="100%" max-width="500px" border="0" cellpadding="0" cellspacing="0" style="max-width: 500px; background-color: #161b22; border: 1px solid #30363d; border-radius: 16px; padding: 36px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
                    <tr>
                        <td align="center" style="padding-bottom: 24px; border-bottom: 1px solid #21262d;">
                            <h1 style="margin: 0; font-size: 28px; font-weight: 900; letter-spacing: -1px; color: #8a2be2;">
                                OriginD
                            </h1>
                            <p style="margin: 6px 0 0; font-size: 13px; color: #8b949e;">Nền tảng Kiến tạo Website & Landing Page Siêu Tốc</p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 28px 0;">
                            <p style="margin: 0 0 16px; font-size: 16px; line-height: 1.6; color: #c9d1d9;">
                                Xin chào <strong>{{ $name }}</strong>,
                            </p>
                            <p style="margin: 0 0 24px; font-size: 15px; line-height: 1.6; color: #8b949e;">
                                Chúng tôi nhận được yêu cầu khôi phục mật khẩu cho tài khoản OriginD của bạn. Dưới đây là mã xác nhận OTP (mã có hiệu lực trong vòng 5 phút).
                            </p>
                            <div style="text-align: center; margin: 28px 0;">
                                <div style="display: inline-block; background: linear-gradient(135deg, rgba(138,43,226,0.15) 0%, rgba(75,0,130,0.25) 100%); border: 2px dashed #8a2be2; border-radius: 14px; padding: 18px 36px;">
                                    <span style="font-size: 34px; font-weight: 800; letter-spacing: 8px; color: #ffffff; text-shadow: 0 0 10px rgba(138,43,226,0.8);">
                                        {{ $otp }}
                                    </span>
                                </div>
                            </div>
                            <p style="margin: 24px 0 0; font-size: 13px; line-height: 1.6; color: #8b949e; text-align: center;">
                                Vì lý do bảo mật, tuyệt đối không chia sẻ mã này cho bất kỳ ai.<br>
                                Nếu bạn không yêu cầu đổi mật khẩu, vui lòng bỏ qua email này.
                            </p>
                        </td>
                    </tr>
                    <tr>
                        <td align="center" style="padding-top: 24px; border-top: 1px solid #21262d; font-size: 12px; color: #484f58;">
                            &copy; {{ date('Y') }} OriginD. Tất cả các quyền được bảo lưu.<br>
                            Liên hệ hỗ trợ: support@origind.id.vn
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>

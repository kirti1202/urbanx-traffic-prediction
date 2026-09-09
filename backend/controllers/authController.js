import User from "../models/User.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { sendEmail } from "../utils/sendEmail.js";

// ── helpers ──────────────────────────────────────────────
function generateOtp() {
  // 6-digit numeric OTP
  return crypto.randomInt(100000, 999999).toString();
}

function otpEmailHtml(otp) {
  const digits = otp.toString().split('');
  while (digits.length < 6) digits.push('&nbsp;');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Your UrbanX OTP</title>
</head>
<body style="margin:0;padding:0;background:#f5edd0;font-family:'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" border="0"
       style="background:linear-gradient(160deg,#fdf3d0 0%,#fef8e0 50%,#f5edd0 100%);min-height:100vh;">
  <tr>
    <td align="center" valign="top" style="padding:48px 16px 40px;">
      <table width="540" cellpadding="0" cellspacing="0" border="0"
             style="max-width:540px;width:100%;background:#ffffff;border-radius:22px;overflow:hidden;box-shadow:0 12px 48px rgba(79,94,43,0.16);">
        <tr><td style="height:5px;background:linear-gradient(90deg,#6b7f3a,#f5a623,#9db558);font-size:0;">&nbsp;</td></tr>
        <tr>
          <td align="center" style="background:linear-gradient(150deg,#1a1e0e 0%,#2d3818 55%,#1a1e0e 100%);padding:32px 40px 26px;">
            <div style="font-family:Georgia,'Times New Roman',serif;font-size:36px;font-weight:700;letter-spacing:2px;margin-bottom:5px;line-height:1.1;">
              <span style="color:#f5a623;">Urban</span><span style="color:#c8d87a;">X</span>
            </div>
            <div style="font-size:10px;font-weight:700;letter-spacing:4px;text-transform:uppercase;color:rgba(200,216,122,0.55);">AI Traffic Intelligence</div>
            <div style="margin:18px auto 0;width:44px;height:2px;background:linear-gradient(90deg,transparent,#f5a623,transparent);"></div>
          </td>
        </tr>
        <tr>
          <td style="padding:40px 44px 36px;background:#fffdf5;">

            <table width="100%" cellpadding="0" cellspacing="0" border="0"
                   style="background:linear-gradient(135deg,rgba(107,127,58,.07),rgba(245,166,35,.05));border:1.5px solid rgba(107,127,58,.16);border-radius:14px;margin-bottom:28px;">
              <tr>
                <td style="padding:14px 18px;">
                  <table cellpadding="0" cellspacing="0" border="0"><tr>
                    <td style="font-size:28px;vertical-align:middle;padding-right:12px;line-height:1;">&#128663;</td>
                    <td>
                      <div style="font-size:13px;font-weight:700;color:#4f5e2b;margin-bottom:2px;">Hey there, fellow commuter!</div>
                      <div style="font-size:11.5px;color:#8a8a6a;font-weight:400;line-height:1.5;">Your route to smarter travel starts with one quick step.</div>
                    </td>
                  </tr></table>
                </td>
              </tr>
            </table>

            <h1 style="margin:0 0 8px;font-size:24px;font-weight:800;color:#1e2112;text-align:center;letter-spacing:-0.4px;">Your Verification Code</h1>
            <p style="margin:0 0 28px;font-size:14px;color:#8a8a6a;text-align:center;line-height:1.65;">
              Use this one-time code to verify your UrbanX account.<br/>
              It expires in <strong style="color:#4f5e2b;">10&nbsp;minutes</strong>.
            </p>

            <div style="background:linear-gradient(145deg,#f0f7d8,#fdf8e6);border:2px solid rgba(107,127,58,0.22);border-radius:16px;padding:26px 20px 22px;text-align:center;margin-bottom:28px;box-shadow:inset 0 2px 10px rgba(107,127,58,0.06);">
              <div style="font-size:9.5px;font-weight:800;letter-spacing:4px;text-transform:uppercase;color:#9db558;margin-bottom:16px;">ONE-TIME PASSWORD</div>
              <table cellpadding="0" cellspacing="0" border="0" align="center" style="margin:0 auto;">
                <tr>
                  <td style="padding:0 3px;"><div style="width:50px;height:62px;background:#fff;border:2px solid rgba(107,127,58,0.22);border-radius:12px;font-family:'Courier New',Courier,monospace;font-size:32px;font-weight:900;color:#4f5e2b;text-align:center;line-height:62px;box-shadow:0 3px 10px rgba(107,127,58,0.1);">${digits[0]}</div></td>
                  <td style="padding:0 3px;"><div style="width:50px;height:62px;background:#fff;border:2px solid rgba(107,127,58,0.22);border-radius:12px;font-family:'Courier New',Courier,monospace;font-size:32px;font-weight:900;color:#4f5e2b;text-align:center;line-height:62px;box-shadow:0 3px 10px rgba(107,127,58,0.1);">${digits[1]}</div></td>
                  <td style="padding:0 3px;"><div style="width:50px;height:62px;background:#fff;border:2px solid rgba(107,127,58,0.22);border-radius:12px;font-family:'Courier New',Courier,monospace;font-size:32px;font-weight:900;color:#4f5e2b;text-align:center;line-height:62px;box-shadow:0 3px 10px rgba(107,127,58,0.1);">${digits[2]}</div></td>
                  <td style="padding:0 6px;vertical-align:middle;"><div style="width:6px;height:6px;background:#c8d87a;border-radius:50%;"></div></td>
                  <td style="padding:0 3px;"><div style="width:50px;height:62px;background:#fff;border:2px solid rgba(107,127,58,0.22);border-radius:12px;font-family:'Courier New',Courier,monospace;font-size:32px;font-weight:900;color:#4f5e2b;text-align:center;line-height:62px;box-shadow:0 3px 10px rgba(107,127,58,0.1);">${digits[3]}</div></td>
                  <td style="padding:0 3px;"><div style="width:50px;height:62px;background:#fff;border:2px solid rgba(107,127,58,0.22);border-radius:12px;font-family:'Courier New',Courier,monospace;font-size:32px;font-weight:900;color:#4f5e2b;text-align:center;line-height:62px;box-shadow:0 3px 10px rgba(107,127,58,0.1);">${digits[4]}</div></td>
                  <td style="padding:0 3px;"><div style="width:50px;height:62px;background:#fff;border:2px solid rgba(107,127,58,0.22);border-radius:12px;font-family:'Courier New',Courier,monospace;font-size:32px;font-weight:900;color:#4f5e2b;text-align:center;line-height:62px;box-shadow:0 3px 10px rgba(107,127,58,0.1);">${digits[5]}</div></td>
                </tr>
              </table>
              <div style="margin-top:20px;">
                <div style="font-size:10.5px;color:#9a9a7a;margin-bottom:6px;">Expires in 10 minutes &nbsp;&#9679;&nbsp; Do not share</div>
                <div style="height:4px;background:rgba(107,127,58,0.1);border-radius:4px;max-width:260px;margin:0 auto;overflow:hidden;">
                  <div style="height:100%;width:100%;background:linear-gradient(90deg,#6b7f3a,#f5a623);border-radius:4px;"></div>
                </div>
              </div>
            </div>

            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;">
              <tr>
                <td style="background:#f9fcf0;border:1.5px solid rgba(107,127,58,0.18);border-radius:12px;padding:14px 16px;">
                  <div style="font-size:11.5px;font-weight:700;color:#4f5e2b;margin-bottom:6px;letter-spacing:.3px;">&#128652;&nbsp; WHAT HAPPENS NEXT</div>
                  <table cellpadding="0" cellspacing="0" border="0" width="100%">
                    <tr><td style="font-size:11.5px;color:#6a7a4a;line-height:1.7;width:14px;vertical-align:top;">1.</td><td style="font-size:11.5px;color:#6a7a4a;line-height:1.7;">Enter this code on the UrbanX verification page</td></tr>
                    <tr><td style="font-size:11.5px;color:#6a7a4a;line-height:1.7;vertical-align:top;">2.</td><td style="font-size:11.5px;color:#6a7a4a;line-height:1.7;">Your account gets verified instantly</td></tr>
                    <tr><td style="font-size:11.5px;color:#6a7a4a;line-height:1.7;vertical-align:top;">3.</td><td style="font-size:11.5px;color:#6a7a4a;line-height:1.7;">Start predicting traffic &amp; beating jams!</td></tr>
                  </table>
                </td>
              </tr>
            </table>

            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:28px;">
              <tr>
                <td style="background:#fffbee;border:1.5px solid rgba(245,166,35,0.3);border-radius:12px;padding:12px 16px;">
                  <table cellpadding="0" cellspacing="0" border="0"><tr>
                    <td style="font-size:15px;vertical-align:top;padding-right:8px;padding-top:1px;">&#9888;&#65039;</td>
                    <td style="font-size:11.5px;color:#7a6030;line-height:1.65;">
                      <strong style="color:#5a4010;">Never share this code.</strong>
                      UrbanX staff will never ask for your OTP. If you didn't request this, safely ignore this email.
                    </td>
                  </tr></table>
                </td>
              </tr>
            </table>

            <div style="height:1px;background:linear-gradient(90deg,transparent,rgba(107,127,58,0.14),transparent);margin-bottom:24px;"></div>

            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td width="33%" align="center" style="padding:0 5px;">
                  <div style="font-size:20px;margin-bottom:5px;">&#128678;</div>
                  <div style="font-size:10px;font-weight:700;color:#6b7f3a;letter-spacing:.5px;text-transform:uppercase;">Live Traffic</div>
                  <div style="font-size:10px;color:#9a9a7a;margin-top:2px;">Real-time data</div>
                </td>
                <td width="33%" align="center" style="padding:0 5px;border-left:1px solid rgba(107,127,58,0.1);border-right:1px solid rgba(107,127,58,0.1);">
                  <div style="font-size:20px;margin-bottom:5px;">&#128506;</div>
                  <div style="font-size:10px;font-weight:700;color:#6b7f3a;letter-spacing:.5px;text-transform:uppercase;">Smart Routes</div>
                  <div style="font-size:10px;color:#9a9a7a;margin-top:2px;">Best path always</div>
                </td>
                <td width="33%" align="center" style="padding:0 5px;">
                  <div style="font-size:20px;margin-bottom:5px;">&#9889;</div>
                  <div style="font-size:10px;font-weight:700;color:#6b7f3a;letter-spacing:.5px;text-transform:uppercase;">94% Accurate</div>
                  <div style="font-size:10px;color:#9a9a7a;margin-top:2px;">ML powered</div>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="background:#1a1e0e;padding:20px 40px;text-align:center;">
            <div style="font-size:11.5px;color:rgba(255,255,255,0.38);line-height:1.7;">
              &copy; 2026 UrbanX Technologies &nbsp;&middot;&nbsp;
              <a href="#" style="color:rgba(200,216,122,0.55);text-decoration:none;">Privacy Policy</a>
              &nbsp;&middot;&nbsp;
              <a href="#" style="color:rgba(200,216,122,0.55);text-decoration:none;">Unsubscribe</a>
            </div>
            <div style="font-size:10.5px;color:rgba(255,255,255,0.2);margin-top:4px;">Sent because you created an UrbanX account.</div>
          </td>
        </tr>
        <tr><td style="height:4px;background:linear-gradient(90deg,#f5a623,#6b7f3a,#f5a623);font-size:0;">&nbsp;</td></tr>
      </table>
      <div style="margin-top:18px;font-size:11.5px;color:#9a8a6a;text-align:center;letter-spacing:.3px;">
        Beat Traffic. Travel Smarter. &mdash; <strong style="color:#6b7f3a;">UrbanX AI</strong>
      </div>
    </td>
  </tr>
</table>
</body>
</html>`;
}

// ── SIGNUP ────────────────────────────────────────────────
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ message: "All fields are required" });

    // If user exists but is NOT verified, allow re-registration (resend OTP)
    const existing = await User.findOne({ email });
    if (existing && existing.isVerified)
      return res.status(400).json({ message: "Email already registered" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = generateOtp();
    const hashedOtp = await bcrypt.hash(otp, 10);
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    if (existing) {
      // update the unverified user with fresh password + OTP
      existing.name = name;
      existing.password = hashedPassword;
      existing.otp = hashedOtp;
      existing.otpExpires = otpExpires;
      await existing.save();
    } else {
      await User.create({
        name,
        email,
        password: hashedPassword,
        otp: hashedOtp,
        otpExpires
      });
    }

    await sendEmail(email, "Your OTP code", otpEmailHtml(otp));

    res.json({ message: "OTP sent to your email" });

  } catch (err) {
    console.error("register error:", err);
    res.status(500).json({ message: "Server error, please try again" });
  }
};

// ── VERIFY OTP ────────────────────────────────────────────
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp)
      return res.status(400).json({ message: "Email and OTP are required" });

    const user = await User.findOne({ email });

    if (!user || !user.otp)
      return res.status(400).json({ message: "No OTP found for this email" });

    if (user.otpExpires < Date.now())
      return res.status(400).json({ message: "OTP has expired, please sign up again" });

    const match = await bcrypt.compare(otp, user.otp);
    if (!match)
      return res.status(400).json({ message: "Invalid OTP" });

    // Mark verified, clear OTP
    user.isVerified = true;
    user.otp = null;
    user.otpExpires = null;
    await user.save();

    res.json({ message: "Email verified successfully! You can now log in." });

  } catch (err) {
    console.error("verifyOtp error:", err);
    res.status(500).json({ message: "Server error, please try again" });
  }
};

// ── RESEND OTP ────────────────────────────────────────────
export const resendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email)
      return res.status(400).json({ message: "Email is required" });

    const user = await User.findOne({ email });

    if (!user)
      return res.status(400).json({ message: "No account found with this email" });

    if (user.isVerified)
      return res.status(400).json({ message: "Account is already verified" });

    const otp = generateOtp();
    const hashedOtp = await bcrypt.hash(otp, 10);

    user.otp = hashedOtp;
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    await sendEmail(email, "Your new OTP code", otpEmailHtml(otp));

    res.json({ message: "New OTP sent to your email" });

  } catch (err) {
    console.error("resendOtp error:", err);
    res.status(500).json({ message: "Server error, please try again" });
  }
};

// ── LOGIN ─────────────────────────────────────────────────
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "Email and password are required" });

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "Invalid credentials" });

    if (!user.isVerified)
      return res.status(401).json({ message: "Please verify your email first" });

    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || "1d" }
    );

    res.json({ token, name: user.name, email: user.email });

  } catch (err) {
    console.error("login error:", err);
    res.status(500).json({ message: "Server error, please try again" });
  }
};

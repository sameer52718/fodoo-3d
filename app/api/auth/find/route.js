import connectDB from "@/lib/db";
import User from "@/models/User";
import jwt from "jsonwebtoken";
import nodemailer from 'nodemailer';


const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: true,
    tls: {
        rejectUnauthorized: false,
    },
    auth: {
        user: process.env.SMTP_MAIL,
        pass: process.env.SMTP_PASSWORD,
    },
});


const resetMail = ({ link, name }) => {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, Helvetica, sans-serif; background-color: #f4f4f4;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f4f4f4; padding: 20px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <!-- Body -->
          <tr>
            <td style="padding: 30px; color: #333333;">
              <h1 style="font-size: 24px; margin: 0 0 20px; color: #333333;">Password Reset Request</h1>
              <p style="font-size: 16px; line-height: 1.5; margin: 0 0 20px;">
                Hello ${name},
              </p>
              <p style="font-size: 16px; line-height: 1.5; margin: 0 0 20px;">
                We received a request to reset your password for your Fodoo account. Click the button below to set a new password:
              </p>
              <!-- Reset Button -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 auto 20px;">
                <tr>
                  <td style="text-align: center;">
                    <a href="${link}" style="background-color: #515def; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 4px; font-size: 16px; font-weight: bold; display: inline-block;">
                      Reset Password
                    </a>
                  </td>
                </tr>
              </table>
              <!-- Fallback Link -->
              <p style="font-size: 14px; line-height: 1.5; margin: 0 0 20px; word-break: break-all;">
                If the button above doesn't work, copy and paste this link into your browser:
                <br />
                <a href="${link}" style="color: #515def; text-decoration: underline;">${link}</a>
              </p>
              <p style="font-size: 14px; line-height: 1.5; margin: 0 0 20px;">
                This link will expire in 5 minutes for security reasons. If you didn't request a password reset, please ignore this email or contact our support team at <a href="mailto:support@fodoo.com" style="color: #515def; text-decoration: underline;">support@fodoo.com</a>.
              </p>
              <p style="font-size: 16px; line-height: 1.5; margin: 0;">
                Best regards,<br />
                The Fodoo Team
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color: #f4f4f4; text-align: center; padding: 20px; color: #666666; font-size: 12px;">
              <p style="margin: 0 0 10px;">
                &copy; ${new Date().getFullYear()} Fodoo. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>

  <!-- Responsive Media Query -->
  <style type="text/css">
    @media only screen and (max-width: 600px) {
      table[width="600"] {
        width: 100% !important;
        max-width: 100% !important;
      }
      td {
        padding: 20px !important;
      }
      h1 {
        font-size: 20px !important;
      }
      p, a {
        font-size: 14px !important;
      }
      img {
        max-width: 120px !important;
      }
    }
  </style>
</body>
</html>`
}


// POST: Send password reset link
export const POST = async function handler(req) {
    await connectDB();

    try {
        const { email } = await req.json();

        // Validate input
        if (!email) {
            return new Response(JSON.stringify({ error: true, message: "Email is required" }), { status: 400 });
        }

        // Find user by email with roles: ADMIN, MODERATOR, VIEWER
        const user = await User.findOne({ email });

        if (!user) {
            return new Response(JSON.stringify({ error: true, message: "Account Not Found." }), { status: 200 });
        }

        const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1d" });


        const mailOptions = {
            from: `"Fodoo" <process.env.SMTP_MAIL>`,
            html: resetMail({ link: `${req.headers.get("origin")}/dashboard/password?token=${token}`, name: user.name }),
            to: user.email,
            subject: "Reset Your Password",
        };


        await transporter.sendMail(mailOptions);

        return new Response(JSON.stringify({
            error: false,
            message: "Account Found. Please check your email for the reset link.",
        }), { status: 200 });
    } catch (error) {
        return new Response(JSON.stringify({ error: true, message: error.message || "An unexpected error occurred" }), { status: 500 });
    }
};
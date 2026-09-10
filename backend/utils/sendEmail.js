import nodemailer from "nodemailer";

export async function sendEmail(to, subject, html) {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // STARTTLS - true only for port 465
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    connectionTimeout: 10000, // fail fast after 10s instead of long retries
  });

  await transporter.sendMail({
    from: "Traffic Prediction" <${process.env.EMAIL_USER}>,
    to,
    subject,
    html,
  });
}
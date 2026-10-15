// Sends an email using Brevo's HTTP API (works on Render, unlike SMTP)
export async function sendEmail(to, subject, html) {
  // The sender address, which must be verified in your Brevo account
  const senderEmail = process.env.SENDER_EMAIL;

  // Build the data in the shape Brevo expects
  const body = {
    sender: { name: "Traffic Prediction", email: senderEmail },
    to: [{ email: to }],
    subject: subject,
    htmlContent: html,
  };

  // Send the request to Brevo's API
  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": process.env.BREVO_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  // If Brevo rejects the request, throw an error so register() returns a 500
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error("Email send failed: " + JSON.stringify(errorData));
  }
}
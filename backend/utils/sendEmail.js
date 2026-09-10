export async function sendEmail(to, subject, html) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Traffic Prediction <onboarding@resend.dev>", // or your verified domain
      to,
      subject,
      html,
    }),
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(`Email send failed: ${JSON.stringify(errorData)}`);
  }
}
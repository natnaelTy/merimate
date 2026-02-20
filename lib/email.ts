type SendEmailInput = {
  to: string;
  subject: string;
  text: string;
  html?: string;
};

const getEmailConfig = () => {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from =
    process.env.REMINDER_EMAIL_FROM?.trim() ||
    process.env.RESEND_FROM_EMAIL?.trim() ||
    process.env.EMAIL_FROM?.trim();

  return { apiKey, from };
};

export async function sendReminderEmail({ to, subject, text, html }: SendEmailInput) {
  const { apiKey, from } = getEmailConfig();

  if (!apiKey) {
    throw new Error("Missing RESEND_API_KEY");
  }
  if (!from) {
    throw new Error("Missing REMINDER_EMAIL_FROM");
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to,
      subject,
      text,
      html,
    }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`Email send failed (${response.status}): ${body}`.trim());
  }
}

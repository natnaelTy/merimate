type SendEmailInput = {
  to: string;
  subject: string;
  text: string;
  html?: string;
};

type WaitlistEmailInput = {
  to: string;
  fullName?: string | null;
  origin?: string;
};

const getEmailConfig = () => {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from =
    process.env.REMINDER_EMAIL_FROM?.trim() ||
    process.env.RESEND_FROM_EMAIL?.trim() ||
    process.env.EMAIL_FROM?.trim();

  return { apiKey, from };
};

export async function sendWaitlistConfirmationEmail({
  to,
  fullName,
  origin,
}: WaitlistEmailInput) {
  const name = fullName?.trim() || "there";
  const appUrl = origin?.trim() || "https://merimate.com";
  const subject = "You're on the Merimate waitlist";
  const text = `Hi ${name},\n\nThanks for joining the Merimate beta waitlist. We'll email you as soon as a spot opens up.\n\nIn the meantime, you can learn more at ${appUrl}.\n\n— Merimate`;
  const html = `
    <div style="font-family: Arial, sans-serif; color: #0f172a; line-height: 1.6;">
      <p>Hi ${name},</p>
      <p>Thanks for joining the Merimate beta waitlist. We'll email you as soon as a spot opens up.</p>
      <p>In the meantime, you can learn more at <a href="${appUrl}" style="color:#2563eb;">${appUrl}</a>.</p>
      <p style="margin-top: 24px;">— Merimate</p>
    </div>
  `.trim();

  await sendReminderEmail({ to, subject, text, html });
}

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

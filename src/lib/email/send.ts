import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const EMAIL_FROM = process.env.EMAIL_FROM || "oncall@yourdomain.com";

interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailOptions) {
  if (!resend) {
    console.log(`[Email Mock] To: ${to}, Subject: ${subject}`);
    return;
  }

  try {
    await resend.emails.send({
      from: EMAIL_FROM,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
    });
  } catch (error) {
    console.error("Failed to send email:", error);
  }
}

export async function sendShiftReminder(
  to: string,
  name: string,
  weekDates: string,
  role: string
) {
  await sendEmail({
    to,
    subject: `On-Call Reminder: Your ${role} shift starts soon`,
    html: `
      <h2>On-Call Shift Reminder</h2>
      <p>Hi ${name},</p>
      <p>Your <strong>${role}</strong> on-call shift is coming up: <strong>${weekDates}</strong>.</p>
      <p>Please ensure you're prepared and reachable during your shift.</p>
      <p>- On-Call Scheduler Pro</p>
    `,
  });
}

export async function sendSwapRequestNotification(
  to: string,
  fromName: string,
  weekDates: string,
  role: string
) {
  await sendEmail({
    to,
    subject: `Swap Request: ${fromName} wants to swap shifts`,
    html: `
      <h2>New Swap Request</h2>
      <p>${fromName} has requested to swap their <strong>${role}</strong> shift during <strong>${weekDates}</strong> with you.</p>
      <p>Log in to the On-Call Scheduler to review and respond.</p>
      <p>- On-Call Scheduler Pro</p>
    `,
  });
}

export async function sendSchedulePublished(
  to: string,
  name: string,
  quarterName: string
) {
  await sendEmail({
    to,
    subject: `Schedule Published: ${quarterName}`,
    html: `
      <h2>Schedule Published</h2>
      <p>Hi ${name},</p>
      <p>The on-call schedule for <strong>${quarterName}</strong> has been published.</p>
      <p>Log in to view your assigned shifts and set up calendar sync.</p>
      <p>- On-Call Scheduler Pro</p>
    `,
  });
}

export async function sendDeadlineReminder(
  to: string,
  name: string,
  quarterName: string,
  deadline: string
) {
  await sendEmail({
    to,
    subject: `Preference Deadline: ${quarterName}`,
    html: `
      <h2>Preference Deadline Approaching</h2>
      <p>Hi ${name},</p>
      <p>The preference submission deadline for <strong>${quarterName}</strong> is <strong>${deadline}</strong>.</p>
      <p>Log in to submit your availability preferences.</p>
      <p>- On-Call Scheduler Pro</p>
    `,
  });
}

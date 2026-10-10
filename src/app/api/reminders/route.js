import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

export async function GET(request) {
  try {
    // Initialize inside the handler to prevent build-time errors if env vars are missing
    const resendApiKey = process.env.RESEND_API_KEY;
    const resend = resendApiKey ? new Resend(resendApiKey) : null;

    if (!resend) {
      console.warn("RESEND_API_KEY is missing. Email will not be sent.");
    }

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error("SUPABASE_SERVICE_ROLE_KEY is missing");
      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 },
      );
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      },
    );

    // Strictly check if the request is from Vercel Cron
    const authHeader = request.headers.get("authorization");
    if (
      !process.env.CRON_SECRET ||
      authHeader !== `Bearer ${process.env.CRON_SECRET}`
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Calculate tomorrow's date (YYYY-MM-DD)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split("T")[0];

    // Fetch assignments due tomorrow with reminder_sent = false
    const { data: assignments, error: assignmentsError } = await supabaseAdmin
      .from("assignments")
      .select("*")
      .eq("due_date", tomorrowStr)
      .eq("reminder_sent", false);

    if (assignmentsError) {
      console.error("Error fetching assignments:", assignmentsError);
      return NextResponse.json(
        { error: assignmentsError.message },
        { status: 500 },
      );
    }

    if (!assignments || assignments.length === 0) {
      return NextResponse.json({ message: "No reminders to send." });
    }

    const results = [];

    // Process each assignment
    for (const assignment of assignments) {
      try {
        // Fetch user email using admin auth
        const { data: userData, error: userError } =
          await supabaseAdmin.auth.admin.getUserById(assignment.user_id);

        if (userError || !userData?.user?.email) {
          console.error(
            `Could not fetch user email for assignment ${assignment.id}`,
            userError,
          );
          results.push({
            id: assignment.id,
            success: false,
            error: "User email not found",
          });
          continue;
        }

        const email = userData.user.email;
        const name = userData.user.user_metadata?.username || "User";

        if (!resend) {
          throw new Error("RESEND_API_KEY is not configured");
        }

        // Send email using Resend
        const { data: emailData, error: emailError } = await resend.emails.send(
          {
            from: "Nira <onboarding@resend.dev>", // Assuming default verified domain, users should change this if needed
            to: [email],
            subject: "🔔 Reminder: Your task is due tomorrow",
            html: `
            <div style="font-family: sans-serif; color: #333;">
              <p>Hi ${name},</p>
              <p>Your assignment deadline is approaching:</p>
              <ul>
                <li><strong>Task:</strong> ${assignment.title}</li>
                <li><strong>Deadline:</strong> ${assignment.due_date}</li>
                <li><strong>Priority:</strong> ${assignment.priority || "Normal"}</li>
              </ul>
              <p>Don't forget to complete it.</p>
              <br/>
              <p>- Nira</p>
            </div>
          `,
          },
        );

        if (emailError) {
          console.error(
            `Failed to send email for assignment ${assignment.id}:`,
            emailError,
          );
          results.push({
            id: assignment.id,
            success: false,
            error: emailError.message,
          });
          continue;
        }

        // Update reminder_sent to true
        const { error: updateError } = await supabaseAdmin
          .from("assignments")
          .update({ reminder_sent: true })
          .eq("id", assignment.id);

        if (updateError) {
          console.error(
            `Failed to update reminder_sent for assignment ${assignment.id}:`,
            updateError,
          );
          results.push({
            id: assignment.id,
            success: false,
            error: updateError.message,
          });
          continue;
        }

        results.push({ id: assignment.id, success: true });
      } catch (err) {
        console.error(
          `Unexpected error processing assignment ${assignment.id}:`,
          err,
        );
        results.push({ id: assignment.id, success: false, error: err.message });
      }
    }

    return NextResponse.json({ message: "Reminders processed", results });
  } catch (error) {
    console.error("Unhandled error in reminders API:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

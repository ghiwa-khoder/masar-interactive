import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(
  process.env.RESEND_API_KEY
);

type InquiryBody = {
  name?: string;
  email?: string;
  projectType?: string;
  budget?: string;
  timeline?: string;
  message?: string;
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export async function POST(request: Request) {
  try {
    const body =
      (await request.json()) as InquiryBody;

    const name = body.name?.trim() || "";
    const email = body.email?.trim() || "";
    const projectType =
      body.projectType?.trim() || "";
    const budget =
      body.budget?.trim() || "Not specified";
    const timeline =
      body.timeline?.trim() || "Not specified";
    const message =
      body.message?.trim() || "";

    /* ================================
       VALIDATION
    ================================= */

    if (
      !name ||
      !email ||
      !projectType ||
      !message
    ) {
      return NextResponse.json(
        {
          error:
            "Please complete all required fields.",
        },
        {
          status: 400,
        }
      );
    }

    const emailPattern =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
      return NextResponse.json(
        {
          error:
            "Please enter a valid email address.",
        },
        {
          status: 400,
        }
      );
    }

    /* ================================
       SAFE VALUES
    ================================= */

    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safeProjectType =
      escapeHtml(projectType);
    const safeBudget = escapeHtml(budget);
    const safeTimeline =
      escapeHtml(timeline);
    const safeMessage = escapeHtml(message)
      .replaceAll("\n", "<br />");

    /* ================================
       SEND EMAIL
    ================================= */

    const { data, error } =
      await resend.emails.send({
        /*
          For initial Resend testing,
          use their onboarding sender.

          Later we replace this with:
          MASAR Interactive <hello@yourdomain.com>
        */
        from:
          "MASAR Interactive <onboarding@resend.dev>",

        to: [
          "masar.interactive@hotmail.com",
        ],

        replyTo: email,

        subject:
          `New MASAR Inquiry — ${projectType}`,

        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="UTF-8" />
            </head>

            <body
              style="
                margin:0;
                padding:0;
                background:#07111f;
                font-family:Arial,Helvetica,sans-serif;
              "
            >

              <div
                style="
                  max-width:680px;
                  margin:0 auto;
                  padding:40px 20px;
                "
              >

                <div
                  style="
                    background:#0b182b;
                    border:1px solid #26364a;
                  "
                >

                  <!-- HEADER -->

                  <div
                    style="
                      padding:32px;
                      border-bottom:1px solid #26364a;
                    "
                  >

                    <div
                      style="
                        color:#d8f860;
                        font-size:11px;
                        letter-spacing:2px;
                        margin-bottom:14px;
                      "
                    >
                      MASAR INTERACTIVE
                    </div>

                    <h1
                      style="
                        margin:0;
                        color:#f1f2ec;
                        font-size:30px;
                        font-weight:500;
                      "
                    >
                      New Project Inquiry
                    </h1>

                  </div>

                  <!-- CONTENT -->

                  <div
                    style="
                      padding:32px;
                    "
                  >

                    <table
                      width="100%"
                      cellspacing="0"
                      cellpadding="0"
                      style="
                        border-collapse:collapse;
                      "
                    >

                      ${row(
                        "NAME",
                        safeName
                      )}

                      ${row(
                        "EMAIL",
                        safeEmail
                      )}

                      ${row(
                        "PROJECT TYPE",
                        safeProjectType
                      )}

                      ${row(
                        "BUDGET",
                        safeBudget
                      )}

                      ${row(
                        "TIMELINE",
                        safeTimeline
                      )}

                    </table>

                    <div
                      style="
                        margin-top:34px;
                        padding-top:28px;
                        border-top:1px solid #26364a;
                      "
                    >

                      <div
                        style="
                          color:#9ca8b4;
                          font-size:10px;
                          letter-spacing:1.5px;
                          margin-bottom:12px;
                        "
                      >
                        PROJECT DETAILS
                      </div>

                      <div
                        style="
                          color:#f1f2ec;
                          font-size:16px;
                          line-height:1.7;
                        "
                      >
                        ${safeMessage}
                      </div>

                    </div>

                  </div>

                  <!-- FOOTER -->

                  <div
                    style="
                      padding:20px 32px;
                      border-top:1px solid #26364a;
                      color:#9ca8b4;
                      font-size:11px;
                    "
                  >
                    Submitted through
                    masarinteractive.com
                  </div>

                </div>

              </div>

            </body>
          </html>
        `,
      });

    if (error) {
      console.error(
        "Resend error:",
        error
      );

      return NextResponse.json(
        {
          error:
            "Unable to send inquiry. Please try again.",
        },
        {
          status: 500,
        }
      );
    }

    return NextResponse.json(
      {
        success: true,
        id: data?.id,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "Inquiry API error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Something went wrong. Please try again.",
      },
      {
        status: 500,
      }
    );
  }
}

function row(
  label: string,
  value: string
) {
  return `
    <tr>
      <td
        style="
          width:150px;
          padding:14px 0;
          border-bottom:1px solid #26364a;
          color:#9ca8b4;
          font-size:10px;
          letter-spacing:1px;
          vertical-align:top;
        "
      >
        ${label}
      </td>

      <td
        style="
          padding:14px 0;
          border-bottom:1px solid #26364a;
          color:#f1f2ec;
          font-size:15px;
          vertical-align:top;
        "
      >
        ${value}
      </td>
    </tr>
  `;
}
"use server";

import { revalidatePath } from "next/cache";
import { withClient } from "@/lib/db";
import { requireUser } from "@/lib/session";

export async function rejectResponse(formData: FormData) {
  const user = await requireUser();
  const responseId = Number(formData.get("response_id"));
  if (!responseId) return;
  await withClient(async (c) => {
    await c.query(
      `INSERT INTO decisions (response_id, action, decided_by) VALUES ($1, 'rejected', $2)`,
      [responseId, user],
    );
  });
  revalidatePath("/queue");
}

export async function rejectCandidate(formData: FormData) {
  const user = await requireUser();
  const candidateId = Number(formData.get("candidate_id"));
  if (!candidateId) return;
  await withClient(async (c) => {
    const { rows } = await c.query<{ id: number }>(
      `SELECT id FROM responses WHERE candidate_id=$1`,
      [candidateId],
    );
    for (const r of rows) {
      await c.query(
        `INSERT INTO decisions (response_id, action, decided_by) VALUES ($1, 'rejected', $2)`,
        [r.id, user],
      );
    }
    await c.query(`UPDATE candidates SET status='rejected' WHERE id=$1`, [candidateId]);
  });
  revalidatePath("/queue");
}

export async function publishResponse(formData: FormData) {
  const user = await requireUser();
  const responseId = Number(formData.get("response_id"));
  const editedText = String(formData.get("edited_text") || "").trim();
  if (!responseId) return;

  const webhook = process.env.DEB_PUBLISH_WEBHOOK;
  if (!webhook) {
    throw new Error("DEB_PUBLISH_WEBHOOK not configured");
  }

  // Fetch needed context
  const ctx = await withClient(async (c) => {
    const { rows } = await c.query<{
      response_id: number;
      text: string;
      tweet_id: string;
      original_text: string;
    }>(
      `SELECT r.id AS response_id, r.text, c.tweet_id, t.tweet_json->>'text' AS original_text
       FROM responses r
       JOIN candidates c ON c.id = r.candidate_id
       JOIN seen_tweets t ON t.tweet_id = c.tweet_id
       WHERE r.id = $1`,
      [responseId],
    );
    return rows[0];
  });
  if (!ctx) throw new Error("Response not found");

  const finalText = editedText || ctx.text;

  let posted = false;
  let postedTweetId: string | null = null;
  let errorMsg: string | null = null;

  try {
    const res = await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        response_id: ctx.response_id,
        in_reply_to_tweet_id: ctx.tweet_id,
        text: finalText,
      }),
    });
    if (res.ok) {
      const j = (await res.json().catch(() => ({}))) as { tweet_id?: string };
      posted = true;
      postedTweetId = j.tweet_id || null;
    } else {
      errorMsg = `webhook ${res.status}: ${(await res.text()).slice(0, 200)}`;
    }
  } catch (e) {
    errorMsg = (e as Error).message;
  }

  await withClient(async (c) => {
    await c.query(
      `INSERT INTO decisions (response_id, action, edited_text, decided_by, posted_tweet_id)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        responseId,
        posted ? "posted" : "publish_failed",
        editedText || null,
        user,
        postedTweetId,
      ],
    );
    if (posted) {
      await c.query(`UPDATE candidates SET status='posted' WHERE id=(SELECT candidate_id FROM responses WHERE id=$1)`, [responseId]);
    }
  });

  revalidatePath("/queue");
  if (errorMsg) throw new Error(errorMsg);
}

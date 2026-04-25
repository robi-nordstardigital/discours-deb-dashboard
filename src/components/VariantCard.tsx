"use client";

import { useState } from "react";
import { publishResponse, rejectResponse } from "@/app/queue/actions";
import type { ResponseVariant } from "@/lib/db";

const LABEL_MAP: Record<string, string> = {
  beamend_kern: "Beamend",
  beamend_andere_invalshoek: "Beamend +",
  beamend_guest_perspective: "Guest expert",
  nuancerend: "Nuancerend",
  ludiek: "Ludiek",
  ludiek_luchtig: "Ludiek",
};

const SCORE_KEYS = ["relevance", "appropriateness", "authenticity", "added_value", "diversity"] as const;
const SCORE_SHORT: Record<string, string> = {
  relevance: "Rel",
  appropriateness: "App",
  authenticity: "Aut",
  added_value: "Add",
  diversity: "Div",
};

function compositeClass(c: number) {
  if (c >= 8) return "composite-strong";
  if (c >= 6) return "composite-mid";
  return "composite-weak";
}

export function VariantCard({ v }: { v: ResponseVariant }) {
  const [text, setText] = useState(v.text);
  const composite = v.composite_score ?? 0;
  const label = LABEL_MAP[v.variant_label || ""] || v.variant_label || `Variant ${v.variant_idx}`;
  const overLimit = text.length > 280;

  return (
    <div className="glass-card p-4 flex flex-col gap-3 h-full">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="brand-eyebrow truncate">{label}</span>
          {v.episode_nr && (
            <span
              className="text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0"
              style={{
                background: "rgba(245,239,230,0.06)",
                color: "var(--color-cream)",
              }}
            >
              EP {v.episode_nr}
            </span>
          )}
        </div>
        <span
          className={`composite-pill px-2 py-0.5 rounded-full text-xs ${compositeClass(composite)}`}
          title={composite < 0 ? "Auto-rejected" : `Composite ${composite}/10`}
        >
          {composite < 0 ? "REJ" : composite.toFixed(2)}
        </span>
      </div>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={5}
        maxLength={300}
        className="bg-black/30 border border-[color:var(--color-line)] rounded-lg p-3 text-[13px] leading-relaxed resize-none focus:border-[color:var(--color-rose)]/40 transition-colors"
      />

      <div className="flex items-center justify-between text-[10px] text-[color:var(--color-mute)]">
        <span>{v.quote_timestamp && `▶ ${v.quote_timestamp}`}</span>
        <span className={overLimit ? "text-red-400 font-bold" : ""}>{text.length}/280</span>
      </div>

      <div className="space-y-1.5">
        {v.scores &&
          SCORE_KEYS.map((k) => {
            const s = v.scores?.[k] as
              | { score: number; why: string; linked?: boolean }
              | undefined;
            if (!s) return null;
            const isRelevance = k === "relevance";
            const linkedFalse = isRelevance && s.linked === false;
            return (
              <div
                key={k}
                className="flex items-center gap-2"
                title={s.why || ""}
              >
                <span
                  className={`score-tag w-6 ${
                    linkedFalse
                      ? "text-red-400 font-black"
                      : "text-[color:var(--color-mute)]"
                  }`}
                >
                  {SCORE_SHORT[k]}
                </span>
                <div className="score-bar flex-1">
                  <div
                    className="score-bar-fill"
                    style={{
                      width: `${s.score * 10}%`,
                      ...(linkedFalse
                        ? { background: "linear-gradient(90deg, #b91c1c, #ef4444)" }
                        : {}),
                    }}
                  />
                </div>
                <span className="text-[10px] tabular-nums text-[color:var(--color-mute)] w-4 text-right">
                  {s.score}
                </span>
              </div>
            );
          })}
        {v.scores?.relevance && (v.scores.relevance as any).why && (
          <p
            className="text-[10px] text-[color:var(--color-mute)] italic leading-snug pt-1"
            title={(v.scores.relevance as any).why}
          >
            <span className="brand-eyebrow not-italic mr-1">Rel:</span>
            {((v.scores.relevance as any).why as string).slice(0, 110)}
          </p>
        )}
      </div>

      {v.youtube_url && (
        <a
          href={v.youtube_url}
          target="_blank"
          rel="noopener"
          className="text-[10px] text-[color:var(--color-mute)] hover:text-white truncate flex items-center gap-1"
        >
          <span style={{ color: "var(--color-yt-red)" }}>▶</span>
          {v.youtube_url.replace(/^https?:\/\/(www\.)?/, "")}
        </a>
      )}

      <div className="flex gap-2 mt-auto">
        <form action={publishResponse} className="flex-1">
          <input type="hidden" name="response_id" value={v.id} />
          <input type="hidden" name="edited_text" value={text} />
          <button
            type="submit"
            disabled={overLimit || composite < 5}
            className="w-full btn-publish text-white font-bold text-sm rounded-lg py-2 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Publish
          </button>
        </form>
        <form action={rejectResponse}>
          <input type="hidden" name="response_id" value={v.id} />
          <button
            type="submit"
            className="btn-reject text-white font-bold text-sm rounded-lg px-3 py-2"
          >
            Reject
          </button>
        </form>
      </div>
    </div>
  );
}

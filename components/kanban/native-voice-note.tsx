"use client";

import { useEffect, useState } from "react";

/**
 * Generates a silent WAV blob URL of the requested duration (capped at 5 s)
 * so the native <audio> element has something to play in the prototype.
 * 8-bit unsigned PCM, mono, 8 kHz.
 */
function createSilentWavUrl(durationSec: number): string {
  const sampleRate = 8000;
  const numSamples = Math.floor(sampleRate * Math.min(durationSec, 5));
  const buf = new ArrayBuffer(44 + numSamples);
  const v = new DataView(buf);
  function str(off: number, s: string) {
    for (let i = 0; i < s.length; i++) v.setUint8(off + i, s.charCodeAt(i));
  }
  str(0, "RIFF");
  v.setUint32(4, 36 + numSamples, true);
  str(8, "WAVE");
  str(12, "fmt ");
  v.setUint32(16, 16, true);       // sub-chunk size
  v.setUint16(20, 1, true);        // PCM
  v.setUint16(22, 1, true);        // mono
  v.setUint32(24, sampleRate, true);
  v.setUint32(28, sampleRate, true); // byte rate
  v.setUint16(32, 1, true);        // block align
  v.setUint16(34, 8, true);        // 8-bit
  str(36, "data");
  v.setUint32(40, numSamples, true);
  for (let i = 0; i < numSamples; i++) v.setUint8(44 + i, 128); // silence
  return URL.createObjectURL(new Blob([buf], { type: "audio/wav" }));
}

/** Parse "m:ss" duration string → seconds */
function parseDuration(s: string): number {
  const parts = s.split(":").map(Number);
  return parts.length === 2 ? (parts[0] * 60 + parts[1]) : (parts[0] ?? 0);
}

interface NativeVoiceNoteProps {
  /** Optional label shown above the player */
  title?: string;
  /** Duration in "m:ss" format, e.g. "0:42" */
  duration: string;
}

/**
 * Native HTML5 audio player for prototype voice-note playback.
 * Uses the browser's built-in controls — no custom waveform UI.
 */
export function NativeVoiceNote({ title, duration }: NativeVoiceNoteProps) {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    const url = createSilentWavUrl(parseDuration(duration));
    setSrc(url);
    return () => URL.revokeObjectURL(url);
  }, [duration]);

  return (
    <div
      className="rounded-xl px-4 py-3"
      style={{ background: "var(--gray-50)", border: "1.5px solid var(--gray-200)" }}
    >
      {title && (
        <p
          className="text-[12px] font-semibold mb-2 truncate"
          style={{ color: "var(--gray-700)" }}
        >
          {title}
        </p>
      )}
      {src ? (
        <audio controls src={src} style={{ width: "100%" }} />
      ) : (
        <div style={{ height: 40 }} />
      )}
    </div>
  );
}

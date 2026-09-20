"use client";

import { useMemo, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import {
  INTENTS,
  type InquiryPayload,
  type IntentId,
  type ReplyChannel,
} from "@/lib/inquiry";
import { vehicleLabel, vehicles } from "@/data/vehicles";

type Step = "closed" | "intent" | "form" | "success" | "error";

function newSubmissionId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `sub-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function InquiryWidget() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const vehicleId = searchParams.get("vehicle") ?? undefined;
  const vehicle = vehicles.find((v) => v.id === vehicleId);

  const [step, setStep] = useState<Step>("closed");
  const [intentId, setIntentId] = useState<IntentId | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [channel, setChannel] = useState<ReplyChannel>("email");
  const [message, setMessage] = useState("");
  const [consent, setConsent] = useState(false);
  const [whatsappConsent, setWhatsappConsent] = useState(false);
  const [voiceConsent, setVoiceConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [reference, setReference] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const intent = useMemo(
    () => INTENTS.find((i) => i.id === intentId) ?? null,
    [intentId],
  );

  const pageType = useMemo(() => {
    if (pathname.startsWith("/buy")) return vehicle ? "vehicle" : "buy";
    if (pathname.startsWith("/sell")) return "sell";
    if (pathname.startsWith("/finance")) return "finance";
    return "home";
  }, [pathname, vehicle]);

  function open() {
    setStep("intent");
    setErrorMsg(null);
  }

  function reset() {
    setStep("closed");
    setIntentId(null);
    setName("");
    setEmail("");
    setPhone("");
    setChannel("email");
    setMessage("");
    setConsent(false);
    setWhatsappConsent(false);
    setVoiceConsent(false);
    setReference(null);
    setErrorMsg(null);
  }

  function validate(): string | null {
    if (!intent) return "Choose how we can help.";
    if (!email.trim() && !phone.trim()) return "Provide an email or phone number.";
    if ((channel === "whatsapp" || channel === "both") && !phone.trim()) {
      return "WhatsApp requires a phone number.";
    }
    if ((channel === "email" || channel === "both") && !email.trim()) {
      return "Email channel requires an email address.";
    }
    if (!consent) return "Please agree to be contacted about this inquiry.";
    return null;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const problem = validate();
    if (problem || !intent) {
      setErrorMsg(problem);
      return;
    }

    const payload: InquiryPayload = {
      submission_id: newSubmissionId(),
      intent: intent.id,
      category_seed: intent.category,
      name: name.trim() || undefined,
      email: email.trim() || undefined,
      phone: phone.trim() || undefined,
      preferred_channel: channel,
      message: message.trim() || undefined,
      contact_consent: consent,
      whatsapp_consent: whatsappConsent && Boolean(phone.trim()),
      voice_consent: voiceConsent && Boolean(phone.trim()),
      page_context: {
        source: "alba-01-web-app",
        page_url: typeof window !== "undefined" ? window.location.href : pathname,
        page_type: pageType,
        vehicle_id: vehicle?.id,
        vehicle_name: vehicle ? vehicleLabel(vehicle) : undefined,
        submitted_at: new Date().toISOString(),
      },
    };

    setSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        reference?: string;
        error?: string;
      };
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Submission failed");
      }
      setReference(data.reference ?? "AC-PENDING");
      setStep("success");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong");
      setStep("error");
    } finally {
      setSubmitting(false);
    }
  }

  if (step === "closed") {
    return (
      <button
        type="button"
        onClick={open}
        className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-full bg-alba-accent px-5 py-3 text-sm font-medium text-alba-black shadow-lg shadow-black/40 transition hover:bg-alba-accentSoft"
        aria-label="Open ALBA CARS inquiry desk"
      >
        <span className="inline-block h-2 w-2 rounded-full bg-alba-black/80" />
        How can we help?
      </button>
    );
  }

  return (
    <div className="fixed bottom-5 right-5 z-50 flex w-[min(100vw-2rem,24rem)] flex-col overflow-hidden rounded-2xl border border-white/15 bg-alba-charcoal shadow-2xl shadow-black/50">
      <div className="flex items-center justify-between bg-alba-black px-4 py-3">
        <div>
          <p className="text-sm font-medium text-alba-white">ALBA CARS</p>
          <p className="text-xs text-alba-silver">Inquiry desk · Online</p>
        </div>
        <button
          type="button"
          onClick={reset}
          className="text-alba-silver hover:text-alba-white"
          aria-label="Close"
        >
          ✕
        </button>
      </div>

      <div className="max-h-[70vh] overflow-y-auto p-4">
        {step === "intent" && (
          <div className="space-y-3">
            <p className="font-display text-lg text-alba-white">How can ALBA CARS help?</p>
            <div className="grid gap-2">
              {INTENTS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setIntentId(item.id);
                    setStep("form");
                  }}
                  className="rounded-lg border border-white/10 bg-alba-graphite px-3 py-2.5 text-left text-sm text-alba-mist transition hover:border-alba-accent/50 hover:text-alba-white"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === "form" && intent && (
          <form onSubmit={submit} className="space-y-3">
            <button
              type="button"
              onClick={() => setStep("intent")}
              className="text-xs text-alba-silver hover:text-alba-accent"
            >
              ← Change intent
            </button>
            <p className="text-sm text-alba-accentSoft">{intent.label}</p>
            {vehicle && (
              <p className="rounded border border-alba-accent/20 bg-alba-black/40 px-2 py-1.5 text-xs text-alba-mist">
                Context: {vehicleLabel(vehicle)}
              </p>
            )}
            <label className="block text-xs text-alba-silver">
              Name (optional)
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full rounded border border-white/10 bg-alba-black px-3 py-2 text-sm text-alba-white outline-none focus:border-alba-accent/50"
              />
            </label>
            <label className="block text-xs text-alba-silver">
              Email
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded border border-white/10 bg-alba-black px-3 py-2 text-sm text-alba-white outline-none focus:border-alba-accent/50"
              />
            </label>
            <label className="block text-xs text-alba-silver">
              Phone
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+971..."
                className="mt-1 w-full rounded border border-white/10 bg-alba-black px-3 py-2 text-sm text-alba-white outline-none focus:border-alba-accent/50"
              />
            </label>
            <fieldset className="space-y-1">
              <legend className="text-xs text-alba-silver">Preferred reply</legend>
              {(["email", "whatsapp", "both"] as ReplyChannel[]).map((c) => (
                <label key={c} className="flex items-center gap-2 text-sm text-alba-mist">
                  <input
                    type="radio"
                    name="channel"
                    checked={channel === c}
                    onChange={() => setChannel(c)}
                  />
                  {c}
                </label>
              ))}
            </fieldset>
            <label className="block text-xs text-alba-silver">
              Message
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                placeholder={intent.prompt}
                className="mt-1 w-full rounded border border-white/10 bg-alba-black px-3 py-2 text-sm text-alba-white outline-none focus:border-alba-accent/50"
              />
            </label>
            <label className="flex items-start gap-2 text-xs text-alba-silver">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-0.5"
              />
              ALBA CARS may contact me about this inquiry.
            </label>
            <label className="flex items-start gap-2 text-xs text-alba-silver">
              <input
                type="checkbox"
                checked={whatsappConsent}
                onChange={(e) => setWhatsappConsent(e.target.checked)}
                className="mt-0.5"
                disabled={!phone.trim()}
              />
              WhatsApp messages OK (requires phone)
            </label>
            <label className="flex items-start gap-2 text-xs text-alba-silver">
              <input
                type="checkbox"
                checked={voiceConsent}
                onChange={(e) => setVoiceConsent(e.target.checked)}
                className="mt-0.5"
                disabled={!phone.trim()}
              />
              Automated voice-agent call OK (requires phone)
            </label>
            {errorMsg && <p className="text-xs text-red-400">{errorMsg}</p>}
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-lg bg-alba-accent py-2.5 text-sm font-medium text-alba-black disabled:opacity-60"
            >
              {submitting ? "Sending…" : "Send inquiry"}
            </button>
          </form>
        )}

        {step === "success" && (
          <div className="space-y-3 text-sm text-alba-mist">
            <p className="font-display text-lg text-alba-white">We received your inquiry</p>
            <p>
              Reference{" "}
              <span className="font-medium text-alba-accentSoft">{reference}</span>
            </p>
            <p>
              A sales specialist will follow up on your preferred channel. You can also book a
              time when we share the appointment link in your confirmation.
            </p>
            <button
              type="button"
              onClick={reset}
              className="w-full rounded-lg border border-white/15 py-2 text-alba-white"
            >
              Close
            </button>
          </div>
        )}

        {step === "error" && (
          <div className="space-y-3 text-sm">
            <p className="text-red-400">{errorMsg ?? "Submission failed"}</p>
            <button
              type="button"
              onClick={() => setStep("form")}
              className="w-full rounded-lg bg-alba-accent py-2 text-alba-black"
            >
              Try again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

import type { Metadata } from "next";
import { ToolIntro } from "@/components/ToolIntro";
import { SectionsTool, type FieldConfig } from "@/components/SectionsTool";
import { FOLLOWUP_TYPES, TONES } from "@/lib/ai/schemas";

export const metadata: Metadata = { title: "Follow-Up Message Generator | VA Career Launch AI" };

const FIELDS: FieldConfig[] = [
  { name: "messageType", label: "Message type", type: "select", required: true, options: FOLLOWUP_TYPES, half: true },
  { name: "tone", label: "Tone", type: "select", required: true, options: TONES, defaultValue: "Professional", half: true },
  { name: "jobTitle", label: "Job title or project", type: "text", required: true, placeholder: "e.g. Part-time Admin VA" },
  { name: "clientName", label: "Client name", type: "text", placeholder: "e.g. Sarah", half: true },
  { name: "firstName", label: "Your first name (for sign-off)", type: "text", placeholder: "e.g. Maria", half: true },
  { name: "details", label: "Details", type: "textarea", required: true, rows: 5, placeholder: "e.g. Applied on Upwork last Monday. Interviewed on Zoom on Nov 5; we discussed managing her inbox and weekly reports. I'm available Mon–Fri, 9am–5pm EST, and can start Dec 1.", hint: "Include when you applied or interviewed, what was discussed, and your availability." },
];

export default function FollowUpPage() {
  return (
    <>
      <ToolIntro
        icon="💬"
        title="Follow-Up Message Generator"
        description="Write polite, professional follow-ups and availability messages."
        steps={[
          "Choose the type of message and the tone.",
          "Add the job title and the real details (dates, what was discussed, your availability).",
          "Click “Write my message”.",
          "Pick the short, standard, or email version, edit it, and copy.",
        ]}
      />
      <SectionsTool tool="followup" fields={FIELDS} submitLabel="Write my message" documentTitle="Follow-Up Message" />
    </>
  );
}

import type { Metadata } from "next";
import { ToolIntro } from "@/components/ToolIntro";
import { SectionsTool, type FieldConfig } from "@/components/SectionsTool";
import { TONES } from "@/lib/ai/schemas";

export const metadata: Metadata = { title: "Job Application Assistant | VA Career Launch AI" };

const FIELDS: FieldConfig[] = [
  { name: "jobDescription", label: "Job description", type: "textarea", required: true, rows: 7, placeholder: "Paste the full job post here." },
  { name: "clientQuestions", label: "Client questions", type: "textarea", rows: 5, placeholder: "e.g.\n1. Why should we hire you?\n2. What is your experience with Shopify?\n3. What are your working hours?", hint: "Paste any screening questions from the job post or application form." },
  { name: "experience", label: "Your experience", type: "textarea", required: true, rows: 4, placeholder: "e.g. 3 years as an admin assistant at a clinic: scheduling, patient records, answering calls" },
  { name: "skills", label: "Your skills", type: "textarea", required: true, rows: 3, placeholder: "e.g. Calendar management, data entry, Google Workspace, email support" },
  { name: "tone", label: "Tone", type: "select", required: true, options: TONES, defaultValue: "Professional", half: true },
  { name: "firstName", label: "Your first name (for sign-off)", type: "text", placeholder: "e.g. Maria", half: true },
];

export default function ApplicationPage() {
  return (
    <>
      <ToolIntro
        icon="📝"
        title="Job Application Assistant"
        description="Prepare honest, personalized answers, introductions, and an application email."
        steps={[
          "Paste the job description and any questions the client asked.",
          "Describe your real experience and skills.",
          "Click “Prepare my application”.",
          "Edit, then copy each answer into the application form.",
        ]}
      />
      <SectionsTool tool="application" fields={FIELDS} submitLabel="Prepare my application" documentTitle="Job Application" />
    </>
  );
}

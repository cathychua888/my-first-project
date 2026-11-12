import type { Metadata } from "next";
import { ToolIntro } from "@/components/ToolIntro";
import { SectionsTool, type FieldConfig } from "@/components/SectionsTool";

export const metadata: Metadata = { title: "Interview Preparation | VA Career Launch AI" };

const FIELDS: FieldConfig[] = [
  { name: "jobTitle", label: "Job title", type: "text", required: true, placeholder: "e.g. Executive Virtual Assistant" },
  { name: "jobDescription", label: "Job description", type: "textarea", rows: 6, placeholder: "Paste the job post for job-specific questions." },
  { name: "experience", label: "Your experience", type: "textarea", required: true, rows: 4, placeholder: "e.g. 2 years as an office admin, handled scheduling for 3 managers" },
  { name: "skills", label: "Your skills", type: "textarea", required: true, rows: 3, placeholder: "e.g. Calendar management, travel booking, Google Workspace" },
];

export default function InterviewPage() {
  return (
    <>
      <ToolIntro
        icon="🎤"
        title="Interview Preparation Assistant"
        description="Practice with common and job-specific questions, and prepare answers based on your real experience."
        steps={[
          "Enter the job title and, if you have it, the job description.",
          "Describe your real experience and skills.",
          "Click “Prepare me for the interview”.",
          "Practice the answers out loud and personalize them with your own examples.",
        ]}
      />
      <SectionsTool tool="interview" fields={FIELDS} submitLabel="Prepare me for the interview" documentTitle="Interview Prep" />
    </>
  );
}

import type { Metadata } from "next";
import { ToolIntro } from "@/components/ToolIntro";
import { SectionsTool, type FieldConfig } from "@/components/SectionsTool";

export const metadata: Metadata = { title: "Job Description Analyzer | VA Career Launch AI" };

const FIELDS: FieldConfig[] = [
  { name: "jobPost", label: "Job post", type: "textarea", required: true, rows: 10, placeholder: "Paste the full job post here." },
  { name: "userSkills", label: "Your skills", type: "textarea", rows: 3, placeholder: "e.g. Email management, Canva, customer support, Google Sheets", hint: "Add these to see which requirements you already match." },
  { name: "userExperience", label: "Your experience", type: "textarea", rows: 3, placeholder: "e.g. 2 years in BPO customer service, 6 months freelance social media" },
];

export default function AnalyzerPage() {
  return (
    <>
      <ToolIntro
        icon="🔍"
        title="Job Description Analyzer"
        description="Understand exactly what the client is looking for before you apply."
        steps={[
          "Paste the full job post.",
          "Optionally add your skills and experience to see your matches and gaps.",
          "Click “Analyze job post”.",
          "Use the keywords and tips to tailor your resume and proposal. This analysis does not predict whether you will be hired.",
        ]}
      />
      <SectionsTool tool="analyzer" fields={FIELDS} submitLabel="Analyze job post" documentTitle="Job Analysis" />
    </>
  );
}

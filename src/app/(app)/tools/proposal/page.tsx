import type { Metadata } from "next";
import { ToolIntro } from "@/components/ToolIntro";
import { SectionsTool, type FieldConfig } from "@/components/SectionsTool";
import { TONES } from "@/lib/ai/schemas";

export const metadata: Metadata = { title: "VA Proposal Generator | VA Career Launch AI" };

const FIELDS: FieldConfig[] = [
  { name: "jobTitle", label: "Job title", type: "text", required: true, placeholder: "e.g. Social Media Virtual Assistant" },
  { name: "jobDescription", label: "Job description", type: "textarea", required: true, rows: 7, placeholder: "Paste the full job post here.", hint: "Copy and paste the whole job post from Upwork, OnlineJobs.ph, LinkedIn, etc." },
  { name: "clientRequirements", label: "Client requirements", type: "textarea", rows: 3, placeholder: "e.g. Must be available 9am–1pm EST, experience with Canva, weekly reports" },
  { name: "relevantExperience", label: "Your relevant experience", type: "textarea", required: true, rows: 4, placeholder: "e.g. 2 years as a customer service rep at a BPO; managed my cousin's online shop Facebook page for 6 months" },
  { name: "skills", label: "Your skills", type: "textarea", required: true, rows: 3, placeholder: "e.g. Writing captions, scheduling posts, replying to messages, basic graphic design" },
  { name: "tools", label: "Tools you have used", type: "text", placeholder: "e.g. Canva, Meta Business Suite, Google Sheets" },
  { name: "tone", label: "Proposal tone", type: "select", required: true, options: TONES, defaultValue: "Professional", half: true },
  { name: "firstName", label: "Your first name (for sign-off)", type: "text", placeholder: "e.g. Maria", half: true },
];

export default function ProposalPage() {
  return (
    <>
      <ToolIntro
        icon="✉️"
        title="VA Proposal Generator"
        description="Create personalized proposals that reference the client's actual needs and your real qualifications."
        steps={[
          "Paste the job title and full job description.",
          "Describe your real experience, skills, and tools.",
          "Choose a tone and click “Generate proposals”.",
          "Edit and copy the version you need. Replace anything in [square brackets] before sending.",
        ]}
      />
      <SectionsTool tool="proposal" fields={FIELDS} submitLabel="Generate proposals" documentTitle="VA Proposal" />
    </>
  );
}

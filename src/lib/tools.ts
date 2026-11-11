export type ToolId =
  | "resume"
  | "proposal"
  | "application"
  | "analyzer"
  | "interview"
  | "followup";

export interface ToolInfo {
  id: ToolId;
  name: string;
  href: string;
  description: string;
  icon: string;
}

export const TOOLS: ToolInfo[] = [
  {
    id: "resume",
    name: "VA Resume Builder",
    href: "/tools/resume",
    description:
      "Answer simple questions and get an ATS-friendly VA resume you can edit and download as PDF or Word.",
    icon: "📄",
  },
  {
    id: "proposal",
    name: "VA Proposal Generator",
    href: "/tools/proposal",
    description:
      "Write Upwork proposals, direct client pitches, and cover letters based on the actual job post.",
    icon: "✉️",
  },
  {
    id: "application",
    name: "Job Application Assistant",
    href: "/tools/application",
    description:
      "Answer client questions, write your introduction, and draft your application email.",
    icon: "📝",
  },
  {
    id: "analyzer",
    name: "Job Description Analyzer",
    href: "/tools/job-analyzer",
    description:
      "Paste a job post to see the skills, tools, and keywords the client is looking for.",
    icon: "🔍",
  },
  {
    id: "interview",
    name: "Interview Preparation Assistant",
    href: "/tools/interview",
    description:
      "Practice common and job-specific VA interview questions with answers based on your real experience.",
    icon: "🎤",
  },
  {
    id: "followup",
    name: "Follow-Up Message Generator",
    href: "/tools/follow-up",
    description:
      "Write polite follow-ups, thank-you notes, and availability messages in the tone you choose.",
    icon: "💬",
  },
];

import type { Metadata } from "next";
import { ToolIntro } from "@/components/ToolIntro";
import { ResumeBuilder } from "@/components/resume/ResumeBuilder";

export const metadata: Metadata = { title: "VA Resume Builder | VA Career Launch AI" };

export default function ResumePage() {
  return (
    <>
      <ToolIntro
        icon="📄"
        title="VA Resume Builder"
        description="Answer a few simple questions and get a professional, ATS-friendly VA resume."
        steps={[
          "Choose Beginner (no VA experience yet) or Experienced (you have VA or freelance experience).",
          "Answer the questions in each step. Only include true information.",
          "Click “Generate my resume”, then review and edit the result.",
          "Download your resume as PDF or Word.",
        ]}
      />
      <ResumeBuilder />
    </>
  );
}

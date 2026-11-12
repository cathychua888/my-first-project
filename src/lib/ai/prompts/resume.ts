import type { ResumeInput } from "../schemas";
import { userBlock } from "./shared";

export function buildResumePrompt(input: ResumeInput): string {
  const modeInstructions =
    input.mode === "beginner"
      ? `MODE: Beginner VA resume. The user has no previous paid VA experience.
- Do not describe them as an experienced VA. Use a headline such as "Aspiring Virtual Assistant | [their niche]" or "Administrative Professional Transitioning to Virtual Assistance".
- Lead with transferable skills from their previous job. Show how those tasks relate to VA work.
- The experience section lists their previous job(s) only, described with VA-relevant, achievement-focused bullets based on their real responsibilities.`
      : `MODE: Experienced VA resume. The user has freelance or VA experience.
- Put their VA / freelance experience first in the experience section, then previous non-VA roles.
- Use their real clients, tasks, and durations exactly as given. If client names are not given, use a neutral label such as "Freelance Virtual Assistant" with the organization "Self-employed / Various clients".`;

  return `<task>resume</task>
Create the content for an ATS-friendly virtual assistant resume.

${modeInstructions}

Generate:
- "headline": one line, under 12 words.
- "summary": 3-4 sentences, first person implied (no "I"), tailored to the preferred niche and target client.
- "skills": 3-5 categories (for example "Administrative Support", "Social Media", "Customer Service", "Technical", "Tools & Software"), each with items taken only from what the user listed. Omit categories with no items.
- "experience": one entry per role the user described, with "role", "organization", "duration", and 3-6 achievement-focused bullets that start with strong action verbs. Only include numbers the user provided.
- "education": lines describing their education exactly as provided.
- "certifications": only certifications or trainings the user listed (empty array if none).
- "transferableSkills": 4-8 short phrases showing transferable strengths grounded in their background.
- "missingInfo": specific questions for details that would strengthen the resume (for example measurable results, dates, or tools), without inventing answers.

${userBlock({
  "Resume mode": input.mode,
  "Previous job title": input.previousJobTitle,
  "Company or industry": input.companyOrIndustry,
  "Work responsibilities": input.responsibilities,
  "Work experience duration": input.experienceDuration,
  "Educational background": input.education,
  "VA / freelance experience": input.vaExperience,
  "Achievements (user-provided)": input.achievements,
  "Certifications or trainings (user-provided)": input.certifications,
  "Administrative skills": input.adminSkills,
  "Social media skills": input.socialMediaSkills,
  "Customer service skills": input.customerServiceSkills,
  "Technical skills": input.technicalSkills,
  "Software and tools used": input.tools,
  "Preferred VA niche": input.niche,
  "Target client": input.targetClient,
  "Preferred job type": input.jobType,
})}`;
}

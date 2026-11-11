import type { AnalyzerInput } from "../schemas";
import { SECTIONS_FORMAT_NOTE, userBlock } from "./shared";

export function buildAnalyzerPrompt(input: AnalyzerInput): string {
  const hasProfile =
    input.userSkills.trim().length > 0 || input.userExperience.trim().length > 0;
  return `<task>analyzer</task>
Analyze this job post for a virtual assistant applicant. Use "- " bullet lines inside each section. Only list things that are actually stated or clearly implied in the job post.

Sections (titles must match exactly):
1. "Required Skills"
2. "Preferred Skills" — nice-to-have skills. Write "- None clearly mentioned" if there are none.
3. "Tools Mentioned" — software, apps, and platforms named in the post.
4. "Main Responsibilities"
5. "Experience Requirements" — years, industries, or types of experience requested. Write "- Not specified" if none.
6. "Important Keywords" — 8-15 keywords and phrases from the post.
7. "Skills You Already Have" — ${
    hasProfile
      ? "match the user's skills and experience to the job requirements. Only list matches supported by what the user wrote."
      : '"- Add your skills and experience above, then analyze again to see your matches."'
  }
8. "Skills To Develop" — ${
    hasProfile
      ? "requirements from the job post that the user did not mention, with a short practical tip for each (for example a free way to learn or practice it)."
      : "the job's key requirements, each with a short practical tip for learning it."
  }
9. "Resume Keywords" — keywords to naturally include in a resume for this job, but only if they truthfully match the user's experience.
10. "Tailoring Tips" — 4-6 specific suggestions for tailoring the application to this job.

Do not predict or guarantee whether the user will get the job.

${SECTIONS_FORMAT_NOTE}

${userBlock({
  "Job post": input.jobPost,
  "User's skills": input.userSkills,
  "User's experience": input.userExperience,
})}`;
}

import type { Metadata } from "next";
import Link from "next/link";
import { TOOLS } from "@/lib/tools";
import { cardClass } from "@/lib/ui";

export const metadata: Metadata = { title: "Dashboard | VA Career Launch AI" };

export default function DashboardPage() {
  return (
    <div>
      <section className="rounded-3xl bg-gradient-to-br from-brand-100 to-brand-50 p-6 sm:p-10">
        <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
          Welcome to VA Career Launch AI!
        </h1>
        <p className="mt-2 max-w-2xl text-muted">
          Your personal assistant for starting and growing your VA career.
        </p>
        <div className="mt-6 rounded-2xl bg-white/80 p-4 text-sm">
          <p className="font-semibold text-brand-800">New here? Try this order:</p>
          <ol className="mt-2 list-decimal space-y-1 pl-5 text-muted">
            <li>Build your resume with the <strong className="text-ink">VA Resume Builder</strong>.</li>
            <li>Paste a job post into the <strong className="text-ink">Job Description Analyzer</strong> to see what the client wants.</li>
            <li>Write your proposal with the <strong className="text-ink">VA Proposal Generator</strong>.</li>
          </ol>
        </div>
      </section>

      <h2 className="mt-10 text-lg font-bold">Your tools</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {TOOLS.map((tool) => (
          <Link
            key={tool.id}
            href={tool.href}
            className={`${cardClass} group flex flex-col p-6 transition-shadow hover:border-brand-300 hover:shadow-md`}
          >
            <span aria-hidden className="grid h-12 w-12 place-items-center rounded-xl bg-brand-50 text-2xl">
              {tool.icon}
            </span>
            <h3 className="mt-4 font-semibold text-ink">{tool.name}</h3>
            <p className="mt-2 flex-1 text-sm text-muted">{tool.description}</p>
            <span className="mt-4 text-sm font-semibold text-brand-700 group-hover:underline">
              Open tool →
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}

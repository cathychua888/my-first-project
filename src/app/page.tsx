import Link from "next/link";
import { Logo } from "@/components/Logo";
import { Footer } from "@/components/Footer";
import { TOOLS } from "@/lib/tools";
import { PRICING, formatPeso } from "@/lib/pricing";
import { btn, cardClass } from "@/lib/ui";

const PROBLEMS = [
  {
    title: "“I don’t have VA experience yet.”",
    body: "It’s hard to know how your past job in retail, BPO, teaching, or admin work translates into VA skills clients look for.",
  },
  {
    title: "Writing proposals takes forever",
    body: "Every job post needs a fresh, personalized proposal, and generic templates get ignored by clients.",
  },
  {
    title: "Not sure what clients really want",
    body: "Long job posts are full of tools, requirements, and keywords. It’s easy to miss what matters most.",
  },
  {
    title: "Interview nerves",
    body: "Talking to international clients for the first time can feel intimidating without practice.",
  },
];

const STEPS = [
  {
    n: "1",
    title: "Tell us about yourself",
    body: "Answer simple questions about your background, skills, and the VA work you want. No technical knowledge needed.",
  },
  {
    n: "2",
    title: "Let AI write the first draft",
    body: "Get a resume, proposal, or application answers based only on the information you provided.",
  },
  {
    n: "3",
    title: "Review, edit, and send",
    body: "Edit everything, copy it with one click, or download your resume as PDF or Word.",
  },
];

const BENEFITS = [
  "Honest by design: it never invents experience, certifications, or results",
  "Tailored to the actual job post, not a one-size-fits-all template",
  "ATS-friendly resume layout that applicant systems can read",
  "Works on your phone, tablet, or laptop",
  "Simple instructions written for beginners",
  "Your answers are not saved in a database by this app",
];

const FAQS = [
  {
    q: "Do I need VA experience to use this?",
    a: "No. The Resume Builder has a Beginner mode that highlights transferable skills from your previous jobs, studies, or other work, without pretending you have VA experience.",
  },
  {
    q: "Will the AI make up experience to make me look better?",
    a: "No. The AI is instructed to use only the information you give it. If something important is missing, it asks you for the details or leaves a clearly marked [placeholder] for you to fill in.",
  },
  {
    q: "Does this guarantee that I will get hired?",
    a: "No tool can guarantee that. VA Career Launch AI helps you present your real skills clearly and professionally, which can help you apply with more confidence.",
  },
  {
    q: "Can I edit what the AI writes?",
    a: "Yes. Every result appears in an editable text box. You can change anything, copy it, regenerate it, or start over.",
  },
  {
    q: "What file formats can I download?",
    a: "Your resume can be downloaded as a PDF or as an editable Word (.docx) file. Proposals and other results can be copied or downloaded as Word or text files.",
  },
  {
    q: "Is my personal information stored?",
    a: "This app does not save your answers in a database. Your resume contact details (name, email, phone) stay in your browser and are not sent to the AI. Other text you type is sent securely to our AI provider only to create your results. Download or copy your work before closing the page.",
  },
  {
    q: "How much does it cost?",
    a: `The planned Founding User price is ${formatPeso(PRICING.foundingPrice)} and the regular price is ${formatPeso(PRICING.regularPrice)}. Online checkout is not open yet.`,
  },
];

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-brand-100 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Logo />
          <nav className="hidden items-center gap-6 text-sm font-semibold text-muted md:flex">
            <a href="#how-it-works" className="hover:text-brand-700">How it works</a>
            <a href="#features" className="hover:text-brand-700">Features</a>
            <a href="#pricing" className="hover:text-brand-700">Pricing</a>
            <a href="#faq" className="hover:text-brand-700">FAQ</a>
          </nav>
          <Link href="/dashboard" className={btn.primary}>
            Get Started
          </Link>
        </div>
      </header>

      <main>
        {/* 1. Hero */}
        <section className="bg-gradient-to-b from-brand-100 via-brand-50 to-canvas">
          <div className="mx-auto max-w-6xl px-4 py-16 text-center sm:py-24">
            <p className="mx-auto mb-4 inline-block rounded-full border border-brand-200 bg-white px-4 py-1 text-xs font-semibold text-brand-700">
              Your AI-powered assistant for building a professional VA career
            </p>
            <h1 className="mx-auto max-w-3xl text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
              Start Your VA Career With{" "}
              <span className="text-brand-600">Confidence.</span>
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base text-muted sm:text-lg">
              Create your professional resume, write personalized proposals, and prepare job
              applications with your AI-powered career assistant.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/tools/resume" className={`${btn.primary} w-full px-6 py-3 text-base sm:w-auto`}>
                Build My VA Resume
              </Link>
              <Link href="/dashboard" className={`${btn.secondary} w-full px-6 py-3 text-base sm:w-auto`}>
                See All Tools
              </Link>
            </div>
          </div>
        </section>

        {/* 2. Problems */}
        <section className="mx-auto max-w-6xl px-4 py-16">
          <h2 className="text-center text-2xl font-bold sm:text-3xl">Starting as a VA can feel overwhelming</h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-muted">
            Many aspiring Filipino VAs face the same challenges when applying for their first clients.
          </p>
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {PROBLEMS.map((p) => (
              <div key={p.title} className={`${cardClass} p-6`}>
                <h3 className="font-semibold text-ink">{p.title}</h3>
                <p className="mt-2 text-sm text-muted">{p.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 3. How it works */}
        <section id="how-it-works" className="scroll-mt-20 bg-white py-16">
          <div className="mx-auto max-w-6xl px-4">
            <h2 className="text-center text-2xl font-bold sm:text-3xl">How VA Career Launch AI works</h2>
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {STEPS.map((s) => (
                <div key={s.n} className="rounded-2xl bg-brand-50 p-6">
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-brand-600 font-bold text-white">
                    {s.n}
                  </span>
                  <h3 className="mt-4 font-semibold">{s.title}</h3>
                  <p className="mt-2 text-sm text-muted">{s.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 4. Features */}
        <section id="features" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-16">
          <h2 className="text-center text-2xl font-bold sm:text-3xl">Six tools for every step of your application</h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {TOOLS.map((t) => (
              <div key={t.id} className={`${cardClass} p-6`}>
                <span aria-hidden className="text-2xl">{t.icon}</span>
                <h3 className="mt-3 font-semibold">{t.name}</h3>
                <p className="mt-2 text-sm text-muted">{t.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 5. Benefits */}
        <section className="bg-white py-16">
          <div className="mx-auto grid max-w-6xl gap-10 px-4 md:grid-cols-2 md:items-center">
            <div>
              <h2 className="text-2xl font-bold sm:text-3xl">Built to help you apply honestly and professionally</h2>
              <p className="mt-3 text-muted">
                Clients value trust. Every result is based on your real background, so you can
                confidently stand behind every word you send.
              </p>
            </div>
            <ul className="space-y-3">
              {BENEFITS.map((b) => (
                <li key={b} className="flex gap-3 rounded-xl bg-brand-50 p-4 text-sm">
                  <span aria-hidden className="font-bold text-brand-600">✓</span>
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* 6. Pricing */}
        <section id="pricing" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-16">
          <h2 className="text-center text-2xl font-bold sm:text-3xl">Simple pricing</h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-muted">
            One plan with access to all six tools.
          </p>
          <div className="mx-auto mt-10 grid max-w-3xl gap-6 md:grid-cols-2">
            <div className="relative rounded-2xl border-2 border-brand-500 bg-white p-8 shadow-md">
              <span className="absolute -top-3 left-6 rounded-full bg-brand-600 px-3 py-1 text-xs font-semibold text-white">
                Limited offer
              </span>
              <h3 className="font-semibold text-brand-700">{PRICING.foundingLabel}</h3>
              <p className="mt-3 text-4xl font-extrabold">{formatPeso(PRICING.foundingPrice)}</p>
              <p className="mt-2 text-sm text-muted">For our earliest users.</p>
            </div>
            <div className={`${cardClass} p-8`}>
              <h3 className="font-semibold text-muted">{PRICING.regularLabel}</h3>
              <p className="mt-3 text-4xl font-extrabold text-ink">{formatPeso(PRICING.regularPrice)}</p>
              <p className="mt-2 text-sm text-muted">Standard price after the founding offer ends.</p>
            </div>
          </div>
          <ul className="mx-auto mt-8 grid max-w-3xl gap-2 text-sm sm:grid-cols-2">
            {TOOLS.map((t) => (
              <li key={t.id} className="flex gap-2">
                <span aria-hidden className="text-brand-600">✓</span> {t.name}
              </li>
            ))}
          </ul>
          <p className="mx-auto mt-6 max-w-xl text-center text-xs text-muted">
            Online checkout is not open yet. Pricing is shown so you know what to expect.
          </p>
        </section>

        {/* 7. FAQ */}
        <section id="faq" className="scroll-mt-20 bg-white py-16">
          <div className="mx-auto max-w-3xl px-4">
            <h2 className="text-center text-2xl font-bold sm:text-3xl">Frequently asked questions</h2>
            <div className="mt-8 space-y-3">
              {FAQS.map((f) => (
                <details key={f.q} className="group rounded-xl border border-brand-100 bg-canvas p-4">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold">
                    {f.q}
                    <span aria-hidden className="text-brand-600 transition-transform group-open:rotate-45">+</span>
                  </summary>
                  <p className="mt-3 text-sm text-muted">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* 8. Final CTA */}
        <section className="mx-auto max-w-6xl px-4 py-16">
          <div className="rounded-3xl bg-gradient-to-br from-brand-600 to-brand-800 px-6 py-12 text-center text-white sm:px-12">
            <h2 className="text-2xl font-bold sm:text-3xl">Ready to take the first step?</h2>
            <p className="mx-auto mt-3 max-w-xl text-brand-100">
              Build your VA resume in minutes and start applying with confidence.
            </p>
            <Link
              href="/tools/resume"
              className="mt-8 inline-flex items-center justify-center rounded-xl bg-white px-6 py-3 font-semibold text-brand-700 hover:bg-brand-50"
            >
              Start My VA Resume
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

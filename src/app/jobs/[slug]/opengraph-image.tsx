import { ImageResponse } from "next/og";
import { createClient } from "@supabase/supabase-js";

export const alt = "Job opening on CryptoValley.jobs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

async function getJob(slug: string) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { data } = await supabase
    .from("jobs")
    .select("title, job_type, location, location_type, company:companies(name)")
    .eq("slug", slug)
    .single();
  return data as {
    title: string;
    job_type: string;
    location: string | null;
    location_type: string;
    company: { name: string } | null;
  } | null;
}

export default async function JobOpengraphImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const job = await getJob(slug);

  const title = job?.title ?? "Crypto & Blockchain Jobs";
  const company = job?.company?.name ?? "CryptoValley.jobs";
  const facts = job
    ? [job.job_type, job.location ?? job.location_type].filter(Boolean)
    : [];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 55%, #4338ca 100%)",
          color: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 30,
            fontWeight: 700,
            color: "#a5b4fc",
          }}
        >
          {company}
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 28,
          }}
        >
          <div
            style={{
              fontSize: title.length > 50 ? 56 : 68,
              fontWeight: 800,
              lineHeight: 1.1,
            }}
          >
            {title}
          </div>
          {facts.length > 0 && (
            <div style={{ display: "flex", gap: 16 }}>
              {facts.map((fact) => (
                <div
                  key={fact}
                  style={{
                    display: "flex",
                    fontSize: 26,
                    color: "#c7d2fe",
                    background: "rgba(99, 102, 241, 0.25)",
                    border: "1px solid rgba(165, 180, 252, 0.4)",
                    borderRadius: 999,
                    padding: "10px 24px",
                    textTransform: "capitalize",
                  }}
                >
                  {fact}
                </div>
              ))}
            </div>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <svg width="44" height="44" viewBox="0 0 64 64">
            <rect width="64" height="64" rx="14" fill="#6366f1" />
            <circle cx="45" cy="18" r="5.5" fill="#fbbf24" />
            <path
              d="M11 47 L26 21 L34 35 L40 26 L53 47 Z"
              fill="#ffffff"
              opacity="0.96"
            />
          </svg>
          <div style={{ display: "flex", fontSize: 28, fontWeight: 700 }}>
            <span style={{ color: "#a5b4fc" }}>Crypto</span>
            <span>Valley</span>
            <span style={{ color: "#818cf8" }}>.jobs</span>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}

import type { Metadata } from "next";
import { getAllCompanies } from "@/lib/supabase/queries";
import { CompanyCard } from "@/components/companies/company-card";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://cryptovalley.jobs";

export const metadata: Metadata = {
  title: "Companies",
  description:
    "Explore blockchain and crypto companies hiring in Switzerland's Crypto Valley.",
  alternates: { canonical: `${BASE_URL}/companies` },
  openGraph: {
    title: "Crypto & Blockchain Companies in Switzerland | CryptoValley.jobs",
    description:
      "Explore blockchain and crypto companies hiring in Switzerland's Crypto Valley.",
    url: `${BASE_URL}/companies`,
  },
};

export default async function CompaniesPage() {
  const companies = (await getAllCompanies()).sort(
    (a, b) => b.job_count - a.job_count || a.name.localeCompare(b.name)
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <h1 className="text-3xl font-extrabold tracking-tight">Companies</h1>
      <p className="mt-2 text-muted-foreground">
        Explore crypto and blockchain companies hiring in Switzerland.
      </p>

      {companies.length > 0 ? (
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {companies.map((company) => (
            <CompanyCard key={company.id} company={company} />
          ))}
        </div>
      ) : (
        <p className="mt-8 text-muted-foreground">
          No companies listed yet.
        </p>
      )}
    </div>
  );
}

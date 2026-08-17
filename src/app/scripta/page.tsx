import type { Metadata } from "next";
import ScriptaLanding, { type LandingPost } from "../components/scripta/ScriptaLanding";
import { getAllPosts } from "./content";

export const metadata: Metadata = {
  title: "Scripta — 02-davinci-01",
  description:
    "Technical writing by Vedant Nagwanshi — systems, architecture, and the occasional essay on craft.",
  openGraph: {
    title: "Scripta — 02-davinci-01",
    description:
      "Technical writing by Vedant Nagwanshi — systems, architecture, and the occasional essay on craft.",
    type: "website",
    url: "https://02-davinci-01.vercel.app/scripta",
  },
};

export default function ScriptaIndexPage() {
  const summaries: LandingPost[] = getAllPosts().map((p) => ({
    num: p.num,
    slug: p.slug,
    kind: p.kind,
    title: p.title,
    dek: p.dek,
    date: p.date,
    year: p.year,
    readTime: p.readTime,
    tags: p.tags,
    schematic: p.schematic,
  }));

  return <ScriptaLanding posts={summaries} />;
}

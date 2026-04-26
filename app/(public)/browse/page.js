import { BrowseSuspenseWrapper } from "./BrowseClient";

export const metadata = {
  title: "Browse Notes — Architectural Academy",
  description:
    "Explore our curated collection of premium handwritten academic notes across all subjects and levels.",
};

export default function BrowsePage() {
  return <BrowseSuspenseWrapper />;
}

import { SectionHeader } from "@/components/ui/section-header";

export function PlaceholderPage({
  title,
  description,
  items
}: {
  title: string;
  description: string;
  items: string[];
}) {
  return (
    <main className="space-y-6">
      <section className="hero-panel rounded-lg p-6">
        <SectionHeader title={title} description={description} />
      </section>
      <div className="grid gap-3 md:grid-cols-3">
        {items.map((item) => (
          <div key={item} className="page-panel rounded-lg p-4 text-sm">
            {item}
          </div>
        ))}
      </div>
    </main>
  );
}

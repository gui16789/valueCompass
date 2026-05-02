export function SectionHeader({
  title,
  description
}: {
  title: string;
  description?: string;
}) {
  return (
    <div>
      <h2 className="text-2xl font-semibold tracking-normal text-foreground">{title}</h2>
      {description ? <p className="mt-2 text-sm text-muted-foreground">{description}</p> : null}
    </div>
  );
}

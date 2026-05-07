export function SectionHeader({
  title,
  description
}: {
  title: string;
  description?: string;
}) {
  return (
    <div>
      <div className="flex items-center gap-2">
        <span className="h-5 w-1 rounded-full bg-primary" aria-hidden />
        <h2 className="text-2xl font-semibold tracking-normal text-foreground">{title}</h2>
      </div>
      {description ? <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">{description}</p> : null}
    </div>
  );
}

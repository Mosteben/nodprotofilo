export function AdminPageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
      <div className="min-w-0">
        <h1 className="font-display text-3xl md:text-4xl text-navy break-words">{title}</h1>
        {description && <p className="font-ui text-sm text-navy/60 mt-2 break-words">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-3">{actions}</div>}
    </div>
  );
}

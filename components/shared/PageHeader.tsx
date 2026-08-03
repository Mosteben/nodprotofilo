export function PageHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <section className="bg-navy-fade text-white py-20 md:py-28">
      <div className="container-narrow text-center">
        <span className="marginalia text-gold-light mb-4 inline-block">— {eyebrow}</span>
        <h1 className="font-display text-4xl md:text-5xl mb-4">{title}</h1>
        <p className="text-white/70 text-lg leading-relaxed">{description}</p>
      </div>
    </section>
  );
}

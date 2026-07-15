export function InformationPage({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <main>
      <section className="border-b bg-secondary/70"><div className="mx-auto max-w-5xl px-4 py-14 sm:px-6 lg:px-8"><p className="text-sm font-bold uppercase tracking-[.16em] text-accent">{eyebrow}</p><h1 className="mt-2 max-w-4xl font-serif text-4xl leading-tight sm:text-5xl">{title}</h1><p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground">{description}</p></div></section>
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">{children}</div>
    </main>
  );
}

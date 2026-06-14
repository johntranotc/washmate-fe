export function AuthHeading({ title, description }) {
  return (
    <div className="mb-8">
      <h1 className="text-balance text-3xl font-extrabold tracking-tight text-foreground">{title}</h1>
      <p className="mt-2 text-pretty leading-relaxed text-muted-foreground">{description}</p>
    </div>
  );
}

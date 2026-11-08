export function Notice({ error, ok }: { error?: string; ok?: string }) {
  if (!error && !ok) return null;
  return <p className={error ? "notice error" : "notice ok"}>{error || ok}</p>;
}

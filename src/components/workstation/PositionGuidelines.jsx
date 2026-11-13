export default function PositionGuidelines({ projection }) {
  return <section className="border-t border-border bg-ws-surface p-3">
    <div className="flex justify-between gap-2"><h3 className="text-xs font-semibold text-primary">POSITIONING REFERENCE · {projection.label}</h3><a href={projection.source} target="_blank" rel="noreferrer" className="text-[11px] text-muted-foreground underline">Reference principles</a></div>
    <ol className="mt-2 space-y-1.5">{projection.positioning.map((line, i) => <li key={line} className="flex gap-2 text-xs leading-relaxed text-foreground"><span className="text-muted-foreground">{i + 1}.</span>{line}</li>)}</ol>
    <dl className="mt-3 grid grid-cols-2 gap-3 border-t border-border pt-2 text-xs"><div><dt className="text-muted-foreground">Anatomical center</dt><dd className="mt-1">{projection.centring}</dd></div><div><dt className="text-muted-foreground">Central ray / angle</dt><dd className="mt-1">{projection.cr}. {projection.angulation}</dd></div></dl>
    <p className="mt-2 text-[10px] leading-relaxed text-muted-foreground">Verify local protocols and patient limitations. Do not force an injured limb.</p>
  </section>;
}
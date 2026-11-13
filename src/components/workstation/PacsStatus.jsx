export default function PacsStatus({ hasImage, assessment }) {
  const rows = [
    { label: 'PACS', value: 'CONNECTED', tone: 'text-chart-2' },
    { label: 'IMAGE TRANSFER', value: hasImage ? 'COMPLETED' : 'AWAITING ACQUISITION', tone: hasImage ? 'text-chart-2' : 'text-muted-foreground' },
    { label: 'RAYID ASSESSMENT', value: assessment ? 'AVAILABLE' : '—', tone: assessment ? 'text-rayid' : 'text-muted-foreground' },
  ];
  return <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[10px] uppercase tracking-wide">
    {rows.map(row => <span key={row.label} className="flex items-center gap-1 text-muted-foreground">{row.label}:<b className={`font-semibold ${row.tone}`}>{row.value}</b></span>)}
  </div>;
}
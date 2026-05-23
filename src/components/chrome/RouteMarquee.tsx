const ITEMS = [
  "NYC → LON",
  "DXB → SIN",
  "LAX → TYO",
  "PAR → FRA",
  "Live Seats",
  "Realtime",
  "Reschedule",
  "Secure RLS",
  "PNR Booking",
  "PWA Ready",
];

export function RouteMarquee() {
  const track = [...ITEMS, ...ITEMS];
  return (
    <div className="select-none overflow-hidden border-y border-white/10 bg-primary py-6 text-white md:py-8">
      <div className="marquee-track font-mono text-xs uppercase tracking-[0.3em] md:text-sm">
        {track.map((item, i) => (
          <span key={`${item}-${i}`} className="mx-4 flex items-center gap-4 md:mx-8">
            {item}
            <span className="text-accent">•</span>
          </span>
        ))}
      </div>
    </div>
  );
}

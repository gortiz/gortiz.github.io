// Talks with published slides. Abstracts come from src/data/sessionize.json (npm run sessionize).
export interface Talk {
  slug: string;
  title: string;
  year: number;
  events: string[];
  sessionizeId: number;
  // Other Sessionize sessions that are the same talk (for example a translation).
  alsoSessionizeIds?: number[];
  links: { label: string; href: string }[];
}

export const talks: Talk[] = [
  {
    slug: 'iceberg-pinot',
    title: 'Your Iceberg Table Is Already a Pinot Table',
    year: 2026,
    events: ['J On The Beach'],
    sessionizeId: 191859,
    links: [
      { label: 'Slides', href: '/talks/iceberg-pinot/' },
      { label: 'PDF', href: '/talks/iceberg-pinot/iceberg-pinot.pdf' },
      { label: 'Extended slides', href: '/talks/iceberg-pinot/extended/' },
      { label: 'Extended PDF', href: '/talks/iceberg-pinot/extended/iceberg-pinot-extended.pdf' },
    ],
  },
  {
    slug: 'panama-rust',
    title: 'Native Speed, Java Comfort: Calling Rust from the JVM with Project Panama',
    year: 2026,
    events: ['Devoxx UK', 'WeAreDevelopers Berlin'],
    sessionizeId: 155839,
    alsoSessionizeIds: [155840],
    links: [
      { label: 'Slides', href: '/talks/panama-rust/' },
      { label: 'PDF', href: '/talks/panama-rust/panama-rust.pdf' },
    ],
  },
];

export interface Lecture {
  slug: string;
  title: string;
  description: string;
  youtubeId: string;
  thumbnail: string;
  duration: string;
  category: string;
  publishedAt: string;
}

export interface Book {
  slug: string;
  title: string;
  description: string;
  cover: string;
  price: string;
  pages: number;
  sampleUrl?: string;
  purchaseUrl?: string;
  featured?: boolean;
}

export interface TimelineItem {
  year: string;
  title: string;
  description: string;
}

export interface Stat {
  label: string;
  value: number;
  suffix?: string;
}

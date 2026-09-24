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

export interface Stat {
  label: string;
  value: number;
  suffix?: string;
}

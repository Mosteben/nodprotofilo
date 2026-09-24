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

export interface Resource {
  slug: string;
  title: string;
  description: string;
  fileType: "pdf" | "pptx" | "worksheet" | "docx";
  fileUrl: string;
  category: string;
  sizeLabel: string;
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

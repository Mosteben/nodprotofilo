import { Facebook, Youtube, Instagram, Linkedin, Github, Palette, MessageCircle, type LucideIcon } from "lucide-react";
import type { SiteContent } from "@/lib/site-settings";

type SocialKey = keyof SiteContent["social"];

const NETWORKS: { key: SocialKey; label: string; icon: LucideIcon }[] = [
  { key: "facebook", label: "فيسبوك", icon: Facebook },
  { key: "youtube", label: "يوتيوب", icon: Youtube },
  { key: "instagram", label: "إنستجرام", icon: Instagram },
  { key: "linkedin", label: "لينكدإن", icon: Linkedin },
  { key: "github", label: "GitHub", icon: Github },
  { key: "behance", label: "Behance", icon: Palette },
  { key: "whatsapp", label: "واتساب", icon: MessageCircle },
];

/** Social profiles the owner has filled in, in a fixed order. */
export function socialLinks(social: SiteContent["social"]) {
  return NETWORKS.filter((n) => social[n.key]).map((n) => ({ ...n, url: social[n.key] }));
}

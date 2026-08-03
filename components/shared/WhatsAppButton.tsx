import { MessageCircle } from "lucide-react";
import { SITE } from "@/lib/constants/site";

export function WhatsAppButton() {
  return (
    <a
      href={SITE.whatsapp}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="راسليني على واتساب"
      className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-[#25D366] text-white shadow-soft flex items-center justify-center hover:scale-105 transition-transform animate-float"
    >
      <MessageCircle className="h-6 w-6" />
    </a>
  );
}

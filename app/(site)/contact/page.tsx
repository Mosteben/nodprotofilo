import type { Metadata } from "next";
import { Mail, MapPin, Facebook, Youtube } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { ContactForm } from "@/components/contact/ContactForm";
import { SITE } from "@/lib/constants/site";

export const metadata: Metadata = {
  title: "تواصل معي",
  description: "تواصلي مع نادين محمد عبر البريد الإلكتروني أو مواقع التواصل الاجتماعي.",
};

export default function ContactPage() {
  return (
    <>
      <PageHeader
        eyebrow="لنتواصل"
        title="تواصل معي"
        description="سواء عندك سؤال، اقتراح  — يسعدني تواصلك."
      />
      <section className="section-py">
        <div className="container grid lg:grid-cols-[1fr_0.8fr] gap-16">
          <div>
            <h2 className="font-display text-2xl text-navy mb-6">أرسلي رسالة</h2>
            <ContactForm />
          </div>

          <div className="space-y-8">
            <div>
              <h2 className="font-display text-2xl text-navy mb-6">معلومات التواصل</h2>
              <ul className="space-y-4 font-ui text-navy/70">
                <li className="flex items-center gap-3">
                  <span className="h-11 w-11 rounded-full bg-section flex items-center justify-center text-gold-dark shrink-0">
                    <Mail className="h-5 w-5" />
                  </span>
                  <a href={`mailto:${SITE.email}`} className="hover:text-gold-dark">{SITE.email}</a>
                </li>
                <li className="flex items-center gap-3">
                  <span className="h-11 w-11 rounded-full bg-section flex items-center justify-center text-gold-dark shrink-0">
                    <Facebook className="h-5 w-5" />
                  </span>
                  <a href={SITE.facebook} target="_blank" rel="noopener noreferrer" className="hover:text-gold-dark">
                    صفحة فيسبوك
                  </a>
                </li>
                <li className="flex items-center gap-3">
                  <span className="h-11 w-11 rounded-full bg-section flex items-center justify-center text-gold-dark shrink-0">
                    <Youtube className="h-5 w-5" />
                  </span>
                  <a href={SITE.youtube} target="_blank" rel="noopener noreferrer" className="hover:text-gold-dark">
                    قناة يوتيوب
                  </a>
                </li>
                <li className="flex items-center gap-3">
                  <span className="h-11 w-11 rounded-full bg-section flex items-center justify-center text-gold-dark shrink-0">
                    <MapPin className="h-5 w-5" />
                  </span>
                  <span>سمنود-الغربية، جمهورية مصر العربية</span>
                </li>
              </ul>
            </div>

            {/* Google Maps placeholder — replace src with an embed URL once a
                specific location/campus is confirmed. */}
            <div className="relative aspect-video rounded-2xl overflow-hidden bg-section flex items-center justify-center border border-navy/10">
              <div className="text-center text-navy/40 font-ui text-sm p-6">
                <MapPin className="h-8 w-8 mx-auto mb-2 text-gold-dark/60" />
                خريطة جوجل — سيتم إضافتها لاحقًا
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

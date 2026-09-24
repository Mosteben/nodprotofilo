import type { Metadata } from "next";
import Image from "next/image";
import { GraduationCap, PenTool, Target, Sparkles } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { Timeline } from "@/components/shared/Timeline";
import { SITE } from "@/lib/constants/site";

export const metadata: Metadata = {
  title: "من أنا",
  description: "تعرّف على نادين محمد، طالبة علوم تربوية بجامعة طنطا وكاتبة وصانعة محتوي.",
};

const SKILLS = [
  { label: "الكتابة العلمية المبسّطة", level: 90 },
  { label: "تصميم محتوى تعليمي", level: 80 },
  { label: "التواصل والشرح", level: 85 },
  { label: "البحث والتحضير الأكاديمي", level: 75 },
];

export default function AboutPage() {
  return (
    <>
      <section className="bg-navy-fade text-white section-py">
        <div className="container grid lg:grid-cols-[0.8fr_1.2fr] gap-14 items-center">
          <RevealOnScroll>
            <div className="relative aspect-square max-w-sm mx-auto rounded-full overflow-hidden border-4 border-gold/30">
              <Image
  src="/images/profile/profile.jpeg"
  alt={SITE.name}
  fill
  className="object-cover"
/>
            </div>
          </RevealOnScroll>
          <RevealOnScroll delay={0.15}>
            <span className="marginalia text-gold-light mb-4 inline-block">— نبذة عني</span>
            <h1 className="font-display text-4xl md:text-5xl mb-6 leading-tight">
              مرحبًا، أنا {SITE.name}
            </h1>
            <p className="text-white/75 text-lg leading-relaxed max-w-xl">
             {SITE.role}، أؤمن أن العلم يستحق أن يُروى بلغة بسيطة تصل
              لكل عقل. أكتب لأفهم أكثر، وأشارك ما أتعلّمه مع كل من يبحث عن نفس
              الطريق.
            </p>
          </RevealOnScroll>
        </div>
      </section>

      <section className="section-py">
        <div className="container grid md:grid-cols-2 gap-12">
          <RevealOnScroll>
            <div className="flex items-start gap-4 mb-6">
              <GraduationCap className="h-8 w-8 text-gold-dark shrink-0" />
              <div>
                <h2 className="font-display text-2xl text-navy mb-2">التعليم</h2>
                <p className="text-brown/80 leading-relaxed">
                  طالبة بكلية التربية، قسم العلوم، جامعة طنطا. أدرس أسس تدريس
                  العلوم وطرق إيصال المفاهيم العلمية للطلاب بمراحلهم المختلفة.
                </p>
              </div>
            </div>
          </RevealOnScroll>
          <RevealOnScroll delay={0.1}>
            <div className="flex items-start gap-4 mb-6">
              <PenTool className="h-8 w-8 text-gold-dark shrink-0" />
              <div>
                <h2 className="font-display text-2xl text-navy mb-2">رحلة الكتابة</h2>
                <p className="text-brown/80 leading-relaxed">
                  بدأت الكتابة كوسيلة لتنظيم أفكاري أثناء المذاكرة، ثم تحوّلت
                  إلى شغف أشارك من خلاله تجربتي مع كل طالب يبحث عن طريقة أسهل
                  للفهم.
                </p>
              </div>
            </div>
          </RevealOnScroll>
          <RevealOnScroll delay={0.05}>
            <div className="flex items-start gap-4">
              <Target className="h-8 w-8 text-gold-dark shrink-0" />
              <div>
                <h2 className="font-display text-2xl text-navy mb-2">رسالتي التعليمية</h2>
                <p className="text-brown/80 leading-relaxed">
                  أن أجعل مادة العلوم صديقة لا عبئًا، من خلال محتوى مبسّط
                  ومقالات ومحاضرات تراعي اختلاف أساليب التعلّم بين الطلاب.
                </p>
              </div>
            </div>
          </RevealOnScroll>
          <RevealOnScroll delay={0.15}>
            <div className="flex items-start gap-4">
              <Sparkles className="h-8 w-8 text-gold-dark shrink-0" />
              <div>
                <h2 className="font-display text-2xl text-navy mb-2">اهتماماتي</h2>
                <p className="text-brown/80 leading-relaxed">
                  القراءة، الكتابة الإبداعية، تصميم المحتوى التعليمي، ومتابعة
                  كل جديد في طرق التدريس الحديثة.
                </p>
              </div>
            </div>
          </RevealOnScroll>
        </div>
      </section>

      <section className="section-py bg-section">
        <div className="container">
          <SectionHeading eyebrow="المهارات" title="ما الذي أتقنه" />
          <div className="grid md:grid-cols-2 gap-x-16 gap-y-8 max-w-3xl">
            {SKILLS.map((skill, i) => (
              <RevealOnScroll key={skill.label} delay={i * 0.08}>
                <div className="flex items-center justify-between mb-2 font-ui text-sm text-navy">
                  <span>{skill.label}</span>
                  <span className="text-gold-dark font-semibold">{skill.level}٪</span>
                </div>
                <div className="h-2 rounded-full bg-navy/10 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gold-fade"
                    style={{ width: `${skill.level}%` }}
                  />
                </div>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </section>

      <section className="section-py">
        <div className="container">
          <SectionHeading eyebrow="محطات" title="رحلتي بالتفصيل" />
          <Timeline />
        </div>
      </section>
    </>
  );
}

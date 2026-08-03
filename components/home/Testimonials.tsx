import { SectionHeading } from "@/components/ui/SectionHeading";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { Quote as QuoteIcon } from "lucide-react";

const PLACEHOLDER_TESTIMONIALS = [
  {
    text: "ديدااا العظيمة بجد، كل مقال بقرأه بيشدني أكمل للآخر. أسلوبك مميز جدًا. 🤍",
  },
  {
    text: "نود عندها قدرة تخلي الكلمات توصل للقلب بسهولة، مستنيين كل جديد تكتبيه.",
  },
  {
    text: "أندي من الناس اللي أحب أقرأ لهم، الكتابة فيها إحساس وجمال في اختيار الكلمات.",
  },
  {
    text: "نيدان كل مرة بتفاجئنا بنص أجمل من اللي قبله، ربنا يوفقك دايمًا.",
  },
  {
    text: "رواية نادين الجديدة متحمسين لها جدًا، ومستنيينها تنزل في أقرب وقت.",
  },
  {
    text: "كل النجاح والتوفيق ليكي، وإن شاء الله نشوف كتب وروايات أكتر في الفترة الجاية. ❤️",
  },
];

export function Testimonials() {
  return (
    <section className="section-py">
      <div className="container">
        <SectionHeading
          align="center"
          eyebrow="آراء القرّاء"
          title="ماذا يقول من تابعني؟"
          description="سيتم استبدال هذا القسم بآراء حقيقية من القرّاء والطلاب لاحقًا."
        />
        <div className="grid md:grid-cols-3 gap-6">
          {PLACEHOLDER_TESTIMONIALS.map((t, i) => (
            <RevealOnScroll key={i} delay={i * 0.1}>
              <div className="bg-section rounded-2xl p-8 h-full">
                <QuoteIcon className="h-8 w-8 text-gold mb-4" />
                <p className="text-navy/80 leading-relaxed mb-6">{t.text}</p>
                <p className="font-ui text-sm text-navy font-semibold">
                  {i + 1} <span className="text-navy/40 font-normal">— {i}</span>
                </p>
              </div>
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}

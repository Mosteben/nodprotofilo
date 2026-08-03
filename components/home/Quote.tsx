import { RevealOnScroll } from "@/components/ui/RevealOnScroll";

export function Quote() {
  return (
    <section className="bg-navy text-white section-py relative overflow-hidden">
     <span className="absolute -top-10 right-10 font-display text-[220px] text-white/5 select-none leading-none">
  &ldquo;
</span>
      <div className="container-narrow text-center relative z-10">
        <RevealOnScroll>
          <p className="font-display text-3xl md:text-4xl leading-relaxed text-gold-light">
           يَجُوبُ العقلُ بُحورَ العَوالمِ أجمعَ
ويَتفننُ في تساؤلاتِه المَطرُوحة
حَتى يُسكِر من نَبيذ الحياة
ويضيعُ بينَ يَقينٍ ووهنٍ عابرٍ
فلا القلبُ يدرِي ما العِلّةُ
ولا الرُوح تُسكِّنُ المُصاب
          </p>
          <p className="mt-6 font-ui text-white/60">— نادين محمد</p>
        </RevealOnScroll>
      </div>
    </section>
  );
}

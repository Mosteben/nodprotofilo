"use client";

import { motion } from "framer-motion";
import { ArrowLeft, BookOpen, PlayCircle } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { InkStroke } from "@/components/ui/InkStroke";
import { SITE } from "@/lib/constants/site";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-navy-fade text-white">
      {/* Decorative open-book line art, quiet ambient presence */}
      <svg
        className="pointer-events-none absolute -left-24 top-1/2 -translate-y-1/2 h-[520px] w-[520px] opacity-[0.06] animate-float"
        viewBox="0 0 200 200"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M100 40C80 25 45 20 20 30V150C45 140 80 145 100 160C120 145 155 140 180 150V30C155 20 120 25 100 40Z"
          stroke="white"
          strokeWidth="2"
        />
        <path d="M100 40V160" stroke="white" strokeWidth="2" />
      </svg>

      <div className="container relative z-10 grid lg:grid-cols-[1.2fr_0.8fr] gap-16 items-center py-28 md:py-36">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="marginalia text-gold-light mb-6 inline-block">
            —   طالبة  تربية · كاتبة  
          </span>
          <h1 className="font-display text-5xl md:text-7xl leading-[1.15] mb-6">
            أكتب عن ما أحلم
            <br />
            <span className="relative inline-block">
              بلغة تصل للقلب
              <InkStroke className="absolute -bottom-3 right-0 w-full h-4" delay={0.9} />
            </span>
          </h1>
          <p className="text-white/75 text-lg md:text-xl leading-relaxed max-w-xl mb-10 font-body">
            {SITE.name}، {SITE.role}. أشارك هنا مقالاتي ومحاضراتي وموادي التعليمية،
            محاولةً أن أجعل كل فكرة علمية معقّدة في متناول كل قارئ.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button href="/articles" variant="gold" size="lg">
              <BookOpen className="h-5 w-5" />
              اقرأ المقالات
            </Button>
            <Button href="/lectures" variant="outline" size="lg" className="border-white/30 text-white hover:border-gold hover:text-gold">
              <PlayCircle className="h-5 w-5" />
              شاهد المحاضرات
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="relative hidden lg:block"
        >
         <div className="aspect-[4/5] rounded-[2rem] bg-gradient-to-br from-gold/20 to-transparent border border-white/10 backdrop-blur-sm flex items-center justify-center relative overflow-hidden">
  <Image
    src="/images/profile/profile.jpeg"
    alt={SITE.name}
    fill
    className="object-cover"
  />
  <div className="absolute inset-6 border border-gold/20 rounded-[1.5rem] pointer-events-none" />
</div>
          <motion.div
            animate={{ y: [0, -14, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -bottom-6 -right-6 bg-paper text-navy rounded-2xl shadow-soft px-6 py-4"
          >
            <p className="font-display text-lg">
  &ldquo;الكتابة أعمق طرق الفهم&rdquo;
</p>
          </motion.div>
        </motion.div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/10 to-transparent" />
    </section>
  );
}

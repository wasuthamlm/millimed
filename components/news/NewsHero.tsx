"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { fadeInUp } from "@/lib/motion";
import { formatThaiDate } from "@/lib/utils";
import { Calendar, ArrowRight } from "@/components/ui/icons";
import type { NewsItem } from "@/data/news";

export function NewsHero({ item }: { item: NewsItem }) {
  return (
    <motion.div variants={fadeInUp} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }}>
      <Link
        href={`/news/${item.slug}`}
        className="group grid overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm transition-shadow hover:shadow-xl lg:grid-cols-2"
      >
        <div className="relative aspect-[16/10] w-full overflow-hidden lg:aspect-auto">
          <Image
            src={item.image}
            alt={item.title}
            fill
            priority
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
        <div className="flex flex-col justify-center gap-4 p-6 sm:p-8 lg:p-10">
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-brand-gold/10 px-3 py-1 text-xs font-semibold text-brand-gold-dark">
            ข่าวเด่น
          </span>
          <h2 className="text-xl font-bold leading-snug text-slate-900 sm:text-2xl lg:text-3xl">{item.title}</h2>
          {item.excerpt && (
            <p className="line-clamp-3 text-sm leading-relaxed text-slate-600 sm:text-base">{item.excerpt}</p>
          )}
          <div className="flex items-center justify-between gap-4 pt-2">
            <span className="inline-flex items-center gap-1.5 text-sm text-slate-500">
              <Calendar className="h-4 w-4" />
              {formatThaiDate(item.publishedAt)}
            </span>
            <span className="inline-flex items-center gap-1 text-sm font-semibold text-brand-navy transition-colors group-hover:text-brand-gold-dark">
              อ่านต่อ
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

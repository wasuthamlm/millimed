"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { fadeInUp } from "@/lib/motion";
import { formatThaiDate } from "@/lib/utils";
import { Calendar, ArrowRight } from "@/components/ui/icons";
import type { NewsItem } from "@/data/news";

export function NewsGridCard({ item }: { item: NewsItem }) {
  return (
    <motion.div variants={fadeInUp} className="h-full">
      <Link href={`/news/${item.slug}`} className="group block h-full">
        <motion.div
          whileHover={{ y: -4 }}
          transition={{ duration: 0.2 }}
          className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition-shadow group-hover:shadow-lg"
        >
          <div className="relative aspect-[4/3] w-full overflow-hidden">
            <Image
              src={item.image}
              alt={item.title}
              fill
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
          <div className="flex flex-1 flex-col gap-2 p-4">
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500">
              <Calendar className="h-3.5 w-3.5" />
              {formatThaiDate(item.publishedAt)}
            </span>
            <h3 className="line-clamp-2 flex-1 text-base font-bold leading-snug text-slate-900">{item.title}</h3>
            <span className="inline-flex items-center gap-1 text-sm font-medium text-brand-navy transition-colors group-hover:text-brand-gold-dark">
              อ่านต่อ
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </span>
          </div>
        </motion.div>
      </Link>
    </motion.div>
  );
}

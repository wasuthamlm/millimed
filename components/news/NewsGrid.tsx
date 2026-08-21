"use client";

import { motion } from "framer-motion";
import { staggerContainer } from "@/lib/motion";
import { NewsGridCard } from "@/components/news/NewsGridCard";
import type { NewsItem } from "@/data/news";

export function NewsGrid({ items }: { items: NewsItem[] }) {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
    >
      {items.map((item) => (
        <NewsGridCard key={item.slug} item={item} />
      ))}
    </motion.div>
  );
}

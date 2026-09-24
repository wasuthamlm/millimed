"use client";

import { motion } from "framer-motion";
import { staggerContainer } from "@/lib/motion";
import { NewsGridCard } from "@/components/news/NewsGridCard";
import type { NewsItem } from "@/data/news";

export function NewsGrid({ items }: { items: NewsItem[] }) {
  return (
    <motion.div
      key={items.map((item) => item.slug).join(",")}
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
    >
      {items.map((item, i) => (
        <NewsGridCard key={item.slug} item={item} priority={i === 0} />
      ))}
    </motion.div>
  );
}

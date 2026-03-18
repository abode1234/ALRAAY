"use client";

import Link from "next/link";
import categoriesData from "@/data/categories.json";

export default function CategoryStrip() {
  return (
    <div className="bg-white py-6 overflow-x-auto">
      <div className="container mx-auto px-4">
        <div className="flex gap-4 md:gap-6">
          {categoriesData.map((category) => (
            <Link
              key={category.id}
              href={`/categories?category=${category.slug}`}
              className="flex flex-col items-center gap-2 min-w-[80px] md:min-w-[100px] hover:scale-105 transition-transform"
            >
              <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-teal-100 to-teal-200 rounded-full flex items-center justify-center text-3xl md:text-4xl shadow-md hover:shadow-lg transition">
                {category.icon}
              </div>
              <span className="text-xs md:text-sm text-gray-700 font-medium text-center">
                {category.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}


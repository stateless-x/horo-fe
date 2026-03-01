'use client';

import Link from 'next/link';
import { Heart } from 'lucide-react';
import { Button } from '@/lib-packages/ui';

export function CompatibilityCTA() {
  return (
    <Link href="/dashboard/compatibility">
      <div className="bg-gradient-to-r from-pink-500/10 to-amethyst/10 border border-pink-500/20 rounded-2xl p-6 transition-all duration-200 hover:border-pink-500/40 hover:shadow-lg hover:shadow-pink-500/10 cursor-pointer group">
        {/* Header */}
        <div className="flex items-center justify-center gap-2 mb-3">
          <Heart className="text-pink-400 w-6 h-6 group-hover:scale-110 transition-transform" />
          <h3 className="font-heading text-xl font-medium text-ghostWhite">
            ส่องดวงความสัมพันธ์
          </h3>
        </div>

        {/* Description */}
        <p className="font-thai text-base text-ashGray text-center mb-4">
          ส่องดวงคนคุย คนรัก หัวหน้า เพื่อนร่วมงาน และอีกมากมาย
        </p>

        {/* Features */}
        <ul className="space-y-2 mb-4 text-sm text-ashGray">
          <li className="flex items-start gap-2">
            <span className="text-pink-400 mt-0.5">&#x2728;</span>
            <span>วิเคราะห์ธาตุและดาวของทั้งสองคน</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-pink-400 mt-0.5">&#x1F4A1;</span>
            <span>เข้าใจจุดแข็งและสิ่งที่ควรระวัง</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-pink-400 mt-0.5">&#x1F3AF;</span>
            <span>รับคำแนะนำเฉพาะตามประเภทความสัมพันธ์</span>
          </li>
        </ul>

        {/* CTA Button */}
        <Button
          className="w-full bg-gradient-to-r from-pink-500 to-amethyst hover:from-pink-600 hover:to-purple-600"
          size="lg"
        >
          ส่องดวงความสัมพันธ์
        </Button>
      </div>
    </Link>
  );
}

'use client';

import Link from 'next/link';
import { Heart, UserPlus, Edit3 } from 'lucide-react';

export function CompatibilityCTA() {
  return (
    <div className="bg-gradient-to-r from-pink-500/10 to-amethyst/10 border border-pink-500/20 rounded-2xl p-6">
      {/* Header */}
      <div className="flex items-center justify-center gap-2 mb-4">
        <Heart className="text-pink-400 w-6 h-6" />
        <h3 className="font-heading text-xl font-medium text-ghostWhite">
          ดูดวงคู่ — ดวงของเจ้าเข้ากับใครได้บ้าง?
        </h3>
      </div>

      {/* Description */}
      <p className="font-thai text-base text-ashGray text-center mb-6">
        เลือกวิธีเช็คดวงคู่:
      </p>

      {/* Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Direct entry */}
        <Link
          href="/dashboard/compatibility"
          className="bg-charcoal border border-darkPurple/50 rounded-xl p-5 flex flex-col items-center gap-3 transition-all duration-200 hover:border-pink-500/50 hover:bg-darkPurple/20 group"
        >
          <Edit3 className="text-pink-400 w-8 h-8 group-hover:scale-110 transition-transform" />
          <div className="text-center">
            <h4 className="font-heading text-base font-medium text-ghostWhite mb-1">
              ใส่ข้อมูลคู่เอง
            </h4>
            <p className="font-thai text-sm text-ashGray">
              กรอกวันเกิดคู่ของเจ้า
            </p>
          </div>
        </Link>

        {/* Invite flow */}
        <Link
          href="/dashboard/compatibility?invite=true"
          className="bg-charcoal border border-darkPurple/50 rounded-xl p-5 flex flex-col items-center gap-3 transition-all duration-200 hover:border-pink-500/50 hover:bg-darkPurple/20 group"
        >
          <UserPlus className="text-amethyst w-8 h-8 group-hover:scale-110 transition-transform" />
          <div className="text-center">
            <h4 className="font-heading text-base font-medium text-ghostWhite mb-1">
              ส่งลิงก์ให้คู่กรอก
            </h4>
            <p className="font-thai text-sm text-ashGray">
              ให้คู่ของเจ้ากรอกเอง
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
}

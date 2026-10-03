import Image from 'next/image';

const categories = [
  { label: 'ภาพรวมชีวิต', desc: 'ช่วงนี้ชีวิตเป็นยังไงบ้าง', image: 'life-overview' },
  { label: 'ความรัก', desc: 'ใจเรา ใจเขา ไปทางไหน', image: 'love' },
  { label: 'การงาน', desc: 'งานที่ทำกับทางที่อยากไป', image: 'career' },
  { label: 'การเงิน', desc: 'เงินเข้า เงินออก เรื่องให้วางแผน', image: 'finance' },
  { label: 'สุขภาพ', desc: 'อย่าลืมเผื่อเวลาให้ตัวเอง', image: 'health' },
  { label: 'ครอบครัว', desc: 'ใกล้กันแล้ว เข้าใจกันแค่ไหน', image: 'family' },
] as const;

/** A quiet preview of the six areas in a reading; it does not imply navigation. */
export function ReadingCategories() {
  return (
    <section className="px-6 py-16 sm:py-20">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 text-center sm:mb-10">
          <h2 className="font-heading text-3xl text-ink md:text-4xl">คำทำนายช่วยมองได้ครบ 6 ด้าน</h2>
          <p className="mt-3 font-oracle text-inkMuted">เปิดดวงครั้งเดียว แล้วค่อยเลือกอ่านเรื่องที่อยากเริ่มก่อน</p>
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 sm:gap-x-8 sm:gap-y-8">
          {categories.map((category) => (
            <div key={category.label} className="flex min-w-0 items-center gap-3 sm:flex-col sm:text-center">
              <Image
                src={`/assets/clay/categories/${category.image}.webp`}
                alt=""
                width={160}
                height={160}
                sizes="(min-width: 640px) 72px, 56px"
                className="size-14 shrink-0 object-contain drop-shadow-[0_8px_14px_rgba(107,33,168,0.12)] sm:size-[72px]"
              />
              <div className="min-w-0">
                <p className="font-heading text-sm text-ink md:text-base">{category.label}</p>
                <p className="mt-0.5 text-xs font-oracle leading-relaxed text-inkMuted">{category.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

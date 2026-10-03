import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'เงื่อนไขการใช้งานและสินค้า',
  description: 'คำอธิบายแต้มมู สินค้า eTicket ตั๋วรู้ใจ และวิธีตรวจสอบรายการเมื่อมีปัญหา',
  alternates: { canonical: '/terms' },
};

const LAST_UPDATED = '30 กันยายน 2569';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <section><h2 className="font-heading text-xl font-semibold text-ink">{title}</h2><div className="mt-3 space-y-3">{children}</div></section>;
}

/** Product terms deliberately explain the recovery path, not just restrictions. Legal review is required before launch. */
export default function TermsPage() {
  return <div className="min-h-screen bg-ground">
    <header className="border-b border-edge"><div className="mx-auto max-w-3xl px-6 py-6"><Link href="/" className="text-sm text-inkMuted transition-colors hover:text-ink">← กลับหน้าหลัก</Link></div></header>
    <main className="mx-auto max-w-3xl px-6 py-12 md:py-16">
      <h1 className="font-heading text-3xl text-ink md:text-4xl">เงื่อนไขการใช้งานและสินค้า</h1>
      <p className="mt-3 text-sm text-inkMuted">ปรับปรุงล่าสุด: {LAST_UPDATED}</p>
      <div className="mt-10 space-y-9 text-sm leading-7 text-inkMuted">
        <p>หน้านี้อธิบายสินค้าและรายการซื้อใน สายมู.com แบบสั้น ๆ เพื่อให้รู้ว่ากำลังซื้ออะไร และเช็กหรือขอความช่วยเหลือได้จากตรงไหน</p>
        <Section title="แต้มมูคืออะไร">
          <p>แต้มมูคือแต้มสำหรับใช้เลือกซื้อสินค้าและบริการภายใน สายมู.com เช่น eTicket และสินค้าอื่นที่แสดงในร้าน ก่อนชำระเงินเพื่อเติมแต้มมู เราจะแจ้งให้ทราบว่าแต้มมูไม่ใช่เงินสด ใช้กับร้านอื่นไม่ได้ โอนให้คนอื่นไม่ได้ และแลกเป็นเงินสดไม่ได้</p>
          <p>เวลาเติมแต้มมู ใช้แต้มมูซื้อสินค้า หรือมีการคืนแต้ม ระบบจะบันทึกเป็นคนละรายการในประวัติ เพื่อให้เช็กได้ว่ายอดเปลี่ยนเพราะอะไร</p>
        </Section>
        <Section title="ทำไมต้องใช้แต้มมูก่อนซื้อสินค้า">
          <p>การแยกเติมแต้มมู ซื้อสินค้า และรับสินค้าออกจากกัน ทำให้ สายมู.com ตรวจสอบปัญหาได้ตรงจุด ถ้าจ่ายเงินแล้วแต้มยังไม่เข้า เราตรวจสอบรายการเติมได้ ถ้าซื้อสินค้าแล้วสินค้าไม่ถึง เราตรวจสอบคำสั่งซื้อได้ และถ้าต้องคืนแต้ม เราคืนให้ถูกรายการโดยไม่ทำให้ประวัติเดิมหายไป</p>
          <p>คุณจึงเห็นลำดับเดียวกับที่เกิดขึ้นจริง: เติมแต้มมู, ซื้อสินค้า, แล้วรับหรือใช้สินค้านั้น</p>
        </Section>
        <Section title="สินค้า eTicket และตั๋วรู้ใจ">
          <p>eTicket คือสินค้าดิจิทัลที่เก็บไว้ในบัญชีของคุณ ตั๋วรู้ใจเป็น eTicket สำหรับเปิดคำอ่านดวงคู่ ใช้ 1 ใบต่อ 1 คน รายการได้รับและใช้ตั๋วแสดงแยกจากประวัติแต้มมู</p>
          <p>ตั๋วรู้ใจที่ซื้อไม่มีวันหมดอายุ ส่วนตั๋วของแถม ของขวัญ หรือรายการส่งเสริมการขายอาจมีวันหมดอายุตามที่ระบุไว้ ระบบจะใช้ตั๋วที่มีวันหมดอายุก่อนโดยอัตโนมัติ</p>
        </Section>
        <Section title="เมื่อเกิดปัญหา">
          <p>หากเปิดคำอ่านไม่สำเร็จ ตั๋วรู้ใจจะไม่ถูกใช้ หากพบปัญหาเกี่ยวกับการชำระเงิน แต้มมู คำสั่งซื้อ หรือตั๋ว ให้ติดต่อทีมงานพร้อมหมายเลขรายการจากประวัติ เพื่อให้เราตรวจสอบและดำเนินการกับรายการที่ถูกต้อง</p>
          <p>การคืนเงินหรือคืนแต้มจะพิจารณาตามสาเหตุของรายการ สถานะการให้บริการ และกฎหมายที่เกี่ยวข้อง การปรับปรุงหรือคืนรายการจะแสดงในประวัติของคุณเสมอ เงื่อนไขแต้มมูไม่ตัดสิทธิใด ๆ ที่คุณมีตามกฎหมาย</p>
        </Section>
        <Section title="การเปลี่ยนแปลงเงื่อนไข">
          <p>หากมีการเปลี่ยนแปลงสาระสำคัญของสินค้า ราคา หรือเงื่อนไข เราจะแจ้งผ่าน สายมู.com ก่อนหรือขณะมีผลใช้บังคับ ตั๋วรู้ใจที่ได้รับแล้วจะยังคงเป็นไปตามเงื่อนไขที่ระบุไว้ตอนได้รับ</p>
        </Section>
        <p>เงื่อนไขนี้ควรอ่านร่วมกับ <Link href="/privacy" className="font-medium text-accent hover:underline">นโยบายความเป็นส่วนตัว</Link></p>
      </div>
    </main>
  </div>;
}

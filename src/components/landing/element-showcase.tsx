import { ELEMENT_COLORS } from '@/lib-packages/shared/constants/design';
import { ElementClayImage } from '@/components/ui/element-clay-image';

const elements = [
  { key: 'wood', name: 'ธาตุไม้', trait: 'ชอบเติบโต', colors: ELEMENT_COLORS.wood },
  { key: 'fire', name: 'ธาตุไฟ', trait: 'ใจมีไฟ', colors: ELEMENT_COLORS.fire },
  { key: 'earth', name: 'ธาตุดิน', trait: 'มั่นคง', colors: ELEMENT_COLORS.earth },
  { key: 'metal', name: 'ธาตุทอง', trait: 'ชัดเจน', colors: ELEMENT_COLORS.metal },
  { key: 'water', name: 'ธาตุน้ำ', trait: 'คิดลึก', colors: ELEMENT_COLORS.water },
] as const;

/** A compact visual glossary, not another card grid in the landing narrative. */
export function ElementShowcase() {
  return (
    <section className="px-6 py-16 sm:py-20">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 text-center sm:mb-10">
          <h2 className="font-heading text-3xl text-ink md:text-4xl">คุณเป็นคนธาตุไหนกันนะ</h2>
          <p className="mt-3 font-oracle text-inkMuted">ไม้ ไฟ ดิน ทอง หรือน้ำ ลองดูว่าธาตุไหนเล่าเรื่องคุณ</p>
        </div>

        <div className="grid grid-cols-5 gap-2 sm:gap-4">
          {elements.map((element) => (
            <div key={element.key} className="min-w-0 text-center">
              <div className="mx-auto grid size-16 place-items-center sm:size-24">
                <ElementClayImage
                  element={element.key}
                  alt={`โมเดลดินปั้น ${element.name}`}
                  sizes="(min-width: 640px) 96px, 64px"
                  className="size-full object-contain drop-shadow-[0_10px_18px_rgba(107,33,168,0.12)]"
                />
              </div>
              <p className="mt-2 truncate font-heading text-xs sm:text-sm" style={{ color: `var(--el-${element.key}, ${element.colors.primary})` }}>
                {element.name}
              </p>
              <p className="mt-0.5 hidden font-oracle text-xs text-inkMuted sm:block">{element.trait}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

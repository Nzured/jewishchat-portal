import { Logo } from "@public/svgs";
import Image, { type StaticImageData } from "next/image";
import { Link } from "@/components/ui/Link";
import { Typography } from "@/components/ui/Typography";
import { NAME_PART_ONE, NAME_PART_TWO } from "@/configs/const";
import { FOOTER_LINK_GROUPS } from "@/configs/footerNav";

export function ExternalFooter() {
  return (
    <footer className="border-t border-surface-line bg-surface-card px-4 py-10 md:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 lg:flex-row lg:justify-between">
        <div className="flex max-w-xs flex-col gap-3">
          <div className="flex items-center gap-2">
            <Image
              src={Logo as StaticImageData}
              alt={NAME_PART_ONE + NAME_PART_TWO}
              width={24}
              height={24}
              className="shrink-0 rounded-full"
            />
            <Typography as="span" className="text-base font-semibold text-ink-1">
              {NAME_PART_ONE + NAME_PART_TWO}
            </Typography>
          </div>
          <Typography variant="small" className="text-ink-3">
            A directory of WhatsApp groups for the Jewish community, made with care. Browse by
            topic, search by city, or just see what your neighbors have joined.
          </Typography>
        </div>

        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          {FOOTER_LINK_GROUPS.map((group) => (
            <div key={group.title} className="flex flex-col gap-3">
              <Typography
                variant="xs"
                className="font-mono font-medium tracking-[1.5px] text-brand-green uppercase"
              >
                {group.title}
              </Typography>
              <ul className="flex flex-col gap-2">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm font-normal text-ink-2 no-underline hover:text-ink-1 hover:underline"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </footer>
  );
}

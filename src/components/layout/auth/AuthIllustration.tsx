import {
  AuthIllustration as AuthIllustrationSvg,
  AuthIllustrationMobile,
  Logo,
} from "@public/svgs";
import Image, { getImageProps, StaticImageData } from "next/image";
import NextLink from "next/link";
import { Typography } from "@/components/ui/Typography";
import { EXTERNAL_HOME_PATH } from "@/configs/const";

const DESKTOP_MEDIA = "(min-width: 1024px)";

function BackdropPicture() {
  const common = { alt: "Authentication Illustration", fill: true, sizes: "100vw" };
  const { props: desktop } = getImageProps({
    ...common,
    src: AuthIllustrationSvg as StaticImageData,
  });
  const { props: mobile } = getImageProps({
    ...common,
    src: AuthIllustrationMobile as StaticImageData,
  });

  return (
    <picture className="contents">
      <source media={DESKTOP_MEDIA} srcSet={desktop.srcSet ?? desktop.src} />
      <img {...mobile} className="object-cover" />
    </picture>
  );
}

function BrandLink({ size, textClassName }: { size: number; textClassName: string }) {
  return (
    <NextLink
      href={EXTERNAL_HOME_PATH}
      aria-label="JewishChat home"
      className="flex w-fit items-center gap-1.5 rounded-sm transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-brand-green/40 focus-visible:outline-none lg:gap-2"
    >
      <Image
        src={Logo as StaticImageData}
        alt="JewishChat"
        width={size}
        height={size}
        className="shrink-0 rounded-full"
      />
      <Typography as="span" className={`font-semibold text-ink-1 ${textClassName}`}>
        JewishChat
      </Typography>
    </NextLink>
  );
}

const footerTagClassName = "text-[10px] tracking-wider text-ink-2 uppercase font-medium";

export default function AuthIllustration() {
  return (
    <div className="relative flex h-[160px] w-full flex-col justify-center p-5 select-none lg:h-full lg:justify-between lg:p-12 lg:[view-transition-name:auth-illustration]">
      <BackdropPicture />

      <div className="absolute top-5 left-5 z-10 lg:hidden">
        <BrandLink size={28} textClassName="text-sm" />
      </div>
      <div className="relative z-10 mt-8 lg:hidden">
        <Typography variant="h2" className="text-base font-semibold leading-tight text-ink-1">
          List your groups.
          <br /> Reach your{" "}
          <Typography as="span" className="font-serif italic font-normal text-ink-1">
            people.
          </Typography>
        </Typography>
      </div>

      <div className="relative z-10 hidden lg:block">
        <BrandLink size={24} textClassName="text-base" />
      </div>
      <div className="relative z-10 my-auto hidden max-w-[420px] flex-col gap-4 lg:flex">
        <Typography variant="h1" className="text-4xl font-semibold leading-[1.2] text-ink-1">
          List your groups.
          <br />
          Reach your{" "}
          <Typography as="span" className="font-serif italic font-normal text-ink-1">
            people.
          </Typography>
        </Typography>
        <Typography variant="p" className="text-ink-2 text-sm leading-relaxed">
          Add your community&apos;s WhatsApp groups to a directory built for discovery.
        </Typography>
      </div>
      <div className="relative z-10 hidden gap-4 lg:flex">
        <Typography variant="p" className={footerTagClassName}>
          Verified Listings
        </Typography>
        <Typography variant="p" className={footerTagClassName}>
          ·
        </Typography>
        <Typography variant="p" className={footerTagClassName}>
          Community-First
        </Typography>
        <Typography variant="p" className={footerTagClassName}>
          ·
        </Typography>
        <Typography variant="p" className={footerTagClassName}>
          Free to Browse
        </Typography>
      </div>
    </div>
  );
}

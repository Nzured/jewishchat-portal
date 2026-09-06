import {
  AuthIllustration as AuthIllustrationSvg,
  AuthIllustrationMobile,
  Logo,
} from "@public/svgs";
import Image, { StaticImageData } from "next/image";
import NextLink from "next/link";
import { Typography } from "@/components/ui/Typography";
import { EXTERNAL_HOME_PATH } from "@/configs/const";

export default function AuthIllustration() {
  return (
    <>
      <div className="relative w-full h-[160px] lg:hidden select-none p-5 flex flex-col justify-center">
        <Image
          src={AuthIllustrationMobile as StaticImageData}
          alt="Authentication Illustration"
          fill
          className="object-cover"
          priority
        />

        <NextLink
          href={EXTERNAL_HOME_PATH}
          aria-label="JewishChat home"
          className="absolute top-5 left-5 flex items-center gap-1.5 z-10 rounded-sm transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-brand-green/40 focus-visible:outline-none"
        >
          <Image
            src={Logo as StaticImageData}
            alt="JewishChat"
            width={28}
            height={28}
            className="shrink-0 rounded-full"
          />
          <Typography as="span" className="font-semibold text-ink-1 text-sm">
            JewishChat
          </Typography>
        </NextLink>
        <div className="relative z-10 mt-8">
          <Typography variant="h2" className="text-base font-semibold leading-tight text-ink-1">
            List your groups.
            <br /> Reach your{" "}
            <Typography as="span" className="font-serif italic font-normal text-ink-1">
              people.
            </Typography>
          </Typography>
        </div>
      </div>
      <div className="relative hidden lg:flex flex-col justify-between p-12 lg:h-full select-none [view-transition-name:auth-illustration]">
        <Image
          src={AuthIllustrationSvg as StaticImageData}
          alt="Authentication Illustration"
          fill
          className="object-cover"
          priority
        />
        <NextLink
          href={EXTERNAL_HOME_PATH}
          aria-label="JewishChat home"
          className="flex w-fit items-center gap-2 relative z-10 rounded-sm transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-brand-green/40 focus-visible:outline-none"
        >
          <Image
            src={Logo as StaticImageData}
            alt="JewishChat"
            width={24}
            height={24}
            className="shrink-0 rounded-full"
          />
          <Typography as="span" className="font-semibold text-ink-1 text-base">
            JewishChat
          </Typography>
        </NextLink>
        <div className="max-w-[420px] my-auto flex flex-col gap-4 relative z-10">
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
        <div className="flex gap-4 relative z-10">
          <Typography
            variant="p"
            className="text-[10px] tracking-wider text-ink-2 uppercase font-medium"
          >
            Verified Listings
          </Typography>
          <Typography
            variant="p"
            className="text-[10px] tracking-wider text-ink-2 uppercase font-medium"
          >
            ·
          </Typography>
          <Typography
            variant="p"
            className="text-[10px] tracking-wider text-ink-2 uppercase font-medium"
          >
            Community-First
          </Typography>
          <Typography
            variant="p"
            className="text-[10px] tracking-wider text-ink-2 uppercase font-medium"
          >
            ·
          </Typography>
          <Typography
            variant="p"
            className="text-[10px] tracking-wider text-ink-2 uppercase font-medium"
          >
            Free to Browse
          </Typography>
        </div>
      </div>
    </>
  );
}

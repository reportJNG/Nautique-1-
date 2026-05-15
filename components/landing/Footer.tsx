import { prisma } from "@/lib/db/prisma";
import { Waves, Mail, Phone, MapPin } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link as IntlLink } from "@/i18n/navigation";
import {
  fallbackLandingParametres,
  withPublicLandingFallback,
} from "@/lib/public-landing";
export const dynamic = "force-dynamic";

type LandingParametres = {
  emailCentre?: string | null;
  telephoneCentre?: string | null;
  adresseCentre?: string | null;
};

async function getParametres() {
  const params = await withPublicLandingFallback<LandingParametres | null>(
    "parametres",
    () => prisma.parametres.findFirst(),
    fallbackLandingParametres,
  );
  return params;
}
const FacebookIcon = () => (<svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
</svg>);
const TwitterIcon = () => (<svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
</svg>);
const InstagramIcon = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
  <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
</svg>);
const LinkedInIcon = () => (<svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
  <rect width="4" height="12" x="2" y="9" />
  <circle cx="4" cy="4" r="2" />
</svg>);
export async function Footer(props: {
  locale: string;
}) {
  const { locale } = props;
  const params = await getParametres();
  const t = await getTranslations({ locale, namespace: "landing" });
  const socialLinks = [
    { icon: FacebookIcon, href: "https://facebook.com", ariaLabel: t("footer.social.facebook") },
    { icon: TwitterIcon, href: "https://twitter.com", ariaLabel: t("footer.social.twitter") },
    { icon: InstagramIcon, href: "https://instagram.com", ariaLabel: t("footer.social.instagram") },
    { icon: LinkedInIcon, href: "https://linkedin.com", ariaLabel: t("footer.social.linkedin") },
  ];
  const quickLinks = [
    { href: "/auth/adherent/login", label: t("footer.memberArea") },
    { href: "/auth/login", label: t("footer.staffArea") },
  ];
  return (<footer id="contact" className="relative overflow-hidden bg-card text-foreground" style={{ fontFamily: "'DM Sans', sans-serif" }}>

    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />


    <div className="pointer-events-none absolute inset-0 opacity-[0.03]" style={{
      backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
      backgroundSize: "32px 32px",
    }} />


    <div className="pointer-events-none absolute -top-32 left-1/4 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
    <div className="pointer-events-none absolute -bottom-16 right-1/4 h-48 w-48 rounded-full bg-primary/10 blur-3xl" />

    <div className="relative mx-auto max-w-7xl px-6 pb-8 pt-14 lg:px-8">
      <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">


        <div className="lg:col-span-1">
          <div className="mb-5 flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15 ring-1 ring-primary/30">
              <Waves className="h-5 w-5 text-primary" />
            </div>
            <span className="text-lg font-bold tracking-tight text-foreground">
              {t("footer.brand")}
            </span>
          </div>
          <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
            {t("footer.description")}
          </p>
          <div className="flex gap-2">
            {socialLinks.map((social, idx) => (<a key={idx} href={social.href} target="_blank" rel="noopener noreferrer" aria-label={social.ariaLabel} className="group flex h-8 w-8 items-center justify-center rounded-lg bg-muted/50 text-muted-foreground ring-1 ring-border transition-all duration-200 hover:bg-primary/15 hover:text-primary hover:ring-primary/30">
              <social.icon />
            </a>))}
          </div>
        </div>


        <div>
          <h3 className="mb-5 text-xs font-semibold uppercase tracking-widest text-primary">
            {t("footer.contact")}
          </h3>
          <ul className="space-y-3">
            {params?.emailCentre && (<li className="group flex items-start gap-3">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-primary/10">
                <Mail className="h-3.5 w-3.5 text-primary" />
              </span>
              <span className="text-sm text-muted-foreground transition-colors group-hover:text-foreground">
                {params.emailCentre}
              </span>
            </li>)}
            {params?.telephoneCentre && (<li className="group flex items-start gap-3">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-primary/10">
                <Phone className="h-3.5 w-3.5 text-primary" />
              </span>
              <span className="text-sm text-muted-foreground transition-colors group-hover:text-foreground">
                {params.telephoneCentre}
              </span>
            </li>)}
            {params?.adresseCentre && (<li className="group flex items-start gap-3">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-primary/10">
                <MapPin className="h-3.5 w-3.5 text-primary" />
              </span>
              <span className="text-sm text-muted-foreground transition-colors group-hover:text-foreground">
                {params.adresseCentre}
              </span>
            </li>)}
          </ul>
        </div>


        <div>
          <h3 className="mb-5 text-xs font-semibold uppercase tracking-widest text-primary">
            {t("footer.quickLinks")}
          </h3>
          <ul className="space-y-2.5">
            {quickLinks.map(({ href, label }) => (<li key={href}>
              <IntlLink href={href} className="group flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
                <span className="h-px w-3 bg-border transition-all duration-200 group-hover:w-4 group-hover:bg-primary" />
                {label}
              </IntlLink>
            </li>))}
          </ul>
        </div>


        <div>
          <h3 className="mb-5 text-xs font-semibold uppercase tracking-widest text-primary">
            {t("footer.openingHoursTitle")}
          </h3>
          <ul className="space-y-2.5">
            {[
              t("footer.openingHours.monFri"),
              t("footer.openingHours.sat"),
              t("footer.openingHours.sun"),
            ].map((line, i) => (<li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className={`h-1.5 w-1.5 rounded-full ${i === 2 ? "bg-muted-foreground/30" : "bg-primary"}`} />
              {line}
            </li>))}
          </ul>
        </div>
      </div>


      <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border/60 pt-8 sm:flex-row">
        <p className="text-xs text-muted-foreground/70">
          {t("footer.copyright", { year: new Date().getFullYear() })}
        </p>

      </div>
    </div>
  </footer>);
}

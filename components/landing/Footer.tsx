import { prisma } from "@/lib/db/prisma";
import { Waves, Mail, Phone, MapPin, ExternalLink } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link as IntlLink } from "@/i18n/navigation";

export const dynamic = "force-dynamic";

async function getParametres() {
  const params = await prisma.parametres.findFirst();
  return params;
}

export async function Footer(props: { locale: string }) {
  const { locale } = props;
  const params = await getParametres();
  const t = await getTranslations({ locale, namespace: "landing" });

  const socialLinks = [
    {
      icon: ExternalLink,
      href: "https://facebook.com",
      ariaLabel: t("footer.social.facebook"),
    },
    {
      icon: ExternalLink,
      href: "https://twitter.com",
      ariaLabel: t("footer.social.twitter"),
    },
    {
      icon: ExternalLink,
      href: "https://instagram.com",
      ariaLabel: t("footer.social.instagram"),
    },
    {
      icon: ExternalLink,
      href: "https://linkedin.com",
      ariaLabel: t("footer.social.linkedin"),
    },
  ];

  return (
    <footer id="contact" className="border-t border-gray-100 bg-white py-12 dark:border-gray-800 dark:bg-gray-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Logo & Description */}
          <div className="md:col-span-1">
            <div className="mb-4 flex items-center gap-2">
              <Waves className="h-8 w-8 text-cyan-600" />
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                {t("footer.brand")}
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t("footer.description")}
            </p>
            <div className="mt-4 flex gap-3">
              {socialLinks.map((social, idx) => (
                <a
                  key={idx}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 transition-colors hover:text-cyan-600"
                  aria-label={social.ariaLabel}
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <h3 className="mb-4 font-semibold text-gray-900 dark:text-white">
              {t("footer.contact")}
            </h3>
            <ul className="space-y-2">
              {params?.emailCentre && (
                <li className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Mail className="h-4 w-4 text-cyan-600" />
                  {params.emailCentre}
                </li>
              )}
              {params?.telephoneCentre && (
                <li className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Phone className="h-4 w-4 text-cyan-600" />
                  {params.telephoneCentre}
                </li>
              )}
              {params?.adresseCentre && (
                <li className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <MapPin className="h-4 w-4 text-cyan-600" />
                  {params.adresseCentre}
                </li>
              )}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-4 font-semibold text-gray-900 dark:text-white">
              {t("footer.quickLinks")}
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <IntlLink
                  href="/auth/adherent/login"
                  className="text-gray-600 hover:text-cyan-600 dark:text-gray-400 dark:hover:text-cyan-400"
                >
                  {t("footer.memberArea")}
                </IntlLink>
              </li>
              <li>
                <IntlLink
                  href="/auth/login"
                  className="text-gray-600 hover:text-cyan-600 dark:text-gray-400 dark:hover:text-cyan-400"
                >
                  {t("footer.staffArea")}
                </IntlLink>
              </li>
              <li>
                <IntlLink
                  href="/privacy"
                  className="text-gray-600 hover:text-cyan-600 dark:text-gray-400 dark:hover:text-cyan-400"
                >
                  {t("footer.privacyPolicy")}
                </IntlLink>
              </li>
              <li>
                <IntlLink
                  href="/terms"
                  className="text-gray-600 hover:text-cyan-600 dark:text-gray-400 dark:hover:text-cyan-400"
                >
                  {t("footer.termsOfUse")}
                </IntlLink>
              </li>
            </ul>
          </div>

          {/* Opening Hours */}
          <div>
            <h3 className="mb-4 font-semibold text-gray-900 dark:text-white">
              {t("footer.openingHoursTitle")}
            </h3>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li>{t("footer.openingHours.monFri")}</li>
              <li>{t("footer.openingHours.sat")}</li>
              <li>{t("footer.openingHours.sun")}</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-100 pt-8 text-center dark:border-gray-800">
          <p className="text-sm text-gray-500 dark:text-gray-500">
            {t("footer.copyright", { year: new Date().getFullYear() })}
          </p>
        </div>
      </div>
    </footer>
  );
}
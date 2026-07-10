import { getRequestConfig } from "next-intl/server";
import { routing, type AppLocale } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  if (!locale || !routing.locales.includes(locale as AppLocale)) {
    locale = routing.defaultLocale;
  }

  const [
    base,
    faq,
    about,
    home,
    contact,
    corporate,
    legal,
    courses,
  ] = await Promise.all([
    import(`../messages/${locale}.json`),
    import(`../messages/faq-${locale}.json`),
    import(`../messages/about-${locale}.json`),
    import(`../messages/home-${locale}.json`),
    import(`../messages/contact-${locale}.json`),
    import(`../messages/corporate-${locale}.json`),
    import(`../messages/legal-${locale}.json`),
    import(`../messages/courses-${locale}.json`),
  ]);

  return {
    locale,
    messages: {
      ...base.default,
      faq: faq.default,
      about: about.default,
      home: home.default,
      contact: contact.default,
      corporate: corporate.default,
      legal: legal.default,
      courses: courses.default,
    },
  };
});

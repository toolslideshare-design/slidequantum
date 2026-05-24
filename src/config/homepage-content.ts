import type { HomepageContentData } from "@/types/content";
import homepageData from "@/data/homepage-content.json";

const data = homepageData as HomepageContentData;

export const heroContent = data.heroContent;
export const howItWorksContent = data.howItWorksContent;
export const differentiatorsContent = data.differentiatorsContent;
export const formatsContent = data.formatsContent;
export const featuresContent = data.featuresContent;
export const trustedUsersContent = data.trustedUsersContent;
export const comparisonContent = data.comparisonContent;
export const conclusionContent = data.conclusionContent;
export const faqContent = data.faqContent;

export const howItWorksSteps = howItWorksContent.steps;
export const formatInfo = formatsContent.items;
export const features = featuresContent.items;
export const trustedUsers = trustedUsersContent.items;
export const faqItems = faqContent.items;
export const finalCta = conclusionContent;

export type { HomepageContentData };

import { SiteContent } from "@/lib/content-types";

function hasText(value: string): boolean {
  return value.trim().length > 0;
}

export function isSiteConfigured(content: SiteContent): boolean {
  const profile = content.profile;

  return Boolean(
    hasText(profile.name) ||
      hasText(profile.role) ||
      hasText(profile.location) ||
      hasText(profile.email) ||
      hasText(profile.phone) ||
      hasText(profile.linkedin) ||
      hasText(profile.avatar) ||
      hasText(profile.cv) ||
      content.profile.summary.length > 0 ||
      content.profile.coreFocus.length > 0 ||
      content.experiences.length > 0 ||
      content.education.length > 0 ||
      content.organizations.length > 0 ||
      content.skills.length > 0 ||
      content.portfolio.length > 0
  );
}

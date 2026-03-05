import "server-only";

import {
  emptyContent,
  PortfolioStatus,
  PortfolioType,
  SiteContent,
  TechStackItem,
} from "@/lib/content-types";
import { restSelect } from "@/lib/supabase-rest";

export type { SiteContent, PortfolioStatus, PortfolioType, TechStackItem };
export { emptyContent };

interface RevisionRow {
  id: number;
  status: "draft" | "published" | "archived";
  snapshot: unknown;
  created_at: string;
}

interface ProfileRow {
  name: string;
  role: string;
  location: string;
  email: string;
  phone: string;
  linkedin: string;
  avatar_url: string;
  cv_url: string;
  summary: string[] | null;
  core_focus: string[] | null;
  hire_modal_title: string | null;
  hire_modal_subtitle: string | null;
  whatsapp_template: string | null;
  email_subject: string | null;
  email_template: string | null;
}

interface ExperienceRow {
  id: number;
  role: string;
  company: string;
  period: string;
  location: string;
  description: string[] | null;
  sort_order: number;
}

interface EducationRow {
  id: number;
  institution: string;
  degree: string;
  period: string;
  description: string | null;
  achievements: string[] | null;
  sort_order: number;
}

interface OrganizationRow {
  id: number;
  role: string;
  organization: string;
  period: string;
  description: string[] | null;
  sort_order: number;
}

interface SkillRow {
  id: number;
  category: string;
  name: string;
  icon: string;
  sort_order: number;
}

interface PortfolioRow {
  id: string;
  title: string;
  description: string;
  long_description: string | null;
  challenge: string | null;
  solution: string | null;
  features: string[] | null;
  tech_stack_details: TechStackItem[] | null;
  gallery: string[] | null;
  tags: string[] | null;
  image: string;
  type: PortfolioType;
  status: PortfolioStatus;
  url: string | null;
  pdf_url: string | null;
  video_url: string | null;
  role: string | null;
  timeline: string | null;
  maintenance_title: string | null;
  maintenance_icon: string | null;
  maintenance_header: string | null;
  maintenance_body: string | null;
  sort_order: number;
}

function asArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function asNumber(value: unknown, fallback = 0): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  return fallback;
}

function normalizeTechStack(value: unknown): TechStackItem[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      const obj = item as Record<string, unknown>;
      return {
        name: asString(obj.name),
        icon: asString(obj.icon),
      };
    })
    .filter((item) => item.name && item.icon);
}

function normalizeSiteContent(input: unknown): SiteContent {
  if (!input || typeof input !== "object") return emptyContent;
  const root = input as Record<string, unknown>;

  const profile = (root.profile || {}) as Record<string, unknown>;
  const experiences = asArray<Record<string, unknown>>(root.experiences);
  const education = asArray<Record<string, unknown>>(root.education);
  const organizations = asArray<Record<string, unknown>>(root.organizations);
  const skills = asArray<Record<string, unknown>>(root.skills);
  const portfolio = asArray<Record<string, unknown>>(root.portfolio);

  return {
    profile: {
      name: asString(profile.name),
      role: asString(profile.role),
      location: asString(profile.location),
      email: asString(profile.email),
      phone: asString(profile.phone),
      linkedin: asString(profile.linkedin),
      avatar: asString(profile.avatar),
      cv: asString(profile.cv),
      summary: asArray<string>(profile.summary),
      coreFocus: asArray<string>(profile.coreFocus),
      hireModalTitle: asString(profile.hireModalTitle, "Let's Work Together"),
      hireModalSubtitle: asString(
        profile.hireModalSubtitle,
        "Choose your preferred contact method."
      ),
      whatsappTemplate: asString(
        profile.whatsappTemplate,
        "Hello, I would like to discuss an opportunity."
      ),
      emailSubject: asString(profile.emailSubject, "Opportunity Discussion"),
      emailTemplate: asString(
        profile.emailTemplate,
        "Hello, I would like to discuss an opportunity."
      ),
    },
    experiences: experiences
      .map((item) => ({
        id: asNumber(item.id),
        role: asString(item.role),
        company: asString(item.company),
        period: asString(item.period),
        location: asString(item.location),
        description: asArray<string>(item.description),
        sortOrder: asNumber(item.sortOrder),
      }))
      .sort((a, b) => a.sortOrder - b.sortOrder),
    education: education
      .map((item) => ({
        id: asNumber(item.id),
        institution: asString(item.institution),
        degree: asString(item.degree),
        period: asString(item.period),
        description: asString(item.description),
        achievements: asArray<string>(item.achievements),
        sortOrder: asNumber(item.sortOrder),
      }))
      .sort((a, b) => a.sortOrder - b.sortOrder),
    organizations: organizations
      .map((item) => ({
        id: asNumber(item.id),
        role: asString(item.role),
        organization: asString(item.organization),
        period: asString(item.period),
        description: asArray<string>(item.description),
        sortOrder: asNumber(item.sortOrder),
      }))
      .sort((a, b) => a.sortOrder - b.sortOrder),
    skills: skills
      .map((item) => ({
        id: asNumber(item.id),
        category: asString(item.category),
        name: asString(item.name),
        icon: asString(item.icon),
        sortOrder: asNumber(item.sortOrder),
      }))
      .sort((a, b) => a.sortOrder - b.sortOrder),
    portfolio: portfolio
      .map((item) => ({
        id: asString(item.id),
        title: asString(item.title),
        description: asString(item.description),
        longDescription: asString(item.longDescription),
        challenge: asString(item.challenge),
        solution: asString(item.solution),
        features: asArray<string>(item.features),
        techStackDetails: normalizeTechStack(item.techStackDetails),
        gallery: asArray<string>(item.gallery),
        tags: asArray<string>(item.tags),
        image: asString(item.image),
        type: (asString(item.type) as PortfolioType) || "web",
        status: (asString(item.status) as PortfolioStatus) || "published",
        url: asString(item.url) || null,
        pdfUrl: asString(item.pdfUrl) || null,
        videoUrl: asString(item.videoUrl) || null,
        role: asString(item.role) || null,
        timeline: asString(item.timeline) || null,
        maintenanceTitle: asString(item.maintenanceTitle) || null,
        maintenanceIcon: asString(item.maintenanceIcon) || null,
        maintenanceHeader: asString(item.maintenanceHeader) || null,
        maintenanceBody: asString(item.maintenanceBody) || null,
        sortOrder: asNumber(item.sortOrder),
      }))
      .sort((a, b) => a.sortOrder - b.sortOrder),
  };
}

async function getPublishedRevisionContent(): Promise<SiteContent | null> {
  try {
    const rows = await restSelect<RevisionRow>("content_revisions", {
      status: "eq.published",
      order: "created_at.desc",
      limit: "1",
    });
    const row = rows[0];
    if (!row) return null;
    return normalizeSiteContent(row.snapshot);
  } catch {
    return null;
  }
}

async function getLegacyTableContent(): Promise<SiteContent | null> {
  try {
    const [profiles, experiences, education, organizations, skills, portfolio] =
      await Promise.all([
        restSelect<ProfileRow>("site_profile", { limit: "1" }),
        restSelect<ExperienceRow>("experiences", { order: "sort_order.asc" }),
        restSelect<EducationRow>("education", { order: "sort_order.asc" }),
        restSelect<OrganizationRow>("organizations", { order: "sort_order.asc" }),
        restSelect<SkillRow>("skills", { order: "sort_order.asc" }),
        restSelect<PortfolioRow>("portfolio_projects", { order: "sort_order.asc" }),
      ]);

    const profile = profiles[0];
    if (!profile) return null;

    return {
      profile: {
        name: profile.name,
        role: profile.role,
        location: profile.location,
        email: profile.email,
        phone: profile.phone,
        linkedin: profile.linkedin,
        avatar: profile.avatar_url,
        cv: profile.cv_url,
        summary: asArray<string>(profile.summary),
        coreFocus: asArray<string>(profile.core_focus),
        hireModalTitle: profile.hire_modal_title || "Let's Work Together",
        hireModalSubtitle:
          profile.hire_modal_subtitle || "Choose your preferred contact method.",
        whatsappTemplate:
          profile.whatsapp_template ||
          "Hello, I would like to discuss an opportunity.",
        emailSubject: profile.email_subject || "Opportunity Discussion",
        emailTemplate:
          profile.email_template ||
          "Hello, I would like to discuss an opportunity.",
      },
      experiences: experiences.map((item) => ({
        id: item.id,
        role: item.role,
        company: item.company,
        period: item.period,
        location: item.location,
        description: asArray<string>(item.description),
        sortOrder: item.sort_order,
      })),
      education: education.map((item) => ({
        id: item.id,
        institution: item.institution,
        degree: item.degree,
        period: item.period,
        description: item.description || "",
        achievements: asArray<string>(item.achievements),
        sortOrder: item.sort_order,
      })),
      organizations: organizations.map((item) => ({
        id: item.id,
        role: item.role,
        organization: item.organization,
        period: item.period,
        description: asArray<string>(item.description),
        sortOrder: item.sort_order,
      })),
      skills: skills.map((item) => ({
        id: item.id,
        category: item.category,
        name: item.name,
        icon: item.icon,
        sortOrder: item.sort_order,
      })),
      portfolio: portfolio.map((item) => ({
        id: item.id,
        title: item.title,
        description: item.description,
        longDescription: item.long_description || "",
        challenge: item.challenge || "",
        solution: item.solution || "",
        features: asArray<string>(item.features),
        techStackDetails: normalizeTechStack(item.tech_stack_details),
        gallery: asArray<string>(item.gallery),
        tags: asArray<string>(item.tags),
        image: item.image,
        type: item.type,
        status: item.status,
        url: item.url,
        pdfUrl: item.pdf_url,
        videoUrl: item.video_url,
        role: item.role,
        timeline: item.timeline,
        maintenanceTitle: item.maintenance_title,
        maintenanceIcon: item.maintenance_icon,
        maintenanceHeader: item.maintenance_header,
        maintenanceBody: item.maintenance_body,
        sortOrder: item.sort_order,
      })),
    };
  } catch {
    return null;
  }
}

export async function getSiteContent(): Promise<SiteContent> {
  const published = await getPublishedRevisionContent();
  if (published) return published;

  const legacy = await getLegacyTableContent();
  if (legacy) return legacy;

  return emptyContent;
}

export async function getPortfolioItemById(id: string) {
  const content = await getSiteContent();
  return content.portfolio.find((item) => item.id === id) || null;
}

export function normalizeSnapshotContent(input: unknown): SiteContent {
  return normalizeSiteContent(input);
}

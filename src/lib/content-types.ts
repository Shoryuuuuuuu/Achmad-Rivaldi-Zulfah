export type PortfolioType = "web" | "pdf" | "video" | "app";
export type PortfolioStatus = "published" | "maintenance" | "under_uploading";

export interface TechStackItem {
  name: string;
  icon: string;
}

export interface SiteProfile {
  name: string;
  role: string;
  location: string;
  email: string;
  phone: string;
  linkedin: string;
  avatar: string;
  cv: string;
  summary: string[];
  coreFocus: string[];
  hireModalTitle: string;
  hireModalSubtitle: string;
  whatsappTemplate: string;
  emailSubject: string;
  emailTemplate: string;
}

export interface ExperienceItem {
  id: number;
  role: string;
  company: string;
  period: string;
  location: string;
  description: string[];
  sortOrder: number;
}

export interface EducationItem {
  id: number;
  institution: string;
  degree: string;
  period: string;
  description?: string;
  achievements?: string[];
  sortOrder: number;
}

export interface OrganizationItem {
  id: number;
  role: string;
  organization: string;
  period: string;
  description: string[];
  sortOrder: number;
}

export interface SkillItem {
  id: number;
  category: string;
  name: string;
  icon: string;
  sortOrder: number;
}

export interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  longDescription: string;
  challenge: string;
  solution: string;
  features: string[];
  techStackDetails: TechStackItem[];
  gallery: string[];
  tags: string[];
  image: string;
  type: PortfolioType;
  status: PortfolioStatus;
  url?: string | null;
  pdfUrl?: string | null;
  videoUrl?: string | null;
  role?: string | null;
  timeline?: string | null;
  maintenanceTitle?: string | null;
  maintenanceIcon?: string | null;
  maintenanceHeader?: string | null;
  maintenanceBody?: string | null;
  sortOrder: number;
}

export interface SiteContent {
  profile: SiteProfile;
  experiences: ExperienceItem[];
  education: EducationItem[];
  organizations: OrganizationItem[];
  skills: SkillItem[];
  portfolio: PortfolioItem[];
}

export const emptyContent: SiteContent = {
  profile: {
    name: "",
    role: "",
    location: "",
    email: "",
    phone: "",
    linkedin: "",
    avatar: "",
    cv: "",
    summary: [],
    coreFocus: [],
    hireModalTitle: "Let's Work Together",
    hireModalSubtitle: "Choose your preferred contact method.",
    whatsappTemplate: "Hello, I would like to discuss an opportunity.",
    emailSubject: "Opportunity Discussion",
    emailTemplate: "Hello, I would like to discuss an opportunity.",
  },
  experiences: [],
  education: [],
  organizations: [],
  skills: [],
  portfolio: [],
};

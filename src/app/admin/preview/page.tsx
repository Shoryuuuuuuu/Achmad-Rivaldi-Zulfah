import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { About } from "@/components/sections/About";
import { Contact } from "@/components/sections/Contact";
import { Education } from "@/components/sections/Education";
import { Experience } from "@/components/sections/Experience";
import { Hero } from "@/components/sections/Hero";
import { Organization } from "@/components/sections/Organization";
import { Portfolio } from "@/components/sections/Portfolio";
import { Skills } from "@/components/sections/Skills";
import { SetupRequired } from "@/components/setup/SetupRequired";
import { getServerSession } from "@/lib/admin-session";
import { getDraftContent } from "@/lib/content-revisions";
import { isSiteConfigured } from "@/lib/site-setup";
import { redirect } from "next/navigation";

export default async function AdminPreviewPage() {
  const session = await getServerSession();
  if (!session) {
    redirect("/admin/login");
  }

  const content = await getDraftContent();
  const configured = isSiteConfigured(content);

  if (!configured) {
    return (
      <SetupRequired
        title="Draft masih kosong"
        description="Silakan isi data di dashboard admin. Preview publik akan muncul otomatis setelah data mulai terisi."
      />
    );
  }

  const hasAbout = content.profile.summary.length > 0 || content.profile.coreFocus.length > 0;
  const hasExperience = content.experiences.length > 0;
  const hasEducation = content.education.length > 0;
  const hasOrganization = content.organizations.length > 0;
  const hasSkills = content.skills.length > 0;
  const hasPortfolio = content.portfolio.length > 0;
  const hasContact = Boolean(
    content.profile.email.trim() ||
      content.profile.phone.trim() ||
      content.profile.linkedin.trim()
  );

  return (
    <main
      className="min-h-screen bg-background relative overflow-hidden"
      suppressHydrationWarning
    >
      <div className="fixed inset-0 z-0 pointer-events-none" suppressHydrationWarning>
        <div
          className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[100px] animate-[pulse_8s_infinite]"
          suppressHydrationWarning
        />
        <div
          className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-accent/5 blur-[100px] animate-[pulse_10s_infinite_2s]"
          suppressHydrationWarning
        />
        <div
          className="absolute top-[40%] left-[40%] w-[30%] h-[30%] rounded-full bg-secondary/5 blur-[100px] animate-[pulse_12s_infinite_4s]"
          suppressHydrationWarning
        />
      </div>

      <div className="relative z-10" suppressHydrationWarning>
        <Navbar profile={content.profile} />
        <Hero data={content.profile} />
        {hasAbout ? <About data={content.profile} /> : null}
        {hasExperience ? <Experience data={content.experiences} /> : null}
        {hasEducation ? <Education data={content.education} /> : null}
        {hasOrganization ? <Organization data={content.organizations} /> : null}
        {hasSkills ? <Skills data={content.skills} /> : null}
        {hasPortfolio ? <Portfolio limit={4} showSeeAll={true} data={content.portfolio} /> : null}
        {hasContact ? <Contact data={content.profile} /> : null}
        <Footer data={content.profile} />
      </div>
    </main>
  );
}

import { PageViewTracker } from "@/components/analytics/PageViewTracker";
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
import { getSiteContent } from "@/lib/site-content";
import { isSiteConfigured } from "@/lib/site-setup";

export default async function Home() {
  const content = await getSiteContent();
  const { profile, experiences, education, organizations, skills, portfolio } = content;
  const configured = isSiteConfigured(content);

  if (!configured) {
    return <SetupRequired />;
  }

  const hasAbout = profile.summary.length > 0 || profile.coreFocus.length > 0;
  const hasExperience = experiences.length > 0;
  const hasEducation = education.length > 0;
  const hasOrganization = organizations.length > 0;
  const hasSkills = skills.length > 0;
  const hasPortfolio = portfolio.length > 0;
  const hasContact = Boolean(
    profile.email.trim() || profile.phone.trim() || profile.linkedin.trim()
  );

  return (
    <main className="min-h-screen bg-background relative overflow-hidden" suppressHydrationWarning>
      <PageViewTracker path="/" />
      <div className="fixed inset-0 z-0 pointer-events-none" suppressHydrationWarning>
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[100px] animate-[pulse_8s_infinite]" suppressHydrationWarning />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-accent/5 blur-[100px] animate-[pulse_10s_infinite_2s]" suppressHydrationWarning />
        <div className="absolute top-[40%] left-[40%] w-[30%] h-[30%] rounded-full bg-secondary/5 blur-[100px] animate-[pulse_12s_infinite_4s]" suppressHydrationWarning />
      </div>

      <div className="relative z-10" suppressHydrationWarning>
        <Navbar profile={profile} />
        <Hero data={profile} />
        {hasAbout ? <About data={profile} /> : null}
        {hasExperience ? <Experience data={experiences} /> : null}
        {hasEducation ? <Education data={education} /> : null}
        {hasOrganization ? <Organization data={organizations} /> : null}
        {hasSkills ? <Skills data={skills} /> : null}
        {hasPortfolio ? <Portfolio limit={4} showSeeAll={true} data={portfolio} /> : null}
        {hasContact ? <Contact data={profile} /> : null}
        <Footer data={profile} />
      </div>
    </main>
  );
}

import { PageViewTracker } from "@/components/analytics/PageViewTracker";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { Portfolio } from "@/components/sections/Portfolio";
import { SetupRequired } from "@/components/setup/SetupRequired";
import { getSiteContent } from "@/lib/site-content";
import { isSiteConfigured } from "@/lib/site-setup";

export default async function PortfolioPage() {
    const content = await getSiteContent();
    const { portfolio, profile } = content;
    const configured = isSiteConfigured(content);

    if (!configured) {
        return <SetupRequired />;
    }

    return (
        <main className="min-h-screen bg-background relative overflow-hidden" suppressHydrationWarning>
            <PageViewTracker path="/portfolio" />
            <div className="fixed inset-0 z-0 pointer-events-none" suppressHydrationWarning>
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[100px] animate-[pulse_8s_infinite]" suppressHydrationWarning />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-accent/5 blur-[100px] animate-[pulse_10s_infinite_2s]" suppressHydrationWarning />
                <div className="absolute top-[40%] left-[40%] w-[30%] h-[30%] rounded-full bg-secondary/5 blur-[100px] animate-[pulse_12s_infinite_4s]" suppressHydrationWarning />
            </div>

            <div className="relative z-10" suppressHydrationWarning>
                <Navbar profile={profile} />
                <div className="pt-20">
                    <Portfolio data={portfolio} />
                </div>
                <Footer data={profile} />
            </div>
        </main>
    );
}

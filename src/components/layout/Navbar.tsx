"use client";

import { Button } from "@/components/ui/button";
import { HireMeModal } from "@/components/ui/hire-me-modal";
import { trackEvent } from "@/lib/tracking";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, useRef } from "react";

const navItems = [
    { name: "Home", href: "/" },
    { name: "About", href: "#about" },
    { name: "Experience", href: "#experience" },
    { name: "Skills", href: "#skills" },
    { name: "Portfolio", href: "#portfolio" },
    { name: "Contact", href: "#contact" },
];
interface NavbarProps {
    profile: {
        name: string;
        phone: string;
        email: string;
        hireModalTitle: string;
        hireModalSubtitle: string;
        whatsappTemplate: string;
        emailSubject: string;
        emailTemplate: string;
    };
}

export function Navbar({ profile }: NavbarProps) {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isHireModalOpen, setIsHireModalOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const pathname = usePathname();
    const hasHireContact = Boolean(profile.phone.trim() || profile.email.trim());
    const displayName = profile.name.trim() || "Profile";

    const [activeSection, setActiveSection] = useState("");
    const navRef = useRef<HTMLDivElement>(null);
    const itemRefs = useRef<{ [key: string]: HTMLAnchorElement | null }>({});

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 100);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveSection(entry.target.id);
                    }
                });
            },
            {
                rootMargin: "-50% 0px -50% 0px",
            }
        );

        navItems.forEach((item) => {
            if (item.href.startsWith("#")) {
                const id = item.href.substring(1);
                const element = document.getElementById(id);
                if (element) observer.observe(element);
            }
        });

        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (activeSection && navRef.current && itemRefs.current[activeSection]) {
            const container = navRef.current;
            const item = itemRefs.current[activeSection];

            if (item) {
                const containerWidth = container.offsetWidth;
                const itemLeft = item.offsetLeft;
                const itemWidth = item.offsetWidth;

                const scrollLeft = itemLeft - (containerWidth / 2) + (itemWidth / 2);

                container.scrollTo({
                    left: scrollLeft,
                    behavior: "smooth"
                });
            }
        }
    }, [activeSection]);

    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isMobileMenuOpen]);

    return (
        <>
            <LayoutGroup>
                <motion.header
                    suppressHydrationWarning
                    layout
                    initial={{ y: 0, width: "100%", borderRadius: 0, backgroundColor: "rgba(255, 255, 255, 0)", borderBottomColor: "rgba(0,0,0,0.1)" }}
                    animate={{
                        y: isScrolled ? 20 : 0,
                        borderRadius: isScrolled ? "9999px" : "0px",
                        backgroundColor: isScrolled ? "rgba(255, 255, 255, 0.05)" : "rgba(255, 255, 255, 0.8)",
                        borderBottomColor: isScrolled ? "rgba(0,0,0,0)" : "rgba(0,0,0,0.05)",
                        boxShadow: isScrolled
                            ? "0 8px 32px 0 rgba(31, 38, 135, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.4) inset"
                            : "none",
                        paddingLeft: isScrolled ? "12px" : "24px",
                        paddingRight: isScrolled ? "12px" : "24px",
                    }}
                    transition={{
                        duration: 0.8,
                        ease: [0.16, 1, 0.3, 1],
                    }}
                    className={cn(
                        "fixed z-50 left-1/2 -translate-x-1/2 supports-[backdrop-filter]:bg-opacity-60",
                        isScrolled ? "max-w-fit" : "w-full"
                    )}
                    style={{
                        backdropFilter: "blur(20px) saturate(180%)",
                        WebkitBackdropFilter: "blur(20px) saturate(180%)",
                        transform: "translateZ(0)",
                    }}
                >
                    <motion.div
                        suppressHydrationWarning
                        layout
                        className={cn(
                            "flex items-center mx-auto",
                            isScrolled ? "h-14 gap-2" : "h-16 w-full max-w-7xl justify-between"
                        )}
                    >
                        <motion.div
                            suppressHydrationWarning
                            layout="position"
                            initial={false}
                            animate={{
                                width: isScrolled ? 0 : "auto",
                                opacity: isScrolled ? 0 : 1,
                                scale: isScrolled ? 0.5 : 1,
                                marginRight: isScrolled ? 0 : 16,
                                filter: isScrolled ? "blur(10px)" : "blur(0px)",
                                display: isScrolled ? "none" : "flex"
                            }}
                            transition={{
                                duration: 0.5,
                                ease: [0.33, 1, 0.68, 1]
                            }}
                            className="flex items-center gap-2 overflow-hidden shrink-0 origin-left"
                        >
                            <Link href="/" className="text-xl font-bold text-primary whitespace-nowrap">
                                {displayName}
                            </Link>
                        </motion.div>

                        <motion.div
                            suppressHydrationWarning
                            layout
                            animate={{ flexGrow: isScrolled ? 0 : 1 }}
                            transition={{ duration: 0.6, ease: [0.33, 1, 0.68, 1] }}
                            className={cn(!isScrolled && "hidden md:block")}
                        />

                        <motion.nav
                            ref={navRef}
                            suppressHydrationWarning
                            className={cn(
                                "items-center overflow-x-auto no-scrollbar mask-gradient",
                                isScrolled ? "flex" : "hidden md:flex"
                            )}
                        >
                            {navItems.map((item) => (
                                <Link
                                    key={item.name}
                                    href={
                                        item.href === "/"
                                            ? "/"
                                            : pathname === "/"
                                                ? item.href
                                                : `/${item.href}`
                                    }
                                    ref={(el) => {
                                        if (item.href.startsWith("#")) {
                                            itemRefs.current[item.href.substring(1)] = el;
                                        }
                                        return undefined;
                                    }}
                                    className={cn(
                                        "text-sm font-medium whitespace-nowrap px-4 py-2 rounded-full transition-colors",
                                        isScrolled ? "text-foreground/80" : "text-muted-foreground",
                                        activeSection === item.href.substring(1) && "bg-primary/10 text-primary"
                                    )}
                                >
                                    {item.name}
                                </Link>
                            ))}
                        </motion.nav>

                        <motion.div
                            suppressHydrationWarning
                            layout
                            animate={{ flexGrow: isScrolled ? 0 : 1 }}
                            transition={{ duration: 0.6, ease: [0.33, 1, 0.68, 1] }}
                            className={cn(!isScrolled && "hidden md:block")}
                        />

                        {hasHireContact ? (
                            <motion.div
                                suppressHydrationWarning
                                className={cn(
                                    "shrink-0",
                                    isScrolled ? "ml-1" : "ml-4",
                                    !isScrolled && "hidden md:block"
                                )}
                            >
                                <Button
                                    size={isScrolled ? "sm" : "default"}
                                    className="rounded-full shadow-lg shadow-primary/20"
                                    onClick={() => {
                                        trackEvent({
                                            eventName: "hire_me_open",
                                            metadata: { source: "navbar" },
                                        });
                                        setIsHireModalOpen(true);
                                    }}
                                >
                                    Hire Me
                                </Button>
                            </motion.div>
                        ) : null}

                        {!isScrolled && (
                            <motion.button
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                onClick={() => setIsMobileMenuOpen(true)}
                                className="md:hidden p-2 text-primary"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <line x1="4" x2="20" y1="12" y2="12" />
                                    <line x1="4" x2="20" y1="6" y2="6" />
                                    <line x1="4" x2="20" y1="18" y2="18" />
                                </svg>
                            </motion.button>
                        )}
                    </motion.div>
                </motion.header>
            </LayoutGroup>

            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                        className="fixed inset-0 z-[60] bg-background/95 backdrop-blur-sm md:hidden"
                    >
                        <div className="flex flex-col h-full p-6">
                            <div className="flex items-center justify-between mb-8">
                                <span className="text-xl font-bold text-primary">{displayName}</span>
                                <button
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="p-2 text-primary"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="24"
                                        height="24"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <path d="M18 6 6 18" />
                                        <path d="m6 6 12 12" />
                                    </svg>
                                </button>
                            </div>
                            <nav className="flex flex-col gap-6">
                                {navItems.map((item) => (
                                    <Link
                                        key={item.name}
                                        href={
                                            item.href === "/"
                                                ? "/"
                                                : pathname === "/"
                                                    ? item.href
                                                    : `/${item.href}`
                                        }
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="text-2xl font-medium text-foreground hover:text-primary transition-colors"
                                    >
                                        {item.name}
                                    </Link>
                                ))}
                                {hasHireContact ? (
                                    <Button
                                        size="lg"
                                        className="w-full mt-4 rounded-full shadow-lg shadow-primary/20"
                                        onClick={() => {
                                            setIsMobileMenuOpen(false);
                                            trackEvent({
                                                eventName: "hire_me_open",
                                                metadata: { source: "mobile_menu" },
                                            });
                                            setIsHireModalOpen(true);
                                        }}
                                    >
                                        Hire Me
                                    </Button>
                                ) : null}
                            </nav>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <HireMeModal
                isOpen={isHireModalOpen}
                onClose={() => setIsHireModalOpen(false)}
                profile={profile}
            />
        </>
    );
}

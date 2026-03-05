"use client";

import { Button } from "@/components/ui/button";
import { trackEvent } from "@/lib/tracking";
import { motion } from "framer-motion";
import { Download, Mail } from "lucide-react";
import Image from "next/image";

interface HeroProps {
    data: {
        name: string;
        role: string;
        avatar: string;
        cv?: string;
    };
}

export function Hero({ data }: HeroProps) {
    const avatarSrc = data.avatar?.trim() || "/globe.svg";
    const hasCv = Boolean(data.cv?.trim());

    return (
        <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-4 py-20 text-center md:px-8" suppressHydrationWarning>
            <div className="absolute -left-20 -top-20 h-96 w-96 rounded-full bg-primary/10 blur-3xl" suppressHydrationWarning />
            <div className="absolute -bottom-20 -right-20 h-96 w-96 rounded-full bg-accent/10 blur-3xl" suppressHydrationWarning />

            <motion.div
                suppressHydrationWarning
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="z-10 flex flex-col items-center gap-6"
            >
                <div className="relative h-40 w-40 overflow-hidden rounded-full border-4 border-white shadow-xl md:h-56 md:w-56" suppressHydrationWarning>
                    <Image
                        src={avatarSrc}
                        alt={data.name || "Profile Avatar"}
                        fill
                        className="object-cover"
                        priority
                        sizes="(max-width: 768px) 160px, 224px"
                    />
                </div>

                <div className="space-y-4" suppressHydrationWarning>
                    <h1 className="text-4xl font-bold tracking-tight text-foreground md:text-6xl lg:text-7xl">
                        {data.name}
                    </h1>
                    <p className="mx-auto max-w-2xl text-lg text-secondary-light md:text-xl">
                        {data.role}
                    </p>
                </div>

                <div className="flex flex-col gap-4 sm:flex-row" suppressHydrationWarning>
                    {hasCv ? (
                        <Button
                            size="lg"
                            className="group relative overflow-hidden gap-2 transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_rgba(15,98,254,0.5)]"
                            asChild
                        >
                            <a
                                href={data.cv}
                                download
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={() =>
                                    trackEvent({
                                        eventName: "cv_download_click",
                                    })
                                }
                            >
                                <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                                <Download className="h-4 w-4 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" />
                                <span className="relative">Download CV</span>
                            </a>
                        </Button>
                    ) : null}
                    <Button
                        size="lg"
                        variant="outline"
                        className="group relative overflow-hidden gap-2 transition-all duration-300 hover:scale-105 hover:bg-primary/5 hover:text-primary hover:border-primary"
                        asChild
                    >
                        <a
                            href="#contact"
                            onClick={() =>
                                trackEvent({
                                    eventName: "contact_click",
                                    metadata: { channel: "hero_contact_button" },
                                })
                            }
                        >
                            <Mail className="h-4 w-4 transition-transform group-hover:rotate-12" />
                            <span className="relative">Contact Me</span>
                        </a>
                    </Button>
                </div>
            </motion.div>
        </section>
    );
}

"use client";

import { trackEvent } from "@/lib/tracking";
import { Linkedin, Mail } from "lucide-react";
import Link from "next/link";

interface FooterProps {
    data: {
        name: string;
        linkedin: string;
        email: string;
    };
}

export function Footer({ data }: FooterProps) {
    const hasLinkedin = Boolean(data.linkedin.trim());
    const hasEmail = Boolean(data.email.trim());
    const hasContact = hasLinkedin || hasEmail;

    return (
        <footer className="border-t bg-background py-8 text-center text-sm text-muted-foreground" suppressHydrationWarning>
            <div className="container mx-auto flex flex-col items-center gap-6 px-4" suppressHydrationWarning>
                {hasContact ? (
                    <div className="flex items-center gap-4" suppressHydrationWarning>
                        {hasLinkedin ? (
                            <Link
                                href={data.linkedin}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="rounded-full bg-secondary/10 p-3 transition-colors hover:bg-primary/10 hover:text-primary"
                                onClick={() =>
                                    trackEvent({
                                        eventName: "contact_click",
                                        metadata: { channel: "linkedin_footer" },
                                    })
                                }
                            >
                                <Linkedin className="h-5 w-5" />
                                <span className="sr-only">LinkedIn</span>
                            </Link>
                        ) : null}
                        {hasEmail ? (
                            <Link
                                href={`mailto:${data.email}`}
                                className="rounded-full bg-secondary/10 p-3 transition-colors hover:bg-primary/10 hover:text-primary"
                                onClick={() =>
                                    trackEvent({
                                        eventName: "contact_click",
                                        metadata: { channel: "email_footer" },
                                    })
                                }
                            >
                                <Mail className="h-5 w-5" />
                                <span className="sr-only">Email</span>
                            </Link>
                        ) : null}
                    </div>
                ) : null}
                <p>
                    &copy; {new Date().getFullYear()} {data.name || "Profile Owner"}. All
                    rights reserved.
                </p>
            </div>
        </footer>
    );
}

"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trackEvent } from "@/lib/tracking";
import { motion } from "framer-motion";
import { Linkedin, Mail, MessageSquare, Phone } from "lucide-react";
import Link from "next/link";

interface ContactProps {
    data: {
        email: string;
        phone: string;
        linkedin: string;
    };
}

export function Contact({ data }: ContactProps) {
    const hasEmail = Boolean(data.email.trim());
    const hasPhone = Boolean(data.phone.trim());
    const hasLinkedin = Boolean(data.linkedin.trim());
    const hasContactInfo = hasEmail || hasPhone || hasLinkedin;

    return (
        <section id="contact" className="py-20 bg-white">
            <div className="container mx-auto px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    viewport={{ once: true }}
                    className="mb-12 text-center"
                >
                    <h2 className="text-3xl font-bold text-primary md:text-4xl">
                        Get In Touch
                    </h2>
                    <p className="mt-4 text-lg text-secondary-light">
                        Feel free to reach out for collaborations or just a friendly hello
                    </p>
                </motion.div>

                <div className="mx-auto max-w-4xl" suppressHydrationWarning>
                    <div className="grid gap-8 md:grid-cols-2" suppressHydrationWarning>
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5 }}
                            viewport={{ once: true }}
                        >
                            <Card className="h-full shadow-md">
                                <CardHeader>
                                    <CardTitle className="text-xl font-bold">
                                        Contact Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {hasEmail ? (
                                        <div className="flex items-center gap-4">
                                            <div className="rounded-full bg-primary/10 p-3 text-primary">
                                                <Mail className="h-6 w-6" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-muted-foreground">
                                                    Email
                                                </p>
                                                <Link
                                                    href={`mailto:${data.email}`}
                                                    className="text-lg font-medium hover:text-primary"
                                                    onClick={() =>
                                                        trackEvent({
                                                            eventName: "contact_click",
                                                            metadata: { channel: "email" },
                                                        })
                                                    }
                                                >
                                                    {data.email}
                                                </Link>
                                            </div>
                                        </div>
                                    ) : null}

                                    {hasPhone ? (
                                        <div className="flex items-center gap-4">
                                            <div className="rounded-full bg-primary/10 p-3 text-primary">
                                                <Phone className="h-6 w-6" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-muted-foreground">
                                                    Phone
                                                </p>
                                                <Link
                                                    href={`tel:${data.phone}`}
                                                    className="text-lg font-medium hover:text-primary"
                                                    onClick={() =>
                                                        trackEvent({
                                                            eventName: "contact_click",
                                                            metadata: { channel: "phone" },
                                                        })
                                                    }
                                                >
                                                    {data.phone}
                                                </Link>
                                            </div>
                                        </div>
                                    ) : null}

                                    {hasLinkedin ? (
                                        <div className="flex items-center gap-4">
                                            <div className="rounded-full bg-primary/10 p-3 text-primary">
                                                <Linkedin className="h-6 w-6" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-muted-foreground">
                                                    LinkedIn
                                                </p>
                                                <Link
                                                    href={data.linkedin}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-lg font-medium hover:text-primary"
                                                    onClick={() =>
                                                        trackEvent({
                                                            eventName: "contact_click",
                                                            metadata: { channel: "linkedin" },
                                                        })
                                                    }
                                                >
                                                    {data.linkedin.replace("https://", "")}
                                                </Link>
                                            </div>
                                        </div>
                                    ) : null}

                                    {!hasContactInfo ? (
                                        <p className="text-sm text-slate-500">
                                            Contact info belum diisi.
                                        </p>
                                    ) : null}
                                </CardContent>
                            </Card>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5 }}
                            viewport={{ once: true }}
                        >
                            <Card className="h-full shadow-md" suppressHydrationWarning>
                                <CardHeader suppressHydrationWarning>
                                    <CardTitle className="text-xl font-bold">
                                        Send a Message
                                    </CardTitle>
                                </CardHeader>
                                <CardContent suppressHydrationWarning>
                                    <form className="space-y-4" suppressHydrationWarning>
                                        <div className="grid gap-2" suppressHydrationWarning>
                                            <label
                                                htmlFor="name"
                                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                            >
                                                Name
                                            </label>
                                            <input
                                                suppressHydrationWarning
                                                type="text"
                                                id="name"
                                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                placeholder="Your name"
                                            />
                                        </div>
                                        <div className="grid gap-2" suppressHydrationWarning>
                                            <label
                                                htmlFor="email"
                                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                            >
                                                Email
                                            </label>
                                            <input
                                                suppressHydrationWarning
                                                type="email"
                                                id="email"
                                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                placeholder="Your email"
                                            />
                                        </div>
                                        <div className="grid gap-2" suppressHydrationWarning>
                                            <label
                                                htmlFor="message"
                                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                            >
                                                Message
                                            </label>
                                            <textarea
                                                suppressHydrationWarning
                                                id="message"
                                                className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                placeholder="Your message"
                                            />
                                        </div>
                                        <Button className="w-full">Send Message</Button>
                                    </form>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </div>

                    {hasPhone ? (
                        <div className="mt-12 text-center" suppressHydrationWarning>
                            <Button
                                size="lg"
                                className="gap-2 rounded-full bg-[#25D366] hover:bg-[#25D366]/90"
                                asChild
                            >
                                <Link
                                    href={`https://wa.me/${data.phone.replace("+", "")}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={() =>
                                        trackEvent({
                                            eventName: "contact_click",
                                            metadata: { channel: "whatsapp" },
                                        })
                                    }
                                >
                                    <MessageSquare className="h-5 w-5" />
                                    Chat on WhatsApp
                                </Link>
                            </Button>
                        </div>
                    ) : null}
                </div>
            </div>
        </section>
    );
}

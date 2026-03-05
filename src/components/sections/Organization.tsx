"use client";

import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Users } from "lucide-react";

interface OrganizationProps {
    data: {
        role: string;
        organization: string;
        period: string;
        description: string[];
    }[];
}

export function Organization({ data }: OrganizationProps) {
    return (
        <section id="organization" className="py-20 bg-background" suppressHydrationWarning>
            <div className="container mx-auto px-4" suppressHydrationWarning>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    viewport={{ once: true }}
                    className="mb-12 text-center"
                    suppressHydrationWarning
                >
                    <h2 className="text-3xl font-bold text-primary md:text-4xl">
                        Organization Experience
                    </h2>
                </motion.div>

                <motion.div
                    className="mx-auto grid max-w-4xl gap-8"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    variants={{
                        hidden: { opacity: 0 },
                        visible: {
                            opacity: 1,
                            transition: {
                                staggerChildren: 0.2
                            }
                        }
                    }}
                    suppressHydrationWarning
                >
                    {data.map((org, index) => (
                        <motion.div
                            key={index}
                            variants={{
                                hidden: { opacity: 0, y: 50 },
                                visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 50 } }
                            }}
                            whileTap={{ scale: 0.98 }}
                            suppressHydrationWarning
                        >
                            <Card className="overflow-hidden border-none shadow-lg transition-all duration-300 hover:shadow-xl hover:shadow-primary/5" suppressHydrationWarning>
                                <CardContent className="p-0" suppressHydrationWarning>
                                    <div className="flex flex-col md:flex-row" suppressHydrationWarning>
                                        <div className="flex flex-col items-center justify-center bg-accent/5 p-8 md:w-1/3 md:items-start md:justify-start md:border-r md:bg-accent/5" suppressHydrationWarning>
                                            <div className="mb-4 rounded-full bg-white p-4 shadow-sm" suppressHydrationWarning>
                                                <Users className="h-8 w-8 text-accent" />
                                            </div>
                                            <h3 className="text-center text-xl font-bold text-foreground md:text-left">
                                                {org.organization}
                                            </h3>
                                            <p className="mt-2 text-center text-sm font-medium text-primary md:text-left">
                                                {org.role}
                                            </p>
                                            <div className="mt-4 rounded-full bg-white px-4 py-1 text-xs font-medium text-secondary shadow-sm" suppressHydrationWarning>
                                                {org.period}
                                            </div>
                                        </div>
                                        <div className="flex-1 p-8" suppressHydrationWarning>
                                            <h4 className="mb-4 text-lg font-semibold text-foreground">
                                                Key Responsibilities
                                            </h4>
                                            <ul className="grid gap-3" suppressHydrationWarning>
                                                {org.description.map((desc, i) => (
                                                    <li key={i} className="flex items-start gap-3 text-secondary-light">
                                                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                                                        <span className="leading-relaxed">{desc}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}

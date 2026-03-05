"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Briefcase } from "lucide-react";

interface ExperienceProps {
    data: {
        role: string;
        company: string;
        period: string;
        location: string;
        description: string[];
    }[];
}

export function Experience({ data }: ExperienceProps) {
    return (
        <section id="experience" className="py-20 bg-white/50 dark:bg-transparent" suppressHydrationWarning>
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
                        Work Experience
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
                    {data.map((exp, index) => (
                        <motion.div
                            key={index}
                            variants={{
                                hidden: { opacity: 0, y: 50 },
                                visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 50 } }
                            }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <Card className="relative overflow-hidden shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5" suppressHydrationWarning>
                                <CardHeader className="pb-2" suppressHydrationWarning>
                                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between" suppressHydrationWarning>
                                        <div className="flex items-start gap-4" suppressHydrationWarning>
                                            <div className="mt-1 rounded-full bg-accent/10 p-3 text-accent shrink-0" suppressHydrationWarning>
                                                <Briefcase className="h-6 w-6" />
                                            </div>
                                            <div suppressHydrationWarning>
                                                <CardTitle className="text-xl font-bold leading-tight">
                                                    {exp.role}
                                                </CardTitle>
                                                <p className="text-lg font-medium text-primary mt-1">
                                                    {exp.company}
                                                </p>
                                                <div className="mt-3 flex flex-col gap-2 md:hidden" suppressHydrationWarning>
                                                    <span className="inline-flex w-fit items-center rounded-full bg-secondary/10 px-3 py-1 text-xs font-medium text-secondary">
                                                        {exp.period}
                                                    </span>
                                                    <span className="text-sm text-muted-foreground">
                                                        {exp.location}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="hidden flex-col items-end gap-1 md:flex" suppressHydrationWarning>
                                            <span className="rounded-full bg-secondary/10 px-3 py-1 text-sm font-medium text-secondary">
                                                {exp.period}
                                            </span>
                                            <span className="text-sm text-muted-foreground">
                                                {exp.location}
                                            </span>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="md:pl-[5.5rem] pt-2 md:pt-0" suppressHydrationWarning>
                                    <ul className="list-disc space-y-2 pl-4 text-secondary-light">
                                        {exp.description.map((desc, i) => (
                                            <li key={i}>{desc}</li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}

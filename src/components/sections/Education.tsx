"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { GraduationCap } from "lucide-react";

interface EducationProps {
    data: {
        institution: string;
        degree: string;
        period: string;
        description?: string;
        achievements?: string[];
    }[];
}

export function Education({ data }: EducationProps) {
    return (
        <section id="education" className="py-20 bg-background" suppressHydrationWarning>
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
                        Education
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
                    {data.map((edu, index) => (
                        <motion.div
                            key={index}
                            variants={{
                                hidden: { opacity: 0, x: index % 2 === 0 ? -50 : 50 },
                                visible: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 50 } }
                            }}
                            whileTap={{ scale: 0.98 }}
                            suppressHydrationWarning
                        >
                            <Card className="overflow-hidden border-l-4 border-l-primary shadow-md transition-shadow hover:shadow-lg" suppressHydrationWarning>
                                <CardHeader className="flex flex-row items-start gap-4 pb-2" suppressHydrationWarning>
                                    <div className="rounded-full bg-primary/10 p-3 text-primary shrink-0" suppressHydrationWarning>
                                        <GraduationCap className="h-6 w-6" />
                                    </div>
                                    <div suppressHydrationWarning>
                                        <CardTitle className="text-xl font-bold">
                                            {edu.institution}
                                        </CardTitle>
                                        <p className="text-sm font-medium text-accent">
                                            {edu.degree}
                                        </p>
                                        <p className="text-sm text-muted-foreground">{edu.period}</p>
                                    </div>
                                </CardHeader>
                                <CardContent className="md:pl-[5.5rem] pt-2 md:pt-0" suppressHydrationWarning>
                                    {edu.description && (
                                        <p className="text-secondary-light">{edu.description}</p>
                                    )}
                                    {edu.achievements && (
                                        <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-secondary-light">
                                            {edu.achievements.map((achievement, i) => (
                                                <li key={i}>{achievement}</li>
                                            ))}
                                        </ul>
                                    )}
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}

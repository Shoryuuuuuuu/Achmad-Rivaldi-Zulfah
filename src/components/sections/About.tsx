"use client";

import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";

interface AboutProps {
    data: {
        summary: string[];
        coreFocus?: string[];
    };
}

export function About({ data }: AboutProps) {
    return (
        <section id="about" className="py-20 bg-background relative overflow-hidden" suppressHydrationWarning>
            <div className="absolute top-0 right-0 -mr-20 -mt-20 h-64 w-64 rounded-full bg-primary/5 blur-3xl" suppressHydrationWarning />

            <div className="container mx-auto px-4 relative z-10" suppressHydrationWarning>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    viewport={{ once: true }}
                    className="mx-auto max-w-4xl text-center"
                >
                    <h2 className="mb-8 text-3xl font-bold text-primary md:text-4xl">
                        About Me
                    </h2>
                    <Card className="border-none bg-white/50 backdrop-blur-sm shadow-xl ring-1 ring-black/5" suppressHydrationWarning>
                        <CardContent className="p-8 md:p-12" suppressHydrationWarning>
                            <div className="space-y-6 text-lg leading-loose tracking-wide text-secondary-light/90 md:text-xl text-justify hyphens-auto font-light" suppressHydrationWarning>
                                {data.summary.map((paragraph, index) => (
                                    <p key={index}>
                                        {paragraph}
                                    </p>
                                ))}
                            </div>

                            <div className="mt-10 pt-8 border-t border-dashed" suppressHydrationWarning>
                                <p className="text-sm font-semibold text-primary mb-6 uppercase tracking-wider">
                                    Core Focus
                                </p>
                                <div className="flex flex-wrap justify-center gap-3" suppressHydrationWarning>
                                    {(data.coreFocus || []).map((tag, i) => (
                                        <span
                                            key={i}
                                            className="px-4 py-2 rounded-lg bg-primary/5 text-primary text-sm font-medium border border-primary/10 transition-colors hover:bg-primary/10"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </section>
    );
}

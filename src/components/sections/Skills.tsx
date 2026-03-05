"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { getIcon } from "@/components/ui/icon-mapper";

interface SkillsProps {
    data: {
        category: string;
        name: string;
        icon: string;
    }[];
}

export function Skills({ data }: SkillsProps) {
    const groupedSkills = data.reduce((acc, skill) => {
        if (!acc[skill.category]) {
            acc[skill.category] = [];
        }
        acc[skill.category].push(skill);
        return acc;
    }, {} as Record<string, typeof data>);

    const categories = Object.keys(groupedSkills).map(category => ({
        category,
        items: groupedSkills[category]
    }));
    return (
        <section id="skills" className="py-20 bg-white/50 dark:bg-transparent" suppressHydrationWarning>
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
                        Skills & Expertise
                    </h2>
                </motion.div>

                <motion.div
                    className="mx-auto grid max-w-5xl gap-8 md:grid-cols-2"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    variants={{
                        hidden: { opacity: 0 },
                        visible: {
                            opacity: 1,
                            transition: {
                                staggerChildren: 0.15
                            }
                        }
                    }}
                    suppressHydrationWarning
                >
                    {categories.map((category, index) => (
                        <motion.div
                            key={index}
                            variants={{
                                hidden: { opacity: 0, scale: 0.9 },
                                visible: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 50 } }
                            }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <Card className="h-full shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5" suppressHydrationWarning>
                                <CardHeader suppressHydrationWarning>
                                    <CardTitle className="text-xl font-bold text-primary">
                                        {category.category}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent suppressHydrationWarning>
                                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3" suppressHydrationWarning>
                                        {category.items.map((skill, i) => (
                                            <div
                                                key={i}
                                                className="flex flex-col items-center justify-center gap-2 rounded-lg bg-background p-4 text-center shadow-sm transition-colors hover:bg-accent/5"
                                                suppressHydrationWarning
                                            >
                                                {skill.icon.startsWith("emoji:") ? (
                                                    <span className="text-3xl leading-none">
                                                        {skill.icon.replace("emoji:", "")}
                                                    </span>
                                                ) : (
                                                    (() => {
                                                        const Icon = getIcon(skill.icon);
                                                        return <Icon className="h-8 w-8 text-accent" />;
                                                    })()
                                                )}
                                                <span className="text-sm font-medium text-secondary">
                                                    {skill.name}
                                                </span>
                                            </div>
                                        ))}
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

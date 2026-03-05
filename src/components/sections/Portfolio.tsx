"use client";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { trackEvent } from "@/lib/tracking";
import { motion, useDragControls, useMotionValue } from "framer-motion";
import { ExternalLink, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState, useCallback, useEffect } from "react";

interface PortfolioProps {
    limit?: number;
    showSeeAll?: boolean;
    data: {
        id: string;
        title: string;
        description: string;
        image: string;
        tags: string[];
        status?: "published" | "maintenance" | "under_uploading";
        maintenanceTitle?: string | null;
        maintenanceIcon?: string | null;
        maintenanceHeader?: string | null;
        maintenanceBody?: string | null;
    }[];
}

export function Portfolio({ limit, showSeeAll = false, data }: PortfolioProps) {
    const displayedPortfolio = limit ? data.slice(0, limit) : data;
    const [activeModalProject, setActiveModalProject] = useState<PortfolioProps["data"][number] | null>(null);
    const dragControls = useDragControls();

    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const width = useMotionValue(600);
    const height = useMotionValue(400);

    useEffect(() => {
        if (activeModalProject?.id) {
            x.set(0);
            y.set(0);
            width.set(600);
            height.set(400);
        }
    }, [activeModalProject, x, y, width, height]);

    const handleResize = useCallback((e: React.PointerEvent, direction: string) => {
        e.preventDefault();
        const startX = e.clientX;
        const startY = e.clientY;
        const startWidth = width.get();
        const startHeight = height.get();
        const startXPos = x.get();
        const startYPos = y.get();

        const onPointerMove = (e: PointerEvent) => {
            const deltaX = e.clientX - startX;
            const deltaY = e.clientY - startY;

            if (direction.includes('e')) width.set(Math.max(400, startWidth + deltaX));
            if (direction.includes('s')) height.set(Math.max(300, startHeight + deltaY));
            if (direction.includes('w')) {
                const newWidth = Math.max(400, startWidth - deltaX);
                width.set(newWidth);
                x.set(startXPos + (startWidth - newWidth));
            }
            if (direction.includes('n')) {
                const newHeight = Math.max(300, startHeight - deltaY);
                height.set(newHeight);
                y.set(startYPos + (startHeight - newHeight));
            }
        };

        const onPointerUp = () => {
            document.removeEventListener('pointermove', onPointerMove);
            document.removeEventListener('pointerup', onPointerUp);
        };

        document.addEventListener('pointermove', onPointerMove);
        document.addEventListener('pointerup', onPointerUp);
    }, [width, height, x, y]);

    const getModalContent = (project: PortfolioProps["data"][number]) => {
        if (project.status === "under_uploading") {
            return {
                title: project.maintenanceTitle || `${project.title} - Uploading`,
                icon: project.maintenanceIcon || "🚀",
                header: project.maintenanceHeader || "Project Under Uploading",
                body:
                    project.maintenanceBody ||
                    "Project ini sedang dalam proses upload. Silakan cek kembali dalam waktu dekat.",
            };
        }

        return {
            title: project.maintenanceTitle || `${project.title} - Maintenance`,
            icon: project.maintenanceIcon || "🚧",
            header: project.maintenanceHeader || "Project Under Maintenance",
            body:
                project.maintenanceBody ||
                "Mohon maaf, proyek ini sedang maintenance dan akan segera kembali online.",
        };
    };

    return (
        <section id="portfolio" className="py-20 bg-background" suppressHydrationWarning>
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
                        Portfolio
                    </h2>
                    <p className="mt-4 text-lg text-secondary-light">
                        Selected projects and works
                    </p>
                </motion.div>

                <motion.div
                    className="mx-auto grid max-w-6xl gap-8 md:grid-cols-2 lg:grid-cols-2"
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
                    {displayedPortfolio.map((project, index) => {
                        const isPdf = project.image.endsWith('.pdf');
                        const isVideo = project.image.endsWith('.mp4') || project.image.endsWith('.mov');
                        const isSpecialProject = project.status && project.status !== "published";

                        return (
                            <motion.div
                                key={index}
                                variants={{
                                    hidden: { opacity: 0, y: 50 },
                                    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 50 } }
                                }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <Card className="group flex h-full flex-col overflow-hidden shadow-md transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/10" suppressHydrationWarning>
                                    <div className="relative h-48 w-full overflow-hidden bg-muted flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800" suppressHydrationWarning>
                                        {isPdf ? (
                                            <div className="flex flex-col items-center justify-center text-white/50 group-hover:text-white/80 transition-colors">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /></svg>
                                                <span className="text-sm font-medium mt-2">PDF Module</span>
                                            </div>
                                        ) : isVideo ? (
                                            <div className="flex flex-col items-center justify-center text-white/50 group-hover:text-white/80 transition-colors">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" /></svg>
                                                <span className="text-sm font-medium mt-2">Video Branding</span>
                                            </div>
                                        ) : (
                                            <Image
                                                src={project.image}
                                                alt={project.title}
                                                fill
                                                className="object-cover transition-transform duration-300 hover:scale-105"
                                                unoptimized={project.image.endsWith('.gif')}
                                            />
                                        )}
                                    </div>
                                    <CardHeader suppressHydrationWarning>
                                        <CardTitle className="text-xl font-bold">
                                            {project.title}
                                        </CardTitle>
                                        <div className="flex flex-wrap gap-2 pt-2" suppressHydrationWarning>
                                            {project.tags.map((tag, i) => (
                                                <span
                                                    key={i}
                                                    className="rounded-full bg-secondary/5 px-2.5 py-0.5 text-xs font-medium text-secondary shadow-sm"
                                                >
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </CardHeader>
                                    <CardContent className="flex-grow" suppressHydrationWarning>
                                        <CardDescription className="text-base line-clamp-3">
                                            {project.description}
                                        </CardDescription>
                                    </CardContent>
                                    <CardFooter>
                                        {isSpecialProject ? (
                                            <Button
                                                className="w-full gap-2"
                                                variant="outline"
                                                onClick={() => {
                                                    trackEvent({
                                                        eventName: "portfolio_view_click",
                                                        metadata: {
                                                            projectId: project.id,
                                                            status: project.status || "published",
                                                        },
                                                    });
                                                    setActiveModalProject(project);
                                                }}
                                            >
                                                <ExternalLink className="h-4 w-4" />
                                                View Project
                                            </Button>
                                        ) : (
                                            <Link href={`/portfolio/${project.id}`} className="w-full">
                                                <Button
                                                    className="w-full gap-2"
                                                    variant="outline"
                                                    onClick={() =>
                                                        trackEvent({
                                                            eventName: "portfolio_view_click",
                                                            metadata: {
                                                                projectId: project.id,
                                                                status: project.status || "published",
                                                            },
                                                        })
                                                    }
                                                >
                                                    <ExternalLink className="h-4 w-4" />
                                                    View Project
                                                </Button>
                                            </Link>
                                        )}
                                    </CardFooter>
                                </Card>
                            </motion.div>
                        )
                    })}
                </motion.div>

                {displayedPortfolio.length === 0 ? (
                    <div className="mx-auto mt-6 max-w-3xl rounded-xl border border-slate-200 bg-white p-6 text-center text-slate-500">
                        Belum ada project yang dipublikasikan.
                    </div>
                ) : null}

                {showSeeAll && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        viewport={{ once: true }}
                        className="mt-12 text-center"
                    >
                        <Link href="/portfolio">
                            <Button size="lg" className="group gap-2 px-8">
                                Lihat Semua Project
                                <ExternalLink className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                            </Button>
                        </Link>
                    </motion.div>
                )}
            </div>



            {
                activeModalProject && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div
                            drag
                            dragListener={false}
                            dragControls={dragControls}
                            dragMomentum={false}
                            style={{ x, y, width, height }}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-[#1e1e1e] rounded-xl shadow-2xl overflow-hidden flex flex-col border border-white/10 relative"
                        >
                            <div
                                className="bg-[#2d2d2d] px-4 py-3 flex items-center gap-4 cursor-move border-b border-black/50"
                                onPointerDown={(e) => dragControls.start(e)}
                            >
                                <div className="flex gap-2 group">
                                    <button
                                        onClick={() => setActiveModalProject(null)}
                                        className="w-3 h-3 rounded-full bg-[#ff5f57] hover:bg-[#ff3b30] flex items-center justify-center transition-colors"
                                    >
                                        <X className="w-2 h-2 text-black/50 opacity-0 group-hover:opacity-100" />
                                    </button>
                                    <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
                                    <div className="w-3 h-3 rounded-full bg-[#28c840]" />
                                </div>
                                <div className="flex-1 text-center text-xs text-gray-400 font-medium select-none ml-[-52px]">
                                    {getModalContent(activeModalProject).title}
                                </div>
                            </div>

                            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-[#1e1e1e] text-white">
                                <div className="w-20 h-20 bg-yellow-500/10 rounded-full flex items-center justify-center mb-6">
                                    <div className="text-4xl">{getModalContent(activeModalProject).icon}</div>
                                </div>
                                <h3 className="text-2xl font-bold mb-3">{getModalContent(activeModalProject).header}</h3>
                                <p className="text-gray-400 max-w-md leading-relaxed">
                                    {getModalContent(activeModalProject).body}
                                </p>
                            </div>

                            <div className="absolute top-0 left-0 w-4 h-4 cursor-nw-resize z-50" onPointerDown={(e) => handleResize(e, 'nw')} />
                            <div className="absolute top-0 right-0 w-4 h-4 cursor-ne-resize z-50" onPointerDown={(e) => handleResize(e, 'ne')} />
                            <div className="absolute bottom-0 left-0 w-4 h-4 cursor-sw-resize z-50" onPointerDown={(e) => handleResize(e, 'sw')} />
                            <div className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize z-50" onPointerDown={(e) => handleResize(e, 'se')} />
                            <div className="absolute top-0 left-4 right-4 h-2 cursor-n-resize z-40" onPointerDown={(e) => handleResize(e, 'n')} />
                            <div className="absolute bottom-0 left-4 right-4 h-2 cursor-s-resize z-40" onPointerDown={(e) => handleResize(e, 's')} />
                            <div className="absolute left-0 top-4 bottom-4 w-2 cursor-w-resize z-40" onPointerDown={(e) => handleResize(e, 'w')} />
                            <div className="absolute right-0 top-4 bottom-4 w-2 cursor-e-resize z-40" onPointerDown={(e) => handleResize(e, 'e')} />
                        </motion.div>
                    </div>
                )
            }
        </section>
    );
}

"use client";

import { PageViewTracker } from "@/components/analytics/PageViewTracker";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getIcon } from "@/components/ui/icon-mapper";
import { motion, useDragControls, useMotionValue } from "framer-motion";
import { ArrowLeft, ExternalLink, Github, Layers, Layout, Calendar, User, Download, Play, FileText, MonitorPlay } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState, useEffect, useCallback } from "react";

type ProjectType = 'web' | 'pdf' | 'video' | 'app';

interface ExtendedProject {
    id: string;
    title: string;
    description: string;
    longDescription: string;
    challenge: string;
    solution: string;
    features: string[];
    techStackDetails: { name: string; icon: string }[];
    gallery: string[];
    tags: string[];
    image: string;
    type?: ProjectType;
    pdfUrl?: string;
    videoUrl?: string;
    url?: string;
    role?: string;
    timeline?: string;
}

export default function ProjectDetail() {
    const params = useParams();
    const id = params.id as string;
    const [project, setProject] = useState<ExtendedProject | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const [selectedMedia, setSelectedMedia] = useState<string | null>(null);
    const [mediaType, setMediaType] = useState<'image' | 'video' | 'pdf'>('image');
    const dragControls = useDragControls();

    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const width = useMotionValue(800);
    const height = useMotionValue(500);
    const hasDownloadAsset = Boolean(project?.pdfUrl || project?.videoUrl);

    useEffect(() => {
        if (selectedMedia) {
            x.set(0);
            y.set(0);
            width.set(800);
            height.set(500);
        }
    }, [selectedMedia, x, y, width, height]);

    useEffect(() => {
        let isMounted = true;

        async function loadProject() {
            try {
                setIsLoading(true);
                const response = await fetch(`/api/public/portfolio/${id}`, {
                    cache: "no-store",
                });
                if (!response.ok) {
                    if (isMounted) setProject(null);
                    return;
                }

                const payload = (await response.json()) as ExtendedProject;
                if (isMounted) setProject(payload);
            } catch {
                if (isMounted) setProject(null);
            } finally {
                if (isMounted) setIsLoading(false);
            }
        }

        if (id) {
            void loadProject();
        }

        return () => {
            isMounted = false;
        };
    }, [id]);

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

    const handleViewProject = () => {
        if (!project) return;
        if (project.type === 'pdf' && project.pdfUrl) {
            setMediaType('pdf');
            setSelectedMedia(project.pdfUrl);
        } else if (project.type === 'video' && project.videoUrl) {
            setMediaType('video');
            setSelectedMedia(project.videoUrl);
        } else if (project.type === 'web' && project.url) {
            window.open(project.url, '_blank');
        } else if (project.type === 'app' || (project.type === 'web' && !project.url)) {
            const gallerySection = document.getElementById('project-gallery');
            if (gallerySection) {
                gallerySection.scrollIntoView({ behavior: 'smooth' });
            }
        }
    };

    const handleDownload = () => {
        if (!project) return;
        const url = project.pdfUrl || project.videoUrl;
        if (url) {
            const link = document.createElement('a');
            link.href = url;
            link.download = url.split('/').pop() || 'download';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    const renderHeroMedia = () => {
        if (!project) return null;
        if (project.type === 'video') {
            return (
                <div className="w-full h-full bg-black flex items-center justify-center relative overflow-hidden">
                    <video
                        src={project.videoUrl}
                        className="w-full h-full object-cover opacity-60"
                        muted
                        loop
                        autoPlay
                        playsInline
                    />
                    <div className="absolute inset-0 bg-black/40 z-10" />
                </div>
            );
        }
        if (project.type === 'pdf') {
            return (
                <div className="w-full h-full bg-gradient-to-br from-blue-900/40 to-slate-900/40 flex items-center justify-center relative overflow-hidden">
                    <div className="absolute top-10 left-10 w-96 h-96 bg-blue-500/20 rounded-full blur-[100px]" />
                    <div className="absolute bottom-10 right-10 w-80 h-80 bg-purple-500/20 rounded-full blur-[80px]" />
                    <FileText className="w-32 h-32 text-white/20 relative z-20" />
                    <div className="absolute inset-0 bg-black/40 z-10" />
                </div>
            );
        }

        return (
            <>
                <div className="absolute inset-0 bg-black/40 z-10" />
                <Image
                    src={project.image}
                    alt={project.title}
                    fill
                    className="object-cover"
                    priority
                />
            </>
        )
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <p className="text-muted-foreground">Loading project...</p>
            </div>
        );
    }

    if (!project) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center px-4">
                <div className="text-center">
                    <p className="text-lg font-medium text-foreground mb-4">Project not found.</p>
                    <Link href="/portfolio">
                        <Button variant="outline">Back to Portfolio</Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background pb-20 relative overflow-hidden">
            <PageViewTracker path={`/portfolio/${id}`} />
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] opacity-50" />
                <div className="absolute bottom-[10%] right-[-5%] w-[400px] h-[400px] bg-blue-500/20 rounded-full blur-[100px] opacity-40" />
            </div>

            <div className="relative h-[50vh] w-full overflow-hidden">
                {renderHeroMedia()}
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                    >
                        <Badge className="mb-6 bg-white/10 text-white hover:bg-white/20 border-white/20 backdrop-blur-md px-4 py-1.5 text-sm font-medium tracking-wide shadow-lg">
                            Project Case Study
                        </Badge>
                        <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight drop-shadow-2xl">
                            {project.title}
                        </h1>
                    </motion.div>
                </div>
            </div>

            <div className="container mx-auto px-4 relative z-30 -mt-20">
                <Link href="/#portfolio" className="inline-block mb-8">
                    <Button
                        variant="ghost"
                        className="gap-2 text-white hover:text-white bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-md shadow-lg transition-all duration-300"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Portfolio
                    </Button>
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <motion.div
                        className="lg:col-span-8 space-y-8"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                    >
                        <Card className="overflow-hidden border-white/10 shadow-2xl bg-gradient-to-br from-white/10 to-transparent backdrop-blur-xl ring-1 ring-white/10">
                            <CardContent className="p-8">
                                <h2 className="text-2xl font-bold mb-4 flex items-center gap-3 text-foreground">
                                    <Layout className="h-6 w-6 text-primary" />
                                    Project Overview
                                </h2>
                                <p className="text-muted-foreground leading-relaxed text-lg">
                                    {project.longDescription}
                                </p>
                            </CardContent>
                        </Card>

                        <div className="grid md:grid-cols-2 gap-6">
                            <Card className="border-white/10 shadow-xl bg-gradient-to-br from-red-500/10 to-transparent backdrop-blur-lg ring-1 ring-white/5">
                                <CardContent className="p-6">
                                    <h3 className="text-xl font-semibold mb-3 text-red-500 flex items-center gap-2">
                                        <div className="h-2 w-2 rounded-full bg-red-500" />
                                        The Challenge
                                    </h3>
                                    <p className="text-muted-foreground leading-relaxed">
                                        {project.challenge}
                                    </p>
                                </CardContent>
                            </Card>
                            <Card className="border-white/10 shadow-xl bg-gradient-to-br from-green-500/10 to-transparent backdrop-blur-lg ring-1 ring-white/5">
                                <CardContent className="p-6">
                                    <h3 className="text-xl font-semibold mb-3 text-green-500 flex items-center gap-2">
                                        <div className="h-2 w-2 rounded-full bg-green-500" />
                                        The Solution
                                    </h3>
                                    <p className="text-muted-foreground leading-relaxed">
                                        {project.solution}
                                    </p>
                                </CardContent>
                            </Card>
                        </div>

                        <Card className="border-white/10 shadow-xl bg-gradient-to-br from-white/10 to-transparent backdrop-blur-xl ring-1 ring-white/10">
                            <CardContent className="p-8">
                                <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-foreground">
                                    <Layers className="h-6 w-6 text-primary" />
                                    Key Features
                                </h2>
                                <div className="grid sm:grid-cols-2 gap-4">
                                    {project.features?.map((feature, index) => (
                                        <div key={index} className="flex items-start gap-3 p-4 rounded-xl bg-secondary/20 border border-white/5 hover:bg-secondary/30 transition-colors">
                                            <div className="mt-1.5 h-2 w-2 rounded-full bg-primary shrink-0 shadow-[0_0_10px_rgba(var(--primary),0.5)]" />
                                            <span className="text-secondary-foreground font-medium">{feature}</span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {(project.gallery && project.gallery.length > 0) && (
                            <div className="space-y-6" id="project-gallery">
                                <h2 className="text-2xl font-bold text-foreground">Project Gallery</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {project.gallery.map((img, index) => {
                                        const isPdf = img.toLowerCase().endsWith('.pdf');
                                        return (
                                            <div
                                                key={index}
                                                className="relative aspect-[16/10] w-full overflow-hidden rounded-xl shadow-lg border border-white/10 cursor-pointer transition-opacity hover:opacity-90 bg-muted"
                                                onClick={() => {
                                                    setSelectedMedia(img);
                                                    setMediaType(isPdf ? 'pdf' : 'image');
                                                }}
                                            >
                                                {isPdf ? (
                                                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 text-white/70 hover:text-white transition-colors">
                                                        <FileText className="h-16 w-16 mb-2" />
                                                        <span className="text-sm font-medium">View PDF Document</span>
                                                    </div>
                                                ) : (
                                                    <Image
                                                        src={img}
                                                        alt={`Gallery image ${index + 1}`}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {project.type === 'video' && project.videoUrl && (
                            <div className="space-y-6">
                                <h2 className="text-2xl font-bold text-foreground">Project Gallery</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div
                                        className="relative aspect-[16/10] w-full overflow-hidden rounded-xl shadow-lg border border-white/10 cursor-pointer transition-opacity hover:opacity-90 group"
                                        onClick={() => { setSelectedMedia(project.videoUrl!); setMediaType('video'); }}
                                    >
                                        <div className="absolute inset-0 bg-black flex items-center justify-center">
                                            <video
                                                src={project.videoUrl}
                                                className="w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity"
                                                muted
                                            />
                                            <Play className="w-16 h-16 text-white absolute fill-white/20" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                    </motion.div>

                    <motion.div
                        className="lg:col-span-4 space-y-6"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                    >
                        <Card className="border-white/10 shadow-2xl bg-gradient-to-br from-white/10 to-transparent backdrop-blur-xl ring-1 ring-white/10 sticky top-24">
                            <CardContent className="p-6 space-y-8">
                                <div>
                                    <h3 className="text-lg font-semibold mb-6 text-foreground border-b border-white/10 pb-2">Project Details</h3>
                                    <div className="space-y-5">
                                        <div className="flex items-center gap-3 text-sm group">
                                            <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
                                                <User className="h-4 w-4" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-muted-foreground text-xs">Role</span>
                                                <span className="font-medium text-foreground">{project.role || "Developer"}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm group">
                                            <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
                                                <Calendar className="h-4 w-4" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-muted-foreground text-xs">Timeline</span>
                                                <span className="font-medium text-foreground">{project.timeline || "TBA"}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-lg font-semibold mb-4 text-foreground border-b border-white/10 pb-2">Tech Stack</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {project.techStackDetails?.map((tech, index) => {
                                            return (
                                                <div key={index} className="flex items-center gap-1.5 py-1.5 px-3 rounded-full bg-secondary/30 border border-white/5 text-xs font-medium text-secondary-foreground hover:bg-secondary/50 transition-colors">
                                                    {tech.icon.startsWith("emoji:") ? (
                                                        <span className="text-sm leading-none">
                                                            {tech.icon.replace("emoji:", "")}
                                                        </span>
                                                    ) : (() => {
                                                        const Icon = getIcon(tech.icon);
                                                        return <Icon className="h-3 w-3" />;
                                                    })()}
                                                    {tech.name}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="pt-2 space-y-3">
                                    <Button
                                        className="w-full gap-2 shadow-lg shadow-primary/20"
                                        size="lg"
                                        onClick={handleViewProject}
                                    >
                                        {project.type === 'pdf' ? (
                                            <>
                                                <FileText className="h-4 w-4" />
                                                View PDF
                                            </>
                                        ) : project.type === 'video' ? (
                                            <>
                                                <MonitorPlay className="h-4 w-4" />
                                                View Video
                                            </>
                                        ) : project.type === 'app' ? (
                                            <>
                                                <Layout className="h-4 w-4" />
                                                View Gallery
                                            </>
                                        ) : (
                                            <>
                                                <ExternalLink className="h-4 w-4" />
                                                Visit Live Site
                                            </>
                                        )}
                                    </Button>

                                    <Button
                                        variant="outline"
                                        className="w-full gap-2 border-white/10 bg-transparent hover:bg-white/5"
                                        size="lg"
                                        onClick={handleDownload}
                                        disabled={!hasDownloadAsset}
                                    >
                                        {project.type === 'pdf' ? (
                                            <>
                                                <Download className="h-4 w-4" />
                                                Download PDF
                                            </>
                                        ) : project.type === 'video' ? (
                                            <>
                                                <Download className="h-4 w-4" />
                                                Download Video
                                            </>
                                        ) : (
                                            <>
                                                <Github className="h-4 w-4" />
                                                No Download Asset
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </div>

            {selectedMedia && (
                <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center">
                    <motion.div
                        drag
                        dragListener={false}
                        dragControls={dragControls}
                        dragMomentum={false}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        style={{ x, y, width, height }}
                        className="pointer-events-auto relative bg-[#1e1e1e] rounded-xl shadow-2xl overflow-hidden border border-white/10 ring-1 ring-black/50 flex flex-col"
                    >
                        <div
                            className="h-10 bg-[#2d2d2d] flex items-center px-4 gap-2 border-b border-white/5 cursor-grab active:cursor-grabbing shrink-0"
                            onPointerDown={(e) => dragControls.start(e)}
                        >
                            <button
                                onClick={() => setSelectedMedia(null)}
                                className="w-3 h-3 rounded-full bg-[#ff5f57] hover:bg-[#ff5f57]/80 transition-colors flex items-center justify-center group"
                            >
                                <span className="text-[8px] font-bold text-black/50 opacity-0 group-hover:opacity-100">✕</span>
                            </button>
                            <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
                            <div className="w-3 h-3 rounded-full bg-[#28c840]" />
                            <div className="flex-1 text-center text-xs text-gray-400 font-medium ml-[-52px] select-none">
                                {project.title}
                            </div>
                        </div>

                        <div className="relative flex-1 bg-black w-full h-full overflow-hidden">
                            {mediaType === 'image' && (
                                <Image
                                    src={selectedMedia}
                                    alt="Project Preview"
                                    fill
                                    className="object-contain pointer-events-none"
                                />
                            )}
                            {mediaType === 'video' && (
                                <video
                                    src={selectedMedia}
                                    className="w-full h-full object-contain"
                                    controls
                                    autoPlay
                                />
                            )}
                            {mediaType === 'pdf' && (
                                <iframe
                                    src={selectedMedia}
                                    className="w-full h-full"
                                    title="PDF Preview"
                                />
                            )}
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
            )}
        </div>
    );
}

"use client";

import { trackEvent } from "@/lib/tracking";
import { AnimatePresence, motion } from "framer-motion";
import { Mail, MessageCircle, X } from "lucide-react";

interface HireMeModalProps {
    isOpen: boolean;
    onClose: () => void;
    profile: {
        name: string;
        phone: string;
        email: string;
        hireModalTitle: string;
        hireModalSubtitle: string;
        whatsappTemplate: string;
        emailSubject: string;
        emailTemplate: string;
    };
}

export function HireMeModal({ isOpen, onClose, profile }: HireMeModalProps) {
    const hasPhone = Boolean(profile.phone.trim());
    const hasEmail = Boolean(profile.email.trim());
    const whatsappMessage = encodeURIComponent(profile.whatsappTemplate);
    const whatsappUrl = `https://wa.me/${profile.phone.replace(/\+/g, "")}?text=${whatsappMessage}`;

    const emailSubject = encodeURIComponent(profile.emailSubject);
    const emailBody = encodeURIComponent(profile.emailTemplate);
    const emailUrl = `mailto:${profile.email}?subject=${emailSubject}&body=${emailBody}`;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[9999] grid h-screen w-screen place-items-center overflow-hidden px-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: "spring", duration: 0.5 }}
                        className="relative z-[70] w-full max-w-md"
                    >
                        <div className="relative overflow-hidden rounded-2xl bg-white p-6 shadow-2xl md:p-8">
                            <div className="absolute left-4 top-4 flex gap-2">
                                <button
                                    onClick={onClose}
                                    className="group flex h-3 w-3 items-center justify-center rounded-full bg-[#FF5F57] hover:bg-[#FF5F57]/80"
                                >
                                    <X className="h-2 w-2 text-black/50 opacity-0 transition-opacity group-hover:opacity-100" />
                                </button>
                                <div className="h-3 w-3 rounded-full bg-[#FEBC2E]" />
                                <div className="h-3 w-3 rounded-full bg-[#28C840]" />
                            </div>

                            <div className="mb-8 mt-4 text-center">
                                <h2 className="text-2xl font-bold text-gray-900 md:text-3xl">
                                    {profile.hireModalTitle || `Hire ${profile.name}`}
                                </h2>
                                <p className="mt-2 text-sm text-gray-500">
                                    {profile.hireModalSubtitle || "How would you like to contact me? Please choose your preferred method below."}
                                </p>
                            </div>

                            <div className="space-y-4">
                                {hasPhone ? (
                                    <a
                                        href={whatsappUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="group flex w-full items-center gap-4 rounded-xl border border-gray-200 p-4 transition-all hover:border-green-500 hover:bg-green-50 hover:shadow-md"
                                        onClick={() =>
                                            trackEvent({
                                                eventName: "hire_me_click",
                                                metadata: { channel: "whatsapp" },
                                            })
                                        }
                                    >
                                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600 transition-colors group-hover:bg-green-200">
                                            <MessageCircle className="h-6 w-6" />
                                        </div>
                                        <div className="flex-1 text-left">
                                            <h3 className="font-semibold text-gray-900">WhatsApp</h3>
                                            <p className="text-sm text-gray-500">Fastest response</p>
                                        </div>
                                        <div className="text-gray-300 transition-transform group-hover:translate-x-1 group-hover:text-green-500">
                                            →
                                        </div>
                                    </a>
                                ) : null}

                                {hasEmail ? (
                                    <a
                                        href={emailUrl}
                                        className="group flex w-full items-center gap-4 rounded-xl border border-gray-200 p-4 transition-all hover:border-blue-500 hover:bg-blue-50 hover:shadow-md"
                                        onClick={() =>
                                            trackEvent({
                                                eventName: "hire_me_click",
                                                metadata: { channel: "email" },
                                            })
                                        }
                                    >
                                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600 transition-colors group-hover:bg-blue-200">
                                            <Mail className="h-6 w-6" />
                                        </div>
                                        <div className="flex-1 text-left">
                                            <h3 className="font-semibold text-gray-900">Email</h3>
                                            <p className="text-sm text-gray-500">Formal discussion</p>
                                        </div>
                                        <div className="text-gray-300 transition-transform group-hover:translate-x-1 group-hover:text-blue-500">
                                            →
                                        </div>
                                    </a>
                                ) : null}

                                {!hasPhone && !hasEmail ? (
                                    <p className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-500">
                                        Kontak belum tersedia.
                                    </p>
                                ) : null}
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

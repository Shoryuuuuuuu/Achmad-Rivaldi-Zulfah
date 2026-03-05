import * as Icons from "lucide-react";
import { LucideIcon } from "lucide-react";

export const getIcon = (name: string): LucideIcon => {
    const iconMap = Icons as unknown as Record<string, LucideIcon>;
    const Icon = iconMap[name];
    return Icon || Icons.HelpCircle;
};

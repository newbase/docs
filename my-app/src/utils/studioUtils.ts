import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { PlacedItem } from "../types"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function getRoleColor(type: string): string {
    switch (type) {
        case 'Doctor': return 'bg-blue-100 text-blue-700 border-blue-200';
        case 'Nurse': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
        case 'Patient': return 'bg-slate-100 text-slate-700 border-slate-200';
        case 'Technician': return 'bg-orange-100 text-orange-700 border-orange-200';
        case 'Family': return 'bg-pink-100 text-pink-700 border-pink-200';
        default: return 'bg-slate-100 text-slate-600 border-slate-200';
    }
}

export const getRotatedDimensions = (w: number, h: number, rotation: number) => {
    const isRotated = rotation % 180 !== 0;
    return { w: isRotated ? h : w, h: isRotated ? w : h };
};

export const checkCollision = (uid: string, x: number, y: number, w: number, h: number, r: number, items: PlacedItem[]) => {
    const dim = getRotatedDimensions(w, h, r);
    const rect1 = { x, y, width: dim.w, height: dim.h };

    return items.some(item => {
        if (item.uid === uid) return false;
        const itemDim = getRotatedDimensions(item.width, item.height, item.rotation);
        const rect2 = { x: item.x, y: item.y, width: itemDim.w, height: itemDim.h };

        return (
            rect1.x < rect2.x + rect2.width &&
            rect1.x + rect1.width > rect2.x &&
            rect1.y < rect2.y + rect2.height &&
            rect1.y + rect1.height > rect2.y
        );
    });
};

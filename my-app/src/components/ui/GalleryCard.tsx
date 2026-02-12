import React from 'react';
import { Link } from 'react-router-dom';
import { Clock } from 'lucide-react';

interface GalleryCardProps {
    to: string;
    title: string;
    duration?: string;
    platforms?: string[] | string;
    isNew?: boolean;
    badges?: React.ReactNode;
}

export default function GalleryCard({ to, title, duration, platforms, isNew, badges }: GalleryCardProps) {
    return (
        <Link to={to} className="block text-inherit no-underline">
            <div className="bg-white rounded-xl overflow-hidden border border-gray-200 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
                <div className="relative h-48 bg-gray-100 overflow-hidden flex items-center justify-center">
                    {/* Placeholder content if no image is present */}
                    <div className="text-gray-300 text-4xl font-bold opacity-20 select-none">IMAGE</div>

                    {isNew && (
                        <span className="absolute top-3 left-3 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm z-10">
                            NEW
                        </span>
                    )}
                    <div className="absolute top-3 right-3 flex gap-1 z-10">
                        {badges}
                    </div>
                </div>
                <div className="p-5">
                    <h3 className="text-lg font-bold text-gray-900 mb-2 truncate">{title}</h3>
                    <div className="flex items-center justify-between text-xs text-gray-500 mt-4 pt-4 border-t border-gray-100">
                        {duration && (
                            <span className="flex items-center gap-1.5 font-medium">
                                <Clock size={14} className="text-gray-400" />
                                {duration} min
                            </span>
                        )}
                        {platforms && (
                            <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                                {Array.isArray(platforms) ? platforms.join(' / ') : platforms}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </Link>
    );
}

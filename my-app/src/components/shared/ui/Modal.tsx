import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    footer?: React.ReactNode;
    size?: 'small' | 'medium' | 'large' | 'xl' | 'full' | string;
    maxWidth?: string;
}

export default function Modal({ isOpen, onClose, title, children, footer, size = 'medium', maxWidth }: ModalProps) {
    // Close on Escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    // Prevent body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const sizeClasses = {
        small: 'max-w-md',
        medium: 'max-w-lg',
        large: 'max-w-2xl',
        xl: 'max-w-4xl',
        full: 'max-w-full mx-4'
    };

    const currentSizeClass = maxWidth || sizeClasses[size as keyof typeof sizeClasses] || size;

    return createPortal(
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 transition-opacity" onClick={onClose}>
            <div
                className={`bg-white rounded-xl shadow-2xl w-full flex flex-col max-h-[90vh] ${currentSizeClass} animate-in fade-in zoom-in-95 duration-200`}
                onClick={(e: React.MouseEvent) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between px-6 py-2 border-b border-gray-100">
                    <h2 className="text-lg font-bold text-gray-900">{title}</h2>
                    <button
                        className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-colors"
                        onClick={onClose}
                    >
                        <X size={20} />
                    </button>
                </div>
                <div className="p-6 overflow-y-auto">
                    {children}
                </div>
                {footer && (
                    <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 rounded-b-xl">
                        {footer}
                    </div>
                )}
            </div>
        </div>,
        document.body
    );
}

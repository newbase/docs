import React from 'react';
import { Outlet } from 'react-router-dom';
import Gnb from './Gnb';
import Footer from './Footer';

interface CommonLayoutProps {
    children?: React.ReactNode;
    maxWidth?: 'default' | 'wide' | 'full';
    noPadding?: boolean;
}

export default function CommonLayout({
    children,
    maxWidth = 'default',
    noPadding = false
}: CommonLayoutProps): React.ReactElement {
    const widthClasses = {
        default: 'max-w-[1280px]',
        wide: 'max-w-[1280px]',
        full: 'max-w-full'
    };

    return (
        <div className="min-h-screen flex flex-col">
            <Gnb />
            <main className="flex-grow">
                <div className={noPadding ? '' : 'pt-20 pb-20 flex-1'}>
                    <div className={`mx-auto px-4 ${widthClasses[maxWidth]}`}>
                        {children || <Outlet />}
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}

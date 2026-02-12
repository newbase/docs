import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Tabs, TabsTrigger } from '../ui';

interface LnbTab {
    key: string;
    label: string;
    to?: string;
    onClick?: () => void;
    type?: 'section' | 'tab';
}

interface LnbProps {
    tabs: LnbTab[];
    activeTab?: string;
    onTabChange?: (key: string) => void;
}

/**
 * LNB - Local Navigation Bar Component (Sidebar)
 * 
 * Provides vertical sidebar navigation within a specific page or section.
 * Supports both link-based navigation (route changes) and state-based filtering.
 */
export default function Lnb({ tabs, activeTab, onTabChange }: LnbProps): React.ReactElement {
    const location = useLocation();
    const navigate = useNavigate();

    // Determine the currently active tab key
    // 1. Try to find a tab with a matching 'to' path
    const routeTab = tabs.find(tab => tab.to && location.pathname === tab.to);
    // 2. Fallback to the provided activeTab prop
    const currentTabValue = routeTab ? routeTab.key : activeTab;

    const handleValueChange = (newValue: string) => {
        const selectedTab = tabs.find(tab => tab.key === newValue);

        if (!selectedTab) return;

        // If tab has a route, navigate to it
        if (selectedTab.to) {
            navigate(selectedTab.to);
        }
        // If tab has a custom onClick handler
        else if (selectedTab.onClick) {
            selectedTab.onClick();
        }
        // Fallback: call onTabChange if provided
        else if (onTabChange) {
            onTabChange(newValue);
        }
    };

    return (
        <nav className="w-full bg-white rounded-lg">
            <Tabs
                value={currentTabValue}
                onValueChange={handleValueChange}
                className="w-full"
            >
                <div className="flex flex-col gap-1 p-2">
                    {tabs.map((tab, index) => {
                        // Render Section Header
                        if (tab.type === 'section') {
                            return (
                                <div
                                    key={`section-${index}`}
                                    className={`px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider ${index > 0 ? 'mt-4' : ''}`}
                                >
                                    {tab.label}
                                </div>
                            );
                        }

                        // We render everything as TabsTrigger to leverage the context/styles.
                        return (
                            <TabsTrigger
                                key={tab.key}
                                value={tab.key}
                                className="w-full justify-start text-left px-3 py-2 h-auto text-sm"
                            >
                                {tab.label}
                            </TabsTrigger>
                        );
                    })}
                </div>
            </Tabs>
        </nav>
    );
}

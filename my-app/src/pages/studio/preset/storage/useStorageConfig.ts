import { useState, useRef } from 'react';
import { StorageItem, PlacedItem } from '../../../../types';

export interface UseStorageConfigReturn {
    // Supply Database State
    supplyDatabase: StorageItem[];
    setSupplyDatabase: React.Dispatch<React.SetStateAction<StorageItem[]>>;
    supplySearchTerm: string;
    setSupplySearchTerm: (term: string) => void;

    // Active Section State
    activeStorageSection: string | null;
    setActiveStorageSection: (id: string | null) => void;

    // Supply Creation State
    isCreatingSupply: boolean;
    setIsCreatingSupply: (isCreating: boolean) => void;
    newSupplyItem: Partial<StorageItem>;
    setNewSupplyItem: (item: Partial<StorageItem>) => void;

    // Drag & Drop State
    dragState: { itemUid: string, offsetX: number, offsetY: number } | null;
    setDragState: (state: { itemUid: string, offsetX: number, offsetY: number } | null) => void;
    collisions: Set<string>;
    setCollisions: React.Dispatch<React.SetStateAction<Set<string>>>;
    containerRef: React.RefObject<HTMLDivElement>;

    // Category State
    selectedListCategory: 'medication' | 'supply' | 'equipment';
    setSelectedListCategory: (category: 'medication' | 'supply' | 'equipment') => void;
    selectedListSubCategory: string;
    setSelectedListSubCategory: (subCategory: string) => void;
}

export const useStorageConfig = (): UseStorageConfigReturn => {
    const [supplyDatabase, setSupplyDatabase] = useState<StorageItem[]>([]);
    const [supplySearchTerm, setSupplySearchTerm] = useState("");
    const [activeStorageSection, setActiveStorageSection] = useState<string | null>(null);
    const [isCreatingSupply, setIsCreatingSupply] = useState(false);
    const [newSupplyItem, setNewSupplyItem] = useState<Partial<StorageItem>>({});
    const [dragState, setDragState] = useState<{ itemUid: string, offsetX: number, offsetY: number } | null>(null);
    const [collisions, setCollisions] = useState<Set<string>>(new Set());
    const containerRef = useRef<HTMLDivElement>(null!);

    const [selectedListCategory, setSelectedListCategory] = useState<'medication' | 'supply' | 'equipment'>('medication');
    const [selectedListSubCategory, setSelectedListSubCategory] = useState<string>('all');

    return {
        supplyDatabase,
        setSupplyDatabase,
        supplySearchTerm,
        setSupplySearchTerm,
        activeStorageSection,
        setActiveStorageSection,
        isCreatingSupply,
        setIsCreatingSupply,
        newSupplyItem,
        setNewSupplyItem,
        dragState,
        setDragState,
        collisions,
        setCollisions,
        containerRef,
        selectedListCategory,
        setSelectedListCategory,
        selectedListSubCategory,
        setSelectedListSubCategory
    };
};

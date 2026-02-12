import React, { useState } from 'react';
import { Users, Plus, X as XIcon, MoreHorizontal, Star, Trash2 } from 'lucide-react';
import { Role } from '../../../types';
import { Button } from '@/components/shared/ui';
import { Badge } from '@/components/shared/ui';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/shared/ui";

interface RolesBarProps {
    roles: Role[];
    deleteRole: (id: string) => void;
    openAddModal: (type: 'role') => void;
    setDefaultRole: (id: string) => void;
}

const RoleItem: React.FC<{ role: Role; index: number; deleteRole: (id: string) => void; setDefaultRole: (id: string) => void }> = ({ role, index, deleteRole, setDefaultRole }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger className="outline-none" onMouseEnter={() => setIsOpen(true)} onMouseLeave={() => setIsOpen(false)}>
                <Badge variant="outline" className={`group shrink-0 pr-2 gap-1 py-1.5 cursor-pointer hover:shadow-md hover:transition-all ${role.color}`}>
                    <span className="drop-shadow-sm whitespace-nowrap flex items-center">
                        {index === 0 && <Star size={10} className="mr-1 text-yellow-500 fill-yellow-500" />}
                        {role.type === 'Doctor' ? 'Dr.' : role.type === 'Nurse' ? 'RN' : ''} {role.name}
                    </span>
                </Badge>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align="start"
                sideOffset={1}
                onMouseEnter={() => setIsOpen(true)}
                onMouseLeave={() => setIsOpen(false)}
            >
                <DropdownMenuItem onClick={() => { setDefaultRole(role.id); setIsOpen(false); }} className="text-xs cursor-pointer">
                    <Star size={12} className="mr-2" />
                    참가자 역할로 설정
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => { deleteRole(role.id); setIsOpen(false); }} className="text-xs text-red-600 focus:text-red-600 cursor-pointer">
                    <Trash2 size={12} className="mr-2" />
                    역할 삭제
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export const RolesBar: React.FC<RolesBarProps> = ({ roles, deleteRole, openAddModal, setDefaultRole }) => {
    return (
        <div className="flex-none bg-white border-b border-slate-200 px-6 py-2 flex items-center gap-4">
            <div className="flex items-center text-xs font-semibold text-slate-500 uppercase tracking-wider shrink-0"> <Users size={14} className="mr-1.5" /> 역할 </div>
            <div className="flex-1 flex items-center space-x-2 overflow-x-auto no-scrollbar mask-gradient-right p-1">
                {roles.map((role, index) => (
                    <RoleItem key={role.id} role={role} index={index} deleteRole={deleteRole} setDefaultRole={setDefaultRole} />
                ))}
            </div>
            <Button variant="secondary" size="sm" onClick={() => openAddModal('role')} className="px-3 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-800 border-none shadow-none shrink-0" icon={<Plus size={14} />}> 역할 추가 </Button>
        </div>
    );
};

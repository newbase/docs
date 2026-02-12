import React, { useState, useEffect } from 'react';
import { Search, Trash2, UserPlus, X, Check } from 'lucide-react';
import { Button, Modal, Badge } from '@/components/shared/ui';
import { organizationUsers, getUsersByOrgId } from '../../data/organizationUsers';
import { ClassItem } from '../../data/classes';
import { User } from '../../types/admin';

interface ClassParticipantModalProps {
    isOpen: boolean;
    onClose: () => void;
    classData: ClassItem;
    currentUserOrgId: string;
}

export default function ClassParticipantModal({
    isOpen,
    onClose,
    classData,
    currentUserOrgId
}: ClassParticipantModalProps) {
    const [activeTab, setActiveTab] = useState<'list' | 'add'>('list');
    const [searchQuery, setSearchQuery] = useState('');
    const [participants, setParticipants] = useState<User[]>([]);
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
    const [allOrgUsers, setAllOrgUsers] = useState<User[]>([]);

    // Initialize data
    useEffect(() => {
        if (isOpen) {
            const orgUsers = getUsersByOrgId(currentUserOrgId);
            setAllOrgUsers(orgUsers);

            // Mock initial participants: Take first 3 users from org as existing participants for demo
            // In real app, this would come from an API
            const initialParticipants = orgUsers.slice(0, 3);
            setParticipants(initialParticipants);

            // Reset state
            setActiveTab('list');
            setSearchQuery('');
            setSelectedUsers([]);
        }
    }, [isOpen, currentUserOrgId]);

    // Filtered lists
    const filteredParticipants = participants.filter(user =>
        user.name.includes(searchQuery) || String(user.id).includes(searchQuery) || (user.email || '').includes(searchQuery)
    );

    const availableUsers = allOrgUsers.filter(user =>
        !participants.find(p => p.id === user.id)
    );

    const filteredAvailableUsers = availableUsers.filter(user =>
        user.name.includes(searchQuery) || String(user.id).includes(searchQuery) || (user.email || '').includes(searchQuery)
    );

    // Handlers
    const handleRemoveParticipant = (userId: string | number) => {
        if (window.confirm('해당 사용자를 클래스에서 제외하시겠습니까?')) {
            setParticipants(prev => prev.filter(p => p.id !== userId));
        }
    };

    const handleToggleSelectUser = (userId: string | number) => {
        const idString = String(userId);
        setSelectedUsers(prev =>
            prev.includes(idString)
                ? prev.filter(id => id !== idString)
                : [...prev, idString]
        );
    };

    const handleAddSelectedUsers = () => {
        const usersToAdd = availableUsers.filter(u => selectedUsers.includes(String(u.id)));
        setParticipants(prev => [...prev, ...usersToAdd]);
        setSelectedUsers([]);
        setActiveTab('list');
        alert(`${usersToAdd.length}명의 사용자가 추가되었습니다.`);
    };

    const handleSelectAll = () => {
        if (selectedUsers.length === filteredAvailableUsers.length) {
            setSelectedUsers([]);
        } else {
            setSelectedUsers(filteredAvailableUsers.map(u => String(u.id)));
        }
    };

    // Render Public Class View (Read-only)
    const renderPublicView = () => (
        <div className="space-y-4">
            <div className="bg-blue-50 text-blue-800 p-4 rounded-lg flex items-start gap-3">
                <div className="bg-blue-100 p-2 rounded-full">
                    <Check size={16} />
                </div>
                <div>
                    <h4 className="font-semibold text-sm">공개 클래스입니다</h4>
                    <p className="text-sm mt-1 text-blue-700">
                        이 클래스는 공개 상태이므로 소속 기관의 모든 사용자가 자동으로 참여자로 등록됩니다.
                        별도의 참가자 관리가 필요하지 않습니다.
                    </p>
                </div>
            </div>

            <div className="border rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-100 font-medium text-sm text-gray-500 flex justify-between items-center">
                    <span>전체 구성원 ({allOrgUsers.length}명)</span>
                    <div className="relative w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input
                            type="text"
                            placeholder="이름, 아이디 검색"
                            className="w-full pl-9 pr-4 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
                <div className="max-h-[400px] overflow-y-auto divide-y divide-gray-100">
                    {allOrgUsers
                        .filter(user => user.name.includes(searchQuery) || String(user.id).includes(searchQuery))
                        .map(user => (
                            <div key={user.id} className="px-4 py-3 flex items-center justify-between hover:bg-gray-50">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">
                                        {user.name[0]}
                                    </div>
                                    <div>
                                        <div className="text-sm font-medium text-gray-900">{user.name} ({user.id})</div>
                                        <div className="text-xs text-gray-500">{user.email}</div>
                                    </div>
                                </div>
                                <Badge variant={user.accountType === '정회원' ? 'default' : 'secondary'}>
                                    {user.accountType}
                                </Badge>
                            </div>
                        ))}
                    {allOrgUsers.length === 0 && (
                        <div className="p-8 text-center text-gray-500 text-sm">
                            등록된 사용자가 없습니다.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    // Render Private Class View (Manageable)
    const renderPrivateView = () => (
        <div className="flex flex-col h-[600px]">
            {/* Tabs */}
            <div className="flex border-b border-gray-200 mb-4">
                <button
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'list'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                    onClick={() => setActiveTab('list')}
                >
                    참가자 목록 ({participants.length})
                </button>
                <button
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'add'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                    onClick={() => setActiveTab('add')}
                >
                    참가자 추가
                </button>
            </div>

            {/* Toolbar */}
            <div className="flex justify-between items-center mb-4">
                <div className="relative w-full max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                        type="text"
                        placeholder="이름, 아이디, 이메일로 검색"
                        className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {activeTab === 'add' && (
                    <Button
                        disabled={selectedUsers.length === 0}
                        onClick={handleAddSelectedUsers}
                    >
                        <UserPlus size={16} className="mr-2" />
                        선택 추가 ({selectedUsers.length})
                    </Button>
                )}
            </div>

            {/* List Content */}
            <div className="flex-1 overflow-y-auto border border-gray-200 rounded-lg">
                {activeTab === 'list' ? (
                    // Current Participants List
                    <div className="divide-y divide-gray-100">
                        {filteredParticipants.length > 0 ? (
                            filteredParticipants.map(user => (
                                <div key={user.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-sm font-bold">
                                            {user.name[0]}
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium text-gray-900">{user.name} <span className="text-gray-400 font-normal">| {user.id}</span></div>
                                            <div className="text-xs text-gray-500">{user.email}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Badge variant="outline" className="text-xs">{user.role}</Badge>
                                        <button
                                            onClick={() => handleRemoveParticipant(user.id)}
                                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                                            title="제외하기"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center h-48 text-gray-500">
                                <p>검색 결과가 없습니다.</p>
                            </div>
                        )}
                    </div>
                ) : (
                    // Add Participants List
                    <div>
                        <div className="bg-gray-50 p-3 border-b border-gray-200 flex items-center gap-3 sticky top-0 z-10">
                            <input
                                type="checkbox"
                                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                checked={selectedUsers.length > 0 && selectedUsers.length === filteredAvailableUsers.length}
                                onChange={handleSelectAll}
                            />
                            <span className="text-sm font-medium text-gray-600">
                                전체 선택 ({selectedUsers.length} / {filteredAvailableUsers.length})
                            </span>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {filteredAvailableUsers.length > 0 ? (
                                filteredAvailableUsers.map(user => (
                                    <div
                                        key={user.id}
                                        className={`p-4 flex items-center justify-between hover:bg-gray-50 cursor-pointer ${selectedUsers.includes(String(user.id)) ? 'bg-blue-50/50' : ''}`}
                                        onClick={() => handleToggleSelectUser(user.id)}
                                    >
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="checkbox"
                                                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                checked={selectedUsers.includes(String(user.id))}
                                                onChange={() => { }} // Handle click on parent
                                            />
                                            <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-500">
                                                {user.name[0]}
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">{user.name} <span className="text-gray-400 font-normal">| {user.id}</span></div>
                                                <div className="text-xs text-gray-500">{user.email}</div>
                                            </div>
                                        </div>
                                        <Badge variant="secondary" className="text-xs">{user.role}</Badge>
                                    </div>
                                ))
                            ) : (
                                <div className="flex flex-col items-center justify-center h-48 text-gray-500">
                                    <p>추가할 수 있는 사용자가 없습니다 (모두 참여 중).</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`${classData.title} - 참가자 관리`}
            size="large"
            footer={
                <Button onClick={onClose} variant="outline">
                    닫기
                </Button>
            }
        >
            {(classData as ClassItem & { isPublic?: boolean }).isPublic ? renderPublicView() : renderPrivateView()}
        </Modal>
    );
}

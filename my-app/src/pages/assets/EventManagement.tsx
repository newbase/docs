import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, Zap, Activity, X } from 'lucide-react';
import {
    PageHeader,
    StatsGrid,
    ListHeader,
    FilterGroup,
    FilterSelect,
    SearchBar,
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableHead,
    TableCell,
    Badge,
    Pagination,
    Button
} from '@/components/shared/ui';
import {
    assetEvents,
    type AssetEvent,
    type Event,
    type EventParameter,
    type EventCategory,
    type TriggerType,
    type FunctionType,
    type ResourceType,
    type EventResource
} from '../../data/assetEvents';
import { validateEvent, generateEventId } from '../../utils/eventUtils';
import { useAuth } from '../../contexts/AuthContext';


export default function EventManagement(): React.ReactElement {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState<string>('');

    const [categoryFilter, setCategoryFilter] = useState<string>('전체');
    const [statusFilter, setStatusFilter] = useState<string>('전체');
    const [currentPage, setCurrentPage] = useState<number>(1);
    const itemsPerPage = 10;

    // 필터링 - preset 데이터 제외, asset만 표시
    const filteredEvents = assetEvents
        .filter(event => event.source === 'asset') // preset 제외
        .filter(event => {
            const matchesSearch =
                event.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                event.id.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesEventType = true; // eventType 필드 제거됨

            const matchesCategory =
                categoryFilter === '전체' ||
                event.category === categoryFilter;

            const matchesStatus =
                statusFilter === '전체' ||
                event.status === statusFilter;

            return matchesSearch && matchesEventType && matchesCategory && matchesStatus;
        });

    // 페이지네이션
    const totalPages = Math.ceil(filteredEvents.length / itemsPerPage);
    const paginatedEvents = filteredEvents.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handleEdit = (eventId: string) => {
        navigate(`${eventId}/edit`);
    };

    const handleDelete = (eventId: string) => {
        if (window.confirm('정말 삭제하시겠습니까?')) {
            // TODO: Implement delete
        }
    };

    const handleAddNew = () => {
        navigate('create');
    };


    const getStatusBadge = (status: string): 'default' | 'destructive' => {
        return status === 'active' ? 'default' : 'destructive';
    };

    const getCategoryBadgeColor = (category: string): string => {
        const colorMap: Record<string, string> = {
            'npc_event': 'bg-blue-100 text-blue-800',
            'player_event': 'bg-purple-100 text-purple-800',
            'patient_event': 'bg-green-100 text-green-800',
            'emr_update': 'bg-orange-100 text-orange-800',
        };
        return colorMap[category] || 'bg-gray-100 text-gray-800';
    };

    return (
        <>
            <PageHeader
                title="이벤트 관리"
                breadcrumbs={[{ label: '에셋 관리' }, { label: '이벤트' }]}
                actions={
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={handleAddNew}>
                            <Plus size={16} />
                            이벤트 생성
                        </Button>
                    </div>
                }
            />

            {/* List Header with Filters */}
            <ListHeader
                totalCount={filteredEvents.length}
                rightContent={
                    <FilterGroup>
                        <FilterSelect
                            value={categoryFilter}
                            onValueChange={(val) => setCategoryFilter(val)}
                            options={[
                                { value: '전체', label: '전체 이벤트 타입' },
                                { value: 'patient_event', label: '환자이벤트' },
                                { value: 'npc_event', label: 'NPC 이벤트' },
                                { value: 'emr_update', label: 'EMR 업데이트' },
                                { value: 'player_event', label: '플레이어 이벤트' }
                            ]}
                        />
                        <FilterSelect
                            value={statusFilter}
                            onValueChange={(val) => setStatusFilter(val)}
                            options={[
                                { value: '전체', label: '전체 상태' },
                                { value: 'active', label: '활성' },
                                { value: 'inactive', label: '비활성' }
                            ]}
                        />
                        <SearchBar
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="이벤트 이름, 설명, ID 검색"
                        />
                    </FilterGroup>
                }
            />

            {/* Table */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-gray-50/50">
                            <TableHead>Key</TableHead>
                            <TableHead>타겟 역할</TableHead>
                            <TableHead>구분</TableHead>
                            <TableHead>이벤트 이름</TableHead>
                            <TableHead>설명</TableHead>
                            <TableHead>이벤트 타입</TableHead>
                            <TableHead>상태</TableHead>
                            <TableHead>사용횟수</TableHead>
                            <TableHead>관리</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginatedEvents.length > 0 ? (
                            paginatedEvents.map((event) => (
                                <TableRow key={event.id} className="hover:bg-gray-50 transition-colors">
                                    <TableCell>
                                        <code className="text-xs bg-gray-100 px-2 py-1 rounded">{event.id}</code>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-wrap gap-1">
                                            {event.roleTypes.length > 0 ? (
                                                event.roleTypes.map((role, idx) => (
                                                    <span
                                                        key={idx}
                                                        className="text-xs px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded"
                                                    >
                                                        {role}
                                                    </span>
                                                ))
                                            ) : (
                                                <span className="text-xs text-gray-400">-</span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="default">
                                            Event
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div>
                                            <strong className="text-blue-600">{event.displayName}</strong>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="max-w-md truncate" title={event.description}>
                                            {event.description}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <span className={`text-xs px-2 py-1 rounded ${getCategoryBadgeColor(event.category)}`}>
                                            {event.category}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={getStatusBadge(event.status)}>
                                            {event.status === 'active' ? '활성' : event.status === 'inactive' ? '비활성' : '기타'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{event.usageCount}</TableCell>
                                    <TableCell>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleEdit(event.id)}
                                                className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                                title="수정"
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(event.id)}
                                                className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                                title="삭제"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={9} className="text-center py-12 text-gray-500">
                                    검색 결과가 없습니다.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={filteredEvents.length}
                onPageChange={setCurrentPage}
                itemsPerPage={itemsPerPage}
            />


        </>
    );
}

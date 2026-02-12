import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    PageHeader,
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
    Button
} from '@/components/shared/ui';
import { Edit, Trash2, PlusSquare, Search, Wrench } from 'lucide-react';
import { tasks as initialTasks, type TaskTemplate } from '../../data/tasks';
import TaskFormModal from './components/TaskFormModal';

export default function AssetTaskManagement(): React.ReactElement {
    const [tasks, setTasks] = useState<TaskTemplate[]>(initialTasks);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [typeFilter, setTypeFilter] = useState<string>('전체');
    const [categoryFilter, setCategoryFilter] = useState<string>('전체');

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState<TaskTemplate | null>(null);

    // Filter options
    const taskTypes = ['To-do', 'Decision', 'Must-not'];
    const categories = Array.from(new Set(tasks.map(t => t.category).filter(Boolean)));

    // Filtering
    const filteredTasks = tasks.filter(task => {
        const matchesSearch =
            task.taskName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            task.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            task.id.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesType = typeFilter === '전체' || task.taskType === typeFilter;
        const matchesCategory = categoryFilter === '전체' || task.category === categoryFilter;

        return matchesSearch && matchesType && matchesCategory;
    });

    const handleCreate = () => {
        setSelectedTask(null);
        setIsModalOpen(true);
    };

    const handleEdit = (task: TaskTemplate) => {
        setSelectedTask(task);
        setIsModalOpen(true);
    };

    const handleDelete = (id: string) => {
        if (window.confirm('정말 이 태스크를 삭제하시겠습니까?')) {
            setTasks(prev => prev.filter(t => t.id !== id));
        }
    };

    const handleSave = (task: TaskTemplate) => {
        if (selectedTask) {
            // Update
            setTasks(prev => prev.map(t => t.id === task.id ? task : t));
        } else {
            // Create
            setTasks(prev => [...prev, task]);
        }
        setIsModalOpen(false);
        setSelectedTask(null);
    };

    const getTaskTypeColor = (type: string) => {
        switch (type) {
            case 'To-do': return 'bg-blue-50 text-blue-700 border-blue-200';
            case 'Decision': return 'bg-purple-50 text-purple-700 border-purple-200';
            case 'Must-not': return 'bg-red-50 text-red-700 border-red-200';
            default: return 'bg-gray-50 text-gray-700 border-gray-200';
        }
    };

    return (
        <div className="space-y-6">
            <PageHeader
                title="태스크 관리"
                breadcrumbs={[{ label: '에셋 관리' }, { label: '태스크 관리' }]}
                rightContent={
                    <div className="flex items-center gap-2">
                        <Link to="../actions">
                            <Button variant="ghost">
                                <Wrench size={16} className="mr-2" />
                                액션 관리
                            </Button>
                        </Link>
                        <Button variant="outline" onClick={handleCreate}>
                            <PlusSquare size={16} className="mr-2" />
                            태스크 생성
                        </Button>
                    </div>
                }
            />

            <ListHeader
                totalCount={filteredTasks.length}
                rightContent={
                    <FilterGroup>
                        <FilterSelect
                            value={typeFilter}
                            onValueChange={setTypeFilter}
                            options={[
                                { value: '전체', label: '전체 유형' },
                                ...taskTypes.map(t => ({ value: t, label: t }))
                            ]}
                        />
                        <FilterSelect
                            value={categoryFilter}
                            onValueChange={setCategoryFilter}
                            options={[
                                { value: '전체', label: '전체 카테고리' },
                                ...categories.map(c => ({ value: c!, label: c! }))
                            ]}
                        />
                        <SearchBar
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="태스크명, 설명 검색"
                        />
                    </FilterGroup>
                }
            />

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-gray-50/50">
                            <TableHead className="w-24 text-center">ID</TableHead>
                            <TableHead className="w-32 text-center">Task 유형</TableHead>
                            <TableHead className="w-40">카테고리</TableHead>
                            <TableHead>태스크 이름 / 설명</TableHead>
                            <TableHead className="w-20 text-center">점수</TableHead>
                            <TableHead className="w-32 text-center">관리</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredTasks.length > 0 ? (
                            filteredTasks.map((task) => (
                                <TableRow key={task.id} className="hover:bg-gray-50 transition-colors">
                                    <TableCell className="text-center">
                                        <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded text-gray-500">
                                            {task.id}
                                        </code>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold border ${getTaskTypeColor(task.taskType)}`}>
                                            {task.taskType}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{task.category || '기본'}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col gap-0.5">
                                            <span className="font-bold text-gray-900">{task.taskName}</span>
                                            <span className="text-xs text-gray-500 line-clamp-1">{task.description}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center font-bold text-gray-700">
                                        {task.score > 0 ? `+${task.score}` : task.score}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex justify-center gap-1">
                                            <button
                                                onClick={() => handleEdit(task)}
                                                className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="수정"
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(task.id)}
                                                className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
                                <TableCell colSpan={6} className="text-center py-20">
                                    <div className="flex flex-col items-center gap-2 text-gray-400">
                                        <Search size={40} className="mb-2 opacity-20" />
                                        <p>검색 결과가 없습니다.</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <TaskFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                initialData={selectedTask}
                existingIds={tasks.map(t => t.id)}
            />
        </div>
    );
}

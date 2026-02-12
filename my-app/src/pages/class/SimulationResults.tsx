import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { User, Calendar, FileSpreadsheet } from 'lucide-react';
import * as XLSX from 'xlsx';
import { Button, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/shared/ui';
import { FullScreenLayout } from '../../routes/layouts/FullScreenLayout';
import { FullScreenHeader } from '@/components/shared/layout';
import { classesData } from '../../data/classes';
import { useAuth } from '../../contexts/AuthContext';
import { ParticipantSidebar } from './components/ParticipantSidebar';
import { ResultSummaryCards } from './components/ResultSummaryCards';
import { EvaluationTable } from './components/EvaluationTable';
import { Participant, participants } from '../../data/participants';
import { useParticipantState, useSimulationResultData, useFeedbackState, useSimulationFilters } from '../../hooks/useSimulationResults';

export default function SimulationResults(): React.ReactElement {
    const { classId, sessionId } = useParams<{ classId: string, sessionId: string }>();
    const navigate = useNavigate();
    const { getCurrentRole, user } = useAuth();
    const role = getCurrentRole();
    const isManagerPath = window.location.pathname.includes('master') || window.location.pathname.includes('admin');
    const basePath = isManagerPath ? (role === 'master' ? '/master' : '/admin') : '';

    // Get Class & Session Data
    const classItem = (classesData as any)[classId || '001'];
    const sessionItem = classItem?.curriculum.find((s: any) => s.id.toString() === sessionId);

    const initialSelectedId = isManagerPath ? participants[0].id : (user?.id.toString() || 'ST001');
    const { selectedParticipantId, setSelectedParticipantId, selectedParticipant } = useParticipantState(participants, initialSelectedId);
    const { scenarioDetail, resultMetadata, checklistItems, mustNotViolations } = useSimulationResultData(sessionId || '1', sessionItem);
    const { expandedFeedback, toggleFeedback } = useFeedbackState();
    const {
        modeFilter,
        setModeFilter,
        startDate,
        setStartDate,
        endDate,
        setEndDate,
        sortCriteria,
        setSortCriteria,
        completionDates,
        selectedCompletionDate,
        setSelectedCompletionDate
    } = useSimulationFilters();

    const handleDownloadExcel = () => {
        if (!selectedParticipant || !checklistItems) return;

        // 1. Prepare Summary Data
        const summaryData = [
            { 항목: '평가 대상자', 내용: `${selectedParticipant.name} (${selectedParticipant.id})` },
            { 항목: '소속', 내용: selectedParticipant.department },
            { 항목: '시나리오', 내용: sessionItem?.name || '알 수 없음' },
            { 항목: '평가 일시', 내용: selectedCompletionDate },
            { 항목: '평가 점수', 내용: `${resultMetadata?.stats?.find((s: any) => s.label === '총점')?.value || '0'} / 100` },
            { 항목: '성공률', 내용: `${resultMetadata?.stats?.find((s: any) => s.label === '성공률')?.value || '0'}%` },
            { 항목: 'Must-not 위반', 내용: `${mustNotViolations}회` },
        ];

        // 2. Prepare Detailed Evaluation Data
        const detailedData = checklistItems.map((item: any, index: number) => ({
            NO: index + 1,
            구분: item.evaluationType === 'performance' ? '수행' :
                item.evaluationType === 'assessment' ? '평가' :
                    item.evaluationType === 'equipment' ? '도구' : '절차',
            이벤트: item.eventName,
            테스크: item.taskName,
            세부내용: item.description,
            점수: item.score >= 0 ? `+${item.score}` : item.score,
            '수행 결과': item.status.toUpperCase(),
            '선택 값': item.value || '-',
            '정답 값': item.correctValue || '-',
            피드백: item.feedback || '-'
        }));

        // 3. Create Workbook and Sheets
        const wb = XLSX.utils.book_new();
        const wsSummary = XLSX.utils.json_to_sheet(summaryData);
        const wsDetailed = XLSX.utils.json_to_sheet(detailedData);

        // Append sheets
        XLSX.utils.book_append_sheet(wb, wsSummary, "요약");
        XLSX.utils.book_append_sheet(wb, wsDetailed, "상세평가");

        // 4. Download File
        const fileName = `${selectedParticipant.name}_${sessionItem?.name || '평가결과'}.xlsx`;
        XLSX.writeFile(wb, fileName);
    };

    if (!classItem || !sessionItem) {
        return <div className="p-8">Session not found</div>;
    }

    // Header right content
    const headerRightContent = (
        <div className="flex items-center gap-2">
                        <div className="flex items-center gap-2 origin-right">
                            <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg px-2 py-1 h-9">
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="text-sm font-medium text-gray-700 focus:outline-none bg-transparent"
                                />
                            </div>
                            <div className="w-1.5 h-px bg-gray-300"></div>
                            <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg px-2 py-1 h-9">
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="text-sm font-medium text-gray-700 focus:outline-none bg-transparent"
                                />
                            </div>
                        </div>

                        <Select value={sortCriteria} onValueChange={setSortCriteria}>
                            <SelectTrigger className="w-[160px] h-9 text-sm font-bold bg-white border-gray-200 origin-right ml-1">
                                <SelectValue placeholder="조회기준 선택" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="latest">최신 점수</SelectItem>
                                <SelectItem value="highest">최고 점수</SelectItem>
                                <SelectItem value="lowest">최저 점수</SelectItem>
                                <SelectItem value="all">전체 기준</SelectItem>
                            </SelectContent>
                        </Select>

                        <div className="flex items-center gap-1 bg-gray-100 p-0.5 rounded-lg border border-gray-200 mx-1">
                            {[
                                { id: 'study', label: '학습모드' },
                                { id: 'eval', label: '평가모드' }
                            ].map((opt) => (
                                <button
                                    key={opt.id}
                                    onClick={() => setModeFilter(opt.id)}
                                    className={`px-3 py-1 text-[13px] font-bold rounded-md transition-all whitespace-nowrap ${modeFilter === opt.id
                                        ? 'bg-white text-blue-600 shadow-sm'
                                        : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>

                        <div className="h-6 w-px bg-slate-200 mx-1"></div>

                        <div className="flex items-center gap-1.5">
                            <Button
                                variant="primary"
                                size="sm"
                                onClick={handleDownloadExcel}
                                className="gap-1.5 h-8 text-sm"
                            >
                                <FileSpreadsheet size={13} />
                                엑셀 다운로드
                            </Button>
                        </div>
                    </div>
    );

    return (
        <FullScreenLayout
            header={
                <FullScreenHeader
                    title="시뮬레이션 결과"
                    onBack={() => navigate(basePath ? `${basePath}/my-classes/${classId}` : `/student/my-classes/${classId}`)}
                    rightContent={headerRightContent}
                />
            }
        >
            {/* Main Content Area */}
            <div className="flex flex-1">
                {/* Sidebar - Participant List (Manager Only) */}
                {isManagerPath && (
                    <div className="flex flex-col">
                        <ParticipantSidebar
                            participants={participants}
                            selectedParticipantId={selectedParticipantId}
                            onSelect={setSelectedParticipantId}
                        />
                    </div>
                )}

                {/* Main Session Results */}
                <div className="flex-1 bg-white p-8 text-gray-900">
                    <div className="max-w-6xl mx-auto space-y-8">
                        {/* Summary Header */}
                        <div className="flex items-end justify-between border-b border-gray-100 pb-6">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <h2 className="text-2xl font-bold text-gray-900">{sessionItem.name}</h2>
                                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${modeFilter === 'study' ? 'bg-blue-50 text-blue-600 border border-blue-100' : 'bg-indigo-50 text-indigo-600 border border-indigo-100'}`}>
                                        {modeFilter === 'study' ? '학습모드' : '평가모드'}
                                    </span>
                                </div>
                                <div className="text-base flex items-center gap-2">
                                    <div className="flex items-center gap-2">
                                        <User size={16} className="text-gray-400" />
                                        <span className="font-semibold">
                                            {selectedParticipant?.name || user?.name}
                                        </span>
                                        ({selectedParticipant?.department || user?.currentAccount?.organizationName || '-'}, ID: {selectedParticipant?.id || user?.id})
                                    </div>
                                    <span className="mx-2 text-gray-300">|</span>
                                    <div className="flex items-center gap-2">
                                        <Calendar size={16} className="text-gray-400" />
                                        <span>완료일:</span>
                                        {sortCriteria === 'all' ? (
                                            <Select value={selectedCompletionDate} onValueChange={setSelectedCompletionDate}>
                                                <SelectTrigger className="w-[180px] h-8 text-base font-bold bg-white border-gray-200 -ml-1 focus:ring-1">
                                                    <SelectValue placeholder="완료일시 선택" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {completionDates.map((date) => (
                                                        <SelectItem key={date} value={date} className="text-base font-medium">
                                                            {date}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        ) : (
                                            <span className="font-medium text-gray-700">{selectedCompletionDate}</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Analysis Grid */}
                        <ResultSummaryCards
                            stats={resultMetadata?.stats}
                            mustNotViolations={mustNotViolations}
                        />

                        {/* Evaluation Tables */}
                        <div className="space-y-10 !mt-16 !mb-10">
                            {(resultMetadata?.tables || [{ title: '수행결과 평가', type: 'performance' }]).map((table, tableIdx) => {
                                const tableItems = checklistItems.filter(item =>
                                    (table.type as string) === 'checklist' ? true : item.evaluationType === table.type
                                );

                                return (
                                    <EvaluationTable
                                        key={tableIdx}
                                        title={table.title}
                                        type={table.type}
                                        items={tableItems as any}
                                        expandedFeedback={expandedFeedback}
                                        onToggleFeedback={toggleFeedback}
                                    />
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </FullScreenLayout>
    );
}

import React, { useState, useMemo } from 'react';
import { scenarioDetails } from '../data/scenarioDetails';

export function useParticipantState(participants: any[], initialId: string) {
    const [selectedParticipantId, setSelectedParticipantId] = useState(initialId);
    const selectedParticipant = useMemo(() =>
        participants.find(p => p.id === selectedParticipantId),
        [participants, selectedParticipantId]
    );

    return {
        selectedParticipantId,
        setSelectedParticipantId,
        selectedParticipant
    };
}

export function useSimulationResultData(sessionId: string, sessionItem: any) {
    const scenarioDetail = scenarioDetails[Number(sessionId) || 1];
    const resultMetadata = scenarioDetail?.resultMetadata;

    const checklistItems = useMemo(() => {
        if (!sessionItem) return [];
        return resultMetadata?.checklist || scenarioDetail?.checklist || [];
    }, [sessionItem, scenarioDetail, resultMetadata]);

    const mustNotViolations = useMemo(() => {
        return checklistItems.filter(item => item.taskType === 'Must-not' && item.status === 'fail').length;
    }, [checklistItems]);

    return {
        scenarioDetail,
        resultMetadata,
        checklistItems,
        mustNotViolations
    };
}

export function useFeedbackState() {
    const [expandedFeedback, setExpandedFeedback] = useState<Set<string>>(new Set());

    const toggleFeedback = (id: string) => {
        setExpandedFeedback(prev => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    return {
        expandedFeedback,
        toggleFeedback
    };
}

export function useSimulationFilters() {
    const [modeFilter, setModeFilter] = useState('study'); // study, eval
    const [startDate, setStartDate] = useState('2024-03-01');
    const [endDate, setEndDate] = useState('2024-03-31');
    const [sortCriteria, setSortCriteria] = useState('latest'); // latest, highest, lowest, all
    const [completionDates] = useState([
        '2024-03-20 14:30',
        '2024-03-19 10:15',
        '2024-03-15 16:45'
    ]);
    const [selectedCompletionDate, setSelectedCompletionDate] = useState(completionDates[0]);

    return {
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
    };
}

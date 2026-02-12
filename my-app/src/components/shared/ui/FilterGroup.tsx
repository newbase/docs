import React from 'react';
import { cn } from '@/lib/cn';
import { SelectCombo } from './select';
import { Input } from './input';
import { X } from 'lucide-react';

interface FilterGroupProps {
    children: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
}

export function FilterGroup({ children, className, style }: FilterGroupProps) {
    return (
        <div className={cn("flex items-center gap-2 flex-nowrap justify-start", className)} style={style}>
            {children}
        </div>
    );
}

interface FilterOption {
    value: string;
    label: string;
}

interface FilterSelectProps {
    value: string;
    onValueChange: (value: string) => void;
    options?: FilterOption[];
    placeholder?: string;
    className?: string;
}

export function FilterSelect({ value, onValueChange, options = [], placeholder, className }: FilterSelectProps) {
    const hasValue = value && value !== '';
    
    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation(); // Select 열림 방지
        e.preventDefault(); // 기본 동작 방지
        onValueChange('');
    };

    return (
        <div className={cn("relative min-w-[140px]", className)}>
            <div className="relative">
                <div className="relative w-full">
                    <SelectCombo
                        value={value}
                        onValueChange={onValueChange}
                        options={options}
                        placeholder={placeholder}
                        className="w-full"
                        triggerClassName={cn(
                            "h-[38px] bg-white",
                            hasValue && "pr-9" // X 버튼 공간 확보 (ChevronDown 아이콘 오른쪽에 X 버튼 배치)
                        )}
                    />
                    {hasValue && (
                        <button
                            type="button"
                            onClick={handleClear}
                            onMouseDown={(e) => {
                                e.stopPropagation(); // Select 열림 방지
                                e.preventDefault(); // 기본 동작 방지
                            }}
                            className="absolute right-9 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors z-30 pointer-events-auto flex items-center justify-center w-4 h-4 rounded hover:bg-gray-100"
                            aria-label="필터 초기화"
                            title="필터 초기화"
                        >
                            <X size={10} strokeWidth={2.5} />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

interface DateRangeFilterProps {
    startDate: string;
    endDate: string;
    onStartDateChange: (value: string) => void;
    onEndDateChange: (value: string) => void;
    label?: string;
}

export function DateRangeFilter({ startDate, endDate, onStartDateChange, onEndDateChange, label = '조회 기간' }: DateRangeFilterProps) {
    React.useEffect(() => {
        if (!startDate && !endDate && onStartDateChange && onEndDateChange) {
            const today = new Date();
            const pastYear = new Date();
            pastYear.setMonth(today.getMonth() - 12);

            const formatDate = (date: Date) => date.toISOString().split('T')[0];

            onStartDateChange(formatDate(pastYear));
            onEndDateChange(formatDate(today));
        }
    }, [startDate, endDate, onStartDateChange, onEndDateChange]);

    return (
        <div className="flex items-center gap-2">
            <Input
                type="date"
                value={startDate}
                onChange={(e) => onStartDateChange(e.target.value)}
                className="w-[160px] h-10 bg-white"
            />
            <span className="text-muted-foreground px-0.5">~</span>
            <Input
                type="date"
                value={endDate}
                onChange={(e) => onEndDateChange(e.target.value)}
                className="w-[160px] h-10 bg-white"
            />
        </div>
    );
}

interface ManualTimePickerProps {
    ampm: string;
    hour: string | number;
    minute: string | number;
    onChange: (field: string, value: string) => void;
}

export function ManualTimePicker({ ampm, hour, minute, onChange }: ManualTimePickerProps) {
    return (
        <div className="flex items-center gap-2">
            <SelectCombo
                value={ampm}
                onValueChange={(val) => onChange('ampm', val)}
                options={[
                    { value: 'AM', label: 'AM' },
                    { value: 'PM', label: 'PM' }
                ]}
                className="w-20"
                triggerClassName="h-10 bg-white"
            />
            <div className="flex items-center gap-1 bg-white border border-input rounded-md px-2 h-10 transition-all hover:border-brand-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-brand-500/20 focus-within:ring-offset-0 focus-within:border-brand-500">
                <input
                    type="number"
                    min="1"
                    max="12"
                    value={hour}
                    onChange={(e) => onChange('hour', e.target.value)}
                    className="w-10 text-center text-base border-none outline-none appearance-none bg-transparent placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="12"
                />
                <span className="text-muted-foreground font-medium">:</span>
                <input
                    type="number"
                    min="0"
                    max="59"
                    value={minute}
                    onChange={(e) => onChange('minute', e.target.value)}
                    className="w-10 text-center text-base border-none outline-none appearance-none bg-transparent placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="00"
                />
            </div>
        </div>
    );
}

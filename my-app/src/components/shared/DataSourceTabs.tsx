import React from 'react';
import { Tabs, TabsList, TabsTrigger } from './ui/studio-tabs';

interface DataSourceTabsProps {
	value: 'mock' | 'real';
	onChange: (value: 'mock' | 'real') => void;
	className?: string;
}

/**
 * Mock 데이터와 실제 API를 전환하는 탭 컴포넌트
 * 
 * 사용 목적:
 * - 개발 중 Mock 데이터로 UI 테스트
 * - 실제 API와 Mock 데이터 응답 구조 비교
 * - 백엔드 API 불일치 발견 및 검증
 * 
 * @example
 * const [dataSource, setDataSource] = useState<'mock' | 'real'>('mock');
 * <DataSourceTabs value={dataSource} onChange={setDataSource} />
 */
export function DataSourceTabs({ value, onChange, className = '' }: DataSourceTabsProps) {
	return (
		<div className={`bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 mb-6 ${className}`}>
			<div className="flex items-center justify-between">
				<div className="flex-1">
					<h3 className="text-sm font-semibold text-gray-900 mb-1">
						🔧 개발 모드
					</h3>
					<p className="text-xs text-gray-600">
						{value === 'mock' ? (
							<>
								<strong className="text-blue-700">Mock 데이터</strong> 사용 중 
								<span className="text-gray-500 ml-2">(src/data/organizations.ts)</span>
							</>
						) : (
							<>
								<strong className="text-purple-700">실제 API</strong> 연동 중 
								<span className="text-gray-500 ml-2">(백엔드 서버)</span>
							</>
						)}
					</p>
				</div>
				
				<Tabs 
					value={value} 
					onValueChange={(val) => onChange(val as 'mock' | 'real')}
				>
					<TabsList className="bg-white rounded-lg shadow-sm border border-gray-200 h-auto">
						<TabsTrigger 
							value="mock" 
							className="gap-2 px-4 py-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-900"
						>
							<span className="text-base">🎭</span>
							<span className="font-medium">Mock</span>
							<span className="text-xs opacity-70 ml-1">(개발)</span>
						</TabsTrigger>
						<TabsTrigger 
							value="real" 
							className="gap-2 px-4 py-2 data-[state=active]:bg-purple-50 data-[state=active]:text-purple-900"
						>
							<span className="text-base">🌐</span>
							<span className="font-medium">Real API</span>
							<span className="text-xs opacity-70 ml-1">(검증)</span>
						</TabsTrigger>
					</TabsList>
				</Tabs>
			</div>
			
			{/* 경고 메시지 */}
			<div className="mt-3 text-xs text-gray-600 bg-white/60 rounded px-3 py-2 border border-gray-200">
				<strong>💡 사용 가이드:</strong> 
				Mock 탭과 Real 탭을 전환하며 데이터 구조를 비교하세요. 
				불일치 발견 시 <code className="bg-gray-100 px-1 rounded">reports/BACKEND_ISSUES.md</code>에 기록합니다.
			</div>
		</div>
	);
}

/**
 * API 연동 상태를 표시하는 인포박스 컴포넌트
 */
interface ApiStatusBoxProps {
	isLoading?: boolean;
	error?: any;
	dataCount?: number;
	onSwitchToMock?: () => void;
}

export function ApiStatusBox({ isLoading, error, dataCount, onSwitchToMock }: ApiStatusBoxProps) {
	if (isLoading) {
		return (
			<div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
				<div className="flex items-center gap-3">
					<div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
					<div>
						<h4 className="text-sm font-semibold text-blue-900">API 데이터 로딩 중...</h4>
						<p className="text-xs text-blue-700 mt-0.5">백엔드 서버에서 데이터를 가져오고 있습니다.</p>
					</div>
				</div>
			</div>
		);
	}
	
	if (error) {
		return (
			<div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
				<div className="flex items-start justify-between gap-4">
					<div className="flex-1">
						<h4 className="text-sm font-bold text-red-900 mb-2">⚠️ API 에러 발생</h4>
						<div className="text-xs text-red-800 mb-3">
							<p className="mb-1">
								<strong>상태 코드:</strong> {error.response?.status || 'Unknown'}
							</p>
							<p className="mb-1">
								<strong>에러 메시지:</strong> {error.message || '알 수 없는 오류'}
							</p>
						</div>
						<details className="text-xs">
							<summary className="cursor-pointer text-red-700 hover:text-red-900 font-medium mb-2">
								📋 상세 응답 보기
							</summary>
							<pre className="bg-red-100 p-3 rounded overflow-auto max-h-48 text-red-900">
								{JSON.stringify(error.response?.data || error, null, 2)}
							</pre>
						</details>
					</div>
					{onSwitchToMock && (
						<button 
							onClick={onSwitchToMock}
							className="flex-shrink-0 px-4 py-2 bg-white hover:bg-gray-50 text-red-700 border border-red-300 rounded-lg font-medium text-sm transition-colors"
						>
							Mock으로 전환
						</button>
					)}
				</div>
			</div>
		);
	}
	
	// 성공 상태 - 메시지 제거 (로딩/에러만 표시)
	return null;
}

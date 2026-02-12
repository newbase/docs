/**
 * CurriculumList 페이지: 렌더 및 로딩 표시 검증
 * 지금_할_수_있는_작업.md #14 한 페이지 단위 테스트 추가
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import CurriculumList from './CurriculumList';

const mockUseCurriculumList = jest.fn();
jest.mock('@/hooks/useCurriculum', () => ({
	useCurriculumList: (params: unknown) => mockUseCurriculumList(params),
}));
jest.mock('./modals/AddCurriculumModal', () => () => null);
jest.mock('./modals/EditCurriculumModal', () => () => null);

function renderWithClient(ui: React.ReactElement) {
	const queryClient = new QueryClient({
		defaultOptions: {
			queries: { retry: false },
			mutations: { retry: false },
		},
	});
	return render(
		<MemoryRouter>
			<QueryClientProvider client={queryClient}>
				{ui}
			</QueryClientProvider>
		</MemoryRouter>
	);
}

beforeEach(() => {
	mockUseCurriculumList.mockReturnValue({
		data: { curriculumList: [], totalCount: 0 },
		isLoading: false,
		error: null,
		refetch: jest.fn(),
	});
});

test('커리큘럼 관리 제목과 빈 목록 문구를 표시한다', () => {
	renderWithClient(<CurriculumList />);
	expect(screen.getAllByText('커리큘럼 관리').length).toBeGreaterThan(0);
	expect(screen.getByText('등록된 커리큘럼이 없습니다.')).toBeInTheDocument();
});

test('로딩 중일 때 로딩 메시지를 표시한다', () => {
	mockUseCurriculumList.mockReturnValue({
		data: undefined,
		isLoading: true,
		error: null,
		refetch: jest.fn(),
	});
	renderWithClient(<CurriculumList />);
	expect(screen.getByText('데이터를 불러오는 중...')).toBeInTheDocument();
});

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Activity, BookOpen, Brain, PlayCircle, Search } from 'lucide-react';
// @ts-ignore
import { classesData } from '../../data/classes';
import { FilterGroup, FilterSelect, SearchBar, GalleryCard, Tabs, TabsList, TabsTrigger, ListHeader, Pagination, PageHeader, EmptyState, Button } from '@/components/shared/ui';
import { Scenario } from '../../types/admin';

export default function ScenarioList(): React.ReactElement {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [classFilter] = useState<string>('all');
  const [platformFilter, setPlatformFilter] = useState<string>('all');
  const [categoryTab, setCategoryTab] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 12;

  // 모든 시나리오를 하나의 배열로 수집
  const allScenarios: Scenario[] = Object.values(classesData).flatMap((classData: any) =>
    classData.curriculum.map((scenario: any) => ({
      ...scenario,
      classId: classData.id,
      className: classData.title,
      classType: classData.type
    }))
  );

  // 필터링된 시나리오
  const filteredScenarios = allScenarios.filter(scenario => {
    // ScenarioList uses 'name', ScenarioDetail uses 'title'. 
    // Assuming 'name' is correct for classesData scenarios.
    const scenarioName = scenario.name || scenario.title || '';
    const matchesSearch = scenarioName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (scenario.includes && scenario.includes.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesClass = classFilter === 'all' || scenario.classId === classFilter;

    // Category tab filtering (based on classType)
    let matchesCategory = true;
    if (categoryTab !== 'all') {
      matchesCategory = scenario.classType === categoryTab;
    }

    let matchesPlatform = true;
    if (platformFilter !== 'all') {
      if (platformFilter === 'vr') {
        matchesPlatform = scenario.platform === 'VR';
      } else if (platformFilter === 'mobile') {
        matchesPlatform = scenario.platform === 'Mobile';
      } else if (platformFilter === 'pc') {
        matchesPlatform = scenario.platform === 'PC';
      }
    }

    return matchesSearch && matchesClass && matchesCategory && matchesPlatform;
  });

  // 페이지네이션 계산
  const totalPages = Math.ceil(filteredScenarios.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentScenarios = filteredScenarios.slice(startIndex, endIndex);

  // 페이지네이션 핸들러
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getPlatformText = (platform: string | string[] | undefined): string | string[] => {
    if (!platform) return '';

    // 시나리오 플랫폼: VR | Mobile | PC 중 1개
    const platformMap: { [key: string]: string } = {
      'VR': 'HMD',
      'Mobile': 'Mobile',
      'PC': 'PC'
    };

    if (Array.isArray(platform)) {
      return platform;
    }

    return platformMap[platform] || platform;
  };

  return (
    <>
      <PageHeader
        title="시나리오"
        breadcrumbs={[{ label: '시나리오' }]}
        actions={
          <Link to="/ClassList">
            <Button variant="outline" size="md">
              구독하기
            </Button>
          </Link>
        }
      />

      {/* 설명 영역 */}
      <p className="text-base text-gray-600 mb-8">
        모든 시나리오를 한 곳에서 확인하고 학습하세요. 클래스별, 플랫폼별로 필터링하여 원하는 시나리오를 찾을 수 있습니다.
      </p>

      {/* 탭 메뉴 */}
      <div className="mb-8">
        <Tabs
          value={categoryTab}
          onValueChange={setCategoryTab}
        >
          <TabsList>
            <TabsTrigger value="all">전체</TabsTrigger>
            <TabsTrigger value="ls">술기절차</TabsTrigger>
            <TabsTrigger value="ao">질환케어</TabsTrigger>
            <TabsTrigger value="md">진단</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* List Header with Total and Filters */}
      <ListHeader
        totalCount={filteredScenarios.length}
        rightContent={
          <>
            <FilterGroup>
              <FilterSelect
                value={platformFilter}
                onValueChange={(val) => setPlatformFilter(val)}
                options={[
                  { value: 'all', label: '모든 플랫폼' },
                  { value: 'vr', label: 'VR' },
                  { value: 'mobile', label: 'Mobile' },
                  { value: 'pc', label: 'PC' }
                ]}
              />
            </FilterGroup>
            <SearchBar
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search scenarios..."
            />
          </>
        }
      />

      {/* 시나리오 갤러리 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
        {filteredScenarios.length > 0 ? (
          currentScenarios.map((scenario) => {
            let platforms: string[] = [];
            if (Array.isArray(scenario.platform)) {
              // If it is already an array, map each item
              platforms = (scenario.platform as string[])
                .map(p => {
                  const text = getPlatformText(p);
                  return Array.isArray(text) ? text : (text ? [text] : []);
                })
                .flat()
                .filter(Boolean) as string[];
            } else if (scenario.platform) {
              const text = getPlatformText(scenario.platform);
              platforms = Array.isArray(text) ? text : (text ? [text] : []);
            }

            return (
              <GalleryCard
                key={`${scenario.classId}-${scenario.id}`}
                to={`/scenario/${scenario.id}`}
                title={scenario.name || scenario.title || 'Untitled'}
                duration={scenario.duration}
                platforms={platforms}
                isNew={scenario.isNew}
              />
            );
          })
        ) : (
          <EmptyState
            icon={<Search size={48} />}
            title="검색 결과가 없습니다."
            description="다른 키워드로 검색하거나 필터를 변경해보세요."
            className="col-span-full"
          />
        )}
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={filteredScenarios.length}
        onPageChange={handlePageChange}
        itemsPerPage={itemsPerPage}
      />
    </>
  );
}

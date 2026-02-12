import { useNavigate } from 'react-router-dom';
import { Play, Clipboard, Award, ShieldCheck, CheckCircle2, ArrowRight, Youtube, Download, MessageSquare, Workflow, Repeat, TrendingUp, CheckCircle, Edit3, Activity, Layers, Stethoscope, ChevronRight } from 'lucide-react';
import React, { useState } from 'react';
import { Gnb, Footer } from '@/components/shared/layout';
import { Card, CardHeader, CardContent, CardFooter, Button, Badge } from '@/components/shared/ui';
import keyVisual from '../../assets/img/key_visual.png';
import practiceVR from '../../assets/img/practice_VR_01.jpeg';
import practiceMobile from '../../assets/img/practice_mobile.jpg';
import brochurePDF from '../../assets/files/2025_NEWBASE_Catalog_KOR.pdf';
// Scenario Studio Data
const studioContent = {
  flow: {
    title: "시나리오 플로우",
    desc: "드래그 앤 드롭으로 임상 흐름 설계",
    previewImage: "flow-editor-preview.png",
    vrView: "환자가 진료실로 들어와 의자에 앉습니다. 간호사가 다가가 활력 징후 측정을 준비합니다."
  },
  dialogue: {
    title: "AI기반 커뮤니케이션",
    desc: "환자 대사 및 증상 직접 입력",
    previewImage: "dialogue-editor-preview.png",
    vrView: "환자가 가슴을 부여잡으며 거친 숨을 몰아쉽니다. (Audio: '가슴이 너무 답답해요...')"
  },
  item: {
    title: "아이템 편집",
    desc: "사용 약물/도구 커스텀",
    previewImage: "item-editor-preview.png",
    vrView: "처치 카트 위에 '에피네프린' 앰플과 주사기가 준비되어 있습니다. 다른 약물은 보이지 않습니다."
  },
  check: {
    title: "체크리스트 편집",
    desc: "평가 기준 설정",
    previewImage: "check-editor-preview.png",
    vrView: "학습자가 환자에게 이름을 물어보면, 화면 상단에 '환자 확인 완료 (+5점)' 알림이 뜹니다."
  }
};

export default function LandingPage(): React.ReactElement {
  const [activeStudioTab, setActiveStudioTab] = useState<keyof typeof studioContent>('flow');
  const [activeProductTab, setActiveProductTab] = useState('vr');

  return (
    <div className="app-container">
      {/* 1. GNB (Navbar) */}
      <Gnb />

      {/* 2. Hero Section */}
      <section className="bg-white pb-16">
        <div className="container" style={{ maxWidth: '1280px' }}>
          <div className="pt-32 mb-8">
            <h1 className="text-4xl md:text-5xl font-semibold leading-tight text-gray-900">
              Start Simulating, <br />
              Find the Best Outcome
            </h1>
          </div>

          <div className="relative w-full rounded-3xl overflow-hidden mb-8">
            <img src={keyVisual} alt="Medicrew Platform" className="w-full h-[400px] md:h-[500px] object-cover block" />
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/70 via-transparent to-transparent"></div>
          </div>

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="text-base md:text-lg text-gray-700 max-w-2xl">
              우리 병원에 최적화된 업무 시나리오를 직접 디자인하고,<br />
              데이터로 성과를 측정하며 개선하세요.
            </div>
            <a
              href={brochurePDF}
              download="2025_NEWBASE_Catalog_KOR.pdf"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all"
            >
              <Download size={18} />
              카달로그 다운로드
            </a>
          </div>
        </div>
      </section>

      {/* 3. Ticker Section */}
      <section className="bg-gray-50 py-12 border-y border-gray-200">
        <div className="container" style={{ maxWidth: '1280px' }}>
          <div className="text-center">
            <h3 className="text-lg font-bold text-gray-900 mb-6">
              100+ 국내외 기관고객이 신뢰하는 시뮬레이션 교육 파트너
            </h3>
            <div className="flex flex-wrap items-center justify-center gap-8 text-gray-600">
              <span className="text-base font-medium">서울아산병원</span>
              <span className="text-base font-medium">한림대학교성심병원</span>
              <span className="text-base font-medium">MNUMS</span>
              <span className="text-base font-medium">서울대학교</span>
              <span className="text-base font-medium">대한병원협회</span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Features */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container" style={{ maxWidth: '1280px' }}>
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-3">메디크루 특장점</h2>
            <p className="text-base text-[var(--text-sub)] max-w-3xl mx-auto">
              병원 워크플로우를 개선하고 반복 훈련으로 성과를 지속하는 시뮬레이션 플랫폼
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="border border-gray-200 hover:border-gray-300 transition-all">
              <CardContent className="p-8">
                <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-5">
                  <Workflow size={24} />
                </div>
                <h3 className="text-lg font-bold mb-3">핵심 워크플로우 관리</h3>
                <p className="text-sm text-[var(--text-sub)] leading-relaxed">
                  팀원들이 해결해야할 핵심 과제를 설정하고 시뮬레이션을 통해 물품 위치, 보고 체계, 역할분장 등을 반복 개선하며 문제해결에 집중하세요.
                </p>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 hover:border-gray-300 transition-all">
              <CardContent className="p-8">
                <div className="w-12 h-12 rounded-xl bg-teal-100 text-teal-600 flex items-center justify-center mb-5">
                  <Repeat size={24} />
                </div>
                <h3 className="text-lg font-bold mb-3">최적의 워크플로우 반복훈련</h3>
                <p className="text-sm text-[var(--text-sub)] leading-relaxed">
                  가장 좋은 성과를 낼 수 있는 워크플로우를 반복 훈련할 수 있어 실무 오류를 줄이고 성과를 지속할 수 있습니다.
                </p>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 hover:border-gray-300 transition-all">
              <CardContent className="p-8">
                <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-5">
                  <TrendingUp size={24} />
                </div>
                <h3 className="text-lg font-bold mb-3">데이터 기반 성과관리</h3>
                <p className="text-sm text-[var(--text-sub)] leading-relaxed">
                  시뮬레이션을 통해 직원들의 워크플로우 수행 정확도를 측정하고, 개선 전후 성과를 관리하세요.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* 5. Studio Section */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="container" style={{ maxWidth: '1280px' }}>
          {/* Header */}
          <div className="mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
              우리 병원에 최적화된 콘텐츠로<br />
              실무교육에 바로 활용하세요
            </h2>
            <p className="text-base text-[var(--text-sub)] mb-4 max-w-3xl">
              환자 증상, 의료자원, 일하는 방식이 모두 다른 병원에서도
              실무에 바로 적용할 수 있는 교육 시나리오를 만들 수 있습니다.
            </p>
            <button className="text-brand-500 text-sm font-semibold flex items-center gap-1 hover:gap-2 transition-all">
              스튜디오 기능 더 알아보기 <ArrowRight size={16} />
            </button>
          </div>

          {/* Studio Tabs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {(Object.keys(studioContent) as Array<keyof typeof studioContent>).map((key) => (
              <Card
                key={key}
                onClick={() => setActiveStudioTab(key)}
                className={`cursor-pointer transition-all ${activeStudioTab === key
                  ? 'border-brand-500 border-2 bg-brand-50'
                  : 'border-gray-200 hover:border-gray-300'
                  }`}
              >
                <CardContent className="p-6 text-center">
                  <div className="mb-3 flex justify-center">
                    {key === 'flow' && <Layers size={32} className={activeStudioTab === key ? 'text-brand-500' : 'text-gray-400'} />}
                    {key === 'dialogue' && <MessageSquare size={32} className={activeStudioTab === key ? 'text-brand-500' : 'text-gray-400'} />}
                    {key === 'item' && <Stethoscope size={32} className={activeStudioTab === key ? 'text-brand-500' : 'text-gray-400'} />}
                    {key === 'check' && <CheckCircle size={32} className={activeStudioTab === key ? 'text-brand-500' : 'text-gray-400'} />}
                  </div>
                  <div className="font-bold text-sm mb-1">{studioContent[key].title}</div>
                  <div className="text-xs text-[var(--text-sub)]">{studioContent[key].desc}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Studio Content Display */}
          <Card className="overflow-hidden">
            <div className="grid md:grid-cols-2 gap-0">
              {/* Editor Preview */}
              <div className="relative bg-gray-50 p-12 flex flex-col items-center justify-center min-h-[350px]">
                <Badge className="absolute top-4 left-4 bg-white border border-gray-200">
                  <Edit3 size={12} className="mr-1" /> Editor
                </Badge>
                <div className="w-48 h-48 bg-white rounded-2xl border-2 border-gray-200 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-6xl mb-2">
                      {activeStudioTab === 'flow' && '🔗'}
                      {activeStudioTab === 'dialogue' && '💬'}
                      {activeStudioTab === 'item' && '⚕️'}
                      {activeStudioTab === 'check' && '✅'}
                    </div>
                    <div className="text-xs text-gray-500 font-medium">
                      {studioContent[activeStudioTab].title}
                    </div>
                  </div>
                </div>
              </div>

              {/* VR Simulation View */}
              <div className="relative bg-gray-900 p-12 flex items-center justify-center min-h-[350px]">
                <img
                  src={keyVisual}
                  alt="VR Simulation"
                  className="absolute inset-0 w-full h-full object-cover opacity-20"
                />
                <div className="relative z-10 text-white text-center max-w-md">
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30 mb-4">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse mr-2"></div>
                    VR SIMULATION
                  </Badge>
                  <p className="text-sm leading-relaxed">
                    "{studioContent[activeStudioTab].vrView}"
                  </p>
                  <div className="text-xs text-gray-400 mt-4">
                    학습자가 환자에게 이름을 물어보면, 화면 상단에 '환자 확인 완료 (+5점)' 알림이 뜹니다.
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* 6. Courses */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="container" style={{ maxWidth: '1280px' }}>
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-3">기초부터 의사결정 역량까지 3 단계 시뮬레이션</h2>
            <p className="text-base text-[var(--text-sub)] max-w-3xl mx-auto">
              신규 직원부터 경력직원까지 니즈에 맞는 시뮬레이션으로 교육효과가 더 높습니다.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border border-gray-200">
              <CardContent className="p-8">
                <Badge className="bg-blue-100 text-blue-600 mb-6 text-xs font-bold px-3 py-1">
                  STEP 1
                </Badge>
                <h3 className="text-xl font-bold mb-4">Learn Skills</h3>
                <p className="text-sm text-[var(--text-sub)] leading-relaxed">
                  활력 징후, 정맥 주사, 카테터 삽입 등<br />20여 종의 핵심술기 절차 훈련
                </p>
              </CardContent>
            </Card>

            <Card className="border border-gray-200">
              <CardContent className="p-8">
                <Badge className="bg-blue-100 text-blue-600 mb-6 text-xs font-bold px-3 py-1">
                  STEP 2
                </Badge>
                <h3 className="text-xl font-bold mb-4">Act Orders</h3>
                <p className="text-sm text-[var(--text-sub)] leading-relaxed">
                  폐렴, 심근경색, 서맥, 분만 등 질환 중심 시나리오로<br />신규 의료진들의 병원 실무 적응 필수 코스
                </p>
              </CardContent>
            </Card>

            <Card className="border border-gray-200">
              <CardContent className="p-8">
                <Badge className="bg-blue-100 text-blue-600 mb-6 text-xs font-bold px-3 py-1">
                  STEP 3
                </Badge>
                <h3 className="text-xl font-bold mb-4">Make Decisions</h3>
                <p className="text-sm text-[var(--text-sub)] leading-relaxed">
                  흉통, 호흡곤란, 쇼크 등 환자증상과 상황을 파악하고<br />신속하고 적합한 의사결정 역량 훈련
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* 7. Product Lineup */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-white to-gray-50">
        <div className="container" style={{ maxWidth: '1280px' }}>
          {/* Tab Switcher */}
          <div className="flex justify-center mb-12">
            <div className="inline-flex bg-gray-100 rounded-xl p-1">
              <button
                onClick={() => setActiveProductTab('vr')}
                className={`px-8 py-3 rounded-lg font-semibold text-sm transition-all ${activeProductTab === 'vr'
                  ? 'bg-white text-gray-900 shadow-md'
                  : 'text-gray-600 hover:text-gray-900'
                  }`}
              >
                메타퀘스트 VR
              </button>
              <button
                onClick={() => setActiveProductTab('mobile')}
                className={`px-8 py-3 rounded-lg font-semibold text-sm transition-all ${activeProductTab === 'mobile'
                  ? 'bg-white text-gray-900 shadow-md'
                  : 'text-gray-600 hover:text-gray-900'
                  }`}
              >
                모바일앱
              </button>
            </div>
          </div>

          {/* Product Cards */}
          <Card className="overflow-hidden">
            {activeProductTab === 'vr' ? (
              <div className="grid md:grid-cols-2 gap-0">
                {/* Image Column */}
                <div className="relative bg-gray-100 min-h-[400px] overflow-hidden">
                  <img
                    src={practiceVR}
                    alt="VR Device"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <Badge className="absolute bottom-4 left-4 bg-white/95 text-gray-900 backdrop-blur-sm border border-gray-200 px-3 py-1.5 text-xs font-semibold">
                    지원기기: Meta Quest 2, 3S, 3
                  </Badge>
                </div>

                {/* Content Column */}
                <CardContent className="p-8 md:p-12 flex flex-col justify-center">
                  <h3 className="text-2xl font-bold mb-4">메디크루 VR</h3>
                  <p className="text-base text-[var(--text-sub)] mb-8 leading-relaxed">
                    몰입감 넘치는 가상 병원 환경에서 실제 장비를 조작하는 듯한 경험을 제공합니다.
                    공간감을 익히고, 동선을 체득하며 실제 임상 현장에 대한 적응력을 극대화하세요.
                  </p>
                  <ul className="space-y-3 mb-8">
                    <li className="flex items-center gap-3 text-sm text-[var(--text-main)]">
                      <CheckCircle size={20} className="text-brand-500 flex-shrink-0" />
                      AI 환자와의 실시간 음성 상호작용
                    </li>
                    <li className="flex items-center gap-3 text-sm text-[var(--text-main)]">
                      <CheckCircle size={20} className="text-brand-500 flex-shrink-0" />
                      정교한 햅틱 피드백 컨트롤러 지원
                    </li>
                    <li className="flex items-center gap-3 text-sm text-[var(--text-main)]">
                      <CheckCircle size={20} className="text-brand-500 flex-shrink-0" />
                      다중 접속 멀티플레이어 실습 (Optional)
                    </li>
                  </ul>
                  <Button variant="primary" size="lg" className="w-full">
                    메타 스토어 바로가기 <ArrowRight size={18} />
                  </Button>
                </CardContent>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-0">
                {/* Image Column */}
                <div className="relative bg-gray-100 min-h-[400px] overflow-hidden">
                  <img
                    src={practiceMobile}
                    alt="Mobile App"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </div>

                {/* Content Column */}
                <CardContent className="p-8 md:p-12 flex flex-col justify-center">
                  <h3 className="text-2xl font-bold mb-4">메디크루 모바일앱</h3>
                  <p className="text-base text-[var(--text-sub)] mb-8 leading-relaxed">
                    별도의 장비 없이, 내 손안의 시뮬레이션 센터를 경험하세요.
                    이론 학습부터 시뮬레이션까지 앱 하나로 언제 어디서나 학습할 수 있습니다.
                  </p>
                  <ul className="space-y-3 mb-8">
                    <li className="flex items-center gap-3 text-sm text-[var(--text-main)]">
                      <CheckCircle size={20} className="text-indigo-500 flex-shrink-0" />
                      핵심 간호 술기 및 ACLS, Triage 과정 포함
                    </li>
                    <li className="flex items-center gap-3 text-sm text-[var(--text-main)]">
                      <CheckCircle size={20} className="text-indigo-500 flex-shrink-0" />
                      터치 인터페이스에 최적화된 조작감
                    </li>
                  </ul>
                  <div className="flex gap-3">
                    <Button variant="dark" size="lg" className="flex-1">
                      App Store
                    </Button>
                    <Button variant="dark" size="lg" className="flex-1">
                      Google Play
                    </Button>
                  </div>
                </CardContent>
              </div>
            )}
          </Card>
        </div>
      </section>

      {/* 8. Stats Section */}
      <section className="py-20 md:py-28 bg-gradient-to-b from-blue-50/50 to-white">
        <div className="container" style={{ maxWidth: '1280px' }}>
          <div className="flex flex-col md:flex-row justify-between items-center mb-16 gap-4">
            <div>
              <h2 className="text-3xl font-bold mb-2">이미 많은 조직이 변화를 경험하고 있습니다</h2>
              <p className="text-base text-[var(--text-sub)]">Better Preparation, Better Retention, Stronger Teamwork</p>
            </div>
            <Button variant="outline">성과 리포트 전체보기</Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="text-center transition-all hover:shadow-xl hover:-translate-y-1">
              <CardContent className="pt-8 pb-6">
                <div className="text-5xl font-bold text-brand-500 mb-2">
                  13.2<span className="text-2xl opacity-70">%</span>
                </div>
                <h3 className="text-lg font-bold mb-2">연평균 이직률 감소율</h3>
                <p className="text-sm text-[var(--text-sub)]">한림대학교 성심병원 신규 간호사 도입 사례</p>
              </CardContent>
            </Card>

            <Card className="text-center transition-all hover:shadow-xl hover:-translate-y-1">
              <CardContent className="pt-8 pb-6">
                <div className="text-5xl font-bold text-brand-500 mb-2">
                  98<span className="text-2xl opacity-70">%</span>
                </div>
                <h3 className="text-lg font-bold mb-2">교육 만족도</h3>
                <p className="text-sm text-[var(--text-sub)]">학습자 재교육 희망 및 역량 향상 응답률</p>
              </CardContent>
            </Card>

            <Card className="text-center transition-all hover:shadow-xl hover:-translate-y-1">
              <CardContent className="pt-8 pb-6">
                <div className="text-5xl font-bold text-brand-500 mb-2">
                  100K<span className="text-2xl opacity-70">+</span>
                </div>
                <h3 className="text-lg font-bold mb-2">연간 학습자 수</h3>
                <p className="text-sm text-[var(--text-sub)]">Trusted Education Partner in Korea</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* 9. License Plans */}
      <section className="py-16 md:py-12">
        <div className="container" style={{ maxWidth: '1280px' }}>
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-2">구입방법</h2>
            <p className="text-lg text-[var(--text-sub)] max-w-2xl mx-auto">
              사용자 규모와 목적에 맞는 플랜을 선택하여 구입 가능합니다.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

            {/* Basic Plan */}
            <Card className="flex flex-col">
              <CardHeader>
                <h3 className="text-xl font-bold mb-1">Basic</h3>
                <p className="text-sm text-[var(--text-sub)]">간호학생, 간호사, 구급대원 등<br />개인 학습을 위한 기본 플랜</p>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="mb-6 pb-6 border-b border-[var(--border-color)]">
                  <span className="text-3xl font-bold text-[var(--text-main)]">₩45,400</span>
                  <span className="text-base text-[var(--text-main)]">/월간</span>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3 text-sm text-[var(--text-sub)]">
                    <CheckCircle size={16} color="var(--primary)" />클래스 선택 1종
                  </li>
                  <li className="flex items-center gap-3 text-sm text-[var(--text-sub)]">
                    <CheckCircle size={16} color="var(--primary)" />개인 평가결과 조회
                  </li>
                  <li className="flex items-center gap-3 text-sm text-[var(--text-sub)]">
                    <CheckCircle size={16} color="var(--primary)" />교육이수증 발급
                  </li>
                  <li className="flex items-center gap-3 text-sm text-[var(--text-sub)]">
                    <CheckCircle size={16} color="var(--primary)" />이메일 고객지원
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">플랜 선택하기</Button>
              </CardFooter>
            </Card>

            {/* Pro Plan */}
            <Card className="flex flex-col border-2 border-brand-500 shadow-lg shadow-brand-500/20 relative">
              <Badge className="absolute top-4 right-4 text-white bg-brand-500">추천</Badge>
              <CardHeader>
                <h3 className="text-xl font-bold mb-1">Pro</h3>
                <p className="text-sm text-[var(--text-sub)]">AI 기능, 의학 시뮬레이션을 지원하는 <br />개인 학습용 프리미엄 플랜</p>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="mb-6 pb-6 border-b border-[var(--border-color)]">
                  <span className="text-3xl font-bold text-[var(--text-main)]">₩165,000</span>
                  <span className="text-base text-[var(--text-main)]">/월간</span>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3 text-sm text-[var(--text-sub)]">
                    <CheckCircle size={16} color="var(--primary)" />클래스 무제한
                  </li>
                  <li className="flex items-center gap-3 text-sm text-[var(--text-sub)]">
                    <CheckCircle size={16} color="var(--primary)" />배경/아이템 편집 기능
                  </li>
                  <li className="flex items-center gap-3 text-sm text-[var(--text-sub)]">
                    <CheckCircle size={16} color="var(--primary)" />환자/이벤트 편집 기능
                  </li>
                  <li className="flex items-center gap-3 text-sm text-[var(--text-sub)]">
                    <CheckCircle size={16} color="var(--primary)" />워크플로우 편집 기능
                  </li>
                  <li className="flex items-center gap-3 text-sm text-[var(--text-sub)]">
                    <CheckCircle size={16} color="var(--primary)" />체크리스트 편집 기능
                  </li>
                  <li className="flex items-center gap-3 text-sm text-[var(--text-sub)]">
                    <CheckCircle size={16} color="var(--primary)" />자연어기반 AI 대화 지원
                  </li>
                  <li className="flex items-center gap-3 text-sm text-[var(--text-sub)]">
                    <CheckCircle size={16} color="var(--primary)" />개인 평가결과 조회
                  </li>
                  <li className="flex items-center gap-3 text-sm text-[var(--text-sub)]">
                    <CheckCircle size={16} color="var(--primary)" />교육이수증 발급
                  </li>
                  <li className="flex items-center gap-3 text-sm text-[var(--text-sub)]">
                    <CheckCircle size={16} color="var(--primary)" />이메일 고객지원
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button variant="primary" className="w-full">플랜 선택하기</Button>
              </CardFooter>
            </Card>

            {/* Class Plan */}
            <Card className="flex flex-col">
              <CardHeader>
                <h3 className="text-xl font-bold mb-1">Class</h3>
                <p className="text-sm text-[var(--text-sub)]">Basic 또는 Pro플랜을 단체교육으로<br />확장한 플랜</p>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="mb-6 pb-6 border-b border-[var(--border-color)]">
                  <span className="text-2xl font-bold text-[var(--text-main)]">견적문의</span>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3 text-sm text-[var(--text-sub)]">
                    <CheckCircle size={16} color="var(--primary)" />Basic 플랜 또는 Pro 플랜 선택
                  </li>
                  <li className="flex items-center gap-3 text-sm text-[var(--text-sub)]">
                    <CheckCircle size={16} color="var(--primary)" />커리큘럼 관리 기능
                  </li>
                  <li className="flex items-center gap-3 text-sm text-[var(--text-sub)]">
                    <CheckCircle size={16} color="var(--primary)" />학습현황 조회 기능
                  </li>
                  <li className="flex items-center gap-3 text-sm text-[var(--text-sub)]">
                    <CheckCircle size={16} color="var(--primary)" />클래스 평가결과 조회 기능
                  </li>
                  <li className="flex items-center gap-3 text-sm text-[var(--text-sub)]">
                    <CheckCircle size={16} color="var(--primary)" />사용자 관리 기능
                  </li>
                  <li className="flex items-center gap-3 text-sm text-[var(--text-sub)]">
                    <CheckCircle size={16} color="var(--primary)" />방문교육 및 기술지원
                  </li>
                  <li className="flex items-center gap-3 text-sm text-[var(--text-sub)]">
                    <CheckCircle size={16} color="var(--primary)" />장비납품 및 설치 가능
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">플랜 선택하기</Button>
              </CardFooter>
            </Card>

            {/* Enterprise Plan */}
            <Card className="flex flex-col">
              <CardHeader>
                <h3 className="text-xl font-bold mb-1">Enterprise</h3>
                <p className="text-sm text-[var(--text-sub)]">기관별 교육목적에 맞는 신규 시뮬레이션 모듈 개발 또는 사업협력 문의</p>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="mb-6 pb-6 border-b border-[var(--border-color)]">
                  <span className="text-2xl font-bold text-[var(--text-main)]">견적 문의</span>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3 text-sm text-[var(--text-sub)]">
                    <CheckCircle size={16} color="var(--primary)" />커스텀 시뮬레이션 모듈 개발
                  </li>
                  <li className="flex items-center gap-3 text-sm text-[var(--text-sub)]">
                    <CheckCircle size={16} color="var(--primary)" />신규 Courses 개발
                  </li>
                  <li className="flex items-center gap-3 text-sm text-[var(--text-sub)]">
                    <CheckCircle size={16} color="var(--primary)" />해외 교육사업 지원
                  </li>
                  <li className="flex items-center gap-3 text-sm text-[var(--text-sub)]">
                    <CheckCircle size={16} color="var(--primary)" />의료기기 XR 기술협력
                  </li>
                  <li className="flex items-center gap-3 text-sm text-[var(--text-sub)]">
                    <CheckCircle size={16} color="var(--primary)" />기술/교육컨설팅
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">플랜 선택하기</Button>
              </CardFooter>
            </Card>
          </div>

        </div>
      </section>

      {/* 10. Footer */}
      <Footer />
    </div>
  );
};
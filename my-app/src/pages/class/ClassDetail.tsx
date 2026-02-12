import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams, useParams } from 'react-router-dom';
import { Share2, Users, Edit, Calendar, Info, Globe, Building, CheckCircle, Lock, Key, PlayCircle, Copy, Settings, Award, Download } from 'lucide-react';
import {
    PageHeader,
    Button,
    Badge,
    Input,
    Modal,
    Tabs,
    TabsList,
    TabsTrigger,
    TabsContent,
} from '@/components/shared/ui';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/shared/ui';
import { classesData, ClassItem } from '../../data/classes';
import { getUsersByOrgId } from '../../data/organizationUsers';
import { useAuth } from '../../contexts/AuthContext';
import { useClassDetail } from '../../data/queries/useClasses';
import { updateClassPassword } from '../../services/classService';
import ClassParticipantModal from './ClassParticipantModal';

export default function ClassDetail(): React.ReactElement {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { id } = useParams<{ id: string }>();
  const { getCurrentRole, isPremiumUser, user } = useAuth();
  const role = getCurrentRole();
  const isPremium = isPremiumUser();
  const basePath = role === 'master' ? '/master' : role === 'admin' ? '/admin' : '';

  const classId = id || searchParams.get('tab') || '001';
  const { classData: apiClassData, loading: classLoading, refetch: refetchClassDetail } = useClassDetail(classId);
  const staticClassData = (classesData as unknown as Record<string, ClassItem>)[classId] || (classesData as unknown as Record<string, ClassItem>)['001'];
  const classData = apiClassData ?? staticClassData;

  // User Contexts:
  // 1) Non-licensed Participant (guest, student) -> isPremium === false, basePath usually / (or not /master/admin)
  // 2) Non-licensed Manager (master, admin) -> isPremium === false
  // 3) Licensed Participant (student w/ license) -> isPremium === true
  // 4) Licensed Manager (master/admin w/ license) -> isPremium === true, hasRole('master')

  const isManagerPath = basePath.includes('master') || basePath.includes('admin');
  const isLicensedManager = isManagerPath && isPremium;
  const isLicensedParticipant = !isManagerPath && isPremium;

  // All hooks must be called before any early returns
  const [isParticipantModalOpen, setIsParticipantModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(((classData as ClassItem & { isPublic?: boolean })?.isPublic ?? false) || role === 'admin');
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [passwordChangeLoading, setPasswordChangeLoading] = useState(false);
  const [passwordChangeError, setPasswordChangeError] = useState<string | null>(null);
  const [adminActiveTab, setAdminActiveTab] = useState<'curriculum' | 'participants'>('curriculum');

  useEffect(() => {
      setIsUnlocked(((classData as ClassItem & { isPublic?: boolean })?.isPublic ?? false) || role === 'admin');
      setPasswordInput('');
      setPasswordError(false);
  }, [classData, role]);

  // Mock: 이수 진행률 계산 (실제로는 API에서 가져와야 함)
  // React Hooks는 조건문 이전에 호출되어야 함
  const completionProgress = useMemo(() => {
      // Mock: completionRequirements를 기반으로 이수 진행률 계산
      if (!classData?.completionRequirements) return 0;
      // 실제로는 사용자의 클래스 완료 상태를 확인해야 함
      // 여기서는 mock으로 0~100 사이의 랜덤 진행률로 가정
      return Math.floor(Math.random() * 100);
  }, [classData?.completionRequirements]);

  const isCompleted = completionProgress >= 100;

  // 참가자 목록 (직무: 의사, 간호사, 구급대원) — 목업. 훅 규칙 준수를 위해 early return 이전에 호출.
  const JOB_TYPES = ['의사', '간호사', '구급대원'] as const;
  const adminParticipantList = useMemo(() => {
      if (!isLicensedManager || !classData) return [];
      const orgId = (classData as ClassItem & { organizationId?: number })?.organizationId != null
          ? `ORG${String((classData as ClassItem & { organizationId?: number }).organizationId).padStart(3, '0')}`
          : 'ORG001';
      const users = getUsersByOrgId(orgId).slice(0, 10);
      return users.map((u, i) => ({
          name: u.name,
          id: String(u.id),
          organizationName: u.organizationName ?? '메디크루 의원',
          jobType: (u.specialty && JOB_TYPES.includes(u.specialty as typeof JOB_TYPES[number]) ? u.specialty : JOB_TYPES[i % 3]),
          position: u.position ?? u.department ?? '—',
          participantRole: u.role ?? '—',
          completionRate: [0, 25, 50, 75, 100][i % 5],
      }));
  }, [isLicensedManager, classData]);

  if (classLoading && !classData) {
    return <div className="p-8 text-center text-gray-500">클래스 정보를 불러오는 중...</div>;
  }
  if (!classData) {
    return <div>Class not found</div>;
  }

  const handleUnlock = () => {
      if (passwordInput === classData.password) {
          setIsUnlocked(true);
          setPasswordError(false);
      } else {
          setPasswordError(true);
      }
  };

  const handleChangePasswordAndUnlock = async () => {
      if (!newPasswordInput.trim()) return;
      setPasswordChangeError(null);
      setPasswordChangeLoading(true);
      try {
          await updateClassPassword(Number(classId), newPasswordInput.trim());
          setNewPasswordInput('');
          setIsUnlocked(true);
          setIsChangingPassword(false);
      } catch (err) {
          setPasswordChangeError(err instanceof Error ? err.message : '비밀번호 변경에 실패했습니다.');
      } finally {
          setPasswordChangeLoading(false);
      }
  };

  if (!isUnlocked) {
      return (
          <div className="min-h-[60vh] flex items-center justify-center p-4">
              <div className="max-w-md w-full bg-white rounded-xl shadow-lg border border-gray-200 p-8 text-center space-y-6">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                      <Lock className="text-gray-500" size={32} />
                  </div>
                  <div className="space-y-2">
                      <h2 className="text-xl font-bold text-gray-900">비공개 클래스</h2>
                      <p className="text-gray-500">
                          이 클래스는 비공개로 설정되어 있습니다.<br />
                          접근하려면 비밀번호를 입력해주세요.
                      </p>
                  </div>
                  <div className="space-y-4">
                      {!isChangingPassword ? (
                          <>
                              <div className="space-y-2 text-left">
                                  <label className="text-sm font-medium text-gray-700 ml-1">비밀번호</label>
                                  <div className="relative">
                                      <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                      <Input
                                          type="password"
                                          placeholder="비밀번호 입력"
                                          className={`pl-10 ${passwordError ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                                          value={passwordInput}
                                          onChange={(e) => setPasswordInput(e.target.value)}
                                          onKeyDown={(e) => e.key === 'Enter' && handleUnlock()}
                                      />
                                  </div>
                                  {passwordError && (
                                      <p className="text-xs text-red-500 ml-1">비밀번호가 일치하지 않습니다.</p>
                                  )}
                              </div>
                              <div className="flex flex-col gap-3">
                                  <div className="flex gap-3">
                                      <Button variant="outline" className="flex-1" onClick={() => navigate(-1)}>
                                          뒤로가기
                                      </Button>
                                      <Button
                                          variant="primary"
                                          className="flex-1"
                                          onClick={handleUnlock}
                                      >
                                          확인
                                      </Button>
                                  </div>
                                  {(role === 'master' || role === 'admin') && (
                                      <Button
                                          variant="ghost"
                                          className="w-full text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                          onClick={() => {
                                              setNewPasswordInput('');
                                              setIsChangingPassword(true);
                                          }}
                                      >
                                          비밀번호 변경
                                      </Button>
                                  )}
                              </div>
                          </>
                                      ) : (
                                          <>
                                              <div className="space-y-2 text-left">
                                                  <label className="text-sm font-medium text-gray-700 ml-1">새 비밀번호 설정</label>
                                                  <div className="relative">
                                                      <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                                      <Input
                                                          type="password"
                                                          placeholder="새 비밀번호 입력"
                                                          className="pl-10"
                                                          value={newPasswordInput}
                                                          onChange={(e) => setNewPasswordInput(e.target.value)}
                                                          onKeyDown={(e) => e.key === 'Enter' && void handleChangePasswordAndUnlock()}
                                                      />
                                                  </div>
                                                  {passwordChangeError && (
                                                      <p className="text-xs text-red-500 ml-1">{passwordChangeError}</p>
                                                  )}
                                                  <p className="text-xs text-blue-600 ml-1">마스터 권한으로 비밀번호를 수정하고 입장합니다.</p>
                                              </div>
                                              <div className="flex gap-3">
                                                  <Button
                                                      variant="outline"
                                                      className="flex-1"
                                                      onClick={() => { setIsChangingPassword(false); setPasswordChangeError(null); }}
                                                      disabled={passwordChangeLoading}
                                                  >
                                                      취소
                                                  </Button>
                                                  <Button
                                                      variant="primary"
                                                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                                                      onClick={() => void handleChangePasswordAndUnlock()}
                                                      disabled={!newPasswordInput.trim() || passwordChangeLoading}
                                                  >
                                                      {passwordChangeLoading ? '변경 중...' : '변경 및 입장'}
                                                  </Button>
                                              </div>
                                          </>
                                      )}
                  </div>
              </div>
          </div>
      );
  }

  const {
      title,
      thumbnail,
      description,
      participationPeriod,
      completionRequirements,
      maxParticipants = 0,
      currentParticipants = 0,
      completionRate = 0,
      creatorId,
      createdDate,
      curriculum
  } = classData;
  const isPublic = (classData as ClassItem & { isPublic?: boolean }).isPublic ?? false;

  const isFull = currentParticipants >= maxParticipants;
  
  // 이수증 다운로드 핸들러
  const handleDownloadCertificate = () => {
      // Mock: 이수증 다운로드 기능
      // 실제로는 PDF 생성 및 다운로드 API 호출
      // PDF 생성 및 다운로드 로직 구현 필요
      alert('이수증 다운로드 기능은 준비 중입니다.');
  };

  const renderActions = () => {
      if (isLicensedManager) {
          return (
              <>
                  <Button variant="outline" size="md" onClick={() => setIsParticipantModalOpen(true)}>
                      <Users size={16} className="mr-2" />
                      참가자 관리
                  </Button>
                  <Button variant="primary" size="md" onClick={() => navigate(`${basePath}/class/edit/${classData.id}`)}>
                      <Edit size={16} className="mr-2" />
                      클래스 변경
                  </Button>
              </>
          );
      }

      if (isLicensedParticipant) {
          return (
              <Button variant="primary" size="md">
                  참여하기
              </Button>
          );
      }

      // Default: No license (Guest or Manager without license)
      return (
          <>
              <Button variant="outline" size="md">
                  기관 문의
              </Button>
              <Button variant="primary" size="md">
                  참가 신청
              </Button>
          </>
      );
  };

  return (
      <div className="pb-12">
          <PageHeader
              breadcrumbs={[
                  { label: isManagerPath ? '클래스 관리' : '클래스', link: isManagerPath ? `${basePath}/class-management` : '/class-list' },
                  { label: title }
              ]}
          />

          <div className="flex flex-col lg:flex-row gap-8">
              {/* Left Column */}
              <div className="flex-1 space-y-6">
                  <div className="space-y-4">
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
                      <p className="text-base text-gray-600 mt-0.5 leading-relaxed">
                          {description}
                      </p>

                      {/* Thumbnail */}
                      <div className="aspect-video bg-gray-100 rounded-xl overflow-hidden border border-gray-200">
                          {thumbnail ? (
                              <img src={thumbnail} alt={title} className="w-full h-full object-cover" />
                          ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400">
                                  <span>No Thumbnail</span>
                              </div>
                          )}
                      </div>


                  </div>

                  {isLicensedManager ? (
                      <Tabs value={adminActiveTab} onValueChange={(v) => setAdminActiveTab(v as 'curriculum' | 'participants')} className="w-full">
                          <TabsList className="w-full grid grid-cols-2 rounded-lg bg-gray-100 p-1">
                              <TabsTrigger value="curriculum" className="rounded-md">커리큘럼</TabsTrigger>
                              <TabsTrigger value="participants" className="rounded-md">참가자</TabsTrigger>
                          </TabsList>
                          <TabsContent value="curriculum" className="mt-4">
                              <div className="bg-white rounded-xl overflow-hidden shadow-sm">
                                  <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                                      <h3 className="font-bold text-gray-900">커리큘럼</h3>
                                      <span className="text-sm text-gray-700">
                                          총 {curriculum.length}개 세션
                                          <span className="mx-2">/</span>
                                          {(() => {
                                              const totalMinutes = curriculum.reduce((acc, item) => {
                                                  const match = item.duration?.match(/(\d+)분/);
                                                  return match ? acc + parseInt(match[1], 10) : acc;
                                              }, 0);
                                              const hours = Math.floor(totalMinutes / 60);
                                              const minutes = totalMinutes % 60;
                                              return hours > 0 ? `${hours}시간 ${minutes > 0 ? `${minutes}분` : ''}` : `${totalMinutes}분`;
                                          })()}
                                      </span>
                                  </div>
                                  <div className="divide-y divide-gray-100">
                                      {curriculum.map((item, index) => (
                                          <div key={item.id} className="p-4 flex items-center gap-2 hover:bg-gray-50 transition-colors">
                                              <span className="text-gray-500 text-sm font-medium w-10 text-center">{index + 1}</span>
                                              <div className="flex-1">
                                                  <div className="flex items-center gap-3">
                                                      <Badge
                                                          variant="outline"
                                                          className={`text-sm w-24 justify-center ${item.type === 'video'
                                                              ? 'text-green-500 border-green-500'
                                                              : 'text-blue-500 border-blue-500'
                                                              }`}
                                                      >
                                                          {item.type === 'video' ? '동영상' : '시뮬레이션'}
                                                      </Badge>
                                                      <h4
                                                          className="text-base font-medium text-gray-900 hover:text-blue-600 cursor-pointer transition-colors"
                                                          onClick={() => {
                                                              const sessionPath = isManagerPath
                                                                  ? `${basePath}/class-management/${classData.id}/curriculum/${item.id}`
                                                                  : `/class/${classData.id}/curriculum/${item.id}`;
                                                              navigate(sessionPath);
                                                          }}
                                                      >
                                                          {item.name}
                                                      </h4>
                                                  </div>
                                              </div>
                                              <div className="flex items-center gap-4">
                                                  <span className="text-base text-gray-500 w-16 text-right">
                                                      {item.duration}
                                                  </span>
                                                  <div className="w-20">
                                                      {(isLicensedManager || isLicensedParticipant) && item.type === 'scenario' && (
                                                          <Button
                                                              variant="outline"
                                                              size="sm"
                                                              className="h-8 text-sm cursor-pointer"
                                                              onClick={() => {
                                                                  const resultsPath = isLicensedManager
                                                                      ? `${basePath}/class-management/${classData.id}/results/${item.id}`
                                                                      : `/class/${classData.id}/results/${item.id}`;
                                                                  navigate(resultsPath);
                                                              }}
                                                          >
                                                              결과보기
                                                          </Button>
                                                      )}
                                                  </div>
                                              </div>
                                          </div>
                                      ))}
                                  </div>
                              </div>
                          </TabsContent>
                          <TabsContent value="participants" className="mt-4">
                              <div className="bg-white rounded-xl overflow-hidden shadow-sm">
                                  <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                                      <h3 className="font-bold text-gray-900">참가자</h3>
                                      <span className="text-sm text-gray-700">
                                          총 {adminParticipantList.length}명
                                      </span>
                                  </div>
                                  <Table>
                                      <TableHeader>
                                          <TableRow>
                                              <TableHead className="px-4 py-3">이름</TableHead>
                                              <TableHead className="px-4 py-3">ID</TableHead>
                                              <TableHead className="px-4 py-3">소속기관</TableHead>
                                              <TableHead className="px-4 py-3">직무</TableHead>
                                              <TableHead className="px-4 py-3">직책</TableHead>
                                              <TableHead className="px-4 py-3">이수율</TableHead>
                                          </TableRow>
                                      </TableHeader>
                                      <TableBody>
                                          {adminParticipantList.map((row, idx) => (
                                              <TableRow key={idx}>
                                                  <TableCell className="px-4 py-2 font-medium text-gray-900">{row.name}</TableCell>
                                                  <TableCell className="px-4 py-2 text-gray-600">{row.id}</TableCell>
                                                  <TableCell className="px-4 py-2 text-gray-600">{row.organizationName}</TableCell>
                                                  <TableCell className="px-4 py-2 text-gray-600">{row.jobType}</TableCell>
                                                  <TableCell className="px-4 py-2 text-gray-600">{row.position}</TableCell>
                                                  <TableCell className="px-4 py-2">
                                                      {row.participantRole === 'Master' ? (
                                                          <Badge variant="outline" className="text-xs border-blue-300 text-blue-700 bg-blue-50">
                                                              Master
                                                          </Badge>
                                                      ) : (
                                                          <span className={row.completionRate >= 100 ? 'text-green-600 font-medium' : 'text-gray-700'}>
                                                              {row.completionRate}%
                                                          </span>
                                                      )}
                                                  </TableCell>
                                              </TableRow>
                                          ))}
                                      </TableBody>
                                  </Table>
                                  {adminParticipantList.length === 0 && (
                                      <div className="p-8 text-center text-gray-500 text-sm">참가자가 없습니다.</div>
                                  )}
                              </div>
                          </TabsContent>
                      </Tabs>
                  ) : (
                      <div className="bg-white rounded-xl overflow-hidden shadow-sm">
                          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                              <h3 className="font-bold text-gray-900">커리큘럼</h3>
                              <span className="text-sm text-gray-500">
                                  총 {curriculum.length}개 세션
                                  <span className="mx-2">/</span>
                                  {(() => {
                                      const totalMinutes = curriculum.reduce((acc, item) => {
                                          const match = item.duration?.match(/(\d+)분/);
                                          return match ? acc + parseInt(match[1], 10) : acc;
                                      }, 0);
                                      const hours = Math.floor(totalMinutes / 60);
                                      const minutes = totalMinutes % 60;
                                      return hours > 0 ? `${hours}시간 ${minutes > 0 ? `${minutes}분` : ''}` : `${totalMinutes}분`;
                                  })()}
                              </span>
                          </div>
                          <div className="divide-y divide-gray-100">
                              {curriculum.map((item, index) => (
                                  <div key={item.id} className="p-4 flex items-center gap-2 hover:bg-gray-50 transition-colors">
                                      <span className="text-gray-500 text-sm font-medium w-10 text-center">{index + 1}</span>
                                      <div className="flex-1">
                                          <div className="flex items-center gap-3">
                                              <Badge
                                                  variant="outline"
                                                  className={`text-sm w-24 justify-center ${item.type === 'video'
                                                      ? 'text-green-500 border-green-500'
                                                      : 'text-blue-500 border-blue-500'
                                                      }`}
                                              >
                                                  {item.type === 'video' ? '동영상' : '시뮬레이션'}
                                              </Badge>
                                              <h4
                                                  className="text-base font-medium text-gray-900 hover:text-blue-600 cursor-pointer transition-colors"
                                                  onClick={() => {
                                                      const sessionPath = isManagerPath
                                                          ? `${basePath}/class-management/${classData.id}/curriculum/${item.id}`
                                                          : `/class/${classData.id}/curriculum/${item.id}`;
                                                      navigate(sessionPath);
                                                  }}
                                              >
                                                  {item.name}
                                              </h4>
                                          </div>
                                      </div>
                                      <div className="flex items-center gap-4">
                                          <span className="text-base text-gray-500 w-16 text-right">
                                              {item.duration}
                                          </span>
                                          <div className="w-20">
                                              {(isLicensedManager || isLicensedParticipant) && item.type === 'scenario' && (
                                                  <Button
                                                      variant="outline"
                                                      size="sm"
                                                      className="h-8 text-sm cursor-pointer"
                                                      onClick={() => {
                                                          const resultsPath = isLicensedManager
                                                              ? `${basePath}/class-management/${classData.id}/results/${item.id}`
                                                              : `/class/${classData.id}/results/${item.id}`;
                                                          navigate(resultsPath);
                                                      }}
                                                  >
                                                      결과보기
                                                  </Button>
                                              )}
                                          </div>
                                      </div>
                                  </div>
                              ))}
                          </div>
                      </div>
                  )}
              </div>

              {/* Right Column */}
              <div className="w-full lg:w-1/3 space-y-6">

                  {isLicensedManager && (
                      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-6">
                          <h3 className="font-bold text-gray-900 text-lg">클래스 현황</h3>
                          <div className="space-y-2">
                              <div className="flex justify-between text-base">
                                  <span className="text-gray-500">참여자 수</span>
                                  <span className="font-medium text-gray-900 text-base">
                                      <span className={isFull ? "text-red-600" : ""}>{currentParticipants}</span>
                                      <span className="text-gray-400 mx-1">/</span>
                                      {maxParticipants}명
                                  </span>
                              </div>
                              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                  <div
                                      className={`h-full rounded-full ${isFull ? 'bg-red-500' : 'bg-blue-500'}`}
                                      style={{ width: `${Math.min((currentParticipants / maxParticipants) * 100, 100)}%` }}
                                  />
                              </div>
                          </div>
                          <div className="space-y-2">
                              <div className="flex justify-between text-base">
                                  <span className="text-gray-500">이수율</span>
                                  <span className="font-medium text-gray-900">{completionRate}%</span>
                              </div>
                              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                  <div
                                      className="h-full rounded-full bg-green-500"
                                      style={{ width: `${Math.min(completionRate, 100)}%` }}
                                  />
                              </div>
                          </div>
                      </div>
                  )}

                  <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-4">
                      <h3 className="font-bold text-gray-900 text-lg">클래스 참여</h3>
                      <div className="flex items-center justify-between text-base">
                          <span className="text-gray-500 flex items-center gap-2">
                              <Building size={14} /> 개설기관
                          </span>
                          <span className="font-medium text-gray-900">
                              {user?.currentAccount?.organizationName || '-'}
                          </span>
                      </div>
                      <div className="flex items-center justify-between text-base">
                          <span className="text-gray-500 flex items-center gap-2">
                              <Calendar size={14} /> 참여기간
                          </span>
                          <span className="font-medium text-gray-900">
                              {participationPeriod ? `${participationPeriod.startDate} ~ ${participationPeriod.endDate}` : '기간 설정 없음'}
                          </span>
                      </div>
                      <div className="flex items-start justify-between text-base">
                          <span className="text-gray-500 flex items-center gap-2">
                              <CheckCircle size={14} /> 이수조건
                          </span>
                          <span className="font-medium text-gray-900 text-right">
                              {completionRequirements
                                  ? `${completionRequirements.minPassingScore}점 이상, ${completionRequirements.requireAllScenarios ? '전체 시나리오' : `${completionRequirements.minScenarios}개 시나리오`} 완료`
                                  : '이수 조건 없음'
                              }
                          </span>
                      </div>
                      <div className="flex items-center justify-between text-base">
                          <span className="text-gray-500 flex items-center gap-2">
                              <Globe size={14} /> 공개여부
                          </span>
                          <div className="flex items-center gap-2">
                              <Badge variant={isPublic ? "default" : "secondary"} className={isPublic ? "text-sm bg-blue-100 text-blue-700" : ""}>
                                  {isPublic ? "공개" : "비공개"}
                              </Badge>
                              {(role === 'admin' || role === 'master') && !isPublic && (
                                  <button
                                      onClick={() => {
                                          setNewPasswordInput(classData.password || '');
                                          setIsPasswordModalOpen(true);
                                      }}
                                      className="text-xs text-blue-600 hover:text-blue-700 font-medium hover:underline flex items-center gap-1"
                                  >
                                      <Settings size={12} />
                                      비밀번호 변경
                                  </button>
                              )}
                          </div>
                      </div>
                      {isLicensedParticipant && (
                          <div className="space-y-2">
                              <div className="flex items-center justify-between text-base">
                                  <span className="text-gray-500 flex items-center gap-2">
                                      <Award size={14} /> 이수현황
                                  </span>
                                  <span className="font-bold text-lg text-blue-500">{completionProgress}%</span>
                              </div>
                              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                  <div
                                      className={`h-full rounded-full transition-all ${isCompleted ? 'bg-green-500' : 'bg-blue-500'}`}
                                      style={{ width: `${Math.min(completionProgress, 100)}%` }}
                                  />
                              </div>
                          </div>
                      )}

                      {/* Action Buttons */}
                      <div className="pt-2 flex flex-col gap-2">
                          {(isLicensedManager || isLicensedParticipant) && (
                              <>
                                  {/* Main Action Button */}
                                  <Button
                                      variant="primary"
                                      size="lg"
                                      className="w-full"
                                      onClick={() => navigate(isLicensedManager
                                          ? `${basePath}/class-management/${classData.id}/curriculum`
                                          : `/class/${classData.id}/curriculum`
                                      )}
                                  >
                                      참여하기
                                  </Button>
                                  
                                  {/* 이수증 다운로드 버튼 */}
                                  {isLicensedParticipant && (
                                      <Button
                                          variant="outline"
                                          size="lg"
                                          className="w-full"
                                          onClick={handleDownloadCertificate}
                                          disabled={!isCompleted}
                                      >
                                          <Download size={16} className="mr-2" />
                                          이수증 다운로드
                                      </Button>
                                  )}
                              </>
                          )}

                          {/* Management Actions - Single Row */}
                          {isLicensedManager && (
                              <div className="flex flex-col gap-2">
                                  <div className="flex gap-2">
                                      <Button
                                          variant="outline"
                                          size="lg"
                                          className="flex-1"
                                          onClick={() => setIsParticipantModalOpen(true)}
                                      >
                                          <Users size={16} className="mr-2" />
                                          참가자 관리
                                      </Button>
                                  </div>
                                  <div className="flex gap-2">
                                      <Button
                                          variant="ghost"
                                          size="lg"
                                          className="flex-1"
                                          onClick={() => navigate(`${basePath}/class/edit/${classData.id}`)}
                                      >
                                          <Edit size={16} className="mr-2" />
                                          클래스 변경
                                      </Button>
                                      <Button
                                          variant="ghost"
                                          size="lg"
                                          className="flex-1"
                                          onClick={() => navigate(`${basePath}/class/create`, { state: { duplicateFrom: classData } })}
                                      >
                                          <Copy size={16} className="mr-2" />
                                          클래스 복제
                                      </Button>
                                  </div>
                              </div>
                          )}

                          {!isLicensedManager && !isLicensedParticipant && (
                              <>
                                  <Button variant="outline" size="lg" className="w-full">
                                      기관 문의
                                  </Button>
                                  <Button variant="primary" size="lg" className="w-full">
                                      참가 신청
                                  </Button>
                              </>
                          )}
                      </div>
                  </div>
              </div>
          </div>

          <ClassParticipantModal
              isOpen={isParticipantModalOpen}
              onClose={() => setIsParticipantModalOpen(false)}
              classData={classData}
              currentUserOrgId="ORG001"
          />

          <Modal
              isOpen={isPasswordModalOpen}
              onClose={() => {
                  setIsPasswordModalOpen(false);
                  setPasswordChangeError(null);
              }}
              title="비밀번호 변경"
              size="small"
              footer={
                  <div className="flex gap-2">
                      <Button
                          variant="outline"
                          onClick={() => setIsPasswordModalOpen(false)}
                          className="flex-1"
                          disabled={passwordChangeLoading}
                      >
                          취소
                      </Button>
                      <Button
                          variant="primary"
                          onClick={async () => {
                              if (!newPasswordInput.trim()) return;
                              setPasswordChangeError(null);
                              setPasswordChangeLoading(true);
                              try {
                                  await updateClassPassword(Number(classId), newPasswordInput.trim());
                                  setNewPasswordInput('');
                                  setIsPasswordModalOpen(false);
                                  await refetchClassDetail?.();
                              } catch (err) {
                                  setPasswordChangeError(err instanceof Error ? err.message : '비밀번호 변경에 실패했습니다.');
                              } finally {
                                  setPasswordChangeLoading(false);
                              }
                          }}
                          className="flex-1"
                          disabled={!newPasswordInput.trim() || passwordChangeLoading}
                      >
                          {passwordChangeLoading ? '변경 중...' : '변경 완료'}
                      </Button>
                  </div>
              }
          >
              <div className="space-y-4 py-2">
                  <p className="text-sm text-gray-500">
                      클래스의 새로운 비밀번호를 설정해주세요.
                  </p>
                  {passwordChangeError && (
                      <p className="text-sm text-red-600">{passwordChangeError}</p>
                  )}
                  <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">비밀번호</label>
                      <div className="relative">
                          <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                          <Input
                              type="password"
                              placeholder="새 비밀번호 입력"
                              className="pl-10"
                              value={newPasswordInput}
                              onChange={(e) => setNewPasswordInput(e.target.value)}
                          />
                      </div>
                  </div>
              </div>
          </Modal>
      </div>
  );
}

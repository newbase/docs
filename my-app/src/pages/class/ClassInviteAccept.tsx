import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { CheckCircle2, AlertCircle, Loader2, ArrowRight, LogIn, UserPlus } from 'lucide-react';
import { Button, Badge } from '@/components/shared/ui';
import { classInviteService } from '../../services/classInviteService';
import { useAuth } from '../../contexts/AuthContext';
import { ClassInvite } from '../../types/class';
import { classesData, ClassItem } from '../../data/classes';
import { setMyClassStatus } from '../../utils/myClassStatus';

export default function ClassInviteAccept() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [invite, setInvite] = useState<ClassInvite | null>(null);
  const [classData, setClassData] = useState<ClassItem | null>(null);
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (token) {
      validateInvite(token);
    } else {
      setError('유효하지 않은 초대 링크입니다.');
      setLoading(false);
    }
  }, [token]);

  const validateInvite = async (inviteToken: string) => {
    try {
      const inviteData = await classInviteService.getInviteByToken(inviteToken);
      if (!inviteData) {
        setError('초대 정보를 찾을 수 없습니다.');
        return;
      }

      if (inviteData.status !== 'active') {
        setError('이 초대는 더 이상 유효하지 않습니다.');
        return;
      }

      const expiresAt = new Date(inviteData.expiresAt);
      if (expiresAt < new Date()) {
        setError('초대 링크가 만료되었습니다.');
        return;
      }

      setInvite(inviteData);
      
      // 클래스 정보 가져오기 (Mock 데이터에서 찾기)
      const data = (classesData as any)[inviteData.classId];
      if (data) {
        setClassData(data);
      }
    } catch (err) {
      console.error('Validation error:', err);
      setError('초대 확인 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    if (!user) {
      // 로그인이 필요한 경우 토큰 저장 후 로그인 페이지로 이동
      localStorage.setItem('pending_invite_token', token || '');
      navigate(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    setProcessing(true);
    try {
      const result = await classInviteService.acceptInvite(token!, user.id);
      if (result) {
        setSuccess(true);
        // 초대 수락한 클래스를 마이클래스에 참여중(participating) 상태로 반영
        const classId = String(classData?.id ?? invite?.classId ?? '');
        if (classId) {
          setMyClassStatus(classId, 'participating');
        }
        // 2초 후 마이클래스 상세 페이지로 이동
        setTimeout(() => {
          navigate(`/student/my-classes/${classData?.id ?? invite?.classId}`);
        }, 2000);
      } else {
        setError('초대 수락에 실패했습니다. 이미 참여 중인 클래스일 수 있습니다.');
      }
    } catch (err) {
      setError('초대 수락 중 오류가 발생했습니다.');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-4">
        <Loader2 size={48} className="text-blue-500 animate-spin mb-4" />
        <p className="text-gray-600 font-medium">초대 정보를 확인하고 있습니다...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-4">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-6">
          <AlertCircle size={32} className="text-red-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">초대를 처리할 수 없습니다</h2>
        <p className="text-gray-500 mb-8 text-center max-w-md">{error}</p>
        <Button variant="outline" onClick={() => navigate('/class-list')}>
          클래스 목록으로 돌아가기
        </Button>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-4 animate-in zoom-in duration-300">
        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 size={40} className="text-green-500" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2 text-center">초대를 수락했습니다!</h2>
        <p className="text-gray-600 mb-4 text-center">
          {classData?.title || '클래스'}에 성공적으로 참여되었습니다.
        </p>
        <p className="text-sm text-gray-400">잠시 후 클래스 페이지로 이동합니다...</p>
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        {/* Header / Thumbnail */}
        <div className="relative h-48 bg-blue-600 overflow-hidden">
          {classData?.thumbnail ? (
            <img src={classData.thumbnail} alt={classData.title} className="w-full h-full object-cover opacity-80" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <LinkIcon size={64} className="text-blue-200 opacity-20" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-4 left-6 right-6">
            <Badge className="mb-2 bg-blue-500 border-none">클래스 초대</Badge>
            <h1 className="text-xl font-bold text-white leading-tight">
              {classData?.title || '클래스 참여 초대'}
            </h1>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6">
          <div className="space-y-4">
            <p className="text-gray-600 leading-relaxed text-center">
              사용자님을 <strong>{classData?.title || '본 클래스'}</strong>에 초대합니다.<br />
              지금 바로 참여하여 교육 과정을 시작해보세요.
            </p>
            
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">초대 유효기간</span>
                <span className="text-gray-900 font-medium">
                  {invite?.expiresAt.split('T')[0]} 까지
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">참여자 수</span>
                <span className="text-gray-900 font-medium">
                  {classData?.currentParticipants || 0} / {classData?.maxParticipants || '무제한'}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Button 
              variant="primary" 
              className="w-full h-12 text-base font-bold shadow-lg shadow-blue-100"
              onClick={handleAccept}
              disabled={processing}
            >
              {processing ? (
                <Loader2 size={20} className="animate-spin" />
              ) : user ? (
                <>초대 수락하고 참여하기 <ArrowRight size={18} className="ml-2" /></>
              ) : (
                <>로그인하고 참여하기 <ArrowRight size={18} className="ml-2" /></>
              )}
            </Button>
            
            {!user && (
              <div className="flex flex-col items-center gap-3 pt-2">
                <p className="text-xs text-gray-400">계정이 없으신가요?</p>
                <div className="flex gap-4">
                  <Link to="/signup" className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
                    <UserPlus size={14} /> 회원가입
                  </Link>
                  <div className="w-px h-3 bg-gray-200" />
                  <Link to="/login" className="text-sm font-semibold text-gray-600 hover:text-gray-900 flex items-center gap-1">
                    <LogIn size={14} /> 로그인
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-gray-50 px-8 py-4 border-t border-gray-100">
          <p className="text-[11px] text-gray-400 text-center leading-normal">
            본 초대는 발신자에 의해 언제든지 취소될 수 있습니다.<br />
            도움이 필요하시면 고객센터로 문의해주세요.
          </p>
        </div>
      </div>
    </div>
  );
}

const LinkIcon = ({ size, className }: { size: number, className: string }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </svg>
);

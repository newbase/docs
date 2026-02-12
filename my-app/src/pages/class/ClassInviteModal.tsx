import React, { useState } from 'react';
import { Copy, QrCode, Link as LinkIcon, Calendar, Check, Download, RefreshCw } from 'lucide-react';
import { Button, Input, Badge } from '@/components/shared/ui';
import { ClassItem } from '../../data/classes';
import { classInviteService } from '../../services/classInviteService';
import { ClassInvite } from '../../types/class';
// import { QRCodeSVG } from 'qrcode.react'; // TODO: qrcode.react 패키지 설치 필요

interface ClassInviteModalProps {
  classData: ClassItem;
}

export default function ClassInviteModal({ classData }: ClassInviteModalProps) {
  const [expirationDays, setExpirationDays] = useState<number>(30);
  const [isGenerating, setIsGenerating] = useState(false);
  const [invite, setInvite] = useState<ClassInvite | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const expirationOptions = [
    { label: '7일', value: 7 },
    { label: '14일', value: 14 },
    { label: '30일', value: 30 },
    { label: '60일', value: 60 },
    { label: '90일', value: 90 },
    { label: '무기한', value: 0 },
  ];

  const handleGenerateInvite = async () => {
    setIsGenerating(true);
    try {
      const newInvite = await classInviteService.createInvite({
        classId: classData.id,
        expirationDays: expirationDays,
      });
      setInvite(newInvite);
    } catch (error) {
      console.error('Failed to generate invite:', error);
      alert('초대 생성에 실패했습니다.');
    } finally {
      setIsGenerating(false);
    }
  };

  const inviteUrl = invite ? `${window.location.origin}/class/invite/${invite.token}` : '';

  const copyToClipboard = (text: string, type: 'link' | 'code') => {
    navigator.clipboard.writeText(text);
    if (type === 'link') {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } else {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const downloadQRCode = () => {
    const svg = document.getElementById('invite-qrcode');
    if (!svg) return;
    
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.download = `invite-qr-${classData.id}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };
    
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  return (
    <div className="space-y-6 py-2">
      {!invite ? (
        <div className="space-y-6">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
            <h4 className="text-blue-800 font-semibold text-sm mb-1 flex items-center gap-2">
              <LinkIcon size={16} /> 새로운 초대 생성
            </h4>
            <p className="text-blue-700 text-sm">
              외부 수강생이나 게스트가 클래스에 참여할 수 있도록 초대 링크와 코드를 생성합니다.
            </p>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Calendar size={14} /> 초대 유효기간 설정
            </label>
            <div className="grid grid-cols-3 gap-2">
              {expirationOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setExpirationDays(option.value)}
                  className={`py-2 px-3 text-sm rounded-md border transition-all ${
                    expirationDays === option.value
                      ? 'bg-blue-600 border-blue-600 text-white font-medium shadow-sm'
                      : 'bg-white border-gray-200 text-gray-600 hover:border-blue-300 hover:bg-blue-50'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {expirationDays === 0 
                ? '생성된 초대는 관리자가 취소하기 전까지 무기한 유효합니다.' 
                : `생성된 초대는 ${expirationDays}일 후 만료되어 더 이상 사용할 수 없습니다.`}
            </p>
          </div>

          <Button 
            variant="primary" 
            className="w-full h-12 text-base font-semibold"
            onClick={handleGenerateInvite}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <RefreshCw size={18} className="mr-2 animate-spin" />
                생성 중...
              </>
            ) : (
              '초대 링크 및 코드 생성'
            )}
          </Button>
        </div>
      ) : (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-xl border border-gray-100">
            <div className="bg-white p-4 rounded-xl shadow-sm mb-4 border border-gray-200 w-40 h-40 flex items-center justify-center">
              {/* TODO: qrcode.react 패키지 설치 후 활성화
              <QRCodeSVG 
                id="invite-qrcode"
                value={inviteUrl} 
                size={160}
                level="H"
                includeMargin={true}
              />
              */}
              <QrCode size={80} className="text-gray-400" />
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={downloadQRCode}
              className="text-xs h-8"
              disabled
            >
              <Download size={14} className="mr-1.5" /> QR 코드 다운로드 (준비 중)
            </Button>
          </div>

          <div className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-800 ml-1">초대 링크</label>
              <div className="flex gap-2">
                <Input 
                  value={inviteUrl} 
                  readOnly 
                  className="bg-gray-50 text-gray-600 text-sm"
                />
                <Button 
                  variant={copiedLink ? "secondary" : "primary"}
                  className="shrink-0 w-24"
                  onClick={() => copyToClipboard(inviteUrl, 'link')}
                >
                  {copiedLink ? <Check size={18} /> : '복사'}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-800 ml-1">초대 코드</label>
              <div className="flex gap-2">
                <div className="flex-1 bg-white border-2 border-dashed border-blue-200 rounded-lg flex items-center justify-center py-2 px-4">
                  <span className="text-2xl font-black tracking-[0.2em] text-blue-600">
                    {invite.inviteCode}
                  </span>
                </div>
                <Button 
                  variant={copiedCode ? "secondary" : "primary"}
                  className="shrink-0 w-24"
                  onClick={() => copyToClipboard(invite.inviteCode, 'code')}
                >
                  {copiedCode ? <Check size={18} /> : '복사'}
                </Button>
              </div>
              <p className="text-[11px] text-gray-500 text-center">
                수강생이 직접 코드를 입력하여 참여할 수도 있습니다.
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-xs text-gray-400">만료일</span>
              <span className="text-sm font-medium text-gray-700">
                {invite.expiresAt.split('T')[0]}
              </span>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setInvite(null)}
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            >
              다시 생성하기
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

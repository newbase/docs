import React from 'react';
import { useAuth } from '@/contexts/AuthContext';

export default function Footer(): React.ReactElement {
  // @ts-ignore
  const { getCurrentRole } = useAuth();
  const userRole: string = getCurrentRole();
  const containerMaxWidth = userRole === 'admin' ? 'max-w-[1600px]' : 'max-w-7xl';

  return (
    <footer className="bg-white border-t border-gray-200 py-12 text-sm text-gray-600">
      <div className={`mx-auto px-4 ${containerMaxWidth}`}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg font-bold text-gray-900">NEWBASE</span>
            </div>
            <p className="leading-relaxed max-w-xs text-gray-500">
              메디크루는 뉴베이스가 만드는 메디컬 시뮬레이션 플랫폼입니다.
              의료 교육의 시공간적 한계를 넘어 더 안전한 세상을 만듭니다.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-gray-900 mb-4 text-base">Contact Us</h4>
            <ul className="space-y-2">
              <li>Tel: 02-564-8853</li>
              <li>Email: contact@newbase.kr</li>
              <li className="leading-relaxed">서울시 성동구 왕십리로 115, 헤이그라운드 <br /> 서울숲점 5층 (주)뉴베이스 </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-gray-900 mb-4 text-base">Legal</h4>
            <ul className="space-y-2">
              <li><button className="text-gray-500 hover:text-gray-900 hover:underline bg-transparent border-none p-0 cursor-pointer">이용약관</button></li>
              <li><button className="text-gray-500 hover:text-gray-900 hover:underline bg-transparent border-none p-0 cursor-pointer">개인정보처리방침</button></li>
              <li><button className="text-gray-500 hover:text-gray-900 hover:underline bg-transparent border-none p-0 cursor-pointer">사업자 정보 확인</button></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-gray-400">&copy; NEWBASE Inc. All rights reserved.</div>
          <div className="flex items-center gap-4">
            {/* Social Icons Placeholders */}
            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:bg-gray-200 hover:text-gray-600 transition-colors cursor-pointer">Y</div>
            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:bg-gray-200 hover:text-gray-600 transition-colors cursor-pointer">I</div>
            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:bg-gray-200 hover:text-gray-600 transition-colors cursor-pointer">B</div>
          </div>
        </div>
      </div>
    </footer>
  );
}

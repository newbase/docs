import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { AuthProvider } from './contexts/AuthContext';
import { RequireRole, RequireFeature, RequirePremium } from './routes/guards';
import { ROUTES } from './lib/constants/routes';

// Layouts
import { AuthLayout } from './routes/layouts/AuthLayout';
import { AppLayout } from './routes/layouts/AppLayout';
import { AdminLayout } from './routes/layouts/AdminLayout';

// Routes
import StudentRoutes from './routes/StudentRoutes';
import MasterRoutes from './routes/MasterRoutes';
import AdminRoutes from './routes/AdminRoutes';

// Common Pages
import LandingPage from './pages/main/LandingPage';
import { ClassList, ClassDetail, ClassCurriculum, SimulationResults } from './pages/class';
import OpenClassList from './pages/class/OpenClassList';
import OpenClassDetail from './pages/class/OpenClassDetail';
import OrderConfirm from './pages/order/OrderConfirm';
import ClassSession from './pages/class/ClassSession';
import { ScenarioDetail, ScenarioList } from './pages/scenario';
import LicenseDetail from './pages/organization/LicenseDetail';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import SignupComplete from './pages/auth/SignupComplete';
import EmailVerification from './pages/auth/EmailVerification';
import EmailVerificationComplete from './pages/auth/EmailVerificationComplete';
import StudioEdit from './pages/studio/StudioEdit';
import EmailPreview from './pages/dev/EmailPreview';
import PasswordResetRequest from './pages/auth/PasswordResetRequest';
import PasswordResetNew from './pages/auth/PasswordResetNew';
import EmailChange from './pages/auth/EmailChange';
import EmailChangeComplete from './pages/auth/EmailChangeComplete';
import AccountDeletionRequest from './pages/auth/AccountDeletionRequest';
import AccountDeletionConfirm from './pages/auth/AccountDeletionConfirm';
import AccountDeletionComplete from './pages/auth/AccountDeletionComplete';
import Settings from './pages/auth/Settings';
import AddAccount from './pages/auth/AddAccount';

// Error Pages
import { NotFoundPage, ForbiddenPage, UpgradePage } from './routes/pages/ErrorPages';

import './App.css';

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Routes>
          {/* =======================================================
              AuthLayout: 인증 페이지들 (GNB/Footer 없음)
          ======================================================== */}
          <Route element={<AuthLayout />}>
            {/* Landing & Marketing */}
            <Route path={ROUTES.HOME} element={<LandingPage />} />

            {/* Authentication Pages */}
            <Route path={ROUTES.AUTH.LOGIN} element={<Login />} />
            <Route path={ROUTES.AUTH.SIGNUP} element={<Signup />} />
            <Route path={ROUTES.AUTH.SIGNUP_COMPLETE} element={<SignupComplete />} />
            <Route path={ROUTES.AUTH.EMAIL_VERIFICATION} element={<EmailVerification />} />
            <Route path={ROUTES.AUTH.EMAIL_VERIFICATION_COMPLETE} element={<EmailVerificationComplete />} />
            <Route path={ROUTES.AUTH.PASSWORD_RESET} element={<PasswordResetRequest />} />
            <Route path={ROUTES.AUTH.PASSWORD_RESET_NEW} element={<PasswordResetNew />} />
            
            {/* 
              🚨 임시 라우트 (TODO: 제거 필요!)
              
              추가 날짜: 2024-01-21
              추가 이유: 백엔드가 이메일에 보내는 URL이 /change-password 로 되어있음
              정상 경로: /password-reset/new
              
              제거 조건: 백엔드가 이메일 템플릿을 /password-reset/new 로 수정한 후
              관련 문서: .rules/task/BACKEND_PROFILE_REQUESTS.md (4️⃣번 항목)
              
              ⚠️ 백엔드 수정 완료 후 반드시 제거할 것!
            */}
            <Route path="/change-password" element={<PasswordResetNew />} />
            
            <Route path={ROUTES.AUTH.ACCOUNT_DELETION_REQUEST} element={<AccountDeletionRequest />} />
            <Route path={ROUTES.AUTH.ACCOUNT_DELETION_CONFIRM} element={<AccountDeletionConfirm />} />
            <Route path={ROUTES.AUTH.ACCOUNT_DELETION_COMPLETE} element={<AccountDeletionComplete />} />
            <Route path={ROUTES.AUTH.EMAIL_CHANGE_COMPLETE} element={<EmailChangeComplete />} />
            <Route path={ROUTES.AUTH.SETTINGS} element={<Settings />} />
            <Route path={ROUTES.AUTH.ADD_ACCOUNT} element={<AddAccount />} />

            {/* Development Tools - Feature Flag Protected */}
            <Route element={<RequireFeature feature="ENABLE_EMAIL_PREVIEW" />}>
              <Route path={ROUTES.DEV.EMAIL_PREVIEW} element={<EmailPreview />} />
            </Route>
          </Route>

          {/* =======================================================
              Full Screen Pages (No Layout)
              - 독자적인 레이아웃이 필요한 페이지들
          ======================================================== */}
          
          {/* Studio: Full-screen Editor - Feature Flag + Role + Premium Protected */}
          <Route element={<RequireFeature feature="FEATURE_STUDIO_EDITOR" />}>
            <Route element={<RequireRole role="master" requirePremium={true} />}>
              <Route path={ROUTES.STUDIO.EDIT} element={<StudioEdit />} />
            </Route>
          </Route>

          {/* Class Curriculum: Full Screen (Custom Header) */}
          <Route path="/admin/class-management/:classId/curriculum" element={
            <RequireRole role="admin">
              <ClassCurriculum />
            </RequireRole>
          } />
          <Route path="/master/class-management/:classId/curriculum" element={
            <RequireRole role="master">
              <ClassCurriculum />
            </RequireRole>
          } />
          <Route path="/class/:classId/curriculum" element={
            <RequireRole role="guest">
              <ClassCurriculum />
            </RequireRole>
          } />

          {/* Class Session: Full Screen (Custom Header) */}
          <Route path="/admin/class-management/:classId/curriculum/:sessionId" element={
            <RequireRole role="admin">
              <ClassSession />
            </RequireRole>
          } />
          <Route path="/master/class-management/:classId/curriculum/:sessionId" element={
            <RequireRole role="master">
              <ClassSession />
            </RequireRole>
          } />
          <Route path="/class/:classId/curriculum/:sessionId" element={
            <RequireRole role="guest">
              <ClassSession />
            </RequireRole>
          } />

          {/* Class Session Results: Full Screen */}
          <Route path="/admin/class-management/:classId/results/:sessionId" element={
            <RequireRole role="admin">
              <SimulationResults />
            </RequireRole>
          } />
          <Route path="/master/class-management/:classId/results/:sessionId" element={
            <RequireRole role="master">
              <SimulationResults />
            </RequireRole>
          } />
          <Route path="/class/:classId/results/:sessionId" element={
            <RequireRole role="guest">
              <SimulationResults />
            </RequireRole>
          } />

          {/* License Detail: Full Screen */}
          <Route path="/admin/organizations/:orgId/licenses/:licenseId" element={
            <RequireRole role="admin">
              <LicenseDetail />
            </RequireRole>
          } />
          <Route path="/master/organization/licenses/:licenseId" element={
            <RequireRole role="master">
              <LicenseDetail />
            </RequireRole>
          } />

          {/* =======================================================
              AppLayout: 일반 앱 페이지들 (default width)
              - Student, Master 페이지
          ======================================================== */}
          <Route element={<AppLayout />}>
            {/* Student Section */}
            <Route element={<RequireRole role="guest" />}>
              <Route path={`${ROUTES.STUDENT.BASE}/*`} element={<StudentRoutes />} />
            </Route>

            {/* Master Section */}
            <Route element={<RequireRole role="master" />}>
              <Route path={`${ROUTES.MASTER.BASE}/*`} element={<MasterRoutes />} />
            </Route>

            {/* User Settings & Profile */}
            <Route element={<RequireRole role="student" />}>
              <Route path={ROUTES.AUTH.EMAIL_CHANGE} element={<EmailChange />} />
            </Route>

            {/* Common / Legacy Routes */}
            <Route path={ROUTES.COMMON.DASHBOARD} element={<Navigate to={ROUTES.STUDENT.DASHBOARD} replace />} />
            <Route path={ROUTES.COMMON.CLASS_LIST} element={
              <RequireRole role="guest">
                <OpenClassList />
              </RequireRole>
            } />
            <Route path="/open-class/:id" element={
              <RequireRole role="guest">
                <OpenClassDetail />
              </RequireRole>
            } />
            <Route path="/order-confirm" element={
              <RequireRole role="guest">
                <OrderConfirm />
              </RequireRole>
            } />
            <Route path={ROUTES.COMMON.CLASS_DETAIL} element={
              <RequireRole role="guest">
                <ClassDetail />
              </RequireRole>
            } />
            <Route path="/scenario/:id" element={
              <RequireRole role="guest">
                <ScenarioDetail />
              </RequireRole>
            } />
            <Route path={ROUTES.COMMON.SCENARIOS} element={
              <RequireRole role="guest">
                <ScenarioList />
              </RequireRole>
            } />
          </Route>

          {/* =======================================================
              AdminLayout: Admin 페이지들 (wide width)
          ======================================================== */}
          <Route element={<AdminLayout />}>
            <Route element={<RequireRole role="admin" />}>
              <Route path={`${ROUTES.ADMIN.BASE}/*`} element={<AdminRoutes />} />
            </Route>
          </Route>

          {/* =======================================================
              Error Pages
          ======================================================== */}
          <Route path={ROUTES.ERROR.NOT_FOUND} element={<NotFoundPage />} />
          <Route path={ROUTES.ERROR.FORBIDDEN} element={<ForbiddenPage />} />
          <Route path={ROUTES.ERROR.UPGRADE} element={<UpgradePage />} />

          {/* Catch-all: 404 */}
          <Route path="*" element={<Navigate to={ROUTES.ERROR.NOT_FOUND} replace />} />

        </Routes>
      </Router>
    </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;

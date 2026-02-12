/**
 * Student Routes Configuration
 *
 * Student 라우트 설정
 * - 경로와 컴포넌트를 분리하여 관리
 * - Lazy loading 적용으로 초기 번들 크기 감소
 */

import React, { lazy } from 'react';
import { RouteConfig } from './adminRoutes';

// Lazy load Student pages
const StudentDashboard = lazy(() => import('../../pages/dashboard/StudentDashboard'));
const MyClassList = lazy(() => import('../../pages/class/MyClassList'));
const MyClassDetail = lazy(() => import('../../pages/class/MyClassDetail'));
const Cart = lazy(() => import('../../pages/order/Cart'));
const Orders = lazy(() => import('../../pages/order/Orders'));

export const studentRoutes: RouteConfig[] = [
  {
    path: 'dashboard',
    component: StudentDashboard,
  },
  {
    path: 'my-classes',
    component: MyClassList,
  },
  {
    path: 'my-classes/:id',
    component: MyClassDetail,
  },
  {
    path: 'cart',
    component: Cart,
  },
  {
    path: 'orders',
    component: Orders,
  },
];

/**
 * Admin Routes Configuration
 * 
 * Admin 라우트 설정
 * - 경로와 컴포넌트를 분리하여 관리
 * - Lazy loading 적용으로 초기 번들 크기 감소
 */

import React, { lazy } from 'react';

// Lazy load Admin pages
const AdminDashboard = lazy(() => import('../../pages/dashboard/AdminDashboard'));
const OrganizationList = lazy(() => import('../../pages/organization/OrganizationList'));
const OrganizationDetail = lazy(() => import('../../pages/organization/OrganizationDetail'));
const UserManagement = lazy(() => import('../../pages/users/UserManagement'));
const AdminScenarioManagement = lazy(() => import('../../pages/scenario/AdminScenarioManagement'));
const ScenarioDetail = lazy(() => import('../../pages/scenario').then(m => ({ default: m.ScenarioDetail })));
const ClassManagement = lazy(() => import('../../pages/class/ClassManagement'));
const ProductManagement = lazy(() => import('../../pages/product/ProductManagement'));
const ProductCreate = lazy(() => import('../../pages/product/ProductCreate'));
const OpenClassCreatePage = lazy(() => import('../../pages/class/OpenClassCreatePage'));
const OpenClassCreate = lazy(() => import('../../pages/class/OpenClassCreate'));
const OpenClassEdit = lazy(() => import('../../pages/class/OpenClassEdit'));
const OpenClassDetail = lazy(() => import('../../pages/class/OpenClassDetail'));
const ProductEdit = lazy(() => import('../../pages/product/ProductEdit'));
const ProductDetail = lazy(() => import('../../pages/product/ProductDetail'));
const ClassCreateSelect = lazy(() => import('../../pages/class/ClassCreateSelect'));
const MyClassCreatePage = lazy(() => import('../../pages/class/MyClassCreatePage'));
const MyClassCreate = lazy(() => import('../../pages/class/MyClassCreate'));
const MyClassEdit = lazy(() => import('../../pages/class/MyClassEdit'));
const EventManagement = lazy(() => import('../../pages/assets/EventManagement'));
const EventCreate = lazy(() => import('../../pages/assets/EventCreate'));
const EventEdit = lazy(() => import('../../pages/assets/EventEdit'));
const DialogueManagement = lazy(() => import('../../pages/assets/DialogueManagement'));
const ItemManagement = lazy(() => import('../../pages/assets/ItemManagement'));
const SymptomManagement = lazy(() => import('../../pages/assets/SymptomManagement'));
const AssetTaskManagement = lazy(() => import('../../pages/assets/AssetTaskManagement'));
const AssetActionManagement = lazy(() => import('../../pages/assets/AssetActionManagement'));
const OrderManagement = lazy(() => import('../../pages/order/OrderManagement'));
const OrderDetail = lazy(() => import('../../pages/order/OrderDetail'));
const OrderCreate = lazy(() => import('../../pages/order/OrderCreate'));

export interface RouteConfig {
  path: string;
  component: React.LazyExoticComponent<React.ComponentType<any>>;
}

export const adminRoutes: RouteConfig[] = [
  {
    path: 'dashboard',
    component: AdminDashboard,
  },
  {
    path: 'organizations',
    component: OrganizationList,
  },
  {
    path: 'organizations/:id',
    component: OrganizationDetail,
  },
  {
    path: 'users',
    component: UserManagement,
  },
  {
    path: 'scenarios',
    component: AdminScenarioManagement,
  },
  {
    path: 'order-management',
    component: OrderManagement,
  },
  {
    path: 'order-management/:orderId',
    component: OrderDetail,
  },
  {
    path: 'order-management/create',
    component: OrderCreate,
  },
  {
    path: 'order-create',
    component: OrderCreate,
  },
  {
    path: 'products/:id',
    component: OpenClassDetail,
  },
  {
    path: 'scenarios/:id',
    component: ScenarioDetail,
  },
  {
    path: 'class-management',
    component: ClassManagement,
  },
  {
    path: 'product-management',
    component: ProductManagement,
  },
  {
    path: 'product/create',
    component: ProductCreate,
  },
  {
    path: 'open-class/create',
    component: OpenClassCreatePage,
  },
  {
    path: 'open-class/edit/:id',
    component: OpenClassEdit,
  },
  {
    path: 'open-class/:id',
    component: OpenClassDetail,
  },
  {
    path: 'product/detail/:id',
    component: ProductDetail,
  },
  {
    path: 'product/edit/:id',
    component: ProductEdit,
  },
  {
    path: 'class/create/organization',
    component: MyClassCreatePage,
  },
  {
    path: 'class/create',
    component: ClassCreateSelect,
  },
  {
    path: 'class/edit/:id',
    component: MyClassEdit,
  },
  {
    path: 'assets/events',
    component: EventManagement,
  },
  {
    path: 'assets/events/create',
    component: EventCreate,
  },
  {
    path: 'assets/events/:id/edit',
    component: EventEdit,
  },
  {
    path: 'assets/symptoms',
    component: SymptomManagement,
  },
  {
    path: 'assets/tasks',
    component: AssetTaskManagement,
  },
  {
    path: 'assets/actions',
    component: AssetActionManagement,
  },
  {
    path: 'assets/dialogues',
    component: DialogueManagement,
  },
  {
    path: 'assets/items',
    component: ItemManagement,
  },
];

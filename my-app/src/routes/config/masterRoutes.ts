/**
 * Master Routes Configuration
 * 
 * Master 라우트 설정
 * - 경로와 컴포넌트를 분리하여 관리
 * - Lazy loading 적용으로 초기 번들 크기 감소
 */

import { lazy } from 'react';
import { RouteConfig } from './adminRoutes';

// Lazy load Master pages
const MasterDashboard = lazy(() => import('../../pages/dashboard/MasterDashboard'));
const ClassCreateSelect = lazy(() => import('../../pages/class/ClassCreateSelect'));
const MyClassCreatePage = lazy(() => import('../../pages/class/MyClassCreatePage'));
const MyClassCreate = lazy(() => import('../../pages/class/MyClassCreate'));
const MyClassManagement = lazy(() => import('../../pages/class/MyClassManagement'));
const OpenClassDetail = lazy(() => import('../../pages/class/OpenClassDetail'));
const MyClassList = lazy(() => import('../../pages/class/MyClassList'));
const MyClassDetail = lazy(() => import('../../pages/class/MyClassDetail'));
const ProductManagement = lazy(() => import('../../pages/product/ProductManagement'));
const ProductCreate = lazy(() => import('../../pages/product/ProductCreate'));
const OpenClassCreatePage = lazy(() => import('../../pages/class/OpenClassCreatePage'));
const OpenClassCreate = lazy(() => import('../../pages/class/OpenClassCreate'));
const ProductEdit = lazy(() => import('../../pages/product/ProductEdit'));
const MyClassEdit = lazy(() => import('../../pages/class/MyClassEdit'));
const OpenClassList = lazy(() => import('../../pages/class/OpenClassList'));
const MasterScenarioManagement = lazy(() => import('../../pages/scenario/MasterScenarioManagement'));
const ScenarioDetail = lazy(() => import('../../pages/scenario').then(m => ({ default: m.ScenarioDetail })));
const EventManagement = lazy(() => import('../../pages/assets/EventManagement'));
const EventCreate = lazy(() => import('../../pages/assets/EventCreate'));
const EventEdit = lazy(() => import('../../pages/assets/EventEdit'));
const AssetTaskManagement = lazy(() => import('../../pages/assets/AssetTaskManagement'));
const AssetActionManagement = lazy(() => import('../../pages/assets/AssetActionManagement'));
const DialogueManagement = lazy(() => import('../../pages/assets/DialogueManagement'));
const SymptomManagement = lazy(() => import('../../pages/assets/SymptomManagement'));
const MyOrganization = lazy(() => import('../../pages/organization/MyOrganization'));
const Cart = lazy(() => import('../../pages/order/Cart'));
const Orders = lazy(() => import('../../pages/order/Orders'));
const OrderManagement = lazy(() => import('../../pages/order/OrderManagement'));
const OrderDetail = lazy(() => import('../../pages/order/OrderDetail'));

export const masterRoutes: RouteConfig[] = [
  {
    path: 'dashboard',
    component: MasterDashboard,
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
  {
    path: 'order-management',
    component: OrderManagement,
  },
  {
    path: 'order-management/:orderId',
    component: OrderDetail,
  },
  {
    path: 'class-management',
    component: MyClassManagement,
  },
  {
    path: 'class-management/:id',
    component: OpenClassDetail,
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
    path: 'open-class-list',
    component: OpenClassList,
  },
  {
    path: 'open-class/create',
    component: OpenClassCreatePage,
  },
  {
    path: 'open-class/:id',
    component: OpenClassDetail,
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
    path: 'scenarios',
    component: MasterScenarioManagement,
  },
  {
    path: 'scenarios/:id',
    component: ScenarioDetail,
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
    path: 'organization',
    component: MyOrganization,
  },
];

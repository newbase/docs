/**
 * 마이클래스 생성 진입: 위저드 완료 시 폼 표시, 미완료 시 위저드 표시
 */
import React from 'react';
import { useLocation } from 'react-router-dom';
import MyClassCreateWizard from './MyClassCreateWizard';
import MyClassCreate from './MyClassCreate';

export default function MyClassCreatePage(): React.ReactElement {
    const location = useLocation();
    const state = location.state as { selectedProduct?: unknown } | undefined;
    const hasWizardState = !!state?.selectedProduct;

    if (hasWizardState) {
        return <MyClassCreate />;
    }
    return <MyClassCreateWizard />;
}

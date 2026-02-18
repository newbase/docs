/**
 * 오픈클래스 생성 진입: 위저드 완료 시 폼 표시, 미완료 시 위저드 표시
 */
import React from 'react';
import { useLocation } from 'react-router-dom';
import OpenClassCreateWizard from './OpenClassCreateWizard';
import OpenClassCreate from './OpenClassCreate';

export default function OpenClassCreatePage(): React.ReactElement {
    const location = useLocation();
    const state = location.state as { selectedProduct?: unknown; participationType?: string } | undefined;
    const hasWizardState = !!state?.selectedProduct && !!state?.participationType;

    if (hasWizardState) {
        return <OpenClassCreate />;
    }
    return <OpenClassCreateWizard />;
}

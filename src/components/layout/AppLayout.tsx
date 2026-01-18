'use client';

import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { FamilyForm } from '../forms/FamilyForm';
import { SalaryForm } from '../forms/SalaryForm';
import { PensionForm } from '../forms/PensionForm';
import { IncomeForm } from '../forms/IncomeForm';
import { HousingForm } from '../forms/HousingForm';
import { EducationForm } from '../forms/EducationForm';
import { InsuranceForm } from '../forms/InsuranceForm';
import { TaxForm } from '../forms/TaxForm';
import { LivingExpenseForm } from '../forms/LivingExpenseForm';
import { AssetForm } from '../forms/AssetForm';
import { InvestmentForm } from '../forms/InvestmentForm';
import { LifeEventForm } from '../forms/LifeEventForm';
import { SettingsForm } from '../forms/SettingsForm';
import { Modal } from '../ui/Modal';
import styles from './AppLayout.module.css';

interface AppLayoutProps {
    children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
    const [activeModal, setActiveModal] = useState<string | null>(null);

    const handleOpenModal = (type: string, subtype?: string) => {
        setActiveModal(type);
    };

    const handleCloseModal = () => {
        setActiveModal(null);
    };

    const renderModalContent = () => {
        switch (activeModal) {
            case 'family':
                return <FamilyForm />;
            case 'salary':
                return <SalaryForm />;
            case 'pension':
                return <PensionForm />;
            case 'otherIncome':
                return <IncomeForm filterType="other" />;
            case 'housing':
                return <HousingForm />;
            case 'education':
                return <EducationForm />;
            case 'insurance':
                return <InsuranceForm />;
            case 'tax':
                return <TaxForm />;
            case 'living':
                return <LivingExpenseForm />;
            case 'asset':
                return <AssetForm />;
            case 'investment':
                return <InvestmentForm />;
            case 'event':
                return <LifeEventForm />;
            case 'settings':
                return <SettingsForm />;
            default:
                return null;
        }
    };

    const getModalTitle = () => {
        switch (activeModal) {
            case 'family': return '家族構成の設定';
            case 'salary': return '給与収入の設定';
            case 'pension': return '年金・退職金の設定';
            case 'otherIncome': return 'その他収入の設定';
            case 'housing': return '住宅費の設定';
            case 'education': return '教育費の設定';
            case 'insurance': return '保険の設定';
            case 'tax': return '税金・社会保険の設定';
            case 'living': return '生活費・光熱費・通信費の設定';
            case 'asset': return '資産・投資の設定';
            case 'investment': return '積立投資の設定';
            case 'event': return 'ライフイベントの設定';
            case 'settings': return '全体設定';
            default: return '';
        }
    };

    return (
        <div className={styles.layout}>
            <Sidebar onOpenModal={handleOpenModal} />
            <main className={styles.main}>
                {children}
            </main>

            <Modal
                isOpen={!!activeModal}
                onClose={handleCloseModal}
                title={getModalTitle()}
            >
                {renderModalContent()}
            </Modal>
        </div>
    );
};

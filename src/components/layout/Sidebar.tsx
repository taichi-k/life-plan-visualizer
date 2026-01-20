import React, { useState } from 'react';
import {
    Users,
    Wallet,
    CreditCard,
    Landmark,
    CalendarDays,
    Settings,
    LayoutDashboard,
    TrendingUp,
    PiggyBank,
    Home,
    GraduationCap,
    Shield,
    Car,
    ShoppingCart,
    Download,
    Upload,
    Briefcase,
    Receipt,
    HelpCircle
} from 'lucide-react';
import styles from './Sidebar.module.css';
import { useAppStore } from '../../lib/store';
import { HelpModal } from '../ui/HelpModal';

interface SidebarProps {
    onOpenModal: (type: string, subtype?: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onOpenModal }) => {
    const { exportData, importData, resetAll } = useAppStore();
    const [isHelpOpen, setIsHelpOpen] = useState(false);

    const handleExport = () => {
        const data = exportData();
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `life-plan-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleImport = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const content = e.target?.result as string;
                    if (importData(content)) {
                        alert('データをインポートしました');
                    } else {
                        alert('インポートに失敗しました');
                    }
                };
                reader.readAsText(file);
            }
        };
        input.click();
    };

    return (
        <aside className={styles.sidebar} suppressHydrationWarning>
            <div className={styles.logoArea}>
                <div className={styles.logoIcon}>
                    <LayoutDashboard size={24} color="white" />
                </div>
                <span className={styles.logoText}>LifePlan</span>
            </div>

            <nav className={styles.nav} suppressHydrationWarning>
                <div className={styles.sectionLabel}>ダッシュボード</div>
                <button className={`${styles.navItem} ${styles.active}`} onClick={() => { }}>
                    <LayoutDashboard size={20} />
                    <span>概要</span>
                </button>

                <div className={styles.sectionLabel}>基本設定</div>
                <button className={styles.navItem} onClick={() => onOpenModal('settings')}>
                    <Settings size={20} />
                    <span>計算基準・全体設定</span>
                </button>
                <button className={styles.navItem} onClick={() => onOpenModal('family')}>
                    <Users size={20} />
                    <span>家族情報</span>
                </button>

                <div className={styles.sectionLabel}>収入</div>
                <button className={styles.navItem} onClick={() => onOpenModal('salary')}>
                    <Briefcase size={20} />
                    <span>給与収入</span>
                </button>
                <button className={styles.navItem} onClick={() => onOpenModal('pension')}>
                    <PiggyBank size={20} />
                    <span>年金・退職金</span>
                </button>
                <button className={styles.navItem} onClick={() => onOpenModal('otherIncome')}>
                    <Wallet size={20} />
                    <span>その他収入</span>
                </button>

                <div className={styles.sectionLabel}>資産・運用</div>
                <button className={styles.navItem} onClick={() => onOpenModal('asset')}>
                    <Landmark size={20} />
                    <span>現在資産・投資</span>
                </button>
                <button className={styles.navItem} onClick={() => onOpenModal('investment')}>
                    <TrendingUp size={20} />
                    <span>積立投資</span>
                </button>

                <div className={styles.sectionLabel}>支出</div>
                <button className={styles.navItem} onClick={() => onOpenModal('housing')}>
                    <Home size={20} />
                    <span>住宅費</span>
                </button>
                <button className={styles.navItem} onClick={() => onOpenModal('education')}>
                    <GraduationCap size={20} />
                    <span>教育費</span>
                </button>
                <button className={styles.navItem} onClick={() => onOpenModal('insurance')}>
                    <Shield size={20} />
                    <span>保険</span>
                </button>
                <button className={styles.navItem} onClick={() => onOpenModal('tax')}>
                    <Receipt size={20} />
                    <span>税金・社会保険</span>
                </button>
                <button className={styles.navItem} onClick={() => onOpenModal('living')}>
                    <ShoppingCart size={20} />
                    <span>生活費・光熱費・通信費</span>
                </button>
                <button className={styles.navItem} onClick={() => onOpenModal('event')}>
                    <CalendarDays size={20} />
                    <span>ライフイベント</span>
                </button>

                <div className={styles.sectionLabel}>データ管理</div>
                <button className={styles.navItem} onClick={handleExport}>
                    <Download size={20} />
                    <span>エクスポート (JSON)</span>
                </button>
                <button className={styles.navItem} onClick={handleImport}>
                    <Upload size={20} />
                    <span>インポート</span>
                </button>
            </nav>

            <div className={styles.footer}>
                <button className={styles.helpButton} onClick={() => setIsHelpOpen(true)}>
                    <HelpCircle size={20} />
                    <span>使い方・安全性について</span>
                </button>
            </div>

            <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
        </aside>
    );
};

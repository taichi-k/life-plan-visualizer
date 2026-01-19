import React from 'react';
import { useAppStore } from '../../lib/store';
import styles from './Forms.module.css';

export const SettingsForm: React.FC = () => {
    const { settings, setSettings } = useAppStore();

    const handleChange = (key: keyof typeof settings, value: number) => {
        setSettings({ ...settings, [key]: value });
    };

    return (
        <div className={styles.container}>
            <h3 className={styles.formTitle}>シミュレーション設定</h3>

            <div className={styles.formGroup}>
                <label>現在の年 (計算開始年)</label>
                <input
                    type="number"
                    value={settings.calculationStartYear}
                    onChange={(e) => handleChange('calculationStartYear', Number(e.target.value))}
                />
            </div>

            <div className={styles.formGroup}>
                <label>シミュレーション終了年</label>
                <input
                    type="number"
                    value={settings.calculationEndYear}
                    onChange={(e) => handleChange('calculationEndYear', Number(e.target.value))}
                />
            </div>

            <div className={styles.formGroup}>
                <label>インフレ率 (年率 %)</label>
                <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    value={settings.inflationRate ?? 0}
                    onChange={(e) => handleChange('inflationRate', Number(e.target.value))}
                />
                <small className={styles.hint}>
                    生活費・光熱費・通信費・医療費・賃貸料などに適用されます
                </small>
            </div>

            <div className={styles.note}>
                ※ 設定を変更すると、シミュレーション全体が再計算されます。
            </div>
        </div>
    );
};

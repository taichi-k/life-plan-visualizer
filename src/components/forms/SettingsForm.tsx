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
                    生活費・光熱費・通信費・医療費・賃貸料・教育費・保険料・お小遣い・住居維持費・ライフイベントなど全支出に適用されます
                </small>
            </div>

            <div className={styles.formGroup}>
                <label>収入上昇率 (年率 %)</label>
                <input
                    type="number"
                    step="0.1"
                    min="-5"
                    max="10"
                    value={settings.incomeGrowthRate ?? 0}
                    onChange={(e) => handleChange('incomeGrowthRate', Number(e.target.value))}
                />
                <small className={styles.hint}>
                    給与・事業所得などに適用されます（年金・退職金には適用されません）
                </small>
            </div>

            <div className={styles.note}>
                ※ 設定を変更すると、シミュレーション全体が再計算されます。
            </div>
        </div>
    );
};

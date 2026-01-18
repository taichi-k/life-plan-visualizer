
import React, { useState } from 'react';
import { useAppStore } from '../../lib/store';
import { Asset } from '../../lib/types';
import styles from './Forms.module.css';
import { Trash2, Plus } from 'lucide-react';

interface AssetFormProps {
    filterType?: string;
}

export const AssetForm: React.FC<AssetFormProps> = ({ filterType }) => {
    const { assets, addAsset, removeAsset } = useAppStore();

    const [name, setName] = useState('');
    const [type, setType] = useState<Asset['type']>((filterType as Asset['type']) || 'cash');
    const [currentValue, setCurrentValue] = useState(0);
    const [interestRate, setInterestRate] = useState(0.0);

    const filteredAssets = filterType
        ? assets.filter(a => a.type === filterType)
        : assets;

    const handleAdd = () => {
        if (!name) return;
        const asset: Asset = {
            id: crypto.randomUUID(),
            name,
            type,
            currentValue,
            annualInterestRate: interestRate,
            isCompounding: true
        };
        addAsset(asset);
        setName('');
    };

    return (
        <div className={styles.container}>
            <div className={styles.list}>
                {filteredAssets.map((item) => (
                    <div key={item.id} className={styles.listItem}>
                        <div className={styles.itemInfo}>
                            <span className={styles.itemName}>{item.name}</span>
                            <span className={styles.itemDetail}>
                                {item.type} | {item.currentValue.toLocaleString()} | {item.annualInterestRate}%
                            </span>
                        </div>
                        <button className={styles.deleteBtn} onClick={() => removeAsset(item.id)}>
                            <Trash2 size={18} />
                        </button>
                    </div>
                ))}
                {assets.length === 0 && <div className={styles.emptyState}>資産はまだ登録されていません。</div>}
            </div>

            <div className={styles.addForm}>
                <h3 className={styles.formTitle}>資産を追加</h3>
                <div className={styles.formGroup}>
                    <label>名称</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="例: 銀行預金"
                    />
                </div>
                <div className={styles.row}>
                    <div className={styles.formGroup}>
                        <label>種類</label>
                        <select value={type} onChange={(e) => setType(e.target.value as any)}>
                            <option value="cash">現金・預金</option>
                            <option value="stock">株式・投資信託</option>
                            <option value="real-estate">不動産</option>
                            <option value="crypto">暗号資産</option>
                            <option value="other">その他</option>
                        </select>
                    </div>
                    <div className={styles.formGroup}>
                        <label>現在価値 (円)</label>
                        <input
                            type="number"
                            value={currentValue}
                            onChange={(e) => setCurrentValue(Number(e.target.value))}
                        />
                    </div>
                </div>
                <div className={styles.row}>
                    <div className={styles.formGroup}>
                        <label>想定年利 (%)</label>
                        <input
                            type="number"
                            step="0.1"
                            value={interestRate}
                            onChange={(e) => setInterestRate(Number(e.target.value))}
                        />
                    </div>
                </div>
                <button className={styles.addBtn} onClick={handleAdd}>
                    <Plus size={18} />
                    資産を追加
                </button>
            </div>
        </div>
    );
};

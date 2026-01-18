import React, { useState } from 'react';
import { useAppStore } from '../../lib/store';
import { FamilyMember } from '../../lib/types';
import styles from './Forms.module.css';
import { Trash2, Plus, Edit2, Check, X } from 'lucide-react';

const ROLE_LABELS: Record<string, string> = {
    husband: '夫',
    wife: '妻',
    child: '子供',
    other: 'その他'
};

export const FamilyForm: React.FC = () => {
    const { family, addFamilyMember, removeFamilyMember, updateFamilyMember } = useAppStore();
    const [newMemberName, setNewMemberName] = useState('');
    const [newMemberRole, setNewMemberRole] = useState<FamilyMember['role']>('husband');
    const [newMemberBirthYear, setNewMemberBirthYear] = useState(1990);

    // 編集中のメンバーID
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState('');
    const [editRole, setEditRole] = useState<FamilyMember['role']>('husband');
    const [editBirthYear, setEditBirthYear] = useState(1990);

    const handleAdd = () => {
        if (!newMemberName) return;
        const member: FamilyMember = {
            id: crypto.randomUUID(),
            name: newMemberName,
            role: newMemberRole,
            birthYear: newMemberBirthYear,
            birthMonth: 1
        };
        addFamilyMember(member);
        setNewMemberName('');
    };

    const startEdit = (member: FamilyMember) => {
        setEditingId(member.id);
        setEditName(member.name);
        setEditRole(member.role);
        setEditBirthYear(member.birthYear);
    };

    const cancelEdit = () => {
        setEditingId(null);
    };

    const saveEdit = () => {
        if (!editingId || !editName) return;
        updateFamilyMember(editingId, {
            name: editName,
            role: editRole,
            birthYear: editBirthYear
        });
        setEditingId(null);
    };

    return (
        <div className={styles.container}>
            <div className={styles.list}>
                {family.map((member) => (
                    <div key={member.id} className={styles.listItem}>
                        {editingId === member.id ? (
                            <div className={styles.editForm}>
                                <input
                                    type="text"
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    placeholder="名前"
                                    className={styles.editInput}
                                />
                                <select
                                    value={editRole}
                                    onChange={(e) => setEditRole(e.target.value as any)}
                                    className={styles.editSelect}
                                >
                                    <option value="husband">夫</option>
                                    <option value="wife">妻</option>
                                    <option value="child">子供</option>
                                    <option value="other">その他</option>
                                </select>
                                <input
                                    type="number"
                                    value={editBirthYear}
                                    onChange={(e) => setEditBirthYear(Number(e.target.value))}
                                    className={styles.editInput}
                                    style={{ width: '100px' }}
                                />
                                <span style={{ fontSize: '12px', color: '#666' }}>年生まれ</span>
                                <button className={styles.iconBtn} onClick={saveEdit} title="保存">
                                    <Check size={18} color="#00b894" />
                                </button>
                                <button className={styles.iconBtn} onClick={cancelEdit} title="キャンセル">
                                    <X size={18} color="#d63031" />
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className={styles.itemInfo}>
                                    <span className={styles.itemName}>{member.name}</span>
                                    <span className={styles.itemDetail}>
                                        {ROLE_LABELS[member.role]} | {member.birthYear}年生まれ
                                    </span>
                                </div>
                                <div className={styles.itemActions}>
                                    <button className={styles.editBtn} onClick={() => startEdit(member)} title="編集">
                                        <Edit2 size={16} />
                                    </button>
                                    <button className={styles.deleteBtn} onClick={() => removeFamilyMember(member.id)} title="削除">
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                ))}

                {family.length === 0 && (
                    <div className={styles.emptyState}>家族メンバーはまだ登録されていません。</div>
                )}
            </div>

            <div className={styles.addForm}>
                <h3 className={styles.formTitle}>家族メンバーを追加</h3>
                <div className={styles.formGroup}>
                    <label>名前</label>
                    <input
                        type="text"
                        value={newMemberName}
                        onChange={(e) => setNewMemberName(e.target.value)}
                        placeholder="名前"
                    />
                </div>
                <div className={styles.row}>
                    <div className={styles.formGroup}>
                        <label>役割</label>
                        <select
                            value={newMemberRole}
                            onChange={(e) => setNewMemberRole(e.target.value as any)}
                        >
                            <option value="husband">夫</option>
                            <option value="wife">妻</option>
                            <option value="child">子供</option>
                            <option value="other">その他</option>
                        </select>
                    </div>
                    <div className={styles.formGroup}>
                        <label>生まれ年</label>
                        <input
                            type="number"
                            value={newMemberBirthYear}
                            onChange={(e) => setNewMemberBirthYear(Number(e.target.value))}
                        />
                    </div>
                </div>
                <button className={styles.addBtn} onClick={handleAdd}>
                    <Plus size={18} />
                    メンバーを追加
                </button>
            </div>
        </div>
    );
};

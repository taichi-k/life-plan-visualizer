'use client';

import React from 'react';
import { Modal } from './Modal';
import { 
    Shield, 
    HardDrive, 
    Download, 
    Upload, 
    AlertTriangle,
    CheckCircle,
    Info,
    Calculator
} from 'lucide-react';
import styles from './HelpModal.module.css';

interface HelpModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="ライフプラン シミュレーターについて">
            <div className={styles.helpContent}>
                {/* アプリ概要 */}
                <section className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <Calculator size={24} className={styles.iconBlue} />
                        <h3>このアプリでできること</h3>
                    </div>
                    <p className={styles.description}>
                        ライフプラン シミュレーターは、あなたの将来の収支と資産推移を可視化するツールです。
                    </p>
                    <ul className={styles.featureList}>
                        <li>家族構成・収入・支出・資産を入力</li>
                        <li>住宅購入、教育費、退職などのライフイベントを設定</li>
                        <li>将来の資産推移をグラフと表で確認</li>
                        <li>様々なシナリオをシミュレーション</li>
                    </ul>
                </section>

                {/* セキュリティ */}
                <section className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <Shield size={24} className={styles.iconGreen} />
                        <h3>安全性について</h3>
                    </div>
                    <div className={styles.safetyBox}>
                        <div className={styles.safetyItem}>
                            <CheckCircle size={18} className={styles.iconGreen} />
                            <span>サーバーへのデータ送信なし</span>
                        </div>
                        <div className={styles.safetyItem}>
                            <CheckCircle size={18} className={styles.iconGreen} />
                            <span>ユーザー登録・ログイン不要</span>
                        </div>
                        <div className={styles.safetyItem}>
                            <CheckCircle size={18} className={styles.iconGreen} />
                            <span>個人情報の収集なし</span>
                        </div>
                        <div className={styles.safetyItem}>
                            <CheckCircle size={18} className={styles.iconGreen} />
                            <span>外部サービスとの連携なし</span>
                        </div>
                    </div>
                    <p className={styles.note}>
                        入力した情報は、すべてあなたのブラウザ内にのみ保存されます。
                        運営者を含め、第三者がデータにアクセスすることはできません。
                    </p>
                </section>

                {/* データ保存 */}
                <section className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <HardDrive size={24} className={styles.iconBlue} />
                        <h3>データの保存について</h3>
                    </div>
                    <div className={styles.storageInfo}>
                        <div className={styles.infoCard}>
                            <Info size={18} className={styles.iconBlue} />
                            <div>
                                <strong>保存場所</strong>
                                <p>ブラウザのローカルストレージ</p>
                            </div>
                        </div>
                        <div className={styles.infoCard}>
                            <Info size={18} className={styles.iconBlue} />
                            <div>
                                <strong>保存期間</strong>
                                <p>ブラウザのデータを削除するまで永続</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 注意事項 */}
                <section className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <AlertTriangle size={24} className={styles.iconOrange} />
                        <h3>データが消えるケース</h3>
                    </div>
                    <ul className={styles.warningList}>
                        <li>ブラウザの履歴・キャッシュを削除した場合</li>
                        <li>プライベートブラウジング（シークレットモード）を使用した場合</li>
                        <li>別のブラウザやデバイスで開いた場合</li>
                        <li>ブラウザを再インストールした場合</li>
                    </ul>
                </section>

                {/* バックアップ */}
                <section className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <Download size={24} className={styles.iconBlue} />
                        <h3>バックアップと復元</h3>
                    </div>
                    <p className={styles.description}>
                        大切なデータを守るため、定期的なバックアップをおすすめします。
                    </p>
                    <div className={styles.backupSteps}>
                        <div className={styles.step}>
                            <div className={styles.stepIcon}>
                                <Download size={20} />
                            </div>
                            <div className={styles.stepContent}>
                                <strong>バックアップ（エクスポート）</strong>
                                <p>サイドメニューの「エクスポート (JSON)」をクリックすると、データがファイルとしてダウンロードされます。</p>
                            </div>
                        </div>
                        <div className={styles.step}>
                            <div className={styles.stepIcon}>
                                <Upload size={20} />
                            </div>
                            <div className={styles.stepContent}>
                                <strong>復元（インポート）</strong>
                                <p>サイドメニューの「インポート」から、保存したJSONファイルを読み込むことで、データを復元できます。</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* フッター */}
                <div className={styles.footer}>
                    <p>ご不明な点がありましたら、お気軽にお問い合わせください。</p>
                </div>
            </div>
        </Modal>
    );
};

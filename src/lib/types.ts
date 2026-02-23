
export type Periodicity = 'monthly' | 'yearly' | 'one-time';
// Keep alias for backward compatibility
export type Periodibility = Periodicity;

// ============================================================
// 家族情報
// ============================================================
export interface FamilyMember {
  id: string;
  name: string;
  role: 'husband' | 'wife' | 'child' | 'other';
  birthYear: number;
  birthMonth: number;
}

// ============================================================
// 収入関連
// ============================================================
export type IncomeType = 'salary' | 'bonus' | 'business' | 'pension' | 'retirement' | 'investment' | 'other';

export interface SalaryIncome {
  id: string;
  type: 'salary';
  name: string;
  ownerId: string;
  // 年齢別収入設定（オートコンプリートモード対応）
  useAutoComplete: boolean; // ONの場合、入力された年齢間を線形補間
  ageCurve: { age: number; annualAmount: number }[];
  startAge?: number;
  endAge?: number; // 退職年齢など
  // ボーナス設定
  includesBonus: boolean;
  bonusMonths?: number; // ボーナスが何ヶ月分か
  // 税・社会保険料の自動計算
  autoCalculateTax?: boolean; // ONの場合、所得税・社会保険料を自動計算して費用計上
}

export interface PensionIncome {
  id: string;
  type: 'pension';
  name: string;
  ownerId: string;
  // 年金設定（自動計算用）
  pensionType: 'national' | 'employee' | 'corporate' | 'custom';
  // 国民年金
  nationalPensionYears?: number; // 加入年数（最大40年）
  // 厚生年金
  employeePensionYears?: number; // 加入年数
  averageMonthlyIncome?: number; // 平均標準報酬月額
  // 企業年金
  hasCorporatePension?: boolean;
  corporatePensionAmount?: number; // 年額
  // 受給開始年齢
  startAge: number;
  // カスタム入力の場合
  customAmount?: number;
}

export interface RetirementIncome {
  id: string;
  type: 'retirement';
  name: string;
  ownerId: string;
  amount: number;
  receiveYear: number;
  // 退職所得税計算用（勤続年数）
  yearsOfService?: number; // 勤続年数（指定がない場合は推定）
}

export interface InvestmentIncome {
  id: string;
  type: 'investment';
  name: string;
  // 配当・利子収入として計上
  annualAmount: number;
  startYear?: number;
  endYear?: number;
}

export interface OtherIncome {
  id: string;
  type: 'business' | 'other';
  name: string;
  ownerId?: string;
  amount: number;
  periodicity: Periodicity;
  startYear?: number;
  endYear?: number;
}

export type Income = SalaryIncome | PensionIncome | RetirementIncome | InvestmentIncome | OtherIncome;

// ============================================================
// 支出関連
// ============================================================
export type ExpenseCategory = 
  | 'housing' | 'tax' | 'education' | 'living' | 'utility' 
  | 'communication' | 'medical' | 'insurance' | 'car' 
  | 'allowance' | 'event' | 'other';

// 変動金利の期間・利率設定
export interface VariableRatePeriod {
  startYear: number; // 開始年
  endYear: number; // 終了年
  interestRate: number; // 金利（%）
}

// 住宅費詳細設定
export interface HousingExpense {
  id: string;
  category: 'housing';
  name: string;
  housingType: 'rent' | 'owned-loan' | 'owned-paid';
  // 賃貸の場合
  monthlyRent?: number;
  rentStartYear?: number;
  rentEndYear?: number;
  // 持ち家（ローン）の場合
  loanAmount?: number; // 借入額
  loanInterestRate?: number; // 金利（%）- 固定金利の場合
  loanYears?: number; // 返済期間（年）
  loanStartYear?: number; // ローン開始年
  // 変動金利の場合
  isVariableRate?: boolean; // 変動金利かどうか
  variableRatePeriods?: VariableRatePeriod[]; // 変動金利の期間・利率設定
  // 持ち家共通
  propertyTaxYearly?: number; // 固定資産税（年額）
  // マンションの場合
  isApartment?: boolean;
  managementFeeMonthly?: number; // 管理費（月額）
  repairReserveFundMonthly?: number; // 修繕積立金（月額）
  // 修繕費
  majorRepairCost?: number; // 大規模修繕費用
  majorRepairInterval?: number; // 修繕間隔（年）
  majorRepairStartYear?: number; // 修繕開始年
  // 火災保険
  fireInsuranceYearly?: number;
}

// 教育費詳細設定
export interface EducationExpense {
  id: string;
  category: 'education';
  name: string;
  childId: string; // 対象の子供のID
  // 各教育段階の設定
  kindergarten: { type: 'public' | 'private' | 'none'; startAge: number };
  elementary: { type: 'public' | 'private'; };
  juniorHigh: { type: 'public' | 'private'; };
  highSchool: { type: 'public' | 'private'; };
  university: { type: 'national' | 'public' | 'private-arts' | 'private-science' | 'none'; };
  // 習い事・塾代（月額）
  extracurricularMonthly?: number;
  extracurricularStartAge?: number;
  extracurricularEndAge?: number;
}

// 税金・社会保険
export interface TaxExpense {
  id: string;
  category: 'tax';
  name: string;
  // 自動計算を使用するか
  useAutoCalculation: boolean;
  // カスタム入力の場合
  customAmount?: number;
  customPeriodicity?: Periodicity;
  startYear?: number;
  endYear?: number;
}

// 保険
export interface InsuranceExpense {
  id: string;
  category: 'insurance';
  name: string;
  insuranceType: 'life' | 'medical' | 'cancer' | 'income' | 'other';
  monthlyPremium: number;
  startYear?: number;
  endYear?: number;
  // 掛け捨てか積立か
  isTermLife?: boolean;
}

// 自動車関連
export interface CarExpense {
  id: string;
  category: 'car';
  name: string;
  hasCar: boolean;
  // 車購入
  purchasePrice?: number;
  purchaseYear?: number;
  replacementInterval?: number; // 買い替え間隔（年）
  // 維持費
  taxYearly?: number; // 自動車税
  insuranceYearly?: number; // 自動車保険
  maintenanceYearly?: number; // 車検・整備費（年平均）
  gasMonthly?: number; // ガソリン代（月額）
  parkingMonthly?: number; // 駐車場代（月額）
  // 期間
  startYear?: number;
  endYear?: number;
}

// お小遣い
export interface AllowanceExpense {
  id: string;
  category: 'allowance';
  name: string;
  ownerId: string; // 夫か妻か
  monthlyAmount: number;
  startYear?: number;
  endYear?: number;
}

// 生活費
export interface LivingExpense {
  id: string;
  category: 'living';
  name: string;
  // 詳細カテゴリ
  subcategory: 'food' | 'daily' | 'entertainment' | 'clothing' | 'other';
  monthlyAmount: number;
  startYear?: number;
  endYear?: number;
}

// 光熱費
export interface UtilityExpense {
  id: string;
  category: 'utility';
  name: string;
  electricityMonthly?: number;
  gasMonthly?: number;
  waterMonthly?: number;
  startYear?: number;
  endYear?: number;
}

// 通信費
export interface CommunicationExpense {
  id: string;
  category: 'communication';
  name: string;
  // 家のインターネット
  internetMonthly?: number;
  // 携帯電話（世帯合計）
  mobileMonthly?: number;
  // サブスク等
  subscriptionsMonthly?: number;
  startYear?: number;
  endYear?: number;
}

// 医療費
export interface MedicalExpense {
  id: string;
  category: 'medical';
  name: string;
  monthlyAmount: number;
  startYear?: number;
  endYear?: number;
}

// 汎用支出
export interface GenericExpense {
  id: string;
  category: ExpenseCategory;
  name: string;
  amount: number;
  periodicity: Periodicity;
  targetMemberId?: string;
  startYear?: number;
  endYear?: number;
  intervalYears?: number;
}

export type Expense = 
  | HousingExpense 
  | EducationExpense 
  | TaxExpense 
  | InsuranceExpense 
  | CarExpense 
  | AllowanceExpense 
  | LivingExpense 
  | UtilityExpense 
  | CommunicationExpense 
  | MedicalExpense 
  | GenericExpense;

// ============================================================
// 資産
// ============================================================
export type AssetType = 'cash' | 'deposit' | 'stock' | 'mutual-fund' | 'bond' | 'real-estate' | 'crypto' | 'other';

export interface Asset {
  id: string;
  name: string;
  type: AssetType;
  currentValue: number;
  annualInterestRate: number; // パーセント（例: 5.0 = 5%）
  isCompounding: boolean;
  // 積立投資の場合
  isAccumulating?: boolean;
  monthlyContribution?: number; // 毎月の積立額
  accumulationStartYear?: number;
  accumulationEndYear?: number;
}

// ============================================================
// ライフイベント
// ============================================================
export type LifeEventType = 
  | 'travel-domestic' | 'travel-overseas' | 'car-purchase' 
  | 'home-purchase' | 'wedding-support' | 'celebration' 
  | 'home-renovation' | 'other';

export interface LifeEvent {
  id: string;
  name: string;
  eventType: LifeEventType;
  year: number;
  cost: number;
  isRecurring: boolean;
  recurrenceInterval?: number;
  endYear?: number;
  // 車購入イベント専用の維持費設定
  carMaintenance?: {
    taxYearly: number;        // 自動車税（年額）
    insuranceYearly: number;  // 自動車保険（年額）
    maintenanceYearly: number; // 車検・整備費（年平均）
    gasMonthly: number;       // ガソリン代（月額）
    parkingMonthly: number;   // 駐車場代（月額）
  };
}

// ============================================================
// シミュレーション設定
// ============================================================
export interface SimulationSettings {
  currentYear: number;
  calculationStartYear: number;
  calculationEndYear: number;
  // 追加設定
  inflationRate?: number; // インフレ率（%）
  incomeGrowthRate?: number; // 収入上昇率（%）
}

// ============================================================
// 年間結果
// ============================================================
export interface FamilyAges {
  [memberId: string]: { name: string; age: number; role: string };
}

export interface YearlyResult {
  year: number;
  ageHusband?: number;
  ageWife?: number;
  familyAges: FamilyAges;
  childrenEducationStages: { [childId: string]: string }; // 子供の教育段階
  incomes: Record<string, number>;
  incomeDetails: { name: string; category: string; amount: number }[];
  incomeBreakdown?: {
    salary?: number;
    pension?: number;
    other?: number;
  };
  expenses: Record<string, number>;
  expenseDetails: { name: string; category: string; amount: number }[];
  expenseBreakdown?: {
    housing?: number;
    tax?: number;
    education?: number;
    living?: number;
    utility?: number;
    communication?: number;
    medical?: number;
    insurance?: number;
    car?: number;
    allowance?: number;
    event?: number;
    other?: number;
  };
  totalIncome: number;
  totalExpense: number;
  cashFlow: number;
  assets: Record<string, number>;
  totalAssets: number;
  events: string[];
  // 資産変動の内訳（年間収支と資産残高の差分を説明するため）
  assetChangeBreakdown?: {
    interestGain: number;      // 利息・運用益
    accumulationContribution: number;  // 積立投資
    cashFlowImpact: number;    // キャッシュフローによる変動
    totalChange: number;       // 資産の総変動額
  };
}

// ============================================================
// 教育費の平均値（文部科学省「子供の学習費調査」令和5年度版）
// ============================================================
export const EDUCATION_COSTS = {
  kindergarten: {
    public: 175000, // 年間（3年間）- 令和5年度
    private: 330000,
  },
  elementary: {
    public: 353000, // 年間（6年間）- 学校教育費+学校給食費+学校外活動費
    private: 1880000,
  },
  juniorHigh: {
    public: 539000, // 年間（3年間）
    private: 1440000,
  },
  highSchool: {
    public: 513000, // 年間（3年間）
    private: 1060000,
  },
  university: {
    // 令和5年度 国立大学等の授業料その他の費用
    // 授業料（年額）+ 入学金を4年で按分 + 仕送り・生活費等（250万/4年 = 625,000/年）
    national: 535800 + Math.round(282000 / 4) + Math.round(2500000 / 4), // 国立：授業料535,800 + 入学金282,000/4 + 生活費等 ≒ 1,231,300
    public: 536382 + Math.round(391305 / 4) + Math.round(2500000 / 4), // 公立：授業料536,382 + 入学金391,305/4 + 生活費等 ≒ 1,259,208
    'private-arts': 815069 + Math.round(225651 / 4) + Math.round(2500000 / 4), // 私立文系：授業料815,069 + 入学金225,651/4 + 生活費等 ≒ 1,496,481
    'private-science': 1136074 + Math.round(251029 / 4) + Math.round(2500000 / 4), // 私立理系：授業料1,136,074 + 入学金251,029/4 + 生活費等 ≒ 1,823,831
  },
} as const;

// 年金計算用の定数（令和6年度）
export const PENSION_CONSTANTS = {
  nationalPensionFullAmount: 816000, // 満額（年額）令和6年度: 68,000円×12ヶ月
  nationalPensionMaxYears: 40,
  employeePensionMultiplier: 0.005481, // 報酬比例部分の係数（2003年4月以降）
  // 社会保険料関連
  pensionStandardRemunerationMax: 650000, // 厚生年金標準報酬月額上限
  healthInsuranceRate: 0.10, // 健康保険料率（協会けんぽ全国平均）
  pensionInsuranceRate: 0.183, // 厚生年金保険料率
  employmentInsuranceRate: 0.006, // 雇用保険料率（一般事業）
  nursingCareInsuranceRate: 0.016, // 介護保険料率（40-64歳）
} as const;

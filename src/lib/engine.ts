import {
    FamilyMember,
    Income,
    SalaryIncome,
    PensionIncome,
    RetirementIncome,
    InvestmentIncome,
    OtherIncome,
    Expense,
    HousingExpense,
    EducationExpense,
    TaxExpense,
    InsuranceExpense,
    CarExpense,
    AllowanceExpense,
    LivingExpense,
    UtilityExpense,
    CommunicationExpense,
    MedicalExpense,
    GenericExpense,
    Asset,
    LifeEvent,
    SimulationSettings,
    YearlyResult,
    FamilyAges,
    EDUCATION_COSTS,
    PENSION_CONSTANTS,
    VariableRatePeriod
} from './types';

// 退職所得税を計算（退職所得控除を適用）
function calculateRetirementTax(retirementAmount: number, yearsOfService: number, year: number): number {
    // 退職所得控除を計算
    let retirementDeduction = 0;
    if (yearsOfService <= 20) {
        retirementDeduction = 400000 * yearsOfService;
    } else {
        retirementDeduction = 8000000 + 700000 * (yearsOfService - 20);
    }
    // 最低80万円
    retirementDeduction = Math.max(retirementDeduction, 800000);
    
    // 退職所得（1/2課税）
    // ただし、勤続5年以下の役員等は1/2課税なし（簡易化のため一般的なケースで計算）
    const retirementIncome = Math.max(0, (retirementAmount - retirementDeduction) / 2);
    
    // 所得税（累進課税）
    let incomeTax = 0;
    if (retirementIncome <= 1950000) {
        incomeTax = retirementIncome * 0.05;
    } else if (retirementIncome <= 3300000) {
        incomeTax = retirementIncome * 0.10 - 97500;
    } else if (retirementIncome <= 6950000) {
        incomeTax = retirementIncome * 0.20 - 427500;
    } else if (retirementIncome <= 9000000) {
        incomeTax = retirementIncome * 0.23 - 636000;
    } else if (retirementIncome <= 18000000) {
        incomeTax = retirementIncome * 0.33 - 1536000;
    } else if (retirementIncome <= 40000000) {
        incomeTax = retirementIncome * 0.40 - 2796000;
    } else {
        incomeTax = retirementIncome * 0.45 - 4796000;
    }
    
    // 復興特別所得税（2.1%）- 2037年まで
    if (year <= 2037) {
        incomeTax = incomeTax * 1.021;
    }
    
    // 住民税（10%、退職所得に対して）
    const residenceTax = retirementIncome * 0.10;
    
    return Math.floor(Math.max(0, incomeTax + residenceTax));
}

// 勤続年数を推定（給与情報から）
function estimateYearsOfService(incomes: Income[], ownerId: string): number {
    // 同じオーナーの給与所得を探す
    const salaryIncome = incomes.find(
        (i): i is SalaryIncome => i.type === 'salary' && (i as SalaryIncome).ownerId === ownerId
    );
    
    if (salaryIncome && salaryIncome.startAge && salaryIncome.endAge) {
        return salaryIncome.endAge - salaryIncome.startAge;
    }
    
    // デフォルト: 大卒22歳〜60歳定年で38年と仮定
    return 38;
}

// 教育段階を取得
function getEducationStage(age: number): string {
    if (age < 3) return 'preschool';
    if (age < 6) return 'kindergarten';
    if (age < 12) return 'elementary';
    if (age < 15) return 'middleSchool';
    if (age < 18) return 'highSchool';
    if (age < 22) return 'university';
    return 'graduated';
}

// 年齢別給与を補間計算
function interpolateSalary(ageCurve: { age: number; annualAmount: number }[], age: number): number {
    if (ageCurve.length === 0) return 0;
    if (ageCurve.length === 1) return ageCurve[0].annualAmount;

    // ソート
    const sorted = [...ageCurve].sort((a, b) => a.age - b.age);

    // 範囲外
    if (age <= sorted[0].age) return sorted[0].annualAmount;
    if (age >= sorted[sorted.length - 1].age) return sorted[sorted.length - 1].annualAmount;

    // 線形補間
    for (let i = 0; i < sorted.length - 1; i++) {
        if (age >= sorted[i].age && age < sorted[i + 1].age) {
            const ratio = (age - sorted[i].age) / (sorted[i + 1].age - sorted[i].age);
            return sorted[i].annualAmount + (sorted[i + 1].annualAmount - sorted[i].annualAmount) * ratio;
        }
    }
    return sorted[sorted.length - 1].annualAmount;
}

// 年金額を計算
function calculatePension(pension: PensionIncome, age: number): number {
    if (age < pension.startAge) return 0;

    if (pension.pensionType === 'custom' && pension.customAmount) {
        return pension.customAmount;
    }

    let publicPensionTotal = 0;

    // 国民年金（老齢基礎年金）
    if (pension.nationalPensionYears) {
        const ratio = Math.min(pension.nationalPensionYears, PENSION_CONSTANTS.nationalPensionMaxYears) 
                      / PENSION_CONSTANTS.nationalPensionMaxYears;
        publicPensionTotal += PENSION_CONSTANTS.nationalPensionFullAmount * ratio;
    }

    // 厚生年金（報酬比例部分）
    if (pension.employeePensionYears && pension.averageMonthlyIncome) {
        publicPensionTotal += pension.averageMonthlyIncome * PENSION_CONSTANTS.employeePensionMultiplier 
                 * pension.employeePensionYears * 12;
    }

    // 繰上げ・繰下げ受給の調整（公的年金のみ）
    // 繰上げ: 65歳より前 → 1ヶ月あたり0.4%減額（2022年4月以降、最大60ヶ月=24%減）
    // 繰下げ: 65歳より後 → 1ヶ月あたり0.7%増額（最大75歳=120ヶ月=84%増）
    const standardPensionAge = 65;
    if (pension.startAge !== standardPensionAge && publicPensionTotal > 0) {
        const monthsDiff = (pension.startAge - standardPensionAge) * 12;
        if (monthsDiff < 0) {
            // 繰上げ受給
            const reductionRate = Math.min(Math.abs(monthsDiff) * 0.004, 0.24);
            publicPensionTotal *= (1 - reductionRate);
        } else {
            // 繰下げ受給
            const cappedMonths = Math.min(monthsDiff, 120);
            publicPensionTotal *= (1 + cappedMonths * 0.007);
        }
    }

    let total = publicPensionTotal;

    // 企業年金
    if (pension.hasCorporatePension && pension.corporatePensionAmount) {
        total += pension.corporatePensionAmount;
    }

    return total;
}

// 年金所得税を計算（公的年金等控除を適用）
function calculatePensionTax(annualPension: number, age: number, year: number): number {
    // 公的年金等控除を計算（65歳以上と未満で異なる）
    let pensionDeduction = 0;
    
    if (age >= 65) {
        // 65歳以上
        if (annualPension <= 3300000) {
            pensionDeduction = 1100000;
        } else if (annualPension <= 4100000) {
            pensionDeduction = annualPension * 0.25 + 275000;
        } else if (annualPension <= 7700000) {
            pensionDeduction = annualPension * 0.15 + 685000;
        } else if (annualPension <= 10000000) {
            pensionDeduction = annualPension * 0.05 + 1455000;
        } else {
            pensionDeduction = 1955000;
        }
    } else {
        // 65歳未満
        if (annualPension <= 1300000) {
            pensionDeduction = 600000;
        } else if (annualPension <= 4100000) {
            pensionDeduction = annualPension * 0.25 + 275000;
        } else if (annualPension <= 7700000) {
            pensionDeduction = annualPension * 0.15 + 685000;
        } else if (annualPension <= 10000000) {
            pensionDeduction = annualPension * 0.05 + 1455000;
        } else {
            pensionDeduction = 1955000;
        }
    }
    
    // 最低控除額（65歳以上は110万円、65歳未満で130万円以下は60万円）
    // 注：65歳未満で収入が130万円超の場合は計算式の結果がそのまま適用される
    if (age >= 65) {
        pensionDeduction = Math.max(pensionDeduction, 1100000);
    } else if (annualPension <= 1300000) {
        pensionDeduction = Math.max(pensionDeduction, 600000);
    }
    
    // 年金所得
    const pensionIncome = Math.max(0, annualPension - pensionDeduction);
    
    // 課税所得（基礎控除48万円を適用）
    const taxableIncome = Math.max(0, pensionIncome - 480000);
    
    // 累進課税
    let tax = 0;
    if (taxableIncome <= 1950000) {
        tax = taxableIncome * 0.05;
    } else if (taxableIncome <= 3300000) {
        tax = taxableIncome * 0.10 - 97500;
    } else if (taxableIncome <= 6950000) {
        tax = taxableIncome * 0.20 - 427500;
    } else if (taxableIncome <= 9000000) {
        tax = taxableIncome * 0.23 - 636000;
    } else if (taxableIncome <= 18000000) {
        tax = taxableIncome * 0.33 - 1536000;
    } else if (taxableIncome <= 40000000) {
        tax = taxableIncome * 0.40 - 2796000;
    } else {
        tax = taxableIncome * 0.45 - 4796000;
    }
    
    // 復興特別所得税（2.1%）- 2037年まで
    if (year <= 2037) {
        tax = tax * 1.021;
    }
    
    // 住民税（約10%）
    const residenceTax = taxableIncome * 0.10;
    
    // 後期高齢者医療保険料（75歳以上の場合）
    // 65歳以上は介護保険料も別途発生
    let elderlyInsurance = 0;
    if (age >= 75) {
        // 後期高齢者医療保険（年金から特別徴収）
        // 令和6年度全国平均：所得割約9.87%、均等割約4.7万円
        // 年金所得のみの場合、基礎控除後の所得に対して計算
        const taxableIncomeForInsurance = Math.max(0, pensionIncome - 430000); // 基礎控除43万円
        elderlyInsurance = Math.max(0, taxableIncomeForInsurance * 0.0987) + 47000;
        // 年間上限額（令和6年度：80万円）
        elderlyInsurance = Math.min(elderlyInsurance, 800000);
    } else if (age >= 65) {
        // 介護保険料（第1号被保険者）
        // 所得段階制（標準的な市区町村で年間約7.5万円〜9万円程度）
        // 年金所得に応じた概算（基準額約7万円として所得による調整）
        const baseInsurance = 70000;
        if (pensionIncome <= 800000) {
            elderlyInsurance = baseInsurance * 0.5; // 低所得者軽減
        } else if (pensionIncome <= 1200000) {
            elderlyInsurance = baseInsurance * 0.75;
        } else if (pensionIncome <= 2100000) {
            elderlyInsurance = baseInsurance;
        } else {
            elderlyInsurance = baseInsurance * 1.25;
        }
    }
    
    return Math.floor(Math.max(0, tax + residenceTax + elderlyInsurance));
}

// 住宅ローン年間返済額を計算（元利均等返済）
function calculateMortgagePayment(
    loanAmount: number,
    interestRate: number,
    loanYears: number
): number {
    if (interestRate === 0) {
        return loanAmount / loanYears;
    }
    const monthlyRate = interestRate / 100 / 12;
    const totalMonths = loanYears * 12;
    const monthlyPayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) 
                           / (Math.pow(1 + monthlyRate, totalMonths) - 1);
    return monthlyPayment * 12;
}

// 所得税を計算（累進課税）
function calculateIncomeTax(annualIncome: number, year: number): number {
    // 給与所得控除を適用
    let salaryDeduction = 0;
    if (annualIncome <= 1625000) {
        salaryDeduction = 550000;
    } else if (annualIncome <= 1800000) {
        salaryDeduction = annualIncome * 0.4 - 100000;
    } else if (annualIncome <= 3600000) {
        salaryDeduction = annualIncome * 0.3 + 80000;
    } else if (annualIncome <= 6600000) {
        salaryDeduction = annualIncome * 0.2 + 440000;
    } else if (annualIncome <= 8500000) {
        salaryDeduction = annualIncome * 0.1 + 1100000;
    } else {
        salaryDeduction = 1950000; // 上限
    }
    salaryDeduction = Math.max(salaryDeduction, 550000); // 最低55万円

    // 課税所得
    const taxableIncome = Math.max(0, annualIncome - salaryDeduction - 480000); // 基礎控除48万円

    // 累進課税
    let tax = 0;
    if (taxableIncome <= 1950000) {
        tax = taxableIncome * 0.05;
    } else if (taxableIncome <= 3300000) {
        tax = taxableIncome * 0.10 - 97500;
    } else if (taxableIncome <= 6950000) {
        tax = taxableIncome * 0.20 - 427500;
    } else if (taxableIncome <= 9000000) {
        tax = taxableIncome * 0.23 - 636000;
    } else if (taxableIncome <= 18000000) {
        tax = taxableIncome * 0.33 - 1536000;
    } else if (taxableIncome <= 40000000) {
        tax = taxableIncome * 0.40 - 2796000;
    } else {
        tax = taxableIncome * 0.45 - 4796000;
    }

    // 復興特別所得税（2.1%）- 2037年まで
    if (year <= 2037) {
        tax = tax * 1.021;
    }

    // 住民税（約10%）
    const residenceTax = taxableIncome * 0.10;

    return Math.floor(tax + residenceTax);
}

// 社会保険料を計算（年齢考慮版）
function calculateSocialInsurance(annualIncome: number, age?: number): number {
    // 標準報酬月額ベースで概算
    const monthlyIncome = annualIncome / 12;
    
    // 健康保険料（約10%、労使折半で本人負担5%）
    // 健康保険の標準報酬月額上限は139万円
    const healthBase = Math.min(monthlyIncome, 1390000);
    const healthInsurance = healthBase * (PENSION_CONSTANTS.healthInsuranceRate / 2);
    
    // 介護保険料（40歳以上65歳未満の場合のみ）
    let nursingCareInsurance = 0;
    if (age !== undefined && age >= 40 && age < 65) {
        nursingCareInsurance = healthBase * (PENSION_CONSTANTS.nursingCareInsuranceRate / 2);
    }
    
    // 厚生年金保険料（18.3%、労使折半で本人負担9.15%）
    // 標準報酬月額上限65万円、70歳未満のみ
    let pensionInsurance = 0;
    if (age === undefined || age < 70) {
        const pensionBase = Math.min(monthlyIncome, PENSION_CONSTANTS.pensionStandardRemunerationMax);
        pensionInsurance = pensionBase * (PENSION_CONSTANTS.pensionInsuranceRate / 2);
    }
    
    // 雇用保険料（約0.6%）- 65歳以上も対象
    const employmentInsurance = monthlyIncome * PENSION_CONSTANTS.employmentInsuranceRate;
    
    // 年間の社会保険料
    return Math.floor((healthInsurance + nursingCareInsurance + pensionInsurance + employmentInsurance) * 12);
}

// 変動金利ローンの残債を計算
function calculateRemainingLoan(
    originalLoan: number,
    variableRatePeriods: VariableRatePeriod[],
    defaultRate: number,
    loanStartYear: number,
    loanYears: number,
    currentYear: number
): number {
    let remainingLoan = originalLoan;
    const loanEndYear = loanStartYear + loanYears;
    
    for (let y = loanStartYear; y < currentYear && y < loanEndYear; y++) {
        // その年の金利を取得
        const period = variableRatePeriods.find(p => y >= p.startYear && y <= p.endYear);
        const rate = period?.interestRate ?? defaultRate;
        
        // その年の残り返済年数（少なくとも1年は必要）
        const yearsRemaining = Math.max(1, loanEndYear - y);
        
        // 月利を計算
        const monthlyRate = rate / 100 / 12;
        
        // 利息がゼロの場合の処理
        if (monthlyRate === 0) {
            const principalPayment = remainingLoan / yearsRemaining;
            remainingLoan = Math.max(0, remainingLoan - principalPayment);
            continue;
        }
        
        // 年間返済額を計算（元利均等返済）
        const totalMonths = yearsRemaining * 12;
        const monthlyPayment = remainingLoan * (monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) 
                               / (Math.pow(1 + monthlyRate, totalMonths) - 1);
        const yearlyPayment = monthlyPayment * 12;
        
        // 1年間の利息と元本返済額を月ごとに計算
        let yearlyPrincipal = 0;
        let tempLoan = remainingLoan;
        for (let m = 0; m < 12 && tempLoan > 0; m++) {
            const monthlyInterest = tempLoan * monthlyRate;
            const principalPart = Math.min(monthlyPayment - monthlyInterest, tempLoan);
            yearlyPrincipal += principalPart;
            tempLoan -= principalPart;
        }
        
        // 残債を更新
        remainingLoan = Math.max(0, remainingLoan - yearlyPrincipal);
    }
    
    return remainingLoan;
}

// 教育費を計算
function calculateEducationCost(education: EducationExpense, childAge: number): number {
    let cost = 0;

    // 幼稚園（3-5歳）
    if (childAge >= 3 && childAge < 6 && education.kindergarten.type !== 'none') {
        cost += EDUCATION_COSTS.kindergarten[education.kindergarten.type];
    }

    // 小学校（6-11歳）
    if (childAge >= 6 && childAge < 12) {
        cost += EDUCATION_COSTS.elementary[education.elementary.type];
    }

    // 中学校（12-14歳）
    if (childAge >= 12 && childAge < 15) {
        cost += EDUCATION_COSTS.juniorHigh[education.juniorHigh.type];
    }

    // 高校（15-17歳）
    if (childAge >= 15 && childAge < 18) {
        cost += EDUCATION_COSTS.highSchool[education.highSchool.type];
    }

    // 大学（18-21歳）
    if (childAge >= 18 && childAge < 22 && education.university.type !== 'none') {
        cost += EDUCATION_COSTS.university[education.university.type];
    }

    // 習い事・塾
    if (education.extracurricularMonthly) {
        const startAge = education.extracurricularStartAge || 6;
        const endAge = education.extracurricularEndAge || 18;
        if (childAge >= startAge && childAge < endAge) {
            cost += education.extracurricularMonthly * 12;
        }
    }

    return cost;
}

export function calculateLifePlan(
    family: FamilyMember[],
    incomes: Income[],
    expenses: Expense[],
    initialAssets: Asset[],
    events: LifeEvent[],
    settings: SimulationSettings
): YearlyResult[] {
    const results: YearlyResult[] = [];

    // 資産の初期化
    const currentAssets = initialAssets.reduce((acc, a) => {
        acc[a.id] = a.currentValue;
        return acc;
    }, {} as Record<string, number>);

    // 現金資産を特定
    const cashAsset = initialAssets.find(a => a.type === 'cash' || a.type === 'deposit') || initialAssets[0];
    const cashAssetId = cashAsset?.id;

    let virtualSavings = 0;

    const startYear = settings.calculationStartYear;
    const endYear = settings.calculationEndYear;
    
    // インフレ率（設定がない場合は0%）
    const inflationRate = (settings.inflationRate || 0) / 100;
    // 収入上昇率（設定がない場合は0%）
    const incomeGrowthRate = (settings.incomeGrowthRate || 0) / 100;

    for (let year = startYear; year <= endYear; year++) {
        // インフレ係数を計算（基準年からの経過年数に応じて）
        const yearsFromStart = year - startYear;
        const inflationFactor = Math.pow(1 + inflationRate, yearsFromStart);
        
        const yearResults: YearlyResult = {
            year,
            familyAges: {},
            childrenEducationStages: {},
            incomes: {},
            incomeDetails: [],
            expenses: {},
            expenseDetails: [],
            totalIncome: 0,
            totalExpense: 0,
            cashFlow: 0,
            assets: {},
            totalAssets: 0,
            events: [],
        };

        // 家族の年齢を計算
        family.forEach(member => {
            const age = year - member.birthYear;
            yearResults.familyAges[member.id] = {
                name: member.name,
                age,
                role: member.role
            };
            if (member.role === 'husband') yearResults.ageHusband = age;
            if (member.role === 'wife') yearResults.ageWife = age;
            if (member.role === 'child') {
                yearResults.childrenEducationStages[member.id] = getEducationStage(age);
            }
        });

        // ================== 収入計算 ==================
        // 給与所得の税・社会保険料自動計算用
        let salaryTaxExpenses: { name: string; incomeTax: number; socialInsurance: number }[] = [];
        // 年金所得の税計算用
        let pensionTaxExpenses: { name: string; pensionTax: number }[] = [];
        // 退職所得の税計算用
        let retirementTaxExpenses: { name: string; retirementTax: number }[] = [];
        // 投資所得の源泉分離課税用
        let investmentTaxExpenses: { name: string; investmentTax: number }[] = [];
        
        incomes.forEach(income => {
            let amount = 0;
            const owner = family.find(f => f.id === (income as any).ownerId);
            const ownerAge = owner ? year - owner.birthYear : 0;

            switch (income.type) {
                case 'salary': {
                    const salaryIncome = income as SalaryIncome;
                    if (salaryIncome.startAge && ownerAge < salaryIncome.startAge) break;
                    if (salaryIncome.endAge && ownerAge > salaryIncome.endAge) break;

                    if (salaryIncome.useAutoComplete && salaryIncome.ageCurve.length > 0) {
                        amount = interpolateSalary(salaryIncome.ageCurve, ownerAge);
                    } else if (salaryIncome.ageCurve.length > 0) {
                        const exact = salaryIncome.ageCurve.find(c => c.age === ownerAge);
                        amount = exact?.annualAmount || 0;
                    }
                    // 収入上昇率を適用（年齢カーブで設定された額をベースに経年上昇）
                    if (amount > 0 && incomeGrowthRate > 0) {
                        const incomeGrowthFactor = Math.pow(1 + incomeGrowthRate, yearsFromStart);
                        amount = amount * incomeGrowthFactor;
                    }
                    
                    // 税・社会保険料の自動計算（年齢考慮）
                    if (amount > 0 && salaryIncome.autoCalculateTax !== false) {
                        const incomeTax = calculateIncomeTax(amount, year);
                        const socialInsurance = calculateSocialInsurance(amount, ownerAge);
                        salaryTaxExpenses.push({
                            name: `${salaryIncome.name}の税・社保`,
                            incomeTax,
                            socialInsurance
                        });
                    }
                    break;
                }
                case 'pension': {
                    const pensionIncome = income as PensionIncome;
                    amount = calculatePension(pensionIncome, ownerAge);
                    // 年金にかかる税金を計算
                    if (amount > 0) {
                        const pensionTax = calculatePensionTax(amount, ownerAge, year);
                        if (pensionTax > 0) {
                            pensionTaxExpenses.push({
                                name: `${pensionIncome.name}の税金`,
                                pensionTax
                            });
                        }
                    }
                    break;
                }
                case 'retirement': {
                    const retirementIncome = income as RetirementIncome;
                    if (year === retirementIncome.receiveYear) {
                        amount = retirementIncome.amount;
                        // 退職所得税を計算
                        // 勤続年数が未指定の場合、給与所得の開始〜終了年齢から推定
                        const yearsOfService = retirementIncome.yearsOfService || 
                            estimateYearsOfService(incomes, retirementIncome.ownerId);
                        const retirementTax = calculateRetirementTax(amount, yearsOfService, year);
                        if (retirementTax > 0) {
                            retirementTaxExpenses.push({
                                name: `${retirementIncome.name}の退職所得税`,
                                retirementTax
                            });
                        }
                    }
                    break;
                }
                case 'investment': {
                    const investmentIncome = income as InvestmentIncome;
                    if (investmentIncome.startYear && year < investmentIncome.startYear) break;
                    if (investmentIncome.endYear && year > investmentIncome.endYear) break;
                    amount = investmentIncome.annualAmount;
                    // 配当・利子所得に対する源泉分離課税（20.315%）
                    if (amount > 0) {
                        const investmentTax = Math.floor(amount * 0.20315);
                        investmentTaxExpenses.push({
                            name: `${investmentIncome.name}の源泉税`,
                            investmentTax
                        });
                    }
                    break;
                }
                case 'business':
                case 'other': {
                    const otherIncome = income as OtherIncome;
                    if (otherIncome.startYear && year < otherIncome.startYear) break;
                    if (otherIncome.endYear && year > otherIncome.endYear) break;
                    amount = otherIncome.periodicity === 'monthly' ? otherIncome.amount * 12 : otherIncome.amount;
                    // 事業所得・その他収入にも収入上昇率を適用
                    if (amount > 0 && incomeGrowthRate > 0) {
                        amount = amount * Math.pow(1 + incomeGrowthRate, yearsFromStart);
                    }
                    break;
                }
            }

            if (amount > 0) {
                const category = income.type;
                yearResults.incomes[category] = (yearResults.incomes[category] || 0) + amount;
                yearResults.incomeDetails.push({ name: income.name, category, amount });
                yearResults.totalIncome += amount;
            }
        });

        // ================== 給与からの税・社会保険料を自動計上 ==================
        salaryTaxExpenses.forEach(taxExp => {
            const totalTax = taxExp.incomeTax + taxExp.socialInsurance;
            if (totalTax > 0) {
                yearResults.expenses['tax'] = (yearResults.expenses['tax'] || 0) + totalTax;
                yearResults.expenseDetails.push({ 
                    name: taxExp.name, 
                    category: 'tax', 
                    amount: totalTax 
                });
                yearResults.totalExpense += totalTax;
            }
        });

        // ================== 年金からの税金を自動計上 ==================
        pensionTaxExpenses.forEach(taxExp => {
            if (taxExp.pensionTax > 0) {
                yearResults.expenses['tax'] = (yearResults.expenses['tax'] || 0) + taxExp.pensionTax;
                yearResults.expenseDetails.push({ 
                    name: taxExp.name, 
                    category: 'tax', 
                    amount: taxExp.pensionTax 
                });
                yearResults.totalExpense += taxExp.pensionTax;
            }
        });

        // ================== 退職金からの退職所得税を自動計上 ==================
        retirementTaxExpenses.forEach(taxExp => {
            if (taxExp.retirementTax > 0) {
                yearResults.expenses['tax'] = (yearResults.expenses['tax'] || 0) + taxExp.retirementTax;
                yearResults.expenseDetails.push({ 
                    name: taxExp.name, 
                    category: 'tax', 
                    amount: taxExp.retirementTax 
                });
                yearResults.totalExpense += taxExp.retirementTax;
            }
        });

        // ================== 投資所得からの源泉税を自動計上 ==================
        investmentTaxExpenses.forEach(taxExp => {
            if (taxExp.investmentTax > 0) {
                yearResults.expenses['tax'] = (yearResults.expenses['tax'] || 0) + taxExp.investmentTax;
                yearResults.expenseDetails.push({ 
                    name: taxExp.name, 
                    category: 'tax', 
                    amount: taxExp.investmentTax 
                });
                yearResults.totalExpense += taxExp.investmentTax;
            }
        });

        // ================== 支出計算 ==================
        expenses.forEach(expense => {
            let amount = 0;

            switch (expense.category) {
                case 'housing': {
                    const housing = expense as HousingExpense;
                    // 持ち家（ローンまたは完済済み）の開始年を判定
                    // ローンの場合はloanStartYear、完済済みの場合は設定がないので常に適用
                    const ownedStartYear = housing.housingType === 'owned-loan' 
                        ? housing.loanStartYear 
                        : (housing.housingType === 'owned-paid' ? undefined : undefined);
                    const isOwnedPeriod = housing.housingType !== 'rent' && 
                        (ownedStartYear === undefined || year >= ownedStartYear);
                    
                    if (housing.housingType === 'rent') {
                        if (housing.rentStartYear && year < housing.rentStartYear) break;
                        if (housing.rentEndYear && year > housing.rentEndYear) break;
                        // 賃貸料にインフレ率を適用（更新ごとに家賃が上昇する想定）
                        amount = (housing.monthlyRent || 0) * 12 * inflationFactor;
                    } else if (housing.housingType === 'owned-loan') {
                        if (housing.loanStartYear && housing.loanAmount && housing.loanYears) {
                            const loanEndYear = housing.loanStartYear + housing.loanYears;
                            if (year >= housing.loanStartYear && year < loanEndYear) {
                                // 変動金利の場合
                                if (housing.isVariableRate && housing.variableRatePeriods && housing.variableRatePeriods.length > 0) {
                                    // 現在の年に適用される金利を取得
                                    const currentPeriod = housing.variableRatePeriods.find(
                                        p => year >= p.startYear && year <= p.endYear
                                    );
                                    const currentRate = currentPeriod?.interestRate ?? housing.loanInterestRate ?? 0;
                                    
                                    // 残債を計算（簡易計算：年初時点の残債から計算）
                                    const yearsSinceLoanStart = year - housing.loanStartYear;
                                    const remainingYears = housing.loanYears - yearsSinceLoanStart;
                                    
                                    // 各年の返済額を変動金利で再計算
                                    // 実際には残債ベースで計算するが、簡易的に現在金利で年間返済額を計算
                                    const remainingLoan = calculateRemainingLoan(
                                        housing.loanAmount,
                                        housing.variableRatePeriods,
                                        housing.loanInterestRate || 0,
                                        housing.loanStartYear,
                                        housing.loanYears,
                                        year
                                    );
                                    amount = calculateMortgagePayment(remainingLoan, currentRate, remainingYears);
                                } else {
                                    // 固定金利の場合
                                    amount = calculateMortgagePayment(
                                        housing.loanAmount,
                                        housing.loanInterestRate || 0,
                                        housing.loanYears
                                    );
                                }
                            }
                        }
                    }
                    // 持ち家の場合のみ（持ち家期間中のみ）固定資産税・管理費等を加算
                    if (isOwnedPeriod) {
                        // 固定資産税（評価替えによる上昇をインフレで近似）
                        if (housing.propertyTaxYearly) {
                            amount += housing.propertyTaxYearly * inflationFactor;
                        }
                        // マンション管理費・修繕積立金（長期的に上昇傾向）
                        if (housing.isApartment) {
                            amount += (housing.managementFeeMonthly || 0) * 12 * inflationFactor;
                            amount += (housing.repairReserveFundMonthly || 0) * 12 * inflationFactor;
                        }
                        // 大規模修繕（工事費はインフレの影響を受ける）
                        if (housing.majorRepairCost && housing.majorRepairInterval && housing.majorRepairStartYear) {
                            const yearsSinceStart = year - housing.majorRepairStartYear;
                            if (yearsSinceStart >= 0 && yearsSinceStart % housing.majorRepairInterval === 0) {
                                amount += housing.majorRepairCost * inflationFactor;
                            }
                        }
                        // 火災保険（再調達価額の上昇に連動）
                        if (housing.fireInsuranceYearly) {
                            amount += housing.fireInsuranceYearly * inflationFactor;
                        }
                    }
                    break;
                }
                case 'education': {
                    const education = expense as EducationExpense;
                    const child = family.find(f => f.id === education.childId);
                    if (child) {
                        const childAge = year - child.birthYear;
                        // 教育費にインフレを適用（学費・教材費は物価連動で上昇）
                        amount = calculateEducationCost(education, childAge) * inflationFactor;
                    }
                    break;
                }
                case 'tax': {
                    const tax = expense as TaxExpense;
                    if (tax.startYear && year < tax.startYear) break;
                    if (tax.endYear && year > tax.endYear) break;
                    if (tax.useAutoCalculation) {
                        // 給与所得の税は別途自動計算されているため、
                        // ここでは給与以外の収入（年金、事業所得など）に対する税のみ計算
                        // 給与所得がある場合はスキップ（二重計上防止）
                        const hasSalaryWithAutoTax = salaryTaxExpenses.length > 0;
                        if (!hasSalaryWithAutoTax) {
                            // 給与所得がない場合のみ、収入全体の20%を税として計上
                            amount = yearResults.totalIncome * 0.20;
                        }
                        // 給与所得がある場合は、給与の税は既に計算済みなのでスキップ
                    } else if (tax.customAmount) {
                        amount = tax.customPeriodicity === 'monthly' ? tax.customAmount * 12 : tax.customAmount;
                    }
                    break;
                }
                case 'insurance': {
                    const insurance = expense as InsuranceExpense;
                    if (insurance.startYear && year < insurance.startYear) break;
                    if (insurance.endYear && year > insurance.endYear) break;
                    // 保険料にインフレを適用（医療費上昇に伴う保険料改定を反映）
                    amount = insurance.monthlyPremium * 12 * inflationFactor;
                    break;
                }
                case 'car': {
                    const car = expense as CarExpense;
                    if (!car.hasCar) break;
                    if (car.startYear && year < car.startYear) break;
                    if (car.endYear && year > car.endYear) break;
                    // 維持費（全項目にインフレを適用）
                    amount += (car.taxYearly || 0) * inflationFactor;
                    amount += (car.insuranceYearly || 0) * inflationFactor;
                    amount += (car.maintenanceYearly || 0) * inflationFactor;
                    amount += (car.gasMonthly || 0) * 12 * inflationFactor;
                    amount += (car.parkingMonthly || 0) * 12 * inflationFactor;
                    // 車購入（購入価格にもインフレを適用）
                    if (car.purchaseYear && car.purchasePrice && car.replacementInterval) {
                        const yearsSincePurchase = year - car.purchaseYear;
                        if (yearsSincePurchase >= 0 && yearsSincePurchase % car.replacementInterval === 0) {
                            // 買い替え時の価格はインフレを考慮
                            amount += car.purchasePrice * inflationFactor;
                        }
                    }
                    break;
                }
                case 'allowance': {
                    const allowance = expense as AllowanceExpense;
                    if (allowance.startYear && year < allowance.startYear) break;
                    if (allowance.endYear && year > allowance.endYear) break;
                    // お小遣いにインフレを適用
                    amount = allowance.monthlyAmount * 12 * inflationFactor;
                    break;
                }
                case 'living': {
                    const living = expense as LivingExpense;
                    if (living.startYear && year < living.startYear) break;
                    if (living.endYear && year > living.endYear) break;
                    // 生活費にはインフレ率を適用
                    amount = living.monthlyAmount * 12 * inflationFactor;
                    break;
                }
                case 'utility': {
                    const utility = expense as UtilityExpense;
                    if (utility.startYear && year < utility.startYear) break;
                    if (utility.endYear && year > utility.endYear) break;
                    // 光熱費にはインフレ率を適用
                    amount = ((utility.electricityMonthly || 0) + 
                              (utility.gasMonthly || 0) + 
                              (utility.waterMonthly || 0)) * 12 * inflationFactor;
                    break;
                }
                case 'communication': {
                    const comm = expense as CommunicationExpense;
                    if (comm.startYear && year < comm.startYear) break;
                    if (comm.endYear && year > comm.endYear) break;
                    // 通信費にはインフレ率を適用
                    amount = ((comm.internetMonthly || 0) + 
                              (comm.mobileMonthly || 0) + 
                              (comm.subscriptionsMonthly || 0)) * 12 * inflationFactor;
                    break;
                }
                case 'medical': {
                    const medical = expense as MedicalExpense;
                    if (medical.startYear && year < medical.startYear) break;
                    if (medical.endYear && year > medical.endYear) break;
                    // 医療費にはインフレ率を適用
                    amount = medical.monthlyAmount * 12 * inflationFactor;
                    break;
                }
                default: {
                    const generic = expense as GenericExpense;
                    if (generic.startYear && year < generic.startYear) break;
                    if (generic.endYear && year > generic.endYear) break;
                    
                    // 一回限りの支出は対象年のみ計上
                    if (generic.periodicity === 'one-time') {
                        const targetYear = generic.startYear || settings.calculationStartYear;
                        if (year === targetYear) {
                            amount = generic.amount * inflationFactor;
                        }
                        break;
                    }
                    
                    // 周期的な支出（intervalYearsが設定されている場合）
                    if (generic.intervalYears && generic.intervalYears > 1) {
                        const baseYear = generic.startYear || settings.calculationStartYear;
                        const yearsSinceBase = year - baseYear;
                        // 周期に該当する年のみ計上（インフレ適用）
                        if (yearsSinceBase >= 0 && yearsSinceBase % generic.intervalYears === 0) {
                            amount = (generic.periodicity === 'monthly' ? generic.amount * 12 : generic.amount) * inflationFactor;
                        }
                    } else {
                        // 毎年の支出（インフレ適用）
                        amount = (generic.periodicity === 'monthly' ? generic.amount * 12 : generic.amount) * inflationFactor;
                    }
                    break;
                }
            }

            if (amount > 0) {
                yearResults.expenses[expense.category] = (yearResults.expenses[expense.category] || 0) + amount;
                yearResults.expenseDetails.push({ name: expense.name, category: expense.category, amount });
                yearResults.totalExpense += amount;
            }
        });

        // ================== ライフイベント ==================
        events.forEach(event => {
            let applyEvent = false;
            if (event.year === year) {
                applyEvent = true;
            } else if (event.isRecurring && event.recurrenceInterval) {
                const initialYear = event.year;
                const endYear = event.endYear || settings.calculationEndYear;
                if (year >= initialYear && year <= endYear) {
                    if ((year - initialYear) % event.recurrenceInterval === 0) {
                        applyEvent = true;
                    }
                }
            }

            if (applyEvent) {
                // ライフイベントにインフレを適用（将来の費用は物価上昇を反映）
                const eventCost = event.cost * inflationFactor;
                // 車購入イベントの場合は'car'カテゴリに計上
                if (event.eventType === 'car-purchase') {
                    yearResults.expenses['car'] = (yearResults.expenses['car'] || 0) + eventCost;
                    yearResults.expenseDetails.push({ name: event.name, category: 'car', amount: eventCost });
                } else {
                    yearResults.expenses['event'] = (yearResults.expenses['event'] || 0) + eventCost;
                    yearResults.expenseDetails.push({ name: event.name, category: 'event', amount: eventCost });
                }
                yearResults.totalExpense += eventCost;
                yearResults.events.push(event.name);
            }

            // 車購入イベントの維持費計算（購入年以降、次の買い替えまで or 終了年まで毎年）
            if (event.eventType === 'car-purchase' && event.carMaintenance) {
                const purchaseYear = event.year;
                const maintenanceEndYear = event.endYear || settings.calculationEndYear;
                const interval = event.isRecurring && event.recurrenceInterval ? event.recurrenceInterval : 100; // 買い替えなければ100年
                const yearsSincePurchase = year - purchaseYear;
                
                // 購入年以降で、終了年以内、次の買い替え前まで（繰り返しの場合は各周期内で適用）
                if (yearsSincePurchase >= 0 && year <= maintenanceEndYear) {
                    const cyclePosition = event.isRecurring && event.recurrenceInterval 
                        ? yearsSincePurchase % event.recurrenceInterval 
                        : yearsSincePurchase;
                    
                    // 買い替え間隔内なら維持費を計上（インフレ適用）
                    if (cyclePosition >= 0 && cyclePosition < interval) {
                        const maint = event.carMaintenance;
                        const yearlyMaintenance = 
                            (maint.taxYearly + 
                            maint.insuranceYearly + 
                            maint.maintenanceYearly + 
                            (maint.gasMonthly + maint.parkingMonthly) * 12) * inflationFactor;
                        
                        yearResults.expenses['car'] = (yearResults.expenses['car'] || 0) + yearlyMaintenance;
                        yearResults.expenseDetails.push({ 
                            name: `${event.name}維持費`, 
                            category: 'car', 
                            amount: yearlyMaintenance 
                        });
                        yearResults.totalExpense += yearlyMaintenance;
                    }
                }
            }
        });

        // ================== 内訳を設定 ==================
        // 収入内訳
        yearResults.incomeBreakdown = {
            salary: yearResults.incomes['salary'] || 0,
            pension: yearResults.incomes['pension'] || 0,
            other: (yearResults.incomes['business'] || 0) + 
                   (yearResults.incomes['investment'] || 0) + 
                   (yearResults.incomes['retirement'] || 0) + 
                   (yearResults.incomes['other'] || 0),
        };

        // 支出内訳
        yearResults.expenseBreakdown = {
            housing: yearResults.expenses['housing'] || 0,
            tax: yearResults.expenses['tax'] || 0,
            education: yearResults.expenses['education'] || 0,
            living: yearResults.expenses['living'] || 0,
            utility: yearResults.expenses['utility'] || 0,
            communication: yearResults.expenses['communication'] || 0,
            medical: yearResults.expenses['medical'] || 0,
            insurance: yearResults.expenses['insurance'] || 0,
            car: yearResults.expenses['car'] || 0,
            allowance: yearResults.expenses['allowance'] || 0,
            event: yearResults.expenses['event'] || 0,
            other: yearResults.expenses['other'] || 0,
        };

        // ================== キャッシュフロー計算 ==================
        yearResults.cashFlow = yearResults.totalIncome - yearResults.totalExpense;

        // ================== 資産更新 ==================
        let totalAssetsVal = 0;
        let totalInterestGain = 0;
        let totalAccumulationContribution = 0;

        // 前年の資産合計を取得（最初の年は初期資産）
        const previousTotalAssets = results.length > 0 
            ? results[results.length - 1].totalAssets 
            : initialAssets.reduce((sum, a) => sum + a.currentValue, 0);

        if (initialAssets.length > 0) {
            // Step 1: 現金残高を仮計算して、積立投資が可能か判定
            let cashVal = currentAssets[cashAssetId || ''] || 0;
            cashVal += yearResults.cashFlow;
            
            // 積立可能額を計算（現金残高が足りない場合は積立を縮小・停止）
            let totalDesiredContribution = 0;
            const assetContributions: Record<string, number> = {};
            initialAssets.forEach(asset => {
                if (asset.isAccumulating && asset.monthlyContribution) {
                    const aStartYear = asset.accumulationStartYear || settings.calculationStartYear;
                    const aEndYear = asset.accumulationEndYear || settings.calculationEndYear;
                    if (year >= aStartYear && year <= aEndYear) {
                        const desired = asset.monthlyContribution * 12;
                        assetContributions[asset.id] = desired;
                        totalDesiredContribution += desired;
                    }
                }
            });

            // 積立後の現金残高を予測
            let actualTotalContribution = totalDesiredContribution;
            if (cashVal - totalDesiredContribution < 0) {
                // 現金が足りない → 積立を可能な範囲に縮小（0以上）
                actualTotalContribution = Math.max(0, cashVal);
                // 各資産の積立を按分で縮小
                if (totalDesiredContribution > 0) {
                    const ratio = actualTotalContribution / totalDesiredContribution;
                    Object.keys(assetContributions).forEach(id => {
                        assetContributions[id] = Math.floor(assetContributions[id] * ratio);
                    });
                }
            }

            // Step 2: 各資産の運用益・積立を計算
            initialAssets.forEach(asset => {
                let val = currentAssets[asset.id];
                const originalValue = asset.currentValue;

                // 複利か単利かで計算方法を分岐
                let interestGain = 0;
                if (val > 0) {
                    if (asset.isCompounding !== false) {
                        interestGain = val * (asset.annualInterestRate / 100);
                    } else {
                        interestGain = originalValue * (asset.annualInterestRate / 100);
                    }
                }
                val += interestGain;
                totalInterestGain += interestGain;

                // 積立投資（縮小後の額を適用）
                const contribution = assetContributions[asset.id] || 0;
                if (contribution > 0) {
                    val += contribution;
                    totalAccumulationContribution += contribution;
                    
                    // 積立分の年内利息（平均6ヶ月分として概算）
                    if (asset.isCompounding !== false && asset.annualInterestRate > 0) {
                        const contributionInterest = contribution * (asset.annualInterestRate / 100) * 0.5;
                        val += contributionInterest;
                        totalInterestGain += contributionInterest;
                    }
                }

                // キャッシュフローを現金資産に反映し、積立投資分を差し引く
                if (asset.id === cashAssetId) {
                    val += yearResults.cashFlow;
                    val -= actualTotalContribution;
                }

                currentAssets[asset.id] = val;
                yearResults.assets[asset.id] = val;
                totalAssetsVal += val;
            });

            // Step 3: 現金がマイナスの場合、投資資産を取り崩して補填
            if (cashAssetId && currentAssets[cashAssetId] < 0) {
                const deficit = -currentAssets[cashAssetId]; // 不足額（正の値）
                let remainingDeficit = deficit;

                // 流動性の高い順に取り崩し（cash/deposit以外の資産）
                // 利率が低い資産から優先的に取り崩す（効率的な資産管理）
                const liquidatableAssets = initialAssets
                    .filter(a => a.id !== cashAssetId && currentAssets[a.id] > 0)
                    .sort((a, b) => a.annualInterestRate - b.annualInterestRate);

                for (const asset of liquidatableAssets) {
                    if (remainingDeficit <= 0) break;
                    const available = currentAssets[asset.id];
                    const liquidateAmount = Math.min(available, remainingDeficit);
                    
                    currentAssets[asset.id] -= liquidateAmount;
                    yearResults.assets[asset.id] = currentAssets[asset.id];
                    
                    remainingDeficit -= liquidateAmount;
                }

                // 取り崩し分を現金に加算
                const actualLiquidation = deficit - remainingDeficit;
                currentAssets[cashAssetId] += actualLiquidation;
                yearResults.assets[cashAssetId] = currentAssets[cashAssetId];
                // 注: totalAssetsValは変わらない（資産間の移動のため）
            }
        } else {
            virtualSavings += yearResults.cashFlow;
            yearResults.assets['virtual'] = virtualSavings;
            totalAssetsVal = virtualSavings;
        }

        yearResults.totalAssets = totalAssetsVal;
        
        // 資産変動の内訳を設定
        yearResults.assetChangeBreakdown = {
            interestGain: Math.round(totalInterestGain),
            accumulationContribution: totalAccumulationContribution,
            cashFlowImpact: yearResults.cashFlow,
            totalChange: Math.round(totalAssetsVal - previousTotalAssets)
        };
        
        results.push(yearResults);
    }

    return results;
}

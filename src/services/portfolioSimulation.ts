import { SimulationParams, SimulationResult, SimulationYearData } from '../types';

export function runPortfolioSimulation(params: SimulationParams): SimulationResult {
  const { initialInvestment, monthlyContribution, years, annualReturnPct, inflationPct } = params;

  const monthlyNominalRate = annualReturnPct / 100 / 12;
  const monthlyInflationRate = Math.pow(1 + inflationPct / 100, 1 / 12) - 1;

  let nominalVal = initialInvestment;
  let totalContrib = initialInvestment;
  let inflationFactor = 1;
  // The cost basis in today's purchasing power. Each later contribution is
  // discounted to its value at the start of the simulation.
  let realContributionBasis = initialInvestment;

  const yearlyBreakdown: SimulationYearData[] = [];
  const milestonesToTrack = [25000, 50000, 100000, 250000, 500000, 1000000, 2500000];
  const milestones: { target: number; achievedInYear: number | null }[] = milestonesToTrack.map((target) => ({
    target,
    achievedInYear: initialInvestment >= target ? 0 : null,
  }));

  for (let m = 1; m <= years * 12; m++) {
    nominalVal = nominalVal * (1 + monthlyNominalRate) + monthlyContribution;
    inflationFactor *= 1 + monthlyInflationRate;
    totalContrib += monthlyContribution;
    realContributionBasis += monthlyContribution / inflationFactor;

    // Check milestones
    for (const ms of milestones) {
      if (ms.achievedInYear === null && nominalVal >= ms.target) {
        ms.achievedInYear = Math.ceil(m / 12);
      }
    }

    if (m % 12 === 0) {
      const year = m / 12;
      const realVal = nominalVal / inflationFactor;
      yearlyBreakdown.push({
        year,
        nominalTotal: Math.round(nominalVal),
        realTotal: Math.round(realVal),
        totalContributions: Math.round(totalContrib),
        nominalGrowth: Math.round(Math.max(0, nominalVal - totalContrib)),
        realGrowth: Math.round(Math.max(0, realVal - realContributionBasis)),
      });
    }
  }

  const nominalFinal = Math.round(nominalVal);
  const realFinal = Math.round(nominalVal / inflationFactor);
  const totalContributions = Math.round(totalContrib);
  const nominalGrowth = Math.max(0, nominalFinal - totalContributions);
  const realGrowth = Math.max(0, realFinal - Math.round(realContributionBasis));
  const purchasingPowerLoss = Math.max(0, nominalFinal - realFinal);

  return {
    nominalFinal,
    realFinal,
    totalContributions,
    nominalGrowth,
    realGrowth,
    purchasingPowerLoss,
    yearlyBreakdown,
    milestones,
  };
}

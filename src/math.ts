export interface MonteCarloResult {
  dimension: number;
  samples: number;
  inside: number;
  hitProbability: number;
  estimatedVolume: number;
  trueVolume: number;
  relativeError: number;
  scatter: Array<{ x: number; y: number; inside: boolean }>;
}

const lanczosCoefficients = [
  0.99999999999980993,
  676.5203681218851,
  -1259.1392167224028,
  771.32342877765313,
  -176.61502916214059,
  12.507343278686905,
  -0.13857109526572012,
  9.9843695780195716e-6,
  1.5056327351493116e-7,
];

export function logGamma(z: number): number {
  if (z <= 0) {
    return Number.NaN;
  }

  if (z < 0.5) {
    return Math.log(Math.PI) - Math.log(Math.sin(Math.PI * z)) - logGamma(1 - z);
  }

  const shifted = z - 1;
  let x = lanczosCoefficients[0];
  for (let i = 1; i < lanczosCoefficients.length; i += 1) {
    x += lanczosCoefficients[i] / (shifted + i);
  }

  const t = shifted + 7.5;
  return 0.5 * Math.log(2 * Math.PI) + (shifted + 0.5) * Math.log(t) - t + Math.log(x);
}

export function logBallVolume(n: number, r: number): number {
  if (n < 1 || r < 0) {
    return Number.NaN;
  }
  if (r === 0) {
    return Number.NEGATIVE_INFINITY;
  }
  return (n / 2) * Math.log(Math.PI) - logGamma(n / 2 + 1) + n * Math.log(r);
}

export function ballVolume(n: number, r: number): number {
  const logVolume = logBallVolume(n, r);
  if (logVolume > Math.log(Number.MAX_VALUE)) {
    return Number.POSITIVE_INFINITY;
  }
  if (logVolume < Math.log(Number.MIN_VALUE)) {
    return 0;
  }
  return Math.exp(logVolume);
}

export function cubeVolume(n: number): number {
  return 2 ** n;
}

export function ballCubeRatio(n: number): number {
  return Math.exp(logBallVolume(n, 1) - n * Math.log(2));
}

export function shellInsideFraction(n: number, r: number): number {
  return Math.min(1, Math.max(0, r)) ** n;
}

export function shellOutsideFraction(n: number, r: number): number {
  return 1 - shellInsideFraction(n, r);
}

export function monteCarloEstimate(n: number, samples: number): MonteCarloResult {
  let inside = 0;
  const scatter: MonteCarloResult['scatter'] = [];

  for (let i = 0; i < samples; i += 1) {
    let squaredDistance = 0;
    let first = 0;
    let second = 0;

    for (let axis = 0; axis < n; axis += 1) {
      const coordinate = Math.random() * 2 - 1;
      if (axis === 0) first = coordinate;
      if (axis === 1) second = coordinate;
      squaredDistance += coordinate * coordinate;
    }

    const hit = squaredDistance <= 1;
    if (hit) inside += 1;
    if (n === 2 && scatter.length < 2500) {
      scatter.push({ x: first, y: second, inside: hit });
    }
  }

  const hitProbability = inside / samples;
  const estimatedVolume = cubeVolume(n) * hitProbability;
  const trueVolume = ballVolume(n, 1);
  const relativeError = trueVolume === 0 ? Number.NaN : Math.abs(estimatedVolume - trueVolume) / trueVolume;

  return { dimension: n, samples, inside, hitProbability, estimatedVolume, trueVolume, relativeError, scatter };
}

export function generateDistanceSamples(n: number, samples: number): number[] {
  return Array.from({ length: samples }, () => {
    let squaredDistance = 0;
    for (let axis = 0; axis < n; axis += 1) {
      const coordinate = Math.random() * 2 - 1;
      squaredDistance += coordinate * coordinate;
    }
    return Math.sqrt(squaredDistance);
  });
}

export function formatNumber(value: number, digits = 4): string {
  if (!Number.isFinite(value)) {
    return value > 0 ? '∞' : '—';
  }
  const absolute = Math.abs(value);
  if (absolute === 0) return '0';
  if (absolute >= 1e5 || absolute < 1e-4) {
    return value.toExponential(digits);
  }
  return new Intl.NumberFormat('en-US', {
    maximumSignificantDigits: digits + 1,
  }).format(value);
}

export function formatPercent(value: number): string {
  if (value === 0) return '0%';
  if (Math.abs(value) < 0.0001) return `${(value * 100).toExponential(3)}%`;
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    maximumFractionDigits: 4,
  }).format(value);
}

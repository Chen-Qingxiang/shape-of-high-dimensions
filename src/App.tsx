import { useMemo, useState } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { ExplanationBox, FormulaBlock, SectionCard, SliderControl, StatCard } from './components';
import {
  ballCubeRatio,
  ballVolume,
  cubeVolume,
  formatNumber,
  formatPercent,
  generateDistanceSamples,
  logBallVolume,
  monteCarloEstimate,
  shellInsideFraction,
  shellOutsideFraction,
} from './math';

const volumeData = Array.from({ length: 100 }, (_, index) => {
  const n = index + 1;
  const volume = ballVolume(n, 1);
  return { n, volume, logVolume: logBallVolume(n, 1), label: formatNumber(volume) };
});

const ratioData = Array.from({ length: 100 }, (_, index) => {
  const n = index + 1;
  const ratio = ballCubeRatio(n);
  return { n, ratio, log10Ratio: Math.log10(ratio), cube: cubeVolume(n), volume: ballVolume(n, 1) };
});

function histogram(values: number[], bucketCount = 28) {
  const max = Math.max(...values, 1);
  const width = max / bucketCount;
  return Array.from({ length: bucketCount }, (_, index) => {
    const from = index * width;
    const to = (index + 1) * width;
    return {
      distance: (from + to) / 2,
      label: `${from.toFixed(1)}–${to.toFixed(1)}`,
      count: values.filter((value) => value >= from && (index === bucketCount - 1 ? value <= to : value < to)).length,
    };
  });
}

function App() {
  const [dimension, setDimension] = useState(50);
  const [radius, setRadius] = useState(1);
  const [shellDimension, setShellDimension] = useState(50);
  const [innerRadius, setInnerRadius] = useState(0.9);
  const [monteDimension, setMonteDimension] = useState(2);
  const [samples, setSamples] = useState(5000);
  const [monteSeed, setMonteSeed] = useState(0);
  const [distanceDimension, setDistanceDimension] = useState(50);
  const [distanceSeed, setDistanceSeed] = useState(0);

  const selectedVolume = ballVolume(dimension, radius);
  const unitVolume = ballVolume(dimension, 1);
  const selectedRatio = ballCubeRatio(dimension);
  const inside = shellInsideFraction(shellDimension, innerRadius);
  const outside = shellOutsideFraction(shellDimension, innerRadius);

  const monteCarlo = useMemo(
    () => monteCarloEstimate(monteDimension, samples),
    [monteDimension, samples, monteSeed],
  );

  const distances = useMemo(
    () => generateDistanceSamples(distanceDimension, 5000),
    [distanceDimension, distanceSeed],
  );
  const distanceHistogram = useMemo(() => histogram(distances), [distances]);
  const typicalDistance = Math.sqrt(distanceDimension / 3);
  const meanDistance = distances.reduce((sum, distance) => sum + distance, 0) / distances.length;

  return (
    <main>
      <section className="hero">
        <div className="hero-glow" />
        <p className="eyebrow">Interactive geometry lab</p>
        <h1>The Shape of High Dimensions</h1>
        <p className="subtitle">How Big Is a Ball in 50 Dimensions?</p>
        <p className="hero-copy">A visual lab for seeing why high-dimensional geometry breaks your intuition.</p>
        <p className="inspiration-note">
          Inspired by watching the 3Blue1Brown video{' '}
          <a href="https://www.youtube.com/watch?v=fsLh-NYhOoU" target="_blank" rel="noreferrer">
            about high-dimensional spheres
          </a>
          : I wanted to build my own hands-on playground to understand the ideas more deeply.
        </p>
        <div className="stats-grid">
          <StatCard label="selected dimension" value={`n = ${dimension}`} detail="drag the explorer slider" />
          <StatCard label="unit ball volume Vₙ(1)" value={formatNumber(unitVolume)} detail="peaks near n = 5" />
          <StatCard label="ball / cube ratio" value={formatPercent(selectedRatio)} detail="random cube hit probability" />
        </div>
      </section>

      <SectionCard eyebrow="01" title="n-Dimensional Ball Volume Explorer">
        <div className="split-grid">
          <div className="control-panel">
            <SliderControl id="dimension" label="Dimension n" min={1} max={100} value={dimension} onChange={setDimension} />
            <SliderControl id="radius" label="Radius r" min={0.1} max={3} step={0.1} value={radius} onChange={setRadius} />
            <FormulaBlock tex="V_n(r)=\frac{\pi^{n/2}}{\Gamma(n/2+1)}r^n" />
            <StatCard label="current Vₙ(r)" value={formatNumber(selectedVolume)} detail={`log volume = ${formatNumber(logBallVolume(dimension, radius))}`} />
            <ExplanationBox>
              The unit ball first grows, reaching its maximum at dimension 5, then collapses toward zero. Radius matters exponentially: multiplying r is really multiplying volume by rⁿ.
            </ExplanationBox>
          </div>
          <div className="chart-panel">
            <ResponsiveContainer width="100%" height={360}>
              <ComposedChart data={volumeData} margin={{ top: 18, right: 18, bottom: 8, left: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                <XAxis dataKey="n" stroke="#b9c7ff" />
                <YAxis stroke="#b9c7ff" tickFormatter={(value) => formatNumber(Number(value), 2)} />
                <Tooltip contentStyle={{ background: '#111936', border: '1px solid #31406d' }} formatter={(value) => formatNumber(Number(value))} />
                <Area type="monotone" dataKey="volume" fill="#6ee7ff33" stroke="#6ee7ff" strokeWidth={3} />
                <ReferenceLine x={5} label="peak ≈ 5" stroke="#facc15" strokeDasharray="5 5" />
                <ReferenceLine x={dimension} stroke="#fb7185" strokeWidth={2} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </SectionCard>

      <SectionCard eyebrow="02" title="High-Dimensional Shell Visualiser">
        <div className="split-grid">
          <div className="control-panel">
            <SliderControl id="shell-dimension" label="Dimension n" min={1} max={100} value={shellDimension} onChange={setShellDimension} />
            <SliderControl id="inner-radius" label="Inner radius r" min={0} max={1} step={0.01} value={innerRadius} onChange={setInnerRadius} />
            <FormulaBlock tex="\text{fraction inside radius }r=r^n" />
            <div className="mini-grid">
              <StatCard label="inside core" value={formatPercent(inside)} />
              <StatCard label="outer shell" value={formatPercent(outside)} />
            </div>
            <div className="examples">
              {[10, 50, 100].map((n) => <span key={n}>0.9<sup>{n}</sup> = {formatPercent(0.9 ** n)}</span>)}
            </div>
          </div>
          <div className="visual-panel">
            <div className="shell-bar" aria-label="Inner core versus outer shell volume">
              <div className="shell-inner" style={{ width: `${inside * 100}%` }} />
              <div className="shell-label">outer shell {formatPercent(outside)}</div>
            </div>
            <div className="orb" style={{ ['--core-scale' as string]: Math.max(0.08, innerRadius) }}>
              <div className="orb-core" />
            </div>
            <ExplanationBox tone="success">At high dimensions, most of the volume is near the boundary: even the radius-{innerRadius.toFixed(2)} core holds only {formatPercent(inside)} of the ball.</ExplanationBox>
          </div>
        </div>
      </SectionCard>

      <SectionCard eyebrow="03" title="Cube vs Ball Comparison">
        <div className="split-grid">
          <div className="control-panel">
            <FormulaBlock tex="\frac{V_n(1)}{2^n}=\Pr\{X\in[-1,1]^n:\lVert X\rVert_2\le 1\}" />
            <StatCard label="cube volume 2ⁿ" value={formatNumber(cubeVolume(dimension))} />
            <StatCard label="unit ball / cube" value={formatPercent(selectedRatio)} detail="plotted as log₁₀(probability)" />
            <ExplanationBox>
              The surrounding cube grows as 2ⁿ, while the ball becomes a tiny rounded corner of probability space. A random point in the cube almost never lands inside the ball once n is large.
            </ExplanationBox>
          </div>
          <div className="chart-panel">
            <ResponsiveContainer width="100%" height={330}>
              <AreaChart data={ratioData} margin={{ top: 18, right: 18, bottom: 8, left: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                <XAxis dataKey="n" stroke="#b9c7ff" />
                <YAxis stroke="#b9c7ff" label={{ value: 'log₁₀ ratio', angle: -90, position: 'insideLeft', fill: '#b9c7ff' }} />
                <Tooltip contentStyle={{ background: '#111936', border: '1px solid #31406d' }} formatter={(value) => formatNumber(Number(value), 3)} />
                <Area type="monotone" dataKey="log10Ratio" fill="#a78bfa33" stroke="#a78bfa" strokeWidth={3} />
                <ReferenceLine x={dimension} stroke="#fb7185" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </SectionCard>

      <SectionCard eyebrow="04" title="Monte Carlo Volume Estimator">
        <div className="split-grid">
          <div className="control-panel">
            <SliderControl id="monte-dimension" label="Dimension n" min={2} max={20} value={monteDimension} onChange={setMonteDimension} />
            <SliderControl id="samples" label="Samples" min={500} max={30000} step={500} value={samples} onChange={setSamples} />
            <button className="primary-button" onClick={() => setMonteSeed((seed) => seed + 1)}>Resample points</button>
            <div className="mini-grid">
              <StatCard label="inside / total" value={`${monteCarlo.inside} / ${monteCarlo.samples}`} />
              <StatCard label="hit probability" value={formatPercent(monteCarlo.hitProbability)} />
              <StatCard label="estimated volume" value={formatNumber(monteCarlo.estimatedVolume)} />
              <StatCard label="true volume" value={formatNumber(monteCarlo.trueVolume)} />
              <StatCard label="relative error" value={formatPercent(monteCarlo.relativeError)} />
            </div>
            <ExplanationBox tone={monteCarlo.hitProbability < 0.001 ? 'warning' : 'default'}>
              Monte Carlo becomes inefficient in high dimensions because almost no sampled cube points hit the ball. Zero hits is information too: the probability is below the scale your sample can see.
            </ExplanationBox>
          </div>
          <div className="chart-panel">
            {monteDimension === 2 ? (
              <ResponsiveContainer width="100%" height={360}>
                <ScatterChart margin={{ top: 18, right: 18, bottom: 18, left: 18 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                  <XAxis type="number" dataKey="x" domain={[-1, 1]} stroke="#b9c7ff" />
                  <YAxis type="number" dataKey="y" domain={[-1, 1]} stroke="#b9c7ff" />
                  <Scatter data={monteCarlo.scatter} isAnimationActive={false}>
                    {monteCarlo.scatter.map((point, index) => <Cell key={`${point.x}-${index}`} fill={point.inside ? '#34d399' : '#fb7185'} />)}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            ) : (
              <div className="big-number-panel">
                <strong>{formatPercent(monteCarlo.hitProbability)}</strong>
                <span>of sampled points landed in the ball</span>
              </div>
            )}
          </div>
        </div>
      </SectionCard>

      <SectionCard eyebrow="05" title="Distance Distribution in High Dimensions">
        <div className="split-grid">
          <div className="control-panel">
            <SliderControl id="distance-dimension" label="Dimension n" min={1} max={100} value={distanceDimension} onChange={setDistanceDimension} />
            <button className="primary-button" onClick={() => setDistanceSeed((seed) => seed + 1)}>Regenerate distances</button>
            <FormulaBlock tex="d=\sqrt{x_1^2+\cdots+x_n^2}\qquad \mathbb{E}[d]\approx\sqrt{n/3}" />
            <div className="mini-grid">
              <StatCard label="√(n / 3)" value={formatNumber(typicalDistance)} />
              <StatCard label="sample mean distance" value={formatNumber(meanDistance)} />
            </div>
            <ExplanationBox>
              Coordinates chosen from [-1, 1] have average squared coordinate 1/3, so squared distance piles up near n/3. In high dimensions, random points are usually far from the centre and distances concentrate.
            </ExplanationBox>
          </div>
          <div className="chart-panel">
            <ResponsiveContainer width="100%" height={340}>
              <BarChart data={distanceHistogram} margin={{ top: 18, right: 18, bottom: 8, left: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                <XAxis dataKey="distance" stroke="#b9c7ff" tickFormatter={(value) => Number(value).toFixed(1)} />
                <YAxis stroke="#b9c7ff" />
                <Tooltip contentStyle={{ background: '#111936', border: '1px solid #31406d' }} labelFormatter={(value) => `distance ${Number(value).toFixed(2)}`} />
                <Bar dataKey="count" fill="#6ee7ff" radius={[8, 8, 0, 0]} />
                <ReferenceLine x={typicalDistance} stroke="#facc15" strokeDasharray="5 5" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </SectionCard>

      <SectionCard eyebrow="06" title="Gamma Function Mini Explainer" className="compact">
        <details open>
          <summary>Why does Γ appear in the ball-volume formula?</summary>
          <div className="gamma-grid">
            <div>
              <FormulaBlock tex="\Gamma(k+1)=k!\qquad\Gamma(x+1)=x\Gamma(x)" />
              <p>Factorials count the even-dimensional cases. The gamma function smoothly extends factorials to half-integers, which is why Γ(n/2 + 1) handles odd dimensions too.</p>
            </div>
            <table>
              <tbody>
                <tr><td>Γ(1)</td><td>1</td></tr>
                <tr><td>Γ(2)</td><td>1!</td></tr>
                <tr><td>Γ(3)</td><td>2!</td></tr>
                <tr><td>Γ(1/2)</td><td>√π</td></tr>
                <tr><td>Γ(3/2)</td><td>1/2 √π</td></tr>
              </tbody>
            </table>
          </div>
        </details>
      </SectionCard>
    </main>
  );
}

export default App;

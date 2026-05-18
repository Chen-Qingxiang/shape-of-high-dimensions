import katex from 'katex';
import 'katex/dist/katex.min.css';
import type { ReactNode } from 'react';

interface StatCardProps {
  label: string;
  value: string;
  detail?: string;
}

export function StatCard({ label, value, detail }: StatCardProps) {
  return (
    <article className="stat-card">
      <span>{label}</span>
      <strong>{value}</strong>
      {detail ? <small>{detail}</small> : null}
    </article>
  );
}

interface SectionCardProps {
  eyebrow?: string;
  title: string;
  children: ReactNode;
  className?: string;
}

export function SectionCard({ eyebrow, title, children, className = '' }: SectionCardProps) {
  return (
    <section className={`section-card ${className}`.trim()}>
      {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
      <h2>{title}</h2>
      {children}
    </section>
  );
}

interface SliderControlProps {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  suffix?: string;
  onChange: (value: number) => void;
}

export function SliderControl({ id, label, value, min, max, step = 1, suffix = '', onChange }: SliderControlProps) {
  return (
    <label className="slider-control" htmlFor={id}>
      <span>
        {label}
        <strong>{value.toLocaleString('en-US', { maximumFractionDigits: 2 })}{suffix}</strong>
      </span>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </label>
  );
}

export function FormulaBlock({ tex, display = true }: { tex: string; display?: boolean }) {
  const html = katex.renderToString(tex, { displayMode: display, throwOnError: false, strict: 'ignore' });
  return <div className="formula-block" dangerouslySetInnerHTML={{ __html: html }} />;
}

export function ExplanationBox({ children, tone = 'default' }: { children: ReactNode; tone?: 'default' | 'warning' | 'success' }) {
  return <div className={`explanation-box ${tone}`}>{children}</div>;
}

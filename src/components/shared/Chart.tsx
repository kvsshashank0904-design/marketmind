import React, { useState } from 'react';
import { formatCurrency } from '../../services/financialCalculations';

export interface BarChartItem {
  label: string;
  value: number;
  secondaryValue?: number;
  highlight?: boolean;
}

interface FinancialBarChartProps {
  data: BarChartItem[];
  title?: string;
  unitLabel?: string;
  primaryColor?: string;
  secondaryColor?: string;
  primaryLegend?: string;
  secondaryLegend?: string;
  height?: number;
}

export const FinancialBarChart: React.FC<FinancialBarChartProps> = ({
  data,
  title,
  unitLabel = 'USD',
  primaryColor = '#35d49a',
  secondaryColor = '#38bdf8',
  primaryLegend = 'Primary',
  secondaryLegend,
  height = 220,
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return (
      <div className="chart-empty" style={{ height }}>
        <span>No historical data available to render chart.</span>
      </div>
    );
  }

  let maxVal = 0;
  let minVal = 0;
  data.forEach((d) => {
    if (Math.abs(d.value) > maxVal) maxVal = Math.abs(d.value);
    if (d.value < minVal) minVal = d.value;
    if (d.value > maxVal) maxVal = d.value;
    if (d.secondaryValue && Math.abs(d.secondaryValue) > maxVal) {
      maxVal = Math.abs(d.secondaryValue);
    }
    if (d.secondaryValue !== undefined) {
      minVal = Math.min(minVal, d.secondaryValue);
      maxVal = Math.max(maxVal, d.secondaryValue);
    }
  });

  if (maxVal === minVal) maxVal = minVal + 1;

  const chartWidth = 560;
  const paddingX = 50;
  const paddingY = 30;
  const usableWidth = chartWidth - paddingX * 2;
  const usableHeight = height - paddingY * 2;
  const barGroupWidth = usableWidth / data.length;
  const valueRange = maxVal - minVal;
  const getY = (value: number) => paddingY + ((maxVal - value) / valueRange) * usableHeight;
  const zeroY = getY(0);

  return (
    <div className="chart-container">
      {title && (
        <div className="chart-header">
          <h4>{title}</h4>
          <div className="chart-legends">
            <span className="legend-item">
              <span className="legend-dot" style={{ backgroundColor: primaryColor }} />
              {primaryLegend}
            </span>
            {secondaryLegend && (
              <span className="legend-item">
                <span className="legend-dot" style={{ backgroundColor: secondaryColor }} />
                {secondaryLegend}
              </span>
            )}
            <small className="chart-unit">({unitLabel})</small>
          </div>
        </div>
      )}

      <svg
        viewBox={`0 0 ${chartWidth} ${height}`}
        className="financial-svg-chart"
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label={title || 'Financial bar chart'}
      >
        {[0, 0.25, 0.5, 0.75, 1.0].map((ratio, i) => {
          const gridVal = minVal + valueRange * ratio;
          const y = getY(gridVal);
          return (
            <g key={i}>
              <line
                x1={paddingX}
                y1={y}
                x2={chartWidth - paddingX}
                y2={y}
                stroke={Math.abs(gridVal) < valueRange / 1000 ? '#475569' : '#1e2c40'}
                strokeDasharray={ratio === 0 ? undefined : '3 3'}
                strokeWidth={ratio === 0 ? '1.5' : '1'}
              />
              <text
                x={paddingX - 8}
                y={y + 4}
                fill="#64748b"
                fontSize="9"
                textAnchor="end"
                fontFamily="Space Grotesk, sans-serif"
              >
                {formatCurrency(gridVal)}
              </text>
            </g>
          );
        })}

        {data.map((item, idx) => {
          const groupCenterX = paddingX + idx * barGroupWidth + barGroupWidth / 2;
          const hasSecondary = item.secondaryValue !== undefined;
          const barWidth = hasSecondary ? barGroupWidth * 0.32 : barGroupWidth * 0.48;

          const item1Y = getY(item.value);
          const bar1Height = Math.max(1, Math.abs(zeroY - item1Y));
          const bar1Y = Math.min(zeroY, item1Y);
          const bar1X = hasSecondary ? groupCenterX - barWidth - 3 : groupCenterX - barWidth / 2;

          let bar2Height = 0;
          let bar2Y = 0;
          let bar2X = 0;
          if (hasSecondary && item.secondaryValue !== undefined) {
            const item2Y = getY(item.secondaryValue);
            bar2Height = Math.max(1, Math.abs(zeroY - item2Y));
            bar2Y = Math.min(zeroY, item2Y);
            bar2X = groupCenterX + 3;
          }

          const isHovered = hoveredIdx === idx;

          return (
            <g
              key={idx}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
              style={{ cursor: 'pointer' }}
            >
              {isHovered && (
                <rect
                  x={groupCenterX - barGroupWidth / 2 + 2}
                  y={paddingY}
                  width={barGroupWidth - 4}
                  height={usableHeight}
                  fill="#ffffff08"
                  rx="6"
                />
              )}

              <rect
                x={bar1X}
                y={bar1Y}
                width={barWidth}
                height={bar1Height}
                fill={primaryColor}
                rx="4"
                opacity={isHovered ? 1 : 0.9}
              />

              {hasSecondary && (
                <rect
                  x={bar2X}
                  y={bar2Y}
                  width={barWidth}
                  height={bar2Height}
                  fill={secondaryColor}
                  rx="4"
                  opacity={isHovered ? 1 : 0.9}
                />
              )}

              <text
                x={groupCenterX}
                y={paddingY + usableHeight + 17}
                fill={isHovered ? '#35d49a' : '#94a3b8'}
                fontSize="10"
                fontWeight={isHovered ? 'bold' : 'normal'}
                textAnchor="middle"
                fontFamily="Space Grotesk, sans-serif"
              >
                {item.label}
              </text>

              {isHovered && (
                <g>
                  <rect
                    x={Math.min(chartWidth - 140, Math.max(10, groupCenterX - 65))}
                    y={10}
                    width={130}
                    height={hasSecondary ? 46 : 30}
                    fill="#0f172a"
                    stroke="#334155"
                    strokeWidth="1"
                    rx="6"
                    filter="drop-shadow(0 4px 6px rgba(0,0,0,0.5))"
                  />
                  <text
                    x={Math.min(chartWidth - 140, Math.max(10, groupCenterX - 65)) + 65}
                    y={24}
                    fill="#35d49a"
                    fontSize="10"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    {primaryLegend}: {formatCurrency(item.value)}
                  </text>
                  {hasSecondary && item.secondaryValue !== undefined && (
                    <text
                      x={Math.min(chartWidth - 140, Math.max(10, groupCenterX - 65)) + 65}
                      y={42}
                      fill={secondaryColor}
                      fontSize="9"
                      textAnchor="middle"
                    >
                      {secondaryLegend}: {formatCurrency(item.secondaryValue)}
                    </text>
                  )}
                </g>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export interface AreaPoint {
  label: string;
  nominal: number;
  real?: number;
  contributions: number;
}

interface GrowthAreaChartProps {
  data: AreaPoint[];
  title?: string;
  height?: number;
}

export const GrowthAreaChart: React.FC<GrowthAreaChartProps> = ({
  data,
  title = 'Projected Compounding Growth',
  height = 240,
}) => {
  if (!data || data.length === 0) return null;

  const chartWidth = 560;
  const paddingX = 55;
  const paddingY = 30;
  const usableWidth = chartWidth - paddingX * 2;
  const usableHeight = height - paddingY * 2;

  let maxVal = 0;
  data.forEach((d) => {
    if (d.nominal > maxVal) maxVal = d.nominal;
    if (d.real && d.real > maxVal) maxVal = d.real;
  });
  if (maxVal === 0) maxVal = 1;

  const getX = (idx: number) => paddingX + (idx / (data.length - 1)) * usableWidth;
  const getY = (val: number) => paddingY + usableHeight - (val / maxVal) * usableHeight;

  const nominalPoints = data.map((d, i) => `${getX(i)},${getY(d.nominal)}`).join(' ');
  const realPoints = data.map((d, i) => `${getX(i)},${getY(d.real || 0)}`).join(' ');
  const contribPoints = data.map((d, i) => `${getX(i)},${getY(d.contributions)}`).join(' ');

  const nominalArea = `${nominalPoints} ${getX(data.length - 1)},${paddingY + usableHeight} ${getX(0)},${paddingY + usableHeight}`;
  const contribArea = `${contribPoints} ${getX(data.length - 1)},${paddingY + usableHeight} ${getX(0)},${paddingY + usableHeight}`;

  return (
    <div className="chart-container">
      <div className="chart-header">
        <h4>{title}</h4>
        <div className="chart-legends">
          <span className="legend-item">
            <span className="legend-dot" style={{ backgroundColor: '#35d49a' }} />
            Nominal Value
          </span>
          <span className="legend-item">
            <span className="legend-dot" style={{ backgroundColor: '#38bdf8' }} />
            Real (Inflation-Adjusted)
          </span>
          <span className="legend-item">
            <span className="legend-dot" style={{ backgroundColor: '#64748b' }} />
            Total Contributed
          </span>
        </div>
      </div>

      <svg
        viewBox={`0 0 ${chartWidth} ${height}`}
        className="financial-svg-chart"
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label="Portfolio growth curve"
      >
        {[0, 0.25, 0.5, 0.75, 1.0].map((ratio, i) => {
          const y = paddingY + usableHeight * (1 - ratio);
          return (
            <g key={i}>
              <line
                x1={paddingX}
                y1={y}
                x2={chartWidth - paddingX}
                y2={y}
                stroke="#1e2c40"
                strokeDasharray={ratio === 0 ? undefined : '3 3'}
              />
              <text
                x={paddingX - 8}
                y={y + 4}
                fill="#64748b"
                fontSize="9"
                textAnchor="end"
                fontFamily="Space Grotesk, sans-serif"
              >
                {formatCurrency(maxVal * ratio)}
              </text>
            </g>
          );
        })}

        <polygon points={nominalArea} fill="#35d49a15" />
        <polygon points={contribArea} fill="#64748b15" />

        <polyline points={nominalPoints} fill="none" stroke="#35d49a" strokeWidth="2.5" />
        <polyline points={realPoints} fill="none" stroke="#38bdf8" strokeWidth="2" strokeDasharray="4 4" />
        <polyline points={contribPoints} fill="none" stroke="#64748b" strokeWidth="1.5" />

        {data.map((d, i) => {
          if (i % Math.max(1, Math.floor(data.length / 6)) !== 0 && i !== data.length - 1) return null;
          const x = getX(i);
          return (
            <g key={i}>
              <circle cx={x} cy={getY(d.nominal)} r="3" fill="#35d49a" />
              <text
                x={x}
                y={paddingY + usableHeight + 16}
                fill="#94a3b8"
                fontSize="9"
                textAnchor="middle"
                fontFamily="Space Grotesk, sans-serif"
              >
                {d.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

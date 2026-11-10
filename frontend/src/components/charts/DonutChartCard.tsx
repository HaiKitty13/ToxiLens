import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { CHART_COLORS, ChartCard, ChartPlaceholder, hasAllValues, tooltipStyle, type ChartDatum } from './ChartCard';

interface DonutChartCardProps {
  title: string;
  description?: string;
  data: ChartDatum[];
}

export function DonutChartCard({ title, description, data }: DonutChartCardProps) {
  // `rows` is non-null only when every value has been provided.
  const rows = hasAllValues(data) ? data : null;
  const total = rows ? rows.reduce((sum, d) => sum + d.value, 0) : 0;

  return (
    <ChartCard title={title} description={description} placeholder={rows === null}>
      {rows ? (
        <div className="flex flex-col items-center gap-4 sm:flex-row">
          <div className="relative h-56 w-56 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={rows} dataKey="value" nameKey="name" innerRadius="62%" outerRadius="92%" paddingAngle={2} stroke="none">
                  {rows.map((d, i) => (
                    <Cell key={d.name} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-display text-2xl font-extrabold">{total.toLocaleString()}</span>
              <span className="text-xs text-muted-foreground">total</span>
            </div>
          </div>
          <ul className="w-full space-y-2 text-sm">
            {rows.map((d, i) => (
              <li key={d.name} className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} aria-hidden />
                  {d.name}
                </span>
                <span className="tabular-nums text-muted-foreground">
                  {d.value.toLocaleString()} ({total > 0 ? ((d.value / total) * 100).toFixed(1) : '0.0'}%)
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <ChartPlaceholder labels={data.map((d) => d.name)} />
      )}
    </ChartCard>
  );
}

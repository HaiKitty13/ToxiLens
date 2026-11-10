import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { CHART_COLORS, ChartCard, ChartPlaceholder, hasAllValues, tooltipStyle, type ChartDatum } from './ChartCard';

interface BarChartCardProps {
  title: string;
  description?: string;
  data: ChartDatum[];
}

export function BarChartCard({ title, description, data }: BarChartCardProps) {
  // `rows` is non-null only when every value has been provided.
  const rows = hasAllValues(data) ? data : null;

  return (
    <ChartCard title={title} description={description} placeholder={rows === null}>
      {rows ? (
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={rows} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
              <YAxis tickLine={false} axisLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'hsl(var(--muted))' }} />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {rows.map((d, i) => (
                  <Cell key={d.name} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <ChartPlaceholder labels={data.map((d) => d.name)} />
      )}
    </ChartCard>
  );
}

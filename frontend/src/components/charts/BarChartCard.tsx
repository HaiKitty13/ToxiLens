
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import {
  CHART_COLORS,
  ChartCard,
  ChartPlaceholder,
  hasAllValues,
  tooltipStyle,
  type ChartDatum,
} from './ChartCard';

interface BarChartCardProps {
  title: string;
  description?: string;
  data: ChartDatum[];
}

export function BarChartCard({
  title,
  description,
  data,
}: BarChartCardProps) {
  const rows = hasAllValues(data) ? data : null;

  return (
    <ChartCard
      title={title}
      description={description}
      placeholder={rows === null}
    >
      {rows ? (
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={rows}
              margin={{
                top: 4,
                right: 4,
                left: -16,
                bottom: 0,
              }}
            >
              <CartesianGrid
                vertical={false}
                stroke="hsl(var(--border))"
              />

              <XAxis
                dataKey="name"
                tickLine={false}
                axisLine={false}
                tick={{
                  fill: 'hsl(var(--muted-foreground))',
                  fontSize: 12,
                }}
              />

              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{
                  fill: 'hsl(var(--muted-foreground))',
                  fontSize: 12,
                }}
              />

              <Tooltip
                contentStyle={tooltipStyle}
                cursor={{
                  fill: 'hsl(var(--muted))',
                }}
                formatter={(value, _name, item) => {
                  const datum = item.payload as ChartDatum;
                  const count = Number(value).toLocaleString();

                  if (
                    datum.total !== undefined &&
                    datum.percentage !== undefined
                  ) {
                    return [
                      `${count} / ${datum.total.toLocaleString()} (${datum.percentage.toFixed(2)}%)`,
                      'Tweets with category',
                    ];
                  }

                  return [count, 'Tweets'];
                }}
              />

              <Bar
                dataKey="value"
                radius={[8, 8, 0, 0]}
              >
                {rows.map((datum, index) => (
                  <Cell
                    key={datum.name}
                    fill={
                      CHART_COLORS[
                        index % CHART_COLORS.length
                      ]
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <ChartPlaceholder
          labels={data.map((datum) => datum.name)}
        />
      )}
    </ChartCard>
  );
}

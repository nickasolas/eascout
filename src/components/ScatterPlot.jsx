import { ScatterChart, Scatter, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, Cell } from 'recharts'
import { gapColor } from '../utils'

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  const p = payload[0].payload
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border-hover)', borderRadius: 8, padding: '10px 12px', fontSize: 12 }}>
      <div style={{ fontWeight: 600, marginBottom: 4 }}>{p.name}</div>
      <div style={{ color: 'var(--text-muted)' }}>{p.club}</div>
      <div style={{ marginTop: 6, display: 'flex', gap: 12 }}>
        <span>OVR <strong style={{ color: 'var(--text)' }}>{p.overall}</strong></span>
        <span>POT <strong style={{ color: '#22c55e' }}>{p.potential}</strong></span>
        <span>+{p.gap}</span>
      </div>
    </div>
  )
}

export default function ScatterPlot({ players, onSelect }) {
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '20px 16px 12px' }}>
      <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 16 }}>
        OVR vs Potential — {players.length} players
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <ScatterChart margin={{ top: 4, right: 20, bottom: 8, left: 0 }}>
          <XAxis dataKey="overall" type="number" domain={[65, 74]} name="Overall"
            tick={{ fill: '#7b82a0', fontSize: 11 }} tickLine={false} axisLine={false}
            label={{ value: 'Overall', position: 'insideBottom', offset: -4, fill: '#4a5070', fontSize: 11 }} />
          <YAxis dataKey="potential" type="number" domain={[80, 86]} name="Potential"
            tick={{ fill: '#7b82a0', fontSize: 11 }} tickLine={false} axisLine={false}
            label={{ value: 'Potential', angle: -90, position: 'insideLeft', offset: 10, fill: '#4a5070', fontSize: 11 }} />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.08)' }} />
          <ReferenceLine stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />
          <Scatter data={players} onClick={onSelect}>
            {players.map(p => (
              <Cell key={p.id} fill={gapColor(p.gap)} fillOpacity={0.85} />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
      <div style={{ display: 'flex', gap: 16, justifyContent: 'center', fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
        <span><span style={{ color: '#22c55e' }}>●</span> Gap 15+</span>
        <span><span style={{ color: '#f59e0b' }}>●</span> Gap 12–14</span>
        <span><span style={{ color: '#7b82a0' }}>●</span> Gap 9–11</span>
      </div>
    </div>
  )
}

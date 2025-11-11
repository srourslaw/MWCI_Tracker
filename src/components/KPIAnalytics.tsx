import { motion } from 'framer-motion'
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
  FunnelChart,
  Funnel,
  LabelList,
} from 'recharts'
import { KPI } from '../types/kpi'
import { TrendingUp, PieChartIcon, BarChart3, Target, AlertCircle, Activity } from 'lucide-react'

interface KPIAnalyticsProps {
  kpis: KPI[]
}

const COLORS = {
  primary: ['#0ea5e9', '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef'],
  status: {
    completed: '#10b981',
    inProgress: '#f59e0b',
    notStarted: '#ef4444',
    pending: '#6b7280',
    passed: '#22c55e',
    failed: '#dc2626',
  },
  phases: {
    dev: '#0ea5e9',
    sit: '#8b5cf6',
    uat: '#f59e0b',
    prod: '#10b981',
  },
}

export default function KPIAnalytics({ kpis }: KPIAnalyticsProps) {
  // Category Distribution Data
  const categoryData = Object.entries(
    kpis.reduce((acc, kpi) => {
      acc[kpi.category] = (acc[kpi.category] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value }))

  // Phase Completion Data
  const phaseCompletionData = [
    {
      name: 'DEV',
      completion: Math.round(kpis.reduce((sum, kpi) => sum + kpi.devCompletion, 0) / kpis.length),
      fill: COLORS.phases.dev,
    },
    {
      name: 'SIT',
      completion: Math.round(kpis.reduce((sum, kpi) => sum + kpi.sitCompletion, 0) / kpis.length),
      fill: COLORS.phases.sit,
    },
    {
      name: 'UAT',
      completion: Math.round(kpis.reduce((sum, kpi) => sum + kpi.uatCompletion, 0) / kpis.length),
      fill: COLORS.phases.uat,
    },
    {
      name: 'PROD',
      completion: Math.round(kpis.reduce((sum, kpi) => sum + kpi.prodCompletion, 0) / kpis.length),
      fill: COLORS.phases.prod,
    },
  ]

  // Status Breakdown by Phase
  const getStatusCounts = (phase: 'devStatus' | 'sitStatus' | 'uatStatus' | 'prodStatus') => {
    const counts = kpis.reduce((acc, kpi) => {
      const status = kpi[phase]
      acc[status] = (acc[status] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    return counts
  }

  const devStatusData = Object.entries(getStatusCounts('devStatus')).map(([name, count]) => ({
    status: name,
    count,
  }))

  // Development Pipeline Funnel
  const pipelineFunnelData = [
    {
      name: 'Total KPIs',
      value: kpis.length,
      fill: COLORS.phases.dev,
    },
    {
      name: 'DEV Complete',
      value: kpis.filter((k) => k.devStatus === 'Completed' || k.devStatus === 'Ready for SIT').length,
      fill: COLORS.phases.dev,
    },
    {
      name: 'SIT Passed',
      value: kpis.filter((k) => k.sitStatus === 'Passed').length,
      fill: COLORS.phases.sit,
    },
    {
      name: 'UAT Passed',
      value: kpis.filter((k) => k.uatStatus === 'Passed').length,
      fill: COLORS.phases.uat,
    },
    {
      name: 'PROD Passed',
      value: kpis.filter((k) => k.prodStatus === 'Passed').length,
      fill: COLORS.phases.prod,
    },
  ]

  // Customer Dependency Analysis
  const dependencyData = Object.entries(
    kpis.reduce((acc, kpi) => {
      const status = kpi.customerDependencyStatus || 'None'
      acc[status] = (acc[status] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  )
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8) // Top 8 dependency statuses

  // Phase Progress Over Categories
  const categoryPhaseData = categoryData.map((cat) => {
    const categoryKPIs = kpis.filter((k) => k.category === cat.name)
    return {
      category: cat.name,
      DEV: Math.round(categoryKPIs.reduce((sum, k) => sum + k.devCompletion, 0) / categoryKPIs.length),
      SIT: Math.round(categoryKPIs.reduce((sum, k) => sum + k.sitCompletion, 0) / categoryKPIs.length),
      UAT: Math.round(categoryKPIs.reduce((sum, k) => sum + k.uatCompletion, 0) / categoryKPIs.length),
      PROD: Math.round(categoryKPIs.reduce((sum, k) => sum + k.prodCompletion, 0) / categoryKPIs.length),
    }
  })

  // Signoff Status Distribution
  const signoffData = Object.entries(
    kpis.reduce((acc, kpi) => {
      acc[kpi.signoffStatus] = (acc[kpi.signoffStatus] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value }))

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-morphism p-3 rounded-lg border border-sky-200 shadow-lg">
          <p className="text-slate-800 font-semibold">{payload[0].name}</p>
          <p className="text-sky-600 font-bold text-lg">{payload[0].value}</p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-morphism rounded-2xl p-6"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-gradient-to-br from-sky-500 to-blue-600 rounded-lg">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800">KPI Analytics Dashboard</h2>
        </div>
        <p className="text-slate-600">
          Comprehensive visualization of {kpis.length} KPIs across all development phases
        </p>
      </motion.div>

      {/* Row 1: Phase Completion Radial + Development Funnel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Phase Completion Radial Bars */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-morphism rounded-2xl p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-5 h-5 text-sky-600" />
            <h3 className="text-lg font-bold text-slate-800">Phase Completion Overview</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <RadialBarChart
              cx="50%"
              cy="50%"
              innerRadius="10%"
              outerRadius="90%"
              data={phaseCompletionData}
              startAngle={90}
              endAngle={-270}
            >
              <RadialBar
                background
                dataKey="completion"
                cornerRadius={10}
                label={{ position: 'insideStart', fill: '#fff', fontWeight: 'bold' }}
              />
              <Legend
                iconSize={10}
                layout="horizontal"
                verticalAlign="bottom"
                align="center"
                wrapperStyle={{ paddingTop: '20px' }}
              />
              <Tooltip content={<CustomTooltip />} />
            </RadialBarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Development Pipeline Funnel */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-morphism rounded-2xl p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-sky-600" />
            <h3 className="text-lg font-bold text-slate-800">Development Pipeline</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <FunnelChart>
              <Tooltip content={<CustomTooltip />} />
              <Funnel dataKey="value" data={pipelineFunnelData} isAnimationActive>
                <LabelList position="right" fill="#000" stroke="none" dataKey="name" />
                <LabelList position="center" fill="#fff" stroke="none" dataKey="value" />
              </Funnel>
            </FunnelChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Row 2: Category Distribution + Signoff Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Distribution Donut Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-morphism rounded-2xl p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <PieChartIcon className="w-5 h-5 text-sky-600" />
            <h3 className="text-lg font-bold text-slate-800">KPI Distribution by Category</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                outerRadius={100}
                innerRadius={60}
                fill="#8884d8"
                dataKey="value"
                animationBegin={0}
                animationDuration={800}
              >
                {categoryData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS.primary[index % COLORS.primary.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Signoff Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-morphism rounded-2xl p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="w-5 h-5 text-sky-600" />
            <h3 className="text-lg font-bold text-slate-800">Customer Signoff Status</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={signoffData}
                cx="50%"
                cy="50%"
                labelLine={true}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                animationBegin={0}
                animationDuration={800}
              >
                {signoffData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      entry.name === 'Approved'
                        ? COLORS.status.completed
                        : entry.name === 'Submitted'
                        ? COLORS.status.inProgress
                        : COLORS.status.pending
                    }
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Row 3: Phase Progress by Category (Stacked Area) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="glass-morphism rounded-2xl p-6"
      >
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-5 h-5 text-sky-600" />
          <h3 className="text-lg font-bold text-slate-800">Phase Progress by Category</h3>
        </div>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={categoryPhaseData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              dataKey="category"
              angle={-45}
              textAnchor="end"
              height={100}
              tick={{ fill: '#475569', fontSize: 12 }}
            />
            <YAxis tick={{ fill: '#475569' }} label={{ value: 'Completion %', angle: -90, position: 'insideLeft' }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ paddingTop: '20px' }} />
            <Bar dataKey="DEV" stackId="a" fill={COLORS.phases.dev} radius={[0, 0, 0, 0]} />
            <Bar dataKey="SIT" stackId="a" fill={COLORS.phases.sit} radius={[0, 0, 0, 0]} />
            <Bar dataKey="UAT" stackId="a" fill={COLORS.phases.uat} radius={[0, 0, 0, 0]} />
            <Bar dataKey="PROD" stackId="a" fill={COLORS.phases.prod} radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Row 4: DEV Status Breakdown + Customer Dependency */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* DEV Status Breakdown */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className="glass-morphism rounded-2xl p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-sky-600" />
            <h3 className="text-lg font-bold text-slate-800">DEV Status Breakdown</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={devStatusData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="status" angle={-45} textAnchor="end" height={100} tick={{ fill: '#475569', fontSize: 11 }} />
              <YAxis tick={{ fill: '#475569' }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" fill={COLORS.phases.dev} radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Customer Dependency Analysis */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.7 }}
          className="glass-morphism rounded-2xl p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="w-5 h-5 text-orange-600" />
            <h3 className="text-lg font-bold text-slate-800">Customer Dependency Status</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dependencyData} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={120} tick={{ fill: '#475569', fontSize: 10 }} />
              <YAxis tick={{ fill: '#475569' }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" fill="#f97316" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </div>
  )
}

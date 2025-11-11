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

  // Phase Completion Data with detailed metrics
  const calculatePhaseMetrics = (phase: 'dev' | 'sit' | 'uat' | 'prod') => {
    const completionField = `${phase}Completion` as 'devCompletion' | 'sitCompletion' | 'uatCompletion' | 'prodCompletion'
    const avgCompletion = Math.round(kpis.reduce((sum, kpi) => sum + kpi[completionField], 0) / kpis.length)
    const fullyCompleted = kpis.filter(kpi => kpi[completionField] === 100).length
    const inProgress = kpis.filter(kpi => kpi[completionField] > 0 && kpi[completionField] < 100).length
    const notStarted = kpis.filter(kpi => kpi[completionField] === 0).length

    return { avgCompletion, fullyCompleted, inProgress, notStarted, total: kpis.length }
  }

  const devMetrics = calculatePhaseMetrics('dev')
  const sitMetrics = calculatePhaseMetrics('sit')
  const uatMetrics = calculatePhaseMetrics('uat')
  const prodMetrics = calculatePhaseMetrics('prod')

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

  // Development Pipeline with conversion rates
  const totalKPIs = kpis.length
  const devComplete = kpis.filter((k) => k.devStatus === 'Completed' || k.devStatus === 'Ready for SIT').length
  const sitPassed = kpis.filter((k) => k.sitStatus === 'Passed').length
  const uatPassed = kpis.filter((k) => k.uatStatus === 'Passed').length
  const prodPassed = kpis.filter((k) => k.prodStatus === 'Passed').length

  const pipelineFunnelData = [
    {
      name: 'Total KPIs',
      value: totalKPIs,
      fill: '#64748b',
      percentage: 100,
    },
    {
      name: 'DEV Complete',
      value: devComplete,
      fill: COLORS.phases.dev,
      percentage: totalKPIs > 0 ? Math.round((devComplete / totalKPIs) * 100) : 0,
    },
    {
      name: 'SIT Passed',
      value: sitPassed,
      fill: COLORS.phases.sit,
      percentage: totalKPIs > 0 ? Math.round((sitPassed / totalKPIs) * 100) : 0,
    },
    {
      name: 'UAT Passed',
      value: uatPassed,
      fill: COLORS.phases.uat,
      percentage: totalKPIs > 0 ? Math.round((uatPassed / totalKPIs) * 100) : 0,
    },
    {
      name: 'PROD Deployed',
      value: prodPassed,
      fill: COLORS.phases.prod,
      percentage: totalKPIs > 0 ? Math.round((prodPassed / totalKPIs) * 100) : 0,
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
        {/* Phase Completion Radial Bars - Enhanced */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-morphism rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-sky-600" />
              <h3 className="text-lg font-bold text-slate-800">Phase Completion Overview</h3>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500">Overall Progress</p>
              <p className="text-2xl font-bold text-sky-600">
                {Math.round((devMetrics.avgCompletion + sitMetrics.avgCompletion + uatMetrics.avgCompletion + prodMetrics.avgCompletion) / 4)}%
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {/* DEV Phase */}
            <div className="bg-white/50 rounded-lg p-4 border border-sky-100">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS.phases.dev }}></div>
                  <span className="font-semibold text-slate-800">DEV</span>
                </div>
                <span className="text-2xl font-bold text-sky-600">{devMetrics.avgCompletion}%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${devMetrics.avgCompletion}%` }}
                  transition={{ duration: 1, delay: 0.2 }}
                  className="h-full rounded-full"
                  style={{ background: `linear-gradient(90deg, ${COLORS.phases.dev}, #06b6d4)` }}
                />
              </div>
              <div className="flex justify-between mt-2 text-xs text-slate-600">
                <span>✓ {devMetrics.fullyCompleted} Completed</span>
                <span>⟳ {devMetrics.inProgress} In Progress</span>
                <span>○ {devMetrics.notStarted} Not Started</span>
              </div>
            </div>

            {/* SIT Phase */}
            <div className="bg-white/50 rounded-lg p-4 border border-purple-100">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS.phases.sit }}></div>
                  <span className="font-semibold text-slate-800">SIT</span>
                </div>
                <span className="text-2xl font-bold text-purple-600">{sitMetrics.avgCompletion}%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${sitMetrics.avgCompletion}%` }}
                  transition={{ duration: 1, delay: 0.4 }}
                  className="h-full rounded-full"
                  style={{ background: `linear-gradient(90deg, ${COLORS.phases.sit}, #a855f7)` }}
                />
              </div>
              <div className="flex justify-between mt-2 text-xs text-slate-600">
                <span>✓ {sitMetrics.fullyCompleted} Passed</span>
                <span>⟳ {sitMetrics.inProgress} Testing</span>
                <span>○ {sitMetrics.notStarted} Pending</span>
              </div>
            </div>

            {/* UAT Phase */}
            <div className="bg-white/50 rounded-lg p-4 border border-orange-100">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS.phases.uat }}></div>
                  <span className="font-semibold text-slate-800">UAT</span>
                </div>
                <span className="text-2xl font-bold text-orange-600">{uatMetrics.avgCompletion}%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${uatMetrics.avgCompletion}%` }}
                  transition={{ duration: 1, delay: 0.6 }}
                  className="h-full rounded-full"
                  style={{ background: `linear-gradient(90deg, ${COLORS.phases.uat}, #fb923c)` }}
                />
              </div>
              <div className="flex justify-between mt-2 text-xs text-slate-600">
                <span>✓ {uatMetrics.fullyCompleted} Passed</span>
                <span>⟳ {uatMetrics.inProgress} Testing</span>
                <span>○ {uatMetrics.notStarted} Pending</span>
              </div>
            </div>

            {/* PROD Phase */}
            <div className="bg-white/50 rounded-lg p-4 border border-green-100">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS.phases.prod }}></div>
                  <span className="font-semibold text-slate-800">PROD</span>
                </div>
                <span className="text-2xl font-bold text-green-600">{prodMetrics.avgCompletion}%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${prodMetrics.avgCompletion}%` }}
                  transition={{ duration: 1, delay: 0.8 }}
                  className="h-full rounded-full"
                  style={{ background: `linear-gradient(90deg, ${COLORS.phases.prod}, #22c55e)` }}
                />
              </div>
              <div className="flex justify-between mt-2 text-xs text-slate-600">
                <span>✓ {prodMetrics.fullyCompleted} Deployed</span>
                <span>⟳ {prodMetrics.inProgress} In Progress</span>
                <span>○ {prodMetrics.notStarted} Pending</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Development Pipeline - Enhanced */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-morphism rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-sky-600" />
              <h3 className="text-lg font-bold text-slate-800">Development Pipeline</h3>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500">Success Rate</p>
              <p className="text-2xl font-bold text-green-600">
                {totalKPIs > 0 ? Math.round((prodPassed / totalKPIs) * 100) : 0}%
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {pipelineFunnelData.map((stage, index) => (
              <motion.div
                key={stage.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
                className="relative"
              >
                <div className="bg-white/50 rounded-lg p-4 border border-slate-200 hover:border-sky-300 transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div
                        className="flex items-center justify-center w-8 h-8 rounded-full text-white font-bold text-sm"
                        style={{ backgroundColor: stage.fill }}
                      >
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-800">{stage.name}</h4>
                        <p className="text-xs text-slate-500">{stage.percentage}% of total</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold" style={{ color: stage.fill }}>
                        {stage.value}
                      </p>
                      <p className="text-xs text-slate-500">KPIs</p>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden mt-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${stage.percentage}%` }}
                      transition={{ duration: 1, delay: 0.3 + index * 0.1 }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: stage.fill }}
                    />
                  </div>
                </div>

                {/* Conversion arrow */}
                {index < pipelineFunnelData.length - 1 && (
                  <div className="flex items-center justify-center my-1">
                    <div className="flex items-center gap-2 bg-slate-100 px-3 py-1 rounded-full">
                      <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                      </svg>
                      <span className="text-xs font-semibold text-slate-600">
                        {stage.value > 0 && pipelineFunnelData[index + 1]
                          ? `${Math.round((pipelineFunnelData[index + 1].value / stage.value) * 100)}%`
                          : '0%'}
                      </span>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          {/* Pipeline Summary */}
          <div className="mt-4 pt-4 border-t border-slate-200">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-xs text-slate-500">Drop-off Rate</p>
                <p className="text-xl font-bold text-red-600">
                  {totalKPIs > 0 ? Math.round(((totalKPIs - prodPassed) / totalKPIs) * 100) : 0}%
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-slate-500">In Pipeline</p>
                <p className="text-xl font-bold text-orange-600">{totalKPIs - prodPassed}</p>
              </div>
            </div>
          </div>
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

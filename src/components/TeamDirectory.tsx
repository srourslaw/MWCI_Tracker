import { useState } from 'react'
import { motion } from 'framer-motion'
import { Users, Search, Mail, Briefcase, Building2 } from 'lucide-react'
import { TEAM_MEMBERS, getDepartments } from '../data/teamMembers'

export default function TeamDirectory() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDepartment, setSelectedDepartment] = useState<string>('All')

  const departments = ['All', ...getDepartments()]

  const filteredMembers = TEAM_MEMBERS.filter(member => {
    const matchesSearch =
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.role.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesDepartment =
      selectedDepartment === 'All' || member.department === selectedDepartment

    return matchesSearch && matchesDepartment
  })

  return (
    <div className="glass-morphism rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <Users className="w-6 h-6 text-sky-600" />
        <h3 className="text-2xl font-bold text-slate-800">Team Directory</h3>
        <span className="ml-auto text-sm text-slate-600">
          {filteredMembers.length} members
        </span>
      </div>

      {/* Search and Filter */}
      <div className="mb-6 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search team members..."
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 transition"
          />
        </div>

        {/* Department Filter */}
        <div className="flex gap-2 flex-wrap">
          {departments.map(dept => (
            <button
              key={dept}
              onClick={() => setSelectedDepartment(dept)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                selectedDepartment === dept
                  ? 'bg-sky-500 text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:border-sky-300'
              }`}
            >
              {dept}
            </button>
          ))}
        </div>
      </div>

      {/* Team Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredMembers.map((member, index) => (
          <motion.div
            key={member.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-md transition"
          >
            <div className="flex items-start gap-3">
              {/* Avatar */}
              <div className={`flex-shrink-0 w-12 h-12 rounded-full ${
                member.isAdmin
                  ? 'bg-gradient-to-br from-orange-500 to-red-500'
                  : 'bg-gradient-to-br from-sky-500 to-blue-600'
              } flex items-center justify-center text-white font-bold text-lg shadow-md`}>
                {member.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-slate-800 font-semibold truncate">
                    {member.name}
                  </h4>
                  {member.isAdmin && (
                    <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs font-semibold rounded">
                      Admin
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1 text-sky-600 text-sm mt-1">
                  <Briefcase className="w-3 h-3" />
                  <span className="truncate">{member.role}</span>
                </div>

                <div className="flex items-center gap-1 text-slate-500 text-sm mt-1">
                  <Building2 className="w-3 h-3" />
                  <span>{member.department}</span>
                </div>

                <div className="flex items-center gap-1 text-slate-400 text-xs mt-2">
                  <Mail className="w-3 h-3" />
                  <span className="truncate">{member.email}</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredMembers.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-600">No team members found</p>
          <p className="text-slate-400 text-sm mt-1">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  )
}

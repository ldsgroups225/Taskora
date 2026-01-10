import * as React from 'react'
import { motion } from 'framer-motion'
import {
  BarChart3,
  Users,
  Zap,
  Target,
  Trophy,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Progress } from '~/components/ui/progress'
import { cn } from '~/lib/utils'

export function WarRoom() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.02 }}
      className="p-4 md:p-8 space-y-6"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Project Overview</h1>
          <p className="text-slate-500">Taskora Intelligent Insights</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-emerald-500/10 border-emerald-500/20 text-emerald-400 px-3 py-1 font-bold">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse mr-2" />
            ON TRACK
          </Badge>
          <Badge variant="secondary" className="bg-white/5 border-white/10 text-slate-300 px-3 py-1 font-mono">
            V2.4.0-BETA
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6">
        {/* Bento Stats */}
        <Card className="col-span-1 md:col-span-2 bg-linear-to-br from-indigo-500/10 to-purple-500/10 border-white/10 rounded-3xl relative overflow-hidden group">
          <CardContent className="p-6">
            <div className="absolute top-0 right-0 p-6 opacity-20 group-hover:opacity-40 transition-opacity">
              <Zap className="w-24 h-24 text-indigo-400" />
            </div>
            <div className="relative">
              <p className="text-slate-400 text-sm font-medium">Velocity Score</p>
              <h2 className="text-4xl font-bold text-white mt-1">94.2</h2>
              <div className="flex items-center gap-1.5 mt-2 text-emerald-400 text-sm font-bold">
                <TrendingUp className="w-4 h-4" />
                +12% this week
              </div>
              <div className="mt-8 flex gap-2">
                {[1, 2, 3, 4, 5, 6, 7].map(i => (
                  <div key={i} className="grow h-12 bg-white/10 rounded items-end flex overflow-hidden">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${Math.random() * 80 + 20}%` }}
                      className="w-full bg-indigo-500/40"
                    />
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10 rounded-3xl hover:bg-white/8 transition-colors cursor-pointer group">
          <CardContent className="p-6">
            <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
            </div>
            <p className="text-slate-400 text-sm font-medium">Total Risks</p>
            <h2 className="text-3xl font-bold text-white mt-1">3</h2>
            <p className="text-slate-500 text-xs mt-2 font-mono">Predicted by Gemini AI</p>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10 rounded-3xl p-6 hover:bg-white/8 transition-colors cursor-pointer group">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Users className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-slate-400 text-sm font-medium">Active Agents</p>
          <h2 className="text-3xl font-bold text-white mt-1">8</h2>
          <p className="text-slate-500 text-xs mt-2">Running orchestration</p>
        </Card>

        {/* Deliverables Grid */}
        <Card className="col-span-1 md:col-span-3 bg-white/5 border-white/10 rounded-3xl overflow-hidden flex flex-col">
          <CardHeader className="p-6 border-b border-white/10 flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base font-bold text-white flex items-center gap-2">
              <Target className="w-5 h-5 text-indigo-400" />
              High Priority Deliverables
            </CardTitle>
            <Button variant="ghost" size="sm" className="text-indigo-400 text-xs font-bold hover:bg-indigo-500/10 flex items-center gap-1 p-0 px-2">
              VIEW ROADMAP <ArrowUpRight className="w-3 h-3" />
            </Button>
          </CardHeader>
          <CardContent className="p-0 divide-y divide-white/5 overflow-y-auto">
            {['Agentic UI Overhaul', 'Convex Migration', 'Real-time Sync'].map((item, i) => (
              <div key={i} className="px-6 py-4 flex items-center justify-between hover:bg-white/2 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-lg bg-indigo-600/20 flex items-center justify-center text-indigo-400 font-bold text-xs">
                    {i + 1}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white tracking-tight">{item}</p>
                    <p className="text-xs text-slate-500">Assigned to AI Orchestrator</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="hidden sm:flex items-center gap-1.5">
                    <Zap className="w-3 h-3 text-yellow-500" />
                    <span className="text-xs font-bold text-slate-400">85% Confidence</span>
                  </div>
                  <Progress value={80 - i * 15} className="w-24 h-1.5" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-indigo-600 rounded-3xl p-6 text-white border-0 flex flex-col justify-between shadow-2xl shadow-indigo-500/20 relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-125 transition-transform duration-500">
            <Trophy className="w-32 h-32" />
          </div>
          <div className="relative">
            <h3 className="font-bold text-lg leading-tight">Sprint Goal Achieved?</h3>
            <p className="text-indigo-100 text-sm mt-2 font-medium bg-white/10 w-fit px-2 py-0.5 rounded">Prediction: YES</p>
          </div>
          <Button variant="secondary" className="mt-8 bg-white text-indigo-600 hover:bg-indigo-50 rounded-xl text-xs font-bold transition-colors z-10 w-full">
            VIEW ANALYTICS
          </Button>
        </Card>
      </div>
    </motion.div>
  )
}

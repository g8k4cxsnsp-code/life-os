'use client'

import { useId } from 'react'
import { motion } from 'framer-motion'
import {
  DndContext, closestCenter, PointerSensor, KeyboardSensor,
  useSensor, useSensors, type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy,
  useSortable, arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useStore, useTodayLog, useTodayGoals } from '@/lib/store'
import { getTodayWeekday, getTimeGreeting, getWorkoutLabel } from '@/lib/schedule'
import { getCurrentStreak, getWeeklyCompletionPercent } from '@/lib/streaks'
import { toLocalDateString } from '@/lib/date'
import { ProgressRing } from '@/components/dashboard/ProgressRing'
import { StatCard } from '@/components/dashboard/StatCard'
import { QuoteCard } from '@/components/dashboard/QuoteCard'
import { GoalCard } from '@/components/goals/GoalCard'
import { RecoveryDay } from '@/components/goals/RecoveryDay'
import { sumMacros } from '@/lib/nutrition/calc'
import { DEFAULT_SETTINGS } from '@/lib/store/defaults'
import { useMounted } from '@/lib/useMounted'

function SortableGoalCard({
  goal,
  completed,
  onToggle,
  workoutLabel,
}: {
  goal: import('@/types').Goal
  completed: boolean
  onToggle: () => void
  workoutLabel?: string
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: goal.id })
  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 10 : undefined,
        position: isDragging ? 'relative' : undefined,
      }}
    >
      <GoalCard
        goal={goal}
        completed={completed}
        onToggle={onToggle}
        workoutLabel={workoutLabel}
        dragHandleProps={{ ...attributes, ...listeners } as React.HTMLAttributes<HTMLButtonElement>}
      />
    </div>
  )
}

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04 } },
}

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
}

export default function DashboardPage() {
  const mounted = useMounted()
  const dndId = useId()
  const { settings, history, goals, meals, toggleGoal, updateDayLog, reorderGoals } = useStore()

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const ids = todayGoals.map((g) => g.id)
    const oldIndex = ids.indexOf(active.id as string)
    const newIndex = ids.indexOf(over.id as string)
    if (oldIndex !== -1 && newIndex !== -1) {
      reorderGoals(arrayMove(ids, oldIndex, newIndex))
    }
  }

  // Safe accessors — if a stale persisted payload ever bypasses our `merge`,
  // we still won't crash on `targets.kcal` / `schedule[weekday]`.
  const targets = settings?.targets ?? DEFAULT_SETTINGS.targets
  const schedule = settings?.schedule ?? DEFAULT_SETTINGS.schedule
  const name = settings?.name ?? DEFAULT_SETTINGS.name

  const today = toLocalDateString(new Date())
  const todayLog = useTodayLog()
  const todayGoals = useTodayGoals()
  const weekday = getTodayWeekday()
  const isRestDay = mounted && weekday === 'sunday'

  const streak = getCurrentStreak(history, goals, settings)
  const weeklyPct = getWeeklyCompletionPercent(history, goals, settings)

  const completed = todayGoals.filter((g) => !!todayLog.completed[g.id])
  const progressPct = todayGoals.length === 0 ? 0 : Math.round((completed.length / todayGoals.length) * 100)

  const todayMeals = meals.filter((m) => m.date === today)
  const { kcal } = sumMacros(todayMeals)
  const waterL = todayLog.waterL ?? 0

  // Time-of-day greeting + locale date depend on the user's clock & timezone,
  // so only compute them after mount — otherwise SSR (UTC) and CSR disagree
  // and Next 15 can throw a hydration error.
  const greeting = mounted ? getTimeGreeting(name) : `Hello, ${name}.`
  const workoutType = schedule[weekday] ?? 'rest'
  const workoutLabel = `Complete ${getWorkoutLabel(workoutType)}`

  const dateLabel = mounted
    ? new Date().toLocaleDateString('en-ZA', { weekday: 'long', month: 'long', day: 'numeric' })
    : ''

  return (
    <div className="relative min-h-dvh px-4 py-8 lg:px-8 max-w-2xl mx-auto">
      {/* Background halos */}
      <motion.div
        animate={{ x: [0, 20, 0], y: [0, -15, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
        className="fixed top-0 right-0 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse, rgba(255,45,135,0.06) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }}
      />
      <motion.div
        animate={{ x: [0, -20, 0], y: [0, 20, 0] }}
        transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut', delay: 5 }}
        className="fixed bottom-0 left-0 w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse, rgba(122,92,255,0.06) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }}
      />

      <motion.div variants={container} initial="hidden" animate="show" className="relative space-y-6">
        {/* Greeting */}
        <motion.div variants={item}>
          <p className="text-white/40 text-sm mb-1">{dateLabel}</p>
          <h1 className="text-3xl font-black text-white leading-tight">
            {greeting}
          </h1>
          {!isRestDay && (
            <p className="text-white/50 text-base mt-1">Your goals for today.</p>
          )}
        </motion.div>

        {/* Recovery day override */}
        {isRestDay ? (
          <motion.div variants={item}>
            <RecoveryDay />
          </motion.div>
        ) : (
          <>
            {/* Progress ring + stats */}
            <motion.div variants={item} className="flex flex-col sm:flex-row gap-4 items-center sm:items-start">
              <div className="flex flex-col items-center gap-2">
                <ProgressRing
                  percent={progressPct}
                  size={148}
                  color="#FF2D87"
                  label="Daily Progress"
                  sublabel={`${completed.length} / ${todayGoals.length} done`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3 flex-1 w-full sm:w-auto">
                <StatCard
                  label="Streak"
                  value={streak}
                  unit="days"
                  color="#FF2D87"
                  icon="🔥"
                  subtext="consecutive"
                />
                <StatCard
                  label="This week"
                  value={`${weeklyPct}%`}
                  color="#C6FF3D"
                  icon="📈"
                  subtext="completed"
                />
                <StatCard
                  label="Calories"
                  value={kcal}
                  unit={`/ ${targets.kcal}`}
                  color="#C026FF"
                  icon="🍽️"
                  progress={(kcal / targets.kcal) * 100}
                />
                <StatCard
                  label="Water"
                  value={waterL.toFixed(2)}
                  unit={`/ ${targets.waterL}L`}
                  color="#00E5FF"
                  icon="💧"
                  progress={(waterL / targets.waterL) * 100}
                  actionLabel="+ Glass"
                  onAction={() => {
                    // Read the freshest waterL straight from the store —
                    // closing over `todayLog` would make rapid taps overwrite
                    // each other with the same stale base value.
                    const current = useStore.getState().history[today]?.waterL ?? 0
                    updateDayLog(today, {
                      waterL: Math.round((current + 0.25) * 100) / 100,
                    })
                  }}
                />
              </div>
            </motion.div>

            {/* Today's goals */}
            <motion.div variants={item}>
              <p className="text-white/30 text-xs font-semibold uppercase tracking-widest mb-3">
                Today&rsquo;s Goals
              </p>
              <DndContext id={dndId} sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={todayGoals.map((g) => g.id)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-2.5">
                    {todayGoals.map((goal) => (
                      <SortableGoalCard
                        key={goal.id}
                        goal={goal}
                        completed={!!todayLog.completed[goal.id]}
                        onToggle={() => toggleGoal(goal.id, today)}
                        workoutLabel={goal.id === 'goal-workout' ? workoutLabel : undefined}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>

              {todayGoals.length === 0 && (
                <div className="text-center py-12 text-white/30">
                  <p className="text-lg">No goals for today.</p>
                  <p className="text-sm mt-1">Add goals in Settings.</p>
                </div>
              )}
            </motion.div>
          </>
        )}

        {/* Daily quote */}
        <motion.div variants={item}>
          <QuoteCard />
        </motion.div>
      </motion.div>
    </div>
  )
}

"use client"

import { useEffect } from "react"
import { driver } from "driver.js"
import "driver.js/dist/driver.css"

const STEPS = [
  {
    element: "[data-tour='daily-goal']",
    popover: {
      title: "Daily & Weekly Goals",
      description: "Set a daily block target and watch the bar fill up as you complete learning blocks.",
    },
  },
  {
    element: "[data-tour='xp-display']",
    popover: {
      title: "XP & Level",
      description: "Earn XP by completing blocks, passing quizzes, and keeping your streak. Level up as you go.",
    },
  },
  {
    element: "[data-tour='streak']",
    popover: {
      title: "Daily Streak",
      description: "Log in and study every day to build your streak. Earn bonuses at 7 and 30 days!",
    },
  },
  {
    element: "[data-tour='nav-learning']",
    popover: {
      title: "Curriculum",
      description: "12 months of structured JavaScript content, broken into weekly blocks with quizzes.",
    },
  },
  {
    element: "[data-tour='nav-training']",
    popover: {
      title: "Training",
      description: "Add external courses you're taking and run live coding exercises to practise your skills.",
    },
  },
  {
    element: "[data-tour='nav-roadmap']",
    popover: {
      title: "Roadmap",
      description: "Explore visual skill roadmaps and track your progress on each topic.",
    },
  },
  {
    element: "[data-tour='nav-progress']",
    popover: {
      title: "Progress & Achievements",
      description: "View your activity calendar, unlock achievements, and see your full history.",
    },
  },
  {
    element: "[data-tour='body-double']",
    popover: {
      title: "Body-Double Mode",
      description: "Study alongside others in real time — see how many people are currently focused with you.",
    },
  },
]

function startTour() {
  const d = driver({
    showProgress: true,
    steps: STEPS,
    popoverClass: "devfluent-tour",
    onDestroyed: () => {
      localStorage.setItem("tour_seen", "1")
    },
  })
  d.drive()
}

export function AppTour({ autoStart = false }: { autoStart?: boolean }) {
  useEffect(() => {
    const handler = () => startTour()
    window.addEventListener("start-tour", handler)
    return () => window.removeEventListener("start-tour", handler)
  }, [])

  useEffect(() => {
    if (!autoStart || localStorage.getItem("tour_seen")) return
    const t = setTimeout(startTour, 800)
    return () => clearTimeout(t)
  }, [autoStart])

  return null
}

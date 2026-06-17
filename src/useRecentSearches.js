import { useEffect, useRef } from 'react'
import { DEFAULT_FILTERS } from './utils'

const KEY = 'fc26_recent_searches'
const MAX = 4

function isDefault(filters) {
  return Object.keys(DEFAULT_FILTERS).every(k => filters[k] === DEFAULT_FILTERS[k])
}

function summarise(filters) {
  const parts = []
  if (filters.position) parts.push(filters.position)
  if (filters.search) parts.push(`"${filters.search}"`)
  if (filters.nationality) parts.push(filters.nationality)
  if (filters.league) parts.push(filters.league)
  if (filters.foot) parts.push(`${filters.foot} foot`)
  if (filters.minAge !== DEFAULT_FILTERS.minAge || filters.maxAge !== DEFAULT_FILTERS.maxAge)
    parts.push(`Age ${filters.minAge}–${filters.maxAge}`)
  if (filters.minOvr !== DEFAULT_FILTERS.minOvr || filters.maxOvr !== DEFAULT_FILTERS.maxOvr)
    parts.push(`OVR ${filters.minOvr}–${filters.maxOvr}`)
  if (filters.minPot !== DEFAULT_FILTERS.minPot || filters.maxPot !== DEFAULT_FILTERS.maxPot)
    parts.push(`POT ${filters.minPot}–${filters.maxPot}`)
  if (filters.minGap > 0) parts.push(`Gap +${filters.minGap}+`)
  return parts.join(' · ') || 'All players'
}

export function loadRecent() {
  try { return JSON.parse(localStorage.getItem(KEY)) || [] }
  catch { return [] }
}

function saveRecent(entry) {
  const prev = loadRecent().filter(e => e.label !== entry.label)
  const next = [entry, ...prev].slice(0, MAX)
  localStorage.setItem(KEY, JSON.stringify(next))
}

export function useRecentSearches(filters, resultCount) {
  const timer = useRef(null)

  useEffect(() => {
    if (isDefault(filters)) return
    clearTimeout(timer.current)
    timer.current = setTimeout(() => {
      saveRecent({
        label: summarise(filters),
        filters,
        resultCount,
        ts: Date.now(),
      })
    }, 1500)
    return () => clearTimeout(timer.current)
  }, [filters, resultCount])
}

// 赛程引擎 —— 生成各联赛轮次时间表 + 玩家球队赛程
import { TEAMS, LEAGUES } from '../data/leagues.js'
import { shuffle, randInt, clamp } from './util.js'

// 各联赛赛季起止月份（虚构但贴近现实）
const LEAGUE_WINDOW = {
  CSL: { start: [3, 1], end: [11, 30], rounds: 30, name: '3月-11月' },   // 中超春季-秋季
  CSL2: { start: [4, 1], end: [11, 15], rounds: 30, name: '4月-11月' },
  EPL: { start: [8, 10], end: [5, 22], rounds: 38, name: '8月-次年5月' },
  LALIGA: { start: [8, 12], end: [5, 25], rounds: 38, name: '8月-次年5月' },
  BUNDES: { start: [8, 16], end: [5, 18], rounds: 34, name: '8月-次年5月' },
  SERIEA: { start: [8, 17], end: [5, 24], rounds: 38, name: '8月-次年5月' },
  LIGUE1: { start: [8, 11], end: [5, 22], rounds: 34, name: '8月-次年5月' },
}

// 按起止月份分配轮次日期
function distributeRounds(start, end, rounds, year) {
  // 把跨年赛季转为连续天数
  const startMs = new Date(year, start[0] - 1, start[1]).getTime()
  const endMs = new Date(year + (end[0] < start[0] ? 1 : 0), end[0] - 1, end[1]).getTime()
  const totalDays = Math.max(1, Math.round((endMs - startMs) / 86400000))
  const step = totalDays / (rounds - 1)
  const dates = []
  for (let i = 0; i < rounds; i++) {
    const ms = startMs + Math.round(step * i) * 86400000
    const d = new Date(ms)
    dates.push({ month: d.getMonth() + 1, day: d.getDate(), weekday: d.getDay() })
  }
  return dates
}

const WEEKDAY_CN = ['日', '一', '二', '三', '四', '五', '六']

// 为玩家球队生成赛程：每轮一个对手 + 日期 + 主客场
export function generateSchedule(leagueCode, playerTeamName, year) {
  const teams = TEAMS.filter(t => t.league === leagueCode)
  const opponents = teams.filter(t => t.name !== playerTeamName)
  const win = LEAGUE_WINDOW[leagueCode] || LEAGUE_WINDOW.CSL
  const rounds = win.rounds
  const dates = distributeRounds(win.start, win.end, rounds, year)
  // 双循环：每个对手主客各一次
  const pairs = []
  for (const opp of opponents) {
    pairs.push({ opp: opp.name, home: true, oppStrength: opp.strength })
    pairs.push({ opp: opp.name, home: false, oppStrength: opp.strength })
  }
  // 不足轮次则重复打乱；超出则截断
  let arranged = shuffle(pairs)
  while (arranged.length < rounds) {
    arranged = arranged.concat(shuffle(pairs))
  }
  arranged = arranged.slice(0, rounds)
  const fixtures = arranged.map((p, i) => ({
    round: i + 1,
    date: dates[i],
    dateStr: `${dates[i].month}月${dates[i].day}日 周${WEEKDAY_CN[dates[i].weekday]}`,
    opponent: p.opp,
    home: p.home,
    oppStrength: p.oppStrength,
    isPlayer: true,
  }))
  return {
    leagueCode,
    leagueName: LEAGUES[leagueCode]?.name || '',
    leagueShort: LEAGUES[leagueCode]?.short || '',
    window: win.name,
    rounds,
    fixtures,
  }
}

// 生成"本轮"信息（基于赛季事件索引推算当前轮次）
export function currentRoundInfo(schedule, eventIndex) {
  if (!schedule || !schedule.fixtures.length) return null
  // 每个比赛事件对应一轮
  const idx = clamp(eventIndex, 0, schedule.fixtures.length - 1)
  return schedule.fixtures[idx]
}

// 各联赛概览（用于赛程总览页）
export function leagueOverviews() {
  return Object.entries(LEAGUES).map(([code, lg]) => {
    const win = LEAGUE_WINDOW[code] || LEAGUE_WINDOW.CSL
    const teamCount = TEAMS.filter(t => t.league === code).length
    return {
      code,
      name: lg.name,
      short: lg.short,
      country: lg.country,
      color: lg.color,
      window: win.name,
      rounds: win.rounds,
      teamCount,
    }
  })
}

export { WEEKDAY_CN }

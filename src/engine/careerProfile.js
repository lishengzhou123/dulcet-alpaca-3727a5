// 生涯档案引擎 —— 完整记录球员从青训到退役的俱乐部数据、荣誉、国家队记录
import { LEAGUES } from '../data/leagues.js'

// 构建完整生涯档案
// player: 玩家对象
// careerLog: state.careerLog
// 返回 { personal, clubs, totals, honors, international, timeline }
export function buildCareerProfile(player, careerLog) {
  if (!player) return null

  // ===== 个人信息 =====
  const personal = {
    name: player.name,
    position: player.position,
    nationality: player.nationality || '中国',
    age: player.age,
    height: player.height,
    weight: player.weight,
    preferredFoot: player.preferredFoot,
    weakFoot: player.weakFoot,
    skillMoves: player.skillMoves,
    ovr: player.ovr,
    value: player.value,
    potential: player.potential,
    reputation: player.reputation,
    academy: player.academy,
    birthYear: player.birthYear,
    archetype: player.archetype,
    playStyles: player.playStyles || [],
    perks: player.perks || [],
  }

  // ===== 按俱乐部聚合统计 =====
  const clubMap = new Map()
  for (const log of careerLog) {
    const key = log.team
    if (!clubMap.has(key)) {
      clubMap.set(key, {
        team: log.team,
        league: log.league,
        seasons: [],
        apps: 0,
        goals: 0,
        assists: 0,
        startAge: log.age,
        endAge: log.age,
        startYear: log.year,
        endYear: log.year,
      })
    }
    const club = clubMap.get(key)
    club.seasons.push(log)
    club.apps += log.apps || 0
    club.goals += log.goals || 0
    club.assists += log.assists || 0
    club.endAge = log.age
    club.endYear = log.year
  }
  const clubs = Array.from(clubMap.values()).sort((a, b) => a.startYear - b.startYear)

  // ===== 生涯总计 =====
  const totals = {
    clubs: clubs.length,
    seasons: careerLog.length,
    apps: clubs.reduce((s, c) => s + c.apps, 0),
    goals: clubs.reduce((s, c) => s + c.goals, 0),
    assists: clubs.reduce((s, c) => s + c.assists, 0),
    caps: player.caps || 0,
    intlGoals: player.intlGoals || 0,
  }
  // 场均进球率
  totals.goalPerGame = totals.apps > 0 ? (totals.goals / totals.apps).toFixed(2) : '0.00'
  totals.assistPerGame = totals.apps > 0 ? (totals.assists / totals.apps).toFixed(2) : '0.00'

  // ===== 荣誉分组 =====
  const allHonors = (player.honors || []).slice().sort((a, b) => {
    // 按年份排序，无年份的排最后
    const ya = a.season || 9999
    const yb = b.season || 9999
    return ya - yb
  })
  const honorGroups = {
    world: { label: '🌍 世界级荣誉', icon: '🏆', items: [] },
    continental: { label: '🌐 洲际荣誉', icon: '🥇', items: [] },
    team: { label: '🏴 俱乐部团队荣誉', icon: '🏅', items: [] },
    individual: { label: '⭐ 个人荣誉', icon: '🎖️', items: [] },
    intl: { label: '🏳️ 国家队荣誉', icon: '🎽', items: [] },
  }
  for (const h of allHonors) {
    const type = h.type || 'team'
    if (honorGroups[type]) {
      honorGroups[type].items.push(h)
    } else {
      honorGroups.team.items.push(h)
    }
  }
  // 荣誉计数
  const honorCount = {
    gold: allHonors.filter(h => h.tier === 'gold').length,
    silver: allHonors.filter(h => h.tier === 'silver').length,
    bronze: allHonors.filter(h => h.tier === 'bronze').length,
    total: allHonors.length,
  }

  // ===== 国家队记录 =====
  const international = {
    nationality: player.nationality || '中国',
    caps: player.caps || 0,
    goals: player.intlGoals || 0,
    history: player.intlHistory || [],
    locked: player.nationLocked || false,
  }
  // 国家队进球率
  international.goalPerGame = international.caps > 0 ? (international.goals / international.caps).toFixed(2) : '0.00'

  // ===== 生涯时间线 =====
  const timeline = careerLog.map(log => ({
    year: log.year,
    age: log.age,
    team: log.team,
    league: log.league,
    ovr: log.ovr,
    value: log.value,
    goals: log.goals,
    assists: log.assists,
    apps: log.apps,
    rating: log.rating,
    leaguePos: log.leaguePos,
    honors: log.honors || [],
    nationalTeam: log.nationalTeam,
    promoted: log.promoted,
    relegated: log.relegated,
    clubCups: log.clubCups || [],
  }))

  // ===== 俱乐部杯赛汇总 =====
  const cupMap = new Map()
  for (const log of careerLog) {
    if (!log.clubCups || !log.clubCups.length) continue
    for (const c of log.clubCups) {
      if (!cupMap.has(c.code)) {
        cupMap.set(c.code, {
          code: c.code,
          name: c.name,
          short: c.short,
          icon: c.icon,
          apps: 0,
          goals: 0,
          assists: 0,
          titles: 0, // 冠军数
          runnerUps: 0,
          bestPos: 99,
          participations: 0,
        })
      }
      const cup = cupMap.get(c.code)
      cup.apps += c.apps || 0
      cup.goals += c.goals || 0
      cup.assists += c.assists || 0
      cup.participations += 1
      if (c.finalPos === 1) cup.titles += 1
      else if (c.finalPos === 2) cup.runnerUps += 1
      if (c.finalPos && c.finalPos < cup.bestPos) cup.bestPos = c.finalPos
    }
  }
  const clubCups = Array.from(cupMap.values()).sort((a, b) => b.titles - a.titles || a.bestPos - b.bestPos)

  // ===== 生涯阶段判定 =====
  let stage = ''
  if (player.age <= 17) stage = '青训新星'
  else if (player.age <= 20) stage = '职业新星'
  else if (player.age <= 23) stage = '上升期'
  else if (player.age <= 27) stage = '巅峰期'
  else if (player.age <= 31) stage = '成熟期'
  else if (player.age <= 35) stage = '生涯后期'
  else stage = '老将暮年'

  // ===== 生涯评级 =====
  let rating = ''
  const goldCount = honorCount.gold
  if (goldCount >= 10 || (player.ovr >= 90 && totals.goals >= 200)) rating = '传奇 Legend'
  else if (goldCount >= 5 || (player.ovr >= 85 && totals.goals >= 100)) rating = '世界级 World Class'
  else if (goldCount >= 2 || player.ovr >= 80) rating = '顶级球员'
  else if (player.ovr >= 72) rating = '职业主力'
  else if (player.ovr >= 65) rating = '职业球员'
  else rating = '年轻球员'

  return {
    personal,
    clubs,
    totals,
    honorGroups,
    honorCount,
    international,
    timeline,
    clubCups,
    stage,
    rating,
  }
}

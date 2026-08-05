// 生涯编排引擎：赛季事件构建、转会窗、荣誉判定、国家队

import { ALL_POOLS, pickEvents } from '../data/events.js'
import { TEAMS, LEAGUES, reachableLeagues } from '../data/leagues.js'
import { clamp, randInt, shuffle } from './util.js'

// 构建一个赛季的事件队列
export function buildSeason(player, usedIds) {
  const team = TEAMS.find(t => t.name === player.team) || TEAMS[0]
  const leagueTeams = TEAMS.filter(t => t.league === team.league && t.name !== team.name)
  const makeOpp = () => leagueTeams.length ? leagueTeams[randInt(0, leagueTeams.length - 1)] : { name: '热身对手', strength: 60 }
  // 每次调用返回带新鲜对手的上下文；非match事件会忽略opponent
  const makeCtx = () => ({ player, season: { age: player.age }, team, opponent: makeOpp() })

  // 1 场赛前训练
  const pre = pickEvents([ALL_POOLS.preseason], 1, usedIds, makeCtx)
  // 2-3 场比赛关键时刻（开场/半场/补时/定位球等）
  const keyCount = clamp(2 + Math.floor(player.age / 10), 2, 3)
  const keys = pickEvents([ALL_POOLS.keymoment], keyCount, usedIds, makeCtx)
  // 3-5 场比赛决策（年龄越大越多）
  const matchCount = clamp(3 + Math.floor(player.age / 8), 3, 5)
  const matches = pickEvents([ALL_POOLS.match], matchCount, usedIds, makeCtx)
  // 1-2 场人际关系
  const relCount = player.age <= 18 ? 2 : 1
  const rels = pickEvents([ALL_POOLS.relationship], relCount, usedIds, makeCtx)
  // 媒体与生活各 1
  const media = pickEvents([ALL_POOLS.media], 1, usedIds, makeCtx)
  const life = pickEvents([ALL_POOLS.life], 1, usedIds, makeCtx)
  // 突发事故 1-2（年龄越大比赛越多越易受伤；16岁小将也可能撞上）
  const incidentCount = clamp(1 + Math.floor(Math.random() * 2), 1, 2)
  const incidents = pickEvents([ALL_POOLS.incident], incidentCount, usedIds, makeCtx)
  // 流动转会传闻 1-2（赛季中随时可能出现）
  const transferCount = clamp(1 + Math.floor(Math.random() * 2), 1, 2)
  const transfers = pickEvents([ALL_POOLS.transfer], transferCount, usedIds, makeCtx)

  // 交错排列：pre → (key/match/rel/extra/incident/transfer 交替) → 兜底
  // 关键时刻与比赛决策交替出现，模拟"一场比赛中的多个决策点"
  const interleaved = [...pre]
  const extras = [...media, ...life]
  const pattern = ['key', 'match', 'rel', 'incident', 'key', 'match', 'extra', 'transfer', 'key', 'match', 'rel', 'match', 'extra']
  let ki = 0, mi = 0, ri = 0, ei = 0, ii = 0, ti = 0
  for (const s of pattern) {
    if (s === 'key' && ki < keys.length) interleaved.push(keys[ki++])
    else if (s === 'match' && mi < matches.length) interleaved.push(matches[mi++])
    else if (s === 'rel' && ri < rels.length) interleaved.push(rels[ri++])
    else if (s === 'extra' && ei < extras.length) interleaved.push(extras[ei++])
    else if (s === 'incident' && ii < incidents.length) interleaved.push(incidents[ii++])
    else if (s === 'transfer' && ti < transfers.length) interleaved.push(transfers[ti++])
  }
  // 兜底：把剩余全部塞入
  while (ki < keys.length) interleaved.push(keys[ki++])
  while (mi < matches.length) interleaved.push(matches[mi++])
  while (ri < rels.length) interleaved.push(rels[ri++])
  while (ei < extras.length) interleaved.push(extras[ei++])
  while (ii < incidents.length) interleaved.push(incidents[ii++])
  while (ti < transfers.length) interleaved.push(transfers[ti++])

  // 为比赛类事件（match/keymoment）分配轮次与比赛时间
  // 用一个简化的轮次生成器：每场比赛递增轮次
  let matchSeq = 0
  // 基础日期从8月开始（或3月，中超），每场间隔约7天
  const isCSL = team.league === 'CSL' || team.league === 'CSL2'
  const baseMonth = isCSL ? 3 : 8
  const baseYear = player.birthYear + player.age
  const weekdayCN = ['日','一','二','三','四','五','六']
  interleaved.forEach(ev => {
    if (ev.type === 'match') {
      matchSeq += 1
      const d = new Date(baseYear, baseMonth - 1, 1 + matchSeq * 7)
      ev.round = matchSeq
      ev.dateStr = `${d.getMonth() + 1}月${d.getDate()}日 周${weekdayCN[d.getDay()]}`
      // 主客场轮替
      ev.home = matchSeq % 2 === 1
      ev.opponentName = ev.title?.split(' vs ')[1] || '对手'
    }
  })

  interleaved.forEach(e => usedIds.add(e.id))

  return {
    age: player.age,
    year: player.birthYear + player.age,
    team: player.team,
    league: player.teamLeague,
    events: interleaved,
    eventIndex: 0,
    matchSeq: 0,
  }
}

// 生成夏窗转会报价
export function generateTransferOffers(player) {
  const offers = []
  const currentTeam = TEAMS.find(t => t.name === player.team)
  const reach = reachableLeagues(player.ovr, player.reputation)
  // 候选球队：可达联赛 + 实力匹配（不与当前队差距过大）
  let candidates = TEAMS.filter(t => {
    if (t.name === player.team) return false
    if (!reach.includes(t.league)) return false
    // 球队实力与球员OVR匹配：球队实力 <= ovr+15 且 >= ovr-20
    const diff = t.strength - player.ovr
    return diff <= 18 && diff >= -22
  })
  // 偏好更高声望/更接近实力的球队
  candidates = shuffle(candidates).sort((a, b) => Math.abs(b.strength - player.ovr - 4) - Math.abs(a.strength - player.ovr - 4))
  const numOffers = clamp(2 + Math.floor(player.reputation / 25) + (player.ovr >= 78 ? 1 : 0), 1, 4)
  for (const t of candidates.slice(0, numOffers)) {
    // 转会费：基于身价上下浮动
    const fee = Math.round(player.value * (0.7 + Math.random() * 0.7) / 100000) * 100000
    const salary = Math.round((300000 + (t.strength - 60) * 80000 + player.ovr * 12000) * (0.8 + Math.random() * 0.5) / 10000) * 10000
    const repGain = clamp((t.reputation - (currentTeam ? currentTeam.reputation : 60)) * 0.5, -5, 20)
    offers.push({
      team: t.name,
      league: t.league,
      leagueName: LEAGUES[t.league].name,
      country: t.country,
      teamStrength: t.strength,
      teamReputation: t.reputation,
      fee,
      salary,
      repGain: Math.round(repGain),
      contractYears: 3 + randInt(0, 2),
      starPlayers: t.starPlayers.slice(0, 3),
    })
  }
  return offers
}

// 荣誉判定（FC26 风格完整奖项列表）
export function evaluateHonors(player, leagueResult, seasonStats, extra = {}) {
  const honors = []
  if (!leagueResult || !leagueResult.playerRow) return honors
  const pos = leagueResult.playerRow.pos
  const total = leagueResult.standings.length
  const leagueName = leagueResult.league.short
  const year = leagueResult.year
  const goals = seasonStats.goals
  const assists = seasonStats.assists
  const rating = seasonStats.rating
  const apps = seasonStats.apps
  const isTopLeague = ['EPL', 'LALIGA', 'BUNDES', 'SERIEA', 'LIGUE1'].includes(leagueResult.leagueCode)

  // ===== 团队荣誉 =====
  if (pos === 1) honors.push({ type: 'team', tier: 'gold', text: `${leagueName} 冠军 (${player.team})`, season: year, icon: '🏆', category: 'league' })
  else if (pos === 2) honors.push({ type: 'team', tier: 'silver', text: `${leagueName} 亚军 (${player.team})`, season: year, icon: '🥈', category: 'league' })
  else if (pos === 3) honors.push({ type: 'team', tier: 'bronze', text: `${leagueName} 季军 (${player.team})`, season: year, icon: '🥉', category: 'league' })
  if (leagueResult.promoted) honors.push({ type: 'team', tier: 'silver', text: `随队升入 ${LEAGUES[leagueResult.leagueCode === 'CSL2' ? 'CSL' : leagueResult.leagueCode].short}`, season: year, icon: '⬆️', category: 'promotion' })
  if (leagueResult.relegated) honors.push({ type: 'team', tier: 'bronze', text: `从${leagueName}降级`, season: year, icon: '⬇️', category: 'relegation' })

  // ===== 联赛个人荣誉 =====
  // 金靴（联赛进球最多）
  const leagueTopGoalscorer = (goals >= (isTopLeague ? 22 : 16)) || (goals >= (isTopLeague ? 18 : 13) && Math.random() < 0.5)
  if (leagueTopGoalscorer) {
    honors.push({ type: 'individual', tier: 'gold', text: `${leagueName} 金靴 (${goals}球)`, season: year, icon: '👟', category: 'league' })
  } else if (goals >= (isTopLeague ? 15 : 11)) {
    honors.push({ type: 'individual', tier: 'silver', text: `${leagueName} 银靴 (${goals}球)`, season: year, icon: '🥈', category: 'league' })
  } else if (goals >= (isTopLeague ? 10 : 8)) {
    honors.push({ type: 'individual', tier: 'bronze', text: `${leagueName} 铜靴 (${goals}球)`, season: year, icon: '🥉', category: 'league' })
  }
  // 助攻王
  const topAssister = (assists >= (isTopLeague ? 15 : 11)) || (assists >= (isTopLeague ? 11 : 8) && Math.random() < 0.4)
  if (topAssister) honors.push({ type: 'individual', tier: 'gold', text: `${leagueName} 助攻王 (${assists}次)`, season: year, icon: '🎯', category: 'league' })
  // 联赛 MVP（评选条件：冠军队或前三 + 高评分 + 核心数据）
  const leagueMVPChance = clamp((rating - 7.0) * 10 + (goals + assists) * 0.8 + (pos <= 3 ? 20 : 0) + (player.ovr - 75), 0, 90)
  if (Math.random() * 100 < leagueMVPChance) {
    honors.push({ type: 'individual', tier: 'gold', text: `${leagueName} 最有价值球员 (MVP)`, season: year, icon: '👑', category: 'league' })
  }
  // 联赛最佳年轻球员（U23）
  if (player.age <= 23 && rating >= 7.0 && player.ovr >= 70 && Math.random() < 0.45) {
    honors.push({ type: 'individual', tier: 'gold', text: `${leagueName} 最佳年轻球员 (U23)`, season: year, icon: '🌟', category: 'league' })
  }
  // 最佳门将（GK + 零封）
  if (player.position === 'GK' && rating >= 7.2 && apps >= 20 && Math.random() < 0.4) {
    honors.push({ type: 'individual', tier: 'gold', text: `${leagueName} 最佳门将 (金手套)`, season: year, icon: '🧤', category: 'league' })
  }
  // 联赛最佳阵容
  if (rating >= 7.2 && apps >= 18 && (pos <= 6 || Math.random() < 0.5)) {
    honors.push({ type: 'individual', tier: 'silver', text: `${leagueName} 赛季最佳阵容 (${player.position})`, season: year, icon: '⭐', category: 'league' })
  }

  // ===== 洲际俱乐部荣誉（欧冠/亚冠/欧联） =====
  if (player.ovr >= 80 && isTopLeague && pos <= 4) {
    // 欧冠
    const championsLeagueWin = Math.random() < 0.08
    if (championsLeagueWin) {
      honors.push({ type: 'continental', tier: 'gold', text: `欧洲冠军联赛冠军 (${player.team})`, season: year, icon: '🏆', category: 'ucl' })
      // 欧冠最佳球员/射手
      if (Math.random() < 0.3) honors.push({ type: 'continental', tier: 'gold', text: `欧冠赛季最佳球员`, season: year, icon: '👑', category: 'ucl' })
      if (goals >= 8 && Math.random() < 0.35) honors.push({ type: 'continental', tier: 'gold', text: `欧冠最佳射手 (${Math.min(goals, 15)}球)`, season: year, icon: '👟', category: 'ucl' })
    } else if (Math.random() < 0.15) {
      honors.push({ type: 'continental', tier: 'silver', text: `欧冠四强 (${player.team})`, season: year, icon: '🔝', category: 'ucl' })
    }
    // 欧联
    if (Math.random() < 0.08) honors.push({ type: 'continental', tier: 'gold', text: `欧罗巴联赛冠军 (${player.team})`, season: year, icon: '🏆', category: 'uel' })
  }
  if (['CSL', 'J1', 'K1', 'SaudiL'].includes(leagueResult.leagueCode) && pos <= 2) {
    if (Math.random() < 0.15) honors.push({ type: 'continental', tier: 'gold', text: `亚冠联赛冠军 (${player.team})`, season: year, icon: '🏆', category: 'acl' })
  }

  // ===== 国家队荣誉 =====
  if (player.caps >= 15) {
    if (Math.random() < 0.05) {
      honors.push({ type: 'world', tier: 'gold', text: `世界杯冠军 (${player.nationality})`, season: year, icon: '🏆', category: 'worldcup' })
      if (Math.random() < 0.25 && goals >= 15) honors.push({ type: 'world', tier: 'gold', text: `世界杯金靴`, season: year, icon: '👟', category: 'worldcup' })
      if (Math.random() < 0.2) honors.push({ type: 'world', tier: 'gold', text: `世界杯金球奖`, season: year, icon: '👑', category: 'worldcup' })
    } else if (Math.random() < 0.08) {
      honors.push({ type: 'world', tier: 'silver', text: `世界杯四强 (${player.nationality})`, season: year, icon: '🔝', category: 'worldcup' })
    }
    // 欧洲杯/美洲杯/亚洲杯
    const continentalName = ({'英格兰':'欧洲杯','法国':'欧洲杯','德国':'欧洲杯','西班牙':'欧洲杯','意大利':'欧洲杯','葡萄牙':'欧洲杯','荷兰':'欧洲杯','巴西':'美洲杯','阿根廷':'美洲杯','中国':'亚洲杯','日本':'亚洲杯','韩国':'亚洲杯'})[player.nationality]
    if (continentalName && Math.random() < 0.07) {
      honors.push({ type: 'continental', tier: 'gold', text: `${continentalName}冠军 (${player.nationality})`, season: year, icon: '🏆', category: 'continental_nt' })
    }
  }

  // ===== 世界级个人荣誉 =====
  // 金球奖
  const ballonDorPoints = clamp(
    (rating - 7.0) * 8 + (goals + assists * 0.7) * 0.6 + (player.ovr - 80) * 1.2
    + (pos === 1 ? 10 : pos <= 3 ? 5 : 0) + (honors.filter(h => h.category === 'ucl' && h.tier === 'gold').length ? 15 : 0)
    + (honors.filter(h => h.category === 'worldcup' && h.tier === 'gold').length ? 20 : 0),
    0, 100
  )
  if (player.ovr >= 91 && rating >= 8.1 && goals + assists >= 35 && Math.random() * 100 < ballonDorPoints * 0.35) {
    honors.push({ type: 'world', tier: 'gold', text: `金球奖 🏆`, season: year, icon: '🏆', category: 'ballondor', prestige: 100 })
  } else if (player.ovr >= 88 && rating >= 7.7 && goals + assists >= 25 && Math.random() * 100 < ballonDorPoints * 0.25) {
    honors.push({ type: 'world', tier: 'silver', text: `金球奖 第二名 (银球)`, season: year, icon: '🥈', category: 'ballondor', prestige: 90 })
  } else if (player.ovr >= 85 && rating >= 7.5 && goals + assists >= 20 && Math.random() * 100 < ballonDorPoints * 0.2) {
    honors.push({ type: 'world', tier: 'bronze', text: `金球奖 第三名 (铜球)`, season: year, icon: '🥉', category: 'ballondor', prestige: 80 })
  } else if (player.ovr >= 82 && rating >= 7.3 && goals + assists >= 15 && Math.random() < 0.35) {
    honors.push({ type: 'world', tier: 'bronze', text: `金球奖候选 (Top 10)`, season: year, icon: '🔝', category: 'ballondor', prestige: 60 })
  }
  // 世界足球先生 (FIFA The Best)
  if (player.ovr >= 89 && rating >= 7.9 && goals + assists >= 28 && Math.random() < 0.12) {
    honors.push({ type: 'world', tier: 'gold', text: `FIFA世界足球先生`, season: year, icon: '🏆', category: 'thebest', prestige: 98 })
  }
  // PFA/FIFPRO 年度最佳阵容
  if (rating >= 7.6 && apps >= 22 && (isTopLeague || player.ovr >= 78) && Math.random() < 0.28) {
    honors.push({ type: 'world', tier: 'silver', text: `FIFPRO 世界年度最佳阵容 (${player.position})`, season: year, icon: '⭐', category: 'fifpro', prestige: 85 })
  }
  // 欧洲金靴（跨联赛对比）
  if (leagueTopGoalscorer && goals >= 30 && isTopLeague && Math.random() < 0.25) {
    honors.push({ type: 'continental', tier: 'gold', text: `欧洲金靴 (${goals}球)`, season: year, icon: '👟', category: 'europeangolden', prestige: 92 })
  }
  // 欧足联最佳球员
  if (player.ovr >= 88 && isTopLeague && Math.random() < 0.1) {
    honors.push({ type: 'continental', tier: 'gold', text: `欧足联年度最佳球员`, season: year, icon: '👑', category: 'uefaplayer', prestige: 95 })
  }

  // ===== 国内杯赛荣誉 =====
  if (pos <= 5 && Math.random() < 0.12) {
    honors.push({ type: 'team', tier: 'gold', text: `国内杯赛冠军 (${player.team})`, season: year, icon: '🏆', category: 'domesticcup' })
  }
  if (pos <= 6 && Math.random() < 0.08) {
    honors.push({ type: 'team', tier: 'silver', text: `国内超级杯冠军 (${player.team})`, season: year, icon: '🏆', category: 'supercup' })
  }

  return honors
}

// 国家队征召
export function nationalTeamCheck(player) {
  // 18岁起，OVR与声望达标则被征召
  if (player.age < 17) return { called: false }
  const chance = clamp((player.ovr - 62) * 3 + (player.reputation - 30) * 0.6, 0, 90)
  if (Math.random() * 100 < chance) {
    const caps = randInt(2, 8)
    const intlGoals = ['ST', 'CF', 'LW', 'RW', 'CAM'].includes(player.position)
      ? Math.round(caps * clamp((player.attrs.finishing - 55) * 0.02, 0.05, 0.8))
      : randInt(0, 1)
    return { called: true, caps, intlGoals }
  }
  return { called: false }
}

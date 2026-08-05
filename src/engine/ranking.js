// 身价排行榜引擎 —— 真实球员 + 玩家 混合排名（随年份动态变化）
import { STAR_PLAYERS, playersByLeague, dynamicStarValue, dynamicStarAge, dynamicStarOvr, dynamicStarBio } from '../data/starPlayers.js'
import { TEAMS } from '../data/leagues.js'
import { clamp } from './util.js'

// 生成某联赛身价排行榜（含玩家）
// player: 玩家对象（可选）
// topN: 返回前N条
// year: 当前赛季年份（用于动态身价计算）
export function buildRanking(leagueCode, player = null, topN = 20, year = 2024) {
  const stars = playersByLeague(leagueCode).map((p, i) => {
    const baseVal = dynamicStarValue(p, year)
    // 加上小幅波动模拟赛季内表现起伏
    const factor = 0.92 + ((i * 13 + year) % 16) / 100 // 0.92-1.07
    return {
      name: p.name,
      team: p.team,
      pos: p.pos,
      age: dynamicStarAge(p, year),
      ovr: dynamicStarOvr(p, year),
      value: Math.round(baseVal * factor),
      nation: p.nation,
      traits: p.traits,
      bio: dynamicStarBio(p, year),
      isPlayer: false,
    }
  })
  const all = [...stars]
  if (player && player.teamLeague === leagueCode) {
    all.push({
      name: player.name,
      team: player.team,
      pos: player.position,
      age: player.age,
      ovr: player.ovr,
      value: player.value,
      nation: player.nationality || '中国',
      traits: player.playStyles || [],
      bio: buildPlayerBio(player),
      isPlayer: true,
    })
  }
  // 按身价降序
  all.sort((a, b) => b.value - a.value)
  const ranked = all.map((p, i) => ({ ...p, rank: i + 1 }))
  return ranked.slice(0, topN)
}

// 全联赛身价总榜（Top N，含玩家）
export function buildGlobalRanking(player = null, topN = 50, year = 2024) {
  const stars = STAR_PLAYERS.map((p, i) => {
    const baseVal = dynamicStarValue(p, year)
    const factor = 0.92 + ((i * 17 + year) % 16) / 100
    return {
      name: p.name,
      team: p.team,
      league: p.league,
      pos: p.pos,
      age: dynamicStarAge(p, year),
      ovr: dynamicStarOvr(p, year),
      value: Math.round(baseVal * factor),
      nation: p.nation,
      traits: p.traits,
      bio: dynamicStarBio(p, year),
      isPlayer: false,
    }
  })
  const all = [...stars]
  if (player) {
    all.push({
      name: player.name,
      team: player.team,
      league: player.teamLeague,
      pos: player.position,
      age: player.age,
      ovr: player.ovr,
      value: player.value,
      nation: player.nationality || '中国',
      traits: player.playStyles || [],
      bio: buildPlayerBio(player),
      isPlayer: true,
    })
  }
  all.sort((a, b) => b.value - a.value)
  const ranked = all.map((p, i) => ({ ...p, rank: i + 1 }))
  return ranked.slice(0, topN)
}

// 玩家在联赛中的排名
export function playerLeagueRank(leagueCode, player, year = 2024) {
  const ranking = buildRanking(leagueCode, player, 999, year)
  const me = ranking.find(p => p.isPlayer)
  return me ? me.rank : null
}

// 生成玩家动态简介（根据生涯阶段、荣誉、数据）
export function buildPlayerBio(player) {
  if (!player) return ''
  const age = player.age
  const ovr = player.ovr
  const team = player.team
  const pos = player.position
  const nat = player.nationality || '中国'
  const stats = player.careerStats || { apps: 0, goals: 0, assists: 0 }
  const honors = player.honors || []
  const topHonor = honors.find(h => h.tier === 'gold') || honors[0]
  // 阶段描述
  let stage = ''
  if (age <= 17) stage = '刚步入职业足坛的青训小将，前途无量。'
  else if (age <= 20) stage = '在一线队站稳脚跟的年轻新星，正持续兑现天赋。'
  else if (age <= 23) stage = '已成长为球队重要一员，步入职业生涯上升期。'
  else if (age <= 27) stage = '正值当打之年，处于职业生涯巅峰期。'
  else if (age <= 31) stage = '经验丰富的球队核心，状态稳定。'
  else if (age <= 35) stage = '步入生涯后期，凭借经验仍是球队关键球员。'
  else stage = '职业生涯暮年的老将，足坛常青树。'

  // 实力评价
  let level = ''
  if (ovr >= 88) level = '世界级球星'
  else if (ovr >= 82) level = '欧洲顶级球员'
  else if (ovr >= 75) level = '联赛主力级球员'
  else if (ovr >= 68) level = '职业球员'
  else level = '年轻球员'

  // 荣誉点缀
  let honorText = ''
  if (topHonor) honorText = ` 曾获得${topHonor.text}。`

  return `${player.name}，${nat}足球运动员，${pos}位置，现效力于${team}。${stage}${honorText} 生涯累计出战${stats.apps}场，贡献${stats.goals}球${stats.assists}助攻，目前评估为${level}。`
}

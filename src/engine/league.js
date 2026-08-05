// 联赛与比赛模拟引擎

import { TEAMS, LEAGUES } from '../data/leagues.js'
import { clamp, randInt, shuffle } from './util.js'

// 单场比分模拟（基于实力差 + 随机）
export function simulateMatch(strengthA, strengthB, homeAdv = true) {
  const home = strengthA + (homeAdv ? 3 : 0)
  const diff = home - strengthB
  // 期望进球
  const expA = clamp(1.4 + diff * 0.05, 0.3, 3.5)
  const expB = clamp(1.4 - diff * 0.05, 0.3, 3.5)
  const ga = poisson(expA)
  const gb = poisson(expB)
  return { homeGoals: ga, awayGoals: gb }
}

function poisson(lambda) {
  // 简化泊松采样
  const L = Math.exp(-lambda)
  let k = 0, p = 1
  do {
    k++
    p *= Math.random()
  } while (p > L)
  return k - 1
}

// 模拟整联赛赛季，返回积分榜（含玩家球队位置）
// 联赛填充球队名池（用于补齐小联赛，使积分榜更真实）
const FILLER_NAMES = {
  CSL: ['深圳队', '长春亚泰', '青岛海牛', '沧州雄狮', '南通支云', '梅州客家', '大连人', '武汉江城'],
  CSL2: ['苏州东吴', '四川九牛', '黑龙江冰城', '南京城市', '青岛红狮', '广西平果', '上海嘉定', '江西北大门'],
  EPL: ['埃弗顿', '西汉姆联', '布赖顿', '狼队', '富勒姆', '伯恩茅斯', '水晶宫', '布伦特福德', '诺丁汉森林', '伯恩利'],
  LALIGA: ['塞维利亚', '皇家贝蒂斯', '瓦伦西亚', '毕尔巴鄂', '赫塔费', '奥萨苏纳', '塞尔塔', '马略卡', '拉斯帕尔马斯', '阿拉维斯'],
  BUNDES: ['斯图加特', '法兰克福', '弗赖堡', '沃尔夫斯堡', '美因茨', '门兴', '不莱梅', '奥格斯堡', '霍芬海姆', '波鸿'],
  SERIEA: ['拉齐奥', '佛罗伦萨', '亚特兰大', '都灵', '博洛尼亚', '乌迪内斯', '萨索洛', '恩波利', '维罗纳', '莱切'],
  LIGUE1: ['尼斯', '雷恩', '里昂', '朗斯', '斯特拉斯堡', '布雷斯特', '蒙彼利埃', '图卢兹', '南特', '梅斯'],
}

// 用虚构球队补齐联赛到目标规模
function padTeams(leagueCode, realTeams) {
  const target = leagueCode === 'CSL' || leagueCode === 'CSL2' ? 12 : 10
  if (realTeams.length >= target) return realTeams
  const fillers = FILLER_NAMES[leagueCode] || []
  const league = LEAGUES[leagueCode]
  const baseStrength = league?.tier === 2 ? 58 : 66
  const used = new Set(realTeams.map(t => t.name))
  const result = [...realTeams]
  for (const name of fillers) {
    if (result.length >= target) break
    if (used.has(name)) continue
    result.push({
      name, league: leagueCode, country: league?.country || '',
      reputation: 60, strength: baseStrength + randInt(-6, 6),
      starPlayers: [], _filler: true,
    })
  }
  return result
}

export function simulateLeague(leagueCode, playerTeamName) {
  const realTeams = TEAMS.filter(t => t.league === leagueCode)
  if (realTeams.length < 1) return null
  const teams = padTeams(leagueCode, realTeams)
  const table = teams.map(t => ({
    name: t.name,
    strength: t.strength,
    played: 0, win: 0, draw: 0, loss: 0, gf: 0, ga: 0, points: 0,
    isPlayer: t.name === playerTeamName,
    filler: !!t._filler,
  }))
  // 主客场双循环
  for (let i = 0; i < teams.length; i++) {
    for (let j = 0; j < teams.length; j++) {
      if (i === j) continue
      const a = table[i], b = table[j]
      const r = simulateMatch(a.strength, b.strength, true)
      a.played++; b.played++
      a.gf += r.homeGoals; a.ga += r.awayGoals
      b.gf += r.awayGoals; b.ga += r.homeGoals
      if (r.homeGoals > r.awayGoals) { a.win++; b.loss++; a.points += 3 }
      else if (r.homeGoals < r.awayGoals) { a.loss++; b.win++; b.points += 3 }
      else { a.draw++; b.draw++; a.points += 1 }
    }
  }
  // 排序：积分 -> 净胜球 -> 进球
  table.sort((a, b) => b.points - a.points || (b.gf - b.ga) - (a.gf - a.ga) || b.gf - a.gf)
  table.forEach((t, i) => { t.pos = i + 1 })
  // 升降级判定（仅中国联赛双层）
  const league = LEAGUES[leagueCode]
  let promoted = false, relegated = false
  const total = table.length
  const playerRow = table.find(t => t.isPlayer)
  if (playerRow) {
    if (leagueCode === 'CSL2' && playerRow.pos <= 2) promoted = true
    if (leagueCode === 'CSL' && playerRow.pos > total - 2) relegated = true
  }
  return {
    leagueCode, league: league,
    standings: table,
    playerRow,
    promoted,
    relegated,
  }
}

// 模拟球员一赛季基础数据（不含事件已计入的进球助攻）
// 依据：属性、年龄、球队实力、教练关系、士气、体能
export function simulatePlayerSeason(player, team) {
  const attrs = player.attrs
  const ovr = player.ovr
  const isGK = player.position === 'GK'
  const isDF = ['CB', 'LB', 'RB'].includes(player.position)
  const isMF = ['CM', 'CDM', 'CAM', 'LM', 'RM'].includes(player.position)
  const isFW = ['ST', 'CF', 'LW', 'RW'].includes(player.position)

  // 出场数（教练关系+能力影响是否首发）
  let apps = 0
  const starterChance = clamp((ovr - 55) * 2 + (player.coachRelation - 50) * 0.4 + (player.morale - 50) * 0.2, 10, 100)
  const totalGames = 30  // 联赛30轮
  for (let i = 0; i < totalGames; i++) {
    if (Math.random() * 100 < starterChance) apps++
  }
  apps = clamp(apps, 0, totalGames)

  // 基础进球（不含事件）
  let baseGoals = 0, baseAssists = 0
  if (isFW) {
    const att = (attrs.finishing + attrs.positioning + attrs.composure) / 3
    const teamBoost = team ? (team.strength - 70) * 0.1 : 0
    const perGame = clamp((att - 50) * 0.025 + 0.15 + teamBoost * 0.05, 0.05, 1.1)
    baseGoals = Math.round(apps * perGame * (0.7 + Math.random() * 0.6))
    const vis = (attrs.vision + attrs.shortPassing) / 2
    baseAssists = Math.round(apps * clamp((vis - 50) * 0.018, 0.02, 0.5) * (0.6 + Math.random() * 0.8))
  } else if (isMF) {
    const att = (attrs.finishing + attrs.longShots) / 2
    baseGoals = Math.round(apps * clamp((att - 50) * 0.012, 0.01, 0.4) * (0.6 + Math.random() * 0.8))
    const vis = (attrs.vision + attrs.shortPassing) / 2
    baseAssists = Math.round(apps * clamp((vis - 50) * 0.02, 0.02, 0.5) * (0.6 + Math.random() * 0.8))
  } else if (isDF) {
    baseGoals = randInt(0, 3)
    baseAssists = randInt(0, 4)
  } else if (isGK) {
    baseGoals = 0; baseAssists = 0
  }
  baseGoals = Math.max(0, baseGoals)
  baseAssists = Math.max(0, baseAssists)

  // 评分
  const baseRating = clamp(6.2 + (ovr - 60) * 0.03 + (player.morale - 50) * 0.01, 5.5, 8.5)
  const avgRating = Math.round((baseRating + Math.random() * 0.4 - 0.2) * 10) / 10

  return { apps, baseGoals, baseAssists, avgRating }
}

// 生成下赛季对手（用于事件叙事）
export function pickOpponent(playerTeamName, leagueCode) {
  const teams = TEAMS.filter(t => t.league === leagueCode && t.name !== playerTeamName)
  if (!teams.length) return { name: '热身对手', strength: 65 }
  return teams[randInt(0, teams.length - 1)]
}

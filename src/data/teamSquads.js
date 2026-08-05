// 球队阵容生成器 —— 真实球星 + 填充球员组成完整阵容
import { STAR_PLAYERS, findPlayer } from './starPlayers.js'
import { TEAMS } from './leagues.js'
import { randInt, pick, shuffle, clamp } from '../engine/util.js'

// 填充球员名字池（按位置）
const FILLER_NAMES_BY_LEAGUE = {
  CSL: { domestic: ['张磊','王浩','李明轩','赵宇','陈志强','刘洋','黄海','周杰','吴鹏','徐峰','孙凯','马俊','朱涛','胡铭','郭威','林森','何鑫','罗勇','高翔','谢鹏','唐龙','冯杰','曹宇','沈昊','邓超','袁铭'], foreign: ['安德森','马丁内斯','佩雷拉','卡瓦略','席尔瓦'] },
  EPL: { domestic: ['Smith','Jones','Williams','Taylor','Davies','Wilson','Evans','Thomas','Roberts','Walker','Hall','Green','Wood','Harris','Clarke'], foreign: ['Müller','Costa','Fernandes','López','Schmidt'] },
  LALIGA: { domestic: ['García','Martínez','López','Sánchez','Rodríguez','Torres','Ruiz','Díaz','Moreno','Jiménez','Navarro','Vargas','Ortega','Castro'], foreign: ['Bernard','Kouassi','Petrov','Andersson'] },
  BUNDES: { domestic: ['Müller','Schmidt','Schneider','Fischer','Weber','Meyer','Wagner','Becker','Hoffmann','Schäfer','Krause','Lehmann','Werner'], foreign: ['Jansen','Nielsen','Kowalski','Dubois'] },
  SERIEA: { domestic: ['Rossi','Russo','Ferrari','Esposito','Bianchi','Romano','Colombo','Ricci','Marino','Greco','Bruno','Gallo','Conte','De Luca'], foreign: ['Vogel','Petrov','Andersson','Kovač'] },
  LIGUE1: { domestic: ['Martin','Bernard','Dubois','Thomas','Robert','Richard','Petit','Durand','Leroy','Moreau','Simon','Laurent','Michel','Garcia'], foreign: ['Nwosu','Traoré','Koné','Hassan'] },
}

// 位置阵容结构（4-3-3 阵型，11首发 + 7替补）
const FORMATION = [
  { pos: 'GK', count: 1 },
  { pos: 'LB', count: 1 }, { pos: 'CB', count: 2 }, { pos: 'RB', count: 1 },
  { pos: 'CM', count: 2 }, { pos: 'CAM', count: 1 },
  { pos: 'LW', count: 1 }, { pos: 'ST', count: 1 }, { pos: 'RW', count: 1 },
]

// 生成填充球员
function genFiller(leagueCode, pos, teamStrength, idx) {
  const pool = FILLER_NAMES_BY_LEAGUE[leagueCode] || FILLER_NAMES_BY_LEAGUE.CSL
  const isForeign = Math.random() < 0.25
  const namePool = isForeign ? pool.foreign : pool.domestic
  const name = namePool[idx % namePool.length] || `球员${idx}`
  const ovr = clamp(teamStrength - randInt(3, 12), 45, 85)
  const age = randInt(18, 34)
  return {
    name: `${name}`,
    pos,
    age,
    ovr,
    nation: isForeign ? '外国' : (leagueCode === 'CSL' ? '中国' : ''),
    isFiller: true,
  }
}

// 为一支球队生成完整阵容
export function buildSquad(team) {
  const stars = (team.starPlayers || []).map(n => findPlayer(n)).filter(p => p)
  const result = []
  const usedSlots = new Set()
  // 先放入真实球星到对应位置
  for (const star of stars) {
    const slot = FORMATION.find((s, i) => s.pos === star.pos && !usedSlots.has(`${s.pos}-${i}`))
    // 找到该位置的第一个空位
    let placed = false
    for (let i = 0; i < FORMATION.length; i++) {
      if (FORMATION[i].pos === star.pos && !usedSlots.has(`${star.pos}-${i}`)) {
        usedSlots.add(`${star.pos}-${i}`)
        result.push({ ...star, isFiller: false, starting: true })
        placed = true
        break
      }
    }
    if (!placed) {
      // 位置已满，作为替补
      result.push({ ...star, isFiller: false, starting: false })
    }
  }
  // 填充剩余首发位置
  let fillerIdx = 0
  for (const slot of FORMATION) {
    for (let i = 0; i < slot.count; i++) {
      const key = `${slot.pos}-${i}`
      if (!usedSlots.has(key)) {
        usedSlots.add(key)
        const filler = genFiller(team.league, slot.pos, team.strength, fillerIdx++)
        result.push({ ...filler, starting: true })
      }
    }
  }
  // 补充替补席（7人）
  const benchPositions = ['GK','CB','LB','RB','CM','CAM','ST']
  for (let i = 0; i < 7; i++) {
    const bp = benchPositions[i % benchPositions.length]
    const filler = genFiller(team.league, bp, team.strength, fillerIdx++)
    result.push({ ...filler, starting: false })
  }
  return result
}

// 缓存
const squadCache = new Map()
export function getSquad(teamName) {
  if (squadCache.has(teamName)) return squadCache.get(teamName)
  const team = TEAMS.find(t => t.name === teamName)
  if (!team) return []
  const squad = buildSquad(team)
  squadCache.set(teamName, squad)
  return squad
}

// 获取球队首发阵容（11人）
export function getStartingXI(teamName) {
  return getSquad(teamName).filter(p => p.starting)
}

// 获取球队平均OVR
export function squadOvr(teamName) {
  const xi = getStartingXI(teamName)
  if (!xi.length) return 65
  return Math.round(xi.reduce((s, p) => s + p.ovr, 0) / xi.length)
}

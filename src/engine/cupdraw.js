// 杯赛抽签引擎 —— 欧冠/亚冠/足协杯抽签与对阵生成
import { TEAMS, LEAGUES } from '../data/leagues.js'
import { CUPS } from '../data/starPlayers.js'
import { shuffle, randInt, clamp } from './util.js'

// 判定玩家球队本赛季是否有杯赛参赛资格
// lastLeaguePos: 上赛季联赛排名（1-based）；若为null则按声望估算
export function eligibleCups(player, lastLeaguePos = null) {
  const result = []
  for (const [code, cup] of Object.entries(CUPS)) {
    if (!cup.eligibleLeagues.includes(player.teamLeague)) continue
    // 联赛排名门槛（无排名信息时，OVR高的默认可踢欧冠）
    let qualified = false
    if (lastLeaguePos != null) {
      qualified = lastLeaguePos <= cup.minLeaguePos
    } else {
      // 新赛季初：按球队声望/玩家OVR粗判
      const team = TEAMS.find(t => t.name === player.team)
      const teamRep = team?.reputation || 60
      if (code === 'UCL') qualified = teamRep >= 80 && player.ovr >= 72
      else if (code === 'ACL') qualified = teamRep >= 72
      else qualified = true // 足协杯默认可踢
    }
    if (qualified) result.push({ code, ...cup })
  }
  return result
}

// 抽签：从球队池中抽取玩家所在小组/对阵
// 返回 { cup, pot: 种子池, drawn: 抽出的对手(3-4个), group: 玩家小组对阵列表, narrative }
export function performDraw(cupCode, player) {
  const cup = CUPS[cupCode]
  if (!cup) return null
  // 候选球队池：同联赛或同档位球队（排除玩家队）
  let pot = TEAMS.filter(t => t.league !== t.league) // 空
  if (cupCode === 'UCL') {
    pot = TEAMS.filter(t => ['EPL','LALIGA','BUNDES','SERIEA','LIGUE1'].includes(t.league) && t.name !== player.team && t.reputation >= 78)
  } else if (cupCode === 'ACL') {
    pot = TEAMS.filter(t => t.league === 'CSL' && t.name !== player.team)
  } else {
    pot = TEAMS.filter(t => ['CSL','CSL2'].includes(t.league) && t.name !== player.team)
  }
  // 抽出3个对手（小组赛制）
  const drawn = shuffle(pot).slice(0, 3)
  const group = drawn.map((opp, i) => ({
    opponent: opp.name,
    oppLeague: opp.league,
    oppStrength: opp.strength,
    home: i % 2 === 0,
    round: i + 1,
  }))
  // 抽签叙事
  const narratives = [
    `抽签球在玻璃缸里滚动，全场屏息。主持人念出第一个名字——${drawn[0]?.name || '未知'}。`,
    `镜头对准抽签缸，前欧足联名宿伸手一摸，掏出的球上写着：${drawn[0]?.name || '未知'}。`,
    `大厅灯光聚焦，你的球队被分入死亡之组，同组对手依次揭晓……`,
  ]
  return {
    cup: { code: cupCode, ...cup },
    pot: pot.slice(0, 8).map(t => t.name),
    drawn: drawn.map(t => ({ name: t.name, league: t.league, strength: t.strength, starPlayers: t.starPlayers })),
    group,
    narrative: narratives[randInt(0, narratives.length - 1)],
  }
}

// 模拟杯赛小组赛进程（简化）
// 返回 { results: 每场结果, advanced: 是否出线, groupPos }
export function simulateCupGroup(player, groupFixtures) {
  const team = TEAMS.find(t => t.name === player.team)
  const myStrength = team?.strength || 65
  const results = groupFixtures.map(f => {
    const homeAdv = f.home ? 3 : 0
    const diff = (myStrength + homeAdv) - f.oppStrength
    const expMe = clamp(1.3 + diff * 0.05, 0.3, 3.0)
    const expOpp = clamp(1.3 - diff * 0.05, 0.3, 3.0)
    const gMe = poisson(expMe)
    const gOpp = poisson(expOpp)
    let pts = 0
    if (gMe > gOpp) pts = 3
    else if (gMe === gOpp) pts = 1
    return { ...f, goalsFor: gMe, goalsAgainst: gOpp, pts }
  })
  const totalPts = results.reduce((s, r) => s + r.pts, 0)
  // 出线：积分>=5 大概率出线
  const advanced = totalPts >= 5
  return { results, totalPts, advanced, groupPos: totalPts >= 7 ? 1 : totalPts >= 5 ? 2 : 3 }
}

// 模拟淘汰赛（单回合简化）
export function simulateKnockout(player, opponentName) {
  const team = TEAMS.find(t => t.name === player.team)
  const opp = TEAMS.find(t => t.name === opponentName)
  const myStr = team?.strength || 65
  const oppStr = opp?.strength || 65
  const diff = myStr - oppStr
  const expMe = clamp(1.2 + diff * 0.06, 0.3, 3.0)
  const expOpp = clamp(1.2 - diff * 0.06, 0.3, 3.0)
  let gMe = poisson(expMe), gOpp = poisson(expOpp)
  // 平局点球
  let penalty = null
  if (gMe === gOpp) {
    const win = Math.random() < clamp(0.5 + diff * 0.02, 0.3, 0.7)
    penalty = win ? '胜' : '负'
    gMe += win ? 1 : 0
    gOpp += win ? 0 : 1
  }
  const advanced = gMe > gOpp
  return { goalsFor: gMe - (penalty === '胜' ? 1 : 0), goalsAgainst: gOpp - (penalty === '负' ? 1 : 0), penalty, advanced }
}

function poisson(lambda) {
  const L = Math.exp(-lambda)
  let k = 0, p = 1
  do { k++; p *= Math.random() } while (p > L)
  return k - 1
}

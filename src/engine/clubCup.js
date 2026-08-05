// 俱乐部杯赛引擎 —— 欧冠/亚冠/足协杯按现实时间模拟
// 现实时间线参考：
//   UCL: 9-12月小组赛 → 2-3月16强 → 4月8强 → 4-5月半决赛 → 5月决赛
//   ACL: 2-5月小组赛 → 9月16强 → 9月8强 → 10月半决赛 → 10-11月决赛
//   FACup(中国足协杯): 5月1/8决赛 → 7月1/4决赛 → 9月半决赛 → 11月决赛
import { TEAMS, LEAGUES } from '../data/leagues.js'
import { CUPS } from '../data/starPlayers.js'
import { clamp, randInt, shuffle, pick } from './util.js'

// 杯赛阶段时间表（月份，用于赛事叙事）
const CUP_TIMELINE = {
  UCL: {
    group: [9, 10, 11, 12],
    r16: [2, 3],
    qf: [4],
    sf: [4, 5],
    final: [5],
    rounds: ['小组赛', '16强', '8强', '半决赛', '决赛'],
    groupSize: 4,
    hasGroup: true,
  },
  ACL: {
    group: [2, 3, 4, 5],
    r16: [9],
    qf: [9],
    sf: [10],
    final: [10, 11],
    rounds: ['小组赛', '16强', '8强', '半决赛', '决赛'],
    groupSize: 4,
    hasGroup: true,
  },
  FACup: {
    r16: [5],
    qf: [7],
    sf: [9],
    final: [11],
    rounds: ['1/8决赛', '1/4决赛', '半决赛', '决赛'],
    groupSize: 0,
    hasGroup: false,
  },
}

// 阶段中文标签
function stageLabel(code, round) {
  const tl = CUP_TIMELINE[code]
  if (!tl) return round
  return round
}

// 泊松抽样
function poisson(lambda) {
  const L = Math.exp(-lambda)
  let k = 0, p = 1
  do { k++; p *= Math.random() } while (p > L)
  return k - 1
}

// 模拟一场比赛
// myStr, oppStr: 球队实力, homeAdv: 主场加成
function simulateMatch(myStr, oppStr, homeAdv = 0) {
  const diff = (myStr + homeAdv) - oppStr
  const expMe = clamp(1.35 + diff * 0.05, 0.3, 3.2)
  const expOpp = clamp(1.35 - diff * 0.05, 0.3, 3.2)
  const gMe = poisson(expMe)
  const gOpp = poisson(expOpp)
  let penalty = null
  if (gMe === gOpp) {
    const win = Math.random() < clamp(0.5 + diff * 0.02, 0.3, 0.7)
    penalty = win ? '胜' : '负'
  }
  return {
    goalsFor: gMe,
    goalsAgainst: gOpp,
    penalty,
    win: gMe > gOpp || penalty === '胜',
  }
}

// 玩家单场贡献（进球+助攻）
function playerContribution(player, goalsFor, isAttackerBoost = true) {
  if (goalsFor <= 0) return { goals: 0, assists: 0 }
  const isAttacker = ['ST', 'CF', 'LW', 'RW', 'CAM'].includes(player.position)
  const isMid = ['CM', 'CDM'].includes(player.position)
  const goalChance = clamp((player.ovr - 60) * 0.02, 0.05, 0.5) * (isAttacker ? 1.5 : isMid ? 0.8 : 0.3)
  const assistChance = clamp((player.ovr - 60) * 0.015, 0.04, 0.4) * (isAttacker || isMid ? 1.2 : 0.5)
  const goals = Math.random() < goalChance * goalsFor ? randInt(1, Math.min(2, goalsFor)) : 0
  const assists = (goalsFor - goals > 0) && Math.random() < assistChance * goalsFor ? randInt(0, Math.min(2, goalsFor - goals)) : 0
  return { goals, assists }
}

// 获取玩家球队所在杯赛的对手池
function getOpponentPool(cupCode, player) {
  const myTeam = TEAMS.find(t => t.name === player.team)
  if (cupCode === 'UCL') {
    // 欧冠：5大联赛强队
    return TEAMS.filter(t =>
      ['EPL', 'LALIGA', 'BUNDES', 'SERIEA', 'LIGUE1'].includes(t.league) &&
      t.name !== player.team &&
      t.reputation >= 78
    )
  } else if (cupCode === 'ACL') {
    // 亚冠：中超其他球队 + 模拟亚洲强队
    const cslTeams = TEAMS.filter(t => t.league === 'CSL' && t.name !== player.team)
    // 加入模拟亚洲对手
    const asianOpps = [
      { name: '全北现代', league: 'KLeague', strength: 76, country: '韩国', reputation: 78, starPlayers: [] },
      { name: '浦和红钻', league: 'JLeague', strength: 75, country: '日本', reputation: 76, starPlayers: [] },
      { name: '阿尔希拉尔', league: 'SPL', strength: 78, country: '沙特', reputation: 80, starPlayers: [] },
      { name: '蔚山现代', league: 'KLeague', strength: 74, country: '韩国', reputation: 75, starPlayers: [] },
      { name: '川崎前锋', league: 'JLeague', strength: 74, country: '日本', reputation: 75, starPlayers: [] },
    ]
    return [...cslTeams, ...asianOpps]
  } else {
    // 足协杯：中超中甲球队
    return TEAMS.filter(t => ['CSL', 'CSL2'].includes(t.league) && t.name !== player.team)
  }
}

// 模拟一项俱乐部杯赛
// player: 玩家; cupCode: 'UCL'|'ACL'|'FACup'; year: 赛季年份
// 返回 { cup, year, matches, groupStandings, knockoutBracket, finalPos, playerGoals, playerAssists, apps, honor, narrative }
export function simulateClubCup(player, cupCode, year) {
  const cup = CUPS[cupCode]
  if (!cup) return null
  const tl = CUP_TIMELINE[cupCode]
  const myTeam = TEAMS.find(t => t.name === player.team)
  const myStr = myTeam?.strength || 65
  const pool = getOpponentPool(cupCode, player)

  const matches = []
  const knockoutBracket = []
  let playerGoals = 0
  let playerAssists = 0
  let finalPos = 0
  const groupStandings = []

  // ===== 小组赛（仅UCL/ACL）=====
  let advanced = true
  if (tl.hasGroup) {
    // 抽3个小组对手
    const drawn = shuffle(pool).slice(0, 3)
    const groupTeams = [
      { name: player.team, league: player.teamLeague, strength: myStr, played: 0, win: 0, draw: 0, loss: 0, gf: 0, ga: 0, points: 0, isPlayer: true },
      ...drawn.map(t => ({
        name: t.name, league: t.league, strength: t.strength || 70,
        played: 0, win: 0, draw: 0, loss: 0, gf: 0, ga: 0, points: 0, isPlayer: false
      })),
    ]
    // 6场小组赛
    const fixtures = []
    for (let i = 0; i < groupTeams.length; i++) {
      for (let j = i + 1; j < groupTeams.length; j++) {
        fixtures.push({ home: i, away: j })
        fixtures.push({ home: j, away: i }) // 主客场双循环
      }
    }
    // 模拟小组赛
    for (const fx of fixtures) {
      const home = groupTeams[fx.home]
      const away = groupTeams[fx.away]
      const m = simulateMatch(home.strength, away.strength, 4)
      home.played++; away.played++
      home.gf += m.goalsFor; home.ga += m.goalsAgainst
      away.gf += m.goalsAgainst; away.ga += m.goalsFor
      if (m.goalsFor > m.goalsAgainst) { home.win++; home.points += 3; away.loss++ }
      else if (m.goalsFor < m.goalsAgainst) { away.win++; away.points += 3; home.loss++ }
      else { home.draw++; away.draw++; home.points += 1; away.points += 1 }
      // 仅记录玩家参与的比赛
      if (home.isPlayer || away.isPlayer) {
        const isHome = home.isPlayer
        const goalsFor = isHome ? m.goalsFor : m.goalsAgainst
        const goalsAgainst = isHome ? m.goalsAgainst : m.goalsFor
        const oppName = isHome ? away.name : home.name
        const oppStr = isHome ? away.strength : home.strength
        const pc = playerContribution(player, goalsFor)
        playerGoals += pc.goals
        playerAssists += pc.assists
        matches.push({
          phase: '小组赛',
          opponent: oppName,
          oppStrength: oppStr,
          home: isHome,
          goalsFor,
          goalsAgainst,
          penalty: null,
          win: goalsFor > goalsAgainst,
          playerGoals: pc.goals,
          playerAssists: pc.assists,
        })
      }
    }
    // 排名
    groupTeams.sort((a, b) => b.points - a.points || (b.gf - b.ga) - (a.gf - a.ga) || b.gf - a.gf)
    groupTeams.forEach((t, i) => { t.pos = i + 1 })
    groupStandings.push(...groupTeams)
    const myTeamRow = groupTeams.find(t => t.isPlayer)
    advanced = myTeamRow && myTeamRow.pos <= 2

    if (!advanced) {
      finalPos = myTeamRow?.pos === 3 ? 3 : 4
    }
  } else {
    // 无小组赛（足协杯）：直接从1/8决赛开始
    advanced = true
  }

  // ===== 淘汰赛 =====
  const koRounds = tl.hasGroup ? tl.rounds.slice(1) : tl.rounds
  let koIdx = 0
  let stillIn = advanced
  // 排除小组赛同组对手，避免重复
  const groupOppNames = groupStandings.filter(t => !t.isPlayer).map(t => t.name)
  while (stillIn && koIdx < koRounds.length) {
    const round = koRounds[koIdx]
    // 抽签：从池中排除已遇到的小组赛对手
    let oppPool = pool.filter(t => !groupOppNames.includes(t.name))
    if (oppPool.length === 0) oppPool = pool
    const oppTeam = pick(oppPool)
    const oppStr = oppTeam.strength || 65
    // 淘汰赛主客场（足协杯单回合决赛除外）
    const isFinal = round === '决赛'
    const isTwoLegs = !isFinal && cupCode !== 'FACup'
    let aggGoalsFor = 0, aggGoalsAgainst = 0
    let matchAway = null, matchHome = null
    let pgTotal = 0, paTotal = 0
    if (isTwoLegs) {
      // 客场
      const m1 = simulateMatch(myStr, oppStr, 0)
      const pc1 = playerContribution(player, m1.goalsFor)
      playerGoals += pc1.goals; playerAssists += pc1.assists
      pgTotal += pc1.goals; paTotal += pc1.assists
      aggGoalsFor += m1.goalsFor; aggGoalsAgainst += m1.goalsAgainst
      matchAway = { phase: `${round}首回合`, opponent: oppTeam.name, oppStrength: oppStr, home: false, goalsFor: m1.goalsFor, goalsAgainst: m1.goalsAgainst, penalty: null, win: m1.goalsFor > m1.goalsAgainst, playerGoals: pc1.goals, playerAssists: pc1.assists }
      // 主场
      const m2 = simulateMatch(myStr, oppStr, 4)
      const pc2 = playerContribution(player, m2.goalsFor)
      playerGoals += pc2.goals; playerAssists += pc2.assists
      pgTotal += pc2.goals; paTotal += pc2.assists
      aggGoalsFor += m2.goalsFor; aggGoalsAgainst += m2.goalsAgainst
      matchHome = { phase: `${round}次回合`, opponent: oppTeam.name, oppStrength: oppStr, home: true, goalsFor: m2.goalsFor, goalsAgainst: m2.goalsAgainst, penalty: null, win: m2.goalsFor > m2.goalsAgainst, playerGoals: pc2.goals, playerAssists: pc2.assists }
      // 总比分判定
      let win = aggGoalsFor > aggGoalsAgainst
      let penalty = null
      if (aggGoalsFor === aggGoalsAgainst) {
        // 加客场进球规则（简化：先比总比分平则点球）
        const winChance = clamp(0.5 + (myStr - oppStr) * 0.02, 0.3, 0.7)
        win = Math.random() < winChance
        penalty = win ? '胜' : '负'
      }
      matches.push(matchAway, matchHome)
      knockoutBracket.push({
        round,
        opponent: oppTeam.name,
        oppStrength: oppStr,
        goalsFor: aggGoalsFor,
        goalsAgainst: aggGoalsAgainst,
        penalty,
        win,
        playerGoals: pgTotal,
        playerAssists: paTotal,
        twoLegs: true,
      })
      if (!win) {
        stillIn = false
        if (round === '16强') finalPos = 16
        else if (round === '8强') finalPos = 8
        else if (round === '半决赛') finalPos = 4
        else if (round === '决赛') finalPos = 2
      } else {
        if (round === '决赛') { finalPos = 1; stillIn = false }
        else koIdx += 1
      }
    } else {
      // 单回合（决赛/足协杯）
      const m = simulateMatch(myStr, oppStr, isFinal ? 0 : 3)
      const pc = playerContribution(player, m.goalsFor)
      playerGoals += pc.goals; playerAssists += pc.assists
      matches.push({
        phase: round,
        opponent: oppTeam.name,
        oppStrength: oppStr,
        home: !isFinal,
        goalsFor: m.goalsFor,
        goalsAgainst: m.goalsAgainst,
        penalty: m.penalty,
        win: m.win,
        playerGoals: pc.goals,
        playerAssists: pc.assists,
      })
      knockoutBracket.push({
        round,
        opponent: oppTeam.name,
        oppStrength: oppStr,
        goalsFor: m.goalsFor,
        goalsAgainst: m.goalsAgainst,
        penalty: m.penalty,
        win: m.win,
        playerGoals: pc.goals,
        playerAssists: pc.assists,
        twoLegs: false,
      })
      if (!m.win) {
        stillIn = false
        if (round === '1/8决赛') finalPos = 16
        else if (round === '1/4决赛') finalPos = 8
        else if (round === '半决赛') finalPos = 4
        else if (round === '决赛') finalPos = 2
      } else {
        if (round === '决赛') { finalPos = 1; stillIn = false }
        else koIdx += 1
      }
    }
  }

  // ===== 荣誉判定 =====
  let honor = null
  const honors = []
  if (finalPos === 1) {
    honor = { tier: 'gold', text: `${cup.short}冠军 (${player.team})`, season: year, type: 'continental' }
    honors.push(honor)
  } else if (finalPos === 2) {
    honor = { tier: 'silver', text: `${cup.short}亚军 (${player.team})`, season: year, type: 'continental' }
    honors.push(honor)
  } else if (finalPos === 4) {
    honors.push({ tier: 'bronze', text: `${cup.short}四强 (${player.team})`, season: year, type: 'continental' })
  } else if (finalPos === 8) {
    honors.push({ tier: 'bronze', text: `${cup.short}八强 (${player.team})`, season: year, type: 'continental' })
  }
  // 个人荣誉：金靴/最佳球员
  let individualHonor = null
  if (playerGoals >= 8 && finalPos <= 2) {
    individualHonor = { tier: 'gold', text: `${cup.short}金靴 (${playerGoals}球)`, season: year, type: 'individual' }
    honors.push(individualHonor)
  } else if (playerGoals >= 6 && finalPos <= 4) {
    individualHonor = { tier: 'silver', text: `${cup.short}银靴 (${playerGoals}球)`, season: year, type: 'individual' }
    honors.push(individualHonor)
  } else if (playerGoals >= 5 && finalPos === 1) {
    individualHonor = { tier: 'silver', text: `${cup.short}最佳球员`, season: year, type: 'individual' }
    honors.push(individualHonor)
  }

  // ===== 叙事 =====
  const narratives = [
    `${cup.icon} ${year}赛季${cup.name}战火点燃，${player.team}踏上征程！`,
    `${cup.icon} ${cup.name}抽签揭晓，${player.team}的对手浮出水面。`,
    `${cup.icon} 全欧洲的目光聚焦${cup.name}，${player.team}将为荣誉而战。`,
  ]
  if (cupCode === 'ACL') {
    narratives[2] = `${cup.icon} 亚洲足坛瞩目${cup.name}，${player.team}剑指亚洲之巅。`
  } else if (cupCode === 'FACup') {
    narratives[2] = `${cup.icon} 中国足协杯战火重燃，${player.team}渴望捧起奖杯。`
  }

  return {
    cup: { code: cupCode, ...cup },
    year,
    matches,
    groupStandings,
    knockoutBracket,
    finalPos,
    playerGoals,
    playerAssists,
    apps: matches.length,
    honor,
    individualHonor,
    honors,
    narrative: narratives[0],
    team: player.team,
  }
}

// 玩家球队当年可参加的俱乐部杯赛（基于上赛季排名）
// 返回 [{ code, ...cup }]
export function eligibleClubCups(player, lastLeaguePos = null) {
  const result = []
  for (const [code, cup] of Object.entries(CUPS)) {
    if (!cup.eligibleLeagues.includes(player.teamLeague)) continue
    let qualified = false
    if (lastLeaguePos != null) {
      qualified = lastLeaguePos <= cup.minLeaguePos
    } else {
      const team = TEAMS.find(t => t.name === player.team)
      const teamRep = team?.reputation || 60
      if (code === 'UCL') qualified = teamRep >= 80 && player.ovr >= 72
      else if (code === 'ACL') qualified = teamRep >= 72
      else qualified = true
    }
    if (qualified) result.push({ code, ...cup })
  }
  return result
}

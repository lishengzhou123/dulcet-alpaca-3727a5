// 国际赛事引擎 —— 国家队选择/谈判 + 赛事模拟
import { INTL_COMPETITIONS, competitionsInYear, nationCanCompete, nationConfederation, nationStrength, NATION_TO_CONFED } from '../data/intlCompetitions.js'
import { TEAMS, LEAGUES } from '../data/leagues.js'
import { clamp, randInt, shuffle, pick } from './util.js'
import { simulateIntlMatch } from './matchSim.js'

// 联赛归属国家（用于居住入籍资格）
const LEAGUE_COUNTRY = {
  EPL: '英格兰',
  LALIGA: '西班牙',
  BUNDES: '德国',
  SERIEA: '意大利',
  LIGUE1: '法国',
  CSL: '中国',
  CSL2: '中国',
}

// 获取玩家可代表的国家队候选列表
// player: 玩家对象
// 返回 [{ nation, conf, strength, reason, canSelect }]
export function eligibleNations(player) {
  const result = []
  const currentNation = player.nationality || '中国'
  // 1. 出生地/原国籍（默认可选）
  result.push({
    nation: currentNation,
    conf: nationConfederation(currentNation),
    strength: nationStrength(currentNation),
    reason: '出生地/原国籍',
    canSelect: true,
  })
  // 2. 血统资格（创建时由 createCareer 随机赋予 0-2 个，存于 player.heritageNations）
  const heritage = player.heritageNations || []
  for (const nat of heritage) {
    if (nat === currentNation) continue
    result.push({
      nation: nat,
      conf: nationConfederation(nat),
      strength: nationStrength(nat),
      reason: '血缘资格（父母/祖父母籍）',
      canSelect: true,
    })
  }
  // 3. 居住入籍：在外国联赛踢球满5年可入籍该国
  const leagueCountry = LEAGUE_COUNTRY[player.teamLeague]
  if (leagueCountry && leagueCountry !== currentNation && !heritage.includes(leagueCountry)) {
    const yearsAbroad = player.yearsInLeagues?.[player.teamLeague] || 0
    if (yearsAbroad >= 5) {
      result.push({
        nation: leagueCountry,
        conf: nationConfederation(leagueCountry),
        strength: nationStrength(leagueCountry),
        reason: `居住入籍（在${leagueCountry}效力满5年）`,
        canSelect: true,
      })
    } else {
      // 未满5年，显示但不可选
      result.push({
        nation: leagueCountry,
        conf: nationConfederation(leagueCountry),
        strength: nationStrength(leagueCountry),
        reason: `居住入籍（需在${leagueCountry}效力满5年，当前${yearsAbroad}年）`,
        canSelect: false,
      })
    }
  }
  return result
}

// 判定玩家是否需要做国家队选择
// 17岁首次触发；若已锁定则不再触发
export function needsNationChoice(player) {
  if (player.nationLocked) return false
  if (player.age < 17) return false
  // 首次触发：17岁且尚未做过选择
  if (!player.nationChoiceShown) return true
  // 之后每年检查是否有新的可入籍国家出现
  const elig = eligibleNations(player).filter(e => e.canSelect)
  const known = player.knownEligibleNations || []
  const newOnes = elig.filter(e => !known.includes(e.nation))
  return newOnes.length > 0
}

// 锁定国家队（一旦踢了成年队正式比赛就不可更改）
export function lockNation(player) {
  player.nationLocked = true
}

// 获取玩家当年可参加的国际赛事
export function playerCompetitions(player, year) {
  const nat = player.nationality || '中国'
  const conf = nationConfederation(nat)
  const comps = competitionsInYear(year)
  return comps.filter(c => {
    // 国家能否参赛
    if (!nationCanCompete(c, nat)) return false
    // 年龄限制（奥运会/世青赛）
    if (c.maxAge && player.age > c.maxAge) return false
    // OVR/声望门槛：球员是否会被征召
    const ovrThreshold = c.tier === 'gold' ? 68 : c.tier === 'silver' ? 62 : 58
    if (player.ovr < ovrThreshold && player.reputation < 35) return false
    return true
  })
}

// 泊松抽样
function poisson(lambda) {
  const L = Math.exp(-lambda)
  let k = 0, p = 1
  do { k++; p *= Math.random() } while (p > L)
  return k - 1
}

// 模拟一场国际比赛
// myStr: 玩家国家队实力, oppStr: 对手实力, homeAdv: 主场加成
function simulateMatch(myStr, oppStr, homeAdv = 0) {
  const diff = (myStr + homeAdv) - oppStr
  const expMe = clamp(1.3 + diff * 0.04, 0.3, 3.2)
  const expOpp = clamp(1.3 - diff * 0.04, 0.3, 3.2)
  const gMe = poisson(expMe)
  const gOpp = poisson(expOpp)
  let penalty = null
  if (gMe === gOpp) {
    const win = Math.random() < clamp(0.5 + diff * 0.02, 0.3, 0.7)
    penalty = win ? '胜' : '负'
  }
  return { goalsFor: gMe, goalsAgainst: gOpp, penalty, win: gMe > gOpp || penalty === '胜' }
}

// 模拟一项国际赛事（小组赛+淘汰赛）
// player: 玩家
// comp: 赛事定义
// year: 赛事年份
// 返回 { comp, matches, groupStandings, knockoutBracket, finalPos, goals, assists, apps, honor, narrative }
export function simulateIntlTournament(player, comp, year) {
  const nat = player.nationality || '中国'
  const myStr = nationStrength(nat)
  const conf = nationConfederation(nat)
  // 生成3个小组赛对手（同大洲，避开自己）
  const candidates = Object.keys(NATION_TO_CONFED).filter(n => {
    if (n === nat) return false
    if (comp.eligibleNations === 'ALL') return true
    return comp.eligibleNations.includes(n)
  })
  // 实力从高到低排序后随机抽取3个，确保有强有弱
  const sorted = shuffle(candidates).slice(0, 8)
  const groupOpps = sorted.slice(0, 3).map(n => ({ nation: n, strength: nationStrength(n) }))

  // ===== 小组赛：4队循环（每队3场）=====
  // 构建4队小组：玩家国家队 + 3个对手
  const groupTeams = [
    { nation: nat, strength: myStr, played: 0, win: 0, draw: 0, loss: 0, gf: 0, ga: 0, points: 0, isPlayer: true },
    ...groupOpps.map(o => ({ nation: o.nation, strength: o.strength, played: 0, win: 0, draw: 0, loss: 0, gf: 0, ga: 0, points: 0, isPlayer: false })),
  ]
  // 生成所有6场小组赛对阵
  const groupFixtures = []
  for (let i = 0; i < groupTeams.length; i++) {
    for (let j = i + 1; j < groupTeams.length; j++) {
      groupFixtures.push({ home: i, away: j })
    }
  }
  const matches = []
  let playerGoals = 0
  let playerAssists = 0
  // 模拟小组赛
  for (const fx of groupFixtures) {
    const home = groupTeams[fx.home]
    const away = groupTeams[fx.away]
    const m = simulateMatch(home.strength, away.strength, 2) // 中立场+微弱主场优势
    home.played++; away.played++
    home.gf += m.goalsFor; home.ga += m.goalsAgainst
    away.gf += m.goalsAgainst; away.ga += m.goalsFor
    let isPlayerMatch = home.isPlayer || away.isPlayer
    let pg = 0, pa = 0
    if (isPlayerMatch) {
      const isAttacker = ['ST','CF','LW','RW','CAM'].includes(player.position)
      const goalChance = clamp((player.ovr - 60) * 0.02, 0.05, 0.5) * (isAttacker ? 1.5 : 0.5)
      const assistChance = clamp((player.ovr - 60) * 0.015, 0.04, 0.4)
      const playerGoalsFor = home.isPlayer ? m.goalsFor : m.goalsAgainst
      pg = playerGoalsFor > 0 && Math.random() < goalChance * playerGoalsFor ? randInt(1, Math.min(2, playerGoalsFor)) : 0
      pa = playerGoalsFor > 0 && Math.random() < assistChance * playerGoalsFor ? randInt(0, 1) : 0
      playerGoals += pg
      playerAssists += pa
    }
    if (m.goalsFor > m.goalsAgainst) { home.win++; home.points += 3; away.loss++ }
    else if (m.goalsFor < m.goalsAgainst) { away.win++; away.points += 3; home.loss++ }
    else { home.draw++; away.draw++; home.points += 1; away.points += 1 }
    // 仅记录玩家参与的比赛
    if (isPlayerMatch) {
      const oppNation = home.isPlayer ? away.nation : home.nation
      const oppStr = home.isPlayer ? away.strength : home.strength
      const goalsFor = home.isPlayer ? m.goalsFor : m.goalsAgainst
      const goalsAgainst = home.isPlayer ? m.goalsAgainst : m.goalsFor
      matches.push({
        phase: '小组赛',
        opponent: oppNation,
        oppStrength: oppStr,
        goalsFor,
        goalsAgainst,
        penalty: null,
        win: goalsFor > goalsAgainst,
        playerGoals: pg,
        playerAssists: pa,
      })
    }
  }
  // 小组排名
  groupTeams.sort((a, b) => b.points - a.points || (b.gf - b.ga) - (a.gf - a.ga) || b.gf - a.gf)
  groupTeams.forEach((t, i) => { t.pos = i + 1 })
  const playerTeam = groupTeams.find(t => t.isPlayer)
  const advanced = playerTeam && playerTeam.pos <= 2 // 前2名出线

  // ===== 淘汰赛 =====
  const knockoutBracket = []
  let finalPos = advanced ? 4 : 0
  if (!advanced) {
    // 未出线，名次为小组第3或第4
    finalPos = playerTeam?.pos === 3 ? 3 : 4
    // 未出线也按小组排名给出名次
    if (playerTeam?.pos === 3) finalPos = 3
    else finalPos = 4
  }
  const koRounds = comp.rounds.slice(1) // 去掉小组赛
  let koStage = advanced
  let koRoundIdx = 0
  while (koStage && koRoundIdx < koRounds.length) {
    const round = koRounds[koRoundIdx]
    // 随机抽取一个对手
    const oppPool = candidates.filter(n => !groupOpps.some(g => g.nation === n))
    const oppNation = oppPool.length ? pick(oppPool) : pick(candidates)
    const oppStr = nationStrength(oppNation)
    const m = simulateMatch(myStr, oppStr, 0)
    const isAttacker = ['ST','CF','LW','RW','CAM'].includes(player.position)
    const pg = m.goalsFor > 0 && Math.random() < clamp((player.ovr - 60) * 0.02, 0.05, 0.5) * m.goalsFor * (isAttacker ? 1.5 : 0.5) ? randInt(1, Math.min(2, m.goalsFor)) : 0
    const pa = m.goalsFor > 0 && Math.random() < clamp((player.ovr - 60) * 0.015, 0.04, 0.4) * m.goalsFor ? randInt(0, 1) : 0
    playerGoals += pg
    playerAssists += pa
    const koMatch = {
      round,
      opponent: oppNation,
      oppStrength: oppStr,
      goalsFor: m.goalsFor,
      goalsAgainst: m.goalsAgainst,
      penalty: m.penalty,
      win: m.win,
      playerGoals: pg,
      playerAssists: pa,
    }
    matches.push({
      phase: round,
      opponent: oppNation,
      oppStrength: oppStr,
      goalsFor: m.goalsFor,
      goalsAgainst: m.goalsAgainst,
      penalty: m.penalty,
      win: m.win,
      playerGoals: pg,
      playerAssists: pa,
    })
    knockoutBracket.push(koMatch)
    if (!m.win) {
      koStage = false
      if (round === '16强') finalPos = 16
      else if (round === '8强') finalPos = 8
      else if (round === '半决赛') finalPos = 4
      else if (round === '决赛') finalPos = 2
    } else {
      if (round === '决赛') {
        finalPos = 1
        koStage = false
      } else {
        koRoundIdx += 1
      }
    }
  }

  // 荣誉判定
  let honor = null
  if (finalPos === 1) {
    honor = { tier: 'gold', text: `${comp.short}冠军 (${nat})`, season: year, type: 'intl' }
  } else if (finalPos === 2) {
    honor = { tier: 'silver', text: `${comp.short}亚军 (${nat})`, season: year, type: 'intl' }
  } else if (finalPos === 3 || finalPos === 4) {
    honor = { tier: 'bronze', text: `${comp.short}${finalPos === 3 ? '季军' : '四强'} (${nat})`, season: year, type: 'intl' }
  }
  // 个人荣誉：金靴/最佳新人
  let individualHonor = null
  if (playerGoals >= 5 && finalPos <= 4) {
    individualHonor = { tier: 'gold', text: `${comp.short}金靴 (${playerGoals}球)`, season: year, type: 'intl' }
  } else if (playerGoals >= 3 && finalPos <= 2) {
    individualHonor = { tier: 'silver', text: `${comp.short}银靴 (${playerGoals}球)`, season: year, type: 'intl' }
  }

  // 叙事
  const narratives = [
    `${comp.icon} ${year}年${comp.name}打响，${nat}国家队出征！`,
    `${comp.icon} ${nat}国旗在${comp.name}开幕式上飘扬，万众瞩目。`,
    `${comp.icon} 四年一度的${comp.name}来临，${nat}球迷翘首以盼。`,
  ]

  return {
    comp,
    year,
    matches,
    groupStandings: groupTeams,
    knockoutBracket,
    finalPos,
    playerGoals,
    playerAssists,
    apps: matches.length,
    honor,
    individualHonor,
    narrative: narratives[0],
    playerNation: nat,
  }
}

// 国家队谈判选项（用于谈判界面展示）
// 返回 [{ nation, conf, strength, reason, canSelect, badge }]
export function nationNegotiationOptions(player) {
  const elig = eligibleNations(player)
  return elig.map(e => ({
    ...e,
    badge: e.strength >= 88 ? '⭐ 顶级强队' : e.strength >= 80 ? '🏆 强队' : e.strength >= 70 ? '💪 中游' : '🌱 新兴'
  }))
}

// 选择国家队后更新球员信息
export function chooseNationality(player, nation) {
  player.nationality = nation
  player.nationChoiceShown = true
  // 记录已知可选项
  const elig = eligibleNations(player).filter(e => e.canSelect).map(e => e.nation)
  player.knownEligibleNations = elig
}

// ===== 互动式国际赛事模拟（逐步推进，支持直播观看） =====
// 准备一项国际赛事：生成小组赛对阵 + 赛事结构，返回可逐步推进的 tournament 对象
export function prepareIntlTournament(player, comp, year) {
  const nat = player.nationality || '中国'
  const myStr = nationStrength(nat)
  // 生成3个小组赛对手
  const candidates = Object.keys(NATION_TO_CONFED).filter(n => {
    if (n === nat) return false
    if (comp.eligibleNations === 'ALL') return true
    return comp.eligibleNations.includes(n)
  })
  const sorted = shuffle(candidates).slice(0, 8)
  const groupOpps = sorted.slice(0, 3).map(n => ({ nation: n, strength: nationStrength(n) }))

  // 4队小组
  const groupTeams = [
    { nation: nat, strength: myStr, played: 0, win: 0, draw: 0, loss: 0, gf: 0, ga: 0, points: 0, isPlayer: true },
    ...groupOpps.map(o => ({ nation: o.nation, strength: o.strength, played: 0, win: 0, draw: 0, loss: 0, gf: 0, ga: 0, points: 0, isPlayer: false })),
  ]
  // 生成6场小组赛对阵
  const groupFixtures = []
  for (let i = 0; i < groupTeams.length; i++) {
    for (let j = i + 1; j < groupTeams.length; j++) {
      groupFixtures.push({ homeIdx: i, awayIdx: j })
    }
  }
  // 玩家参与的小组赛（按参与方过滤）
  const playerGroupMatches = groupFixtures
    .filter(fx => groupTeams[fx.homeIdx].isPlayer || groupTeams[fx.awayIdx].isPlayer)
    .map(fx => {
      const home = groupTeams[fx.homeIdx]
      const away = groupTeams[fx.awayIdx]
      const isPlayerHome = home.isPlayer
      return {
        phase: '小组赛',
        homeNation: home.nation,
        awayNation: away.nation,
        homeStrength: home.strength,
        awayStrength: away.strength,
        isPlayerHome,
        isNeutral: true, // 小组赛在中立场
        homeIdx: fx.homeIdx,
        awayIdx: fx.awayIdx,
      }
    })

  return {
    comp,
    year,
    playerNation: nat,
    groupTeams,
    groupFixtures,
    playerGroupMatches,
    groupMatchIdx: 0,
    knockoutMatches: [], // 动态生成
    knockoutIdx: 0,
    advanced: false,
    finalPos: 0,
    playerGoals: 0,
    playerAssists: 0,
    apps: 0,
    matches: [], // 已完成的比赛记录
    knockoutBracket: [],
    phase: 'group', // group | knockout | done
  }
}

// 模拟非玩家的小组赛（自动快速模拟）
function simulateOtherGroupMatch(homeTeam, awayTeam) {
  const diff = homeTeam.strength - awayTeam.strength
  const expHome = clamp(1.3 + diff * 0.04, 0.3, 3.2)
  const expAway = clamp(1.3 - diff * 0.04, 0.3, 3.2)
  const gHome = poisson(expHome)
  const gAway = poisson(expAway)
  let penalty = null
  if (gHome === gAway) {
    const win = Math.random() < clamp(0.5 + diff * 0.02, 0.3, 0.7)
    penalty = win ? '胜' : '负'
  }
  return { goalsFor: gHome, goalsAgainst: gAway, penalty, win: gHome > gAway || penalty === '胜' }
}

// 更新小组积分
function updateGroupStandings(team, gf, ga) {
  team.played++
  team.gf += gf
  team.ga += ga
  if (gf > ga) { team.win++; team.points += 3 }
  else if (gf < ga) { team.loss++ }
  else { team.draw++; team.points += 1 }
}

// 推进到下一场比赛（返回 matchInfo 或 null 表示赛事结束）
// 返回的 matchInfo 包含 simulateIntlMatch 所需参数
export function nextIntlMatch(tournament, player) {
  const { phase } = tournament
  if (phase === 'group') {
    // 还有玩家小组赛
    if (tournament.groupMatchIdx < tournament.playerGroupMatches.length) {
      const m = tournament.playerGroupMatches[tournament.groupMatchIdx]
      return {
        ...m,
        matchType: 'group',
      }
    }
    // 玩家小组赛结束，模拟剩余小组赛并进入淘汰赛
    finalizeGroupStage(tournament)
    if (tournament.advanced) {
      buildKnockoutMatches(tournament, player)
      if (tournament.knockoutMatches.length > 0) {
        tournament.phase = 'knockout'
        return tournament.knockoutMatches[0]
      }
    }
    tournament.phase = 'done'
    finalizeTournament(tournament, player)
    return null
  }
  if (phase === 'knockout') {
    if (tournament.knockoutIdx < tournament.knockoutMatches.length) {
      return tournament.knockoutMatches[tournament.knockoutIdx]
    }
    // 当前轮次结束，检查是否继续
    advanceKnockout(tournament, player)
    if (tournament.knockoutIdx < tournament.knockoutMatches.length) {
      return tournament.knockoutMatches[tournament.knockoutIdx]
    }
    tournament.phase = 'done'
    finalizeTournament(tournament, player)
    return null
  }
  return null
}

// 提交一场比赛结果（玩家观看或跳过后调用）
export function submitIntlMatchResult(tournament, matchInfo, result, player) {
  const { homeNation, awayNation, homeStrength, awayStrength, isPlayerHome, matchType } = matchInfo
  const goalsFor = isPlayerHome ? result.homeGoals : result.awayGoals
  const goalsAgainst = isPlayerHome ? result.awayGoals : result.homeGoals
  // 点球判定（淘汰赛平局）
  let penalty = null
  let win = goalsFor > goalsAgainst
  if (matchType === 'knockout' && goalsFor === goalsAgainst) {
    const diff = (isPlayerHome ? homeStrength : awayStrength) - (isPlayerHome ? awayStrength : homeStrength)
    const pw = Math.random() < clamp(0.5 + diff * 0.02, 0.3, 0.7)
    penalty = pw ? '胜' : '负'
    win = pw
  }
  // 玩家进球助攻（从 matchResult.playerContribution 读取）
  let pg = 0, pa = 0
  if (result.playerContribution) {
    pg = result.playerContribution.goals || 0
    pa = result.playerContribution.assists || 0
  } else {
    // 跳过模式：按概率估算
    const isAttacker = ['ST','CF','LW','RW','CAM'].includes(player.position)
    const goalChance = clamp((player.ovr - 60) * 0.02, 0.05, 0.5) * (isAttacker ? 1.5 : 0.5)
    const assistChance = clamp((player.ovr - 60) * 0.015, 0.04, 0.4)
    pg = goalsFor > 0 && Math.random() < goalChance * goalsFor ? randInt(1, Math.min(2, goalsFor)) : 0
    pa = goalsFor > 0 && Math.random() < assistChance * goalsFor ? randInt(0, 1) : 0
  }
  tournament.playerGoals += pg
  tournament.playerAssists += pa
  tournament.apps++

  const matchRecord = {
    phase: matchType === 'group' ? '小组赛' : matchInfo.round,
    opponent: isPlayerHome ? awayNation : homeNation,
    oppStrength: isPlayerHome ? awayStrength : homeStrength,
    goalsFor,
    goalsAgainst,
    penalty,
    win,
    playerGoals: pg,
    playerAssists: pa,
  }
  tournament.matches.push(matchRecord)

  // 更新小组积分
  if (matchType === 'group') {
    const home = tournament.groupTeams[matchInfo.homeIdx]
    const away = tournament.groupTeams[matchInfo.awayIdx]
    updateGroupStandings(home, result.homeGoals, result.awayGoals)
    updateGroupStandings(away, result.awayGoals, result.homeGoals)
    tournament.groupMatchIdx++
    // 模拟这一轮其他小组赛
    simulateOtherGroupMatchesInRound(tournament, tournament.groupMatchIdx)
  } else {
    // 淘汰赛
    tournament.knockoutBracket.push({
      round: matchInfo.round,
      opponent: isPlayerHome ? awayNation : homeNation,
      oppStrength: isPlayerHome ? awayStrength : homeStrength,
      goalsFor,
      goalsAgainst,
      penalty,
      win,
      playerGoals: pg,
      playerAssists: pa,
    })
    tournament.knockoutIdx++
    // 记录当前轮次结果
    tournament._lastKoWin = win
    tournament._lastKoRound = matchInfo.round
  }
}

// 模拟当前轮次其他小组赛（简化：模拟剩余的与非玩家相关的对阵）
function simulateOtherGroupMatchesInRound(tournament, currentIdx) {
  // 这里简化处理：在玩家小组赛全部结束后统一模拟剩余对阵
  // 实际上小组赛6场，玩家参与3场，另外3场需要模拟
}

// 小组赛结束：模拟剩余非玩家对阵 + 排名
function finalizeGroupStage(tournament) {
  // 模拟所有未模拟的非玩家小组赛
  const { groupTeams, groupFixtures } = tournament
  // 找出哪些对阵还没模拟（通过 played 判断）
  // 简化：玩家的3场已模拟，剩余3场全部自动模拟
  const playerIdx = groupTeams.findIndex(t => t.isPlayer)
  const otherFixtures = groupFixtures.filter(fx => fx.homeIdx !== playerIdx && fx.awayIdx !== playerIdx)
  for (const fx of otherFixtures) {
    const home = groupTeams[fx.homeIdx]
    const away = groupTeams[fx.awayIdx]
    // 已模拟的跳过
    if (home.played >= 3 && away.played >= 3) continue
    const m = simulateOtherGroupMatch(home, away)
    updateGroupStandings(home, m.goalsFor, m.goalsAgainst)
    updateGroupStandings(away, m.goalsAgainst, m.goalsFor)
  }
  // 排名
  groupTeams.sort((a, b) => b.points - a.points || (b.gf - b.ga) - (a.gf - a.ga) || b.gf - a.gf)
  groupTeams.forEach((t, i) => { t.pos = i + 1 })
  const playerTeam = groupTeams.find(t => t.isPlayer)
  tournament.advanced = playerTeam && playerTeam.pos <= 2
  if (!tournament.advanced) {
    tournament.finalPos = playerTeam?.pos === 3 ? 3 : 4
  }
}

// 构建淘汰赛对阵
function buildKnockoutMatches(tournament, player) {
  const nat = tournament.playerNation
  const myStr = nationStrength(nat)
  const candidates = Object.keys(NATION_TO_CONFED).filter(n => {
    if (n === nat) return false
    if (tournament.comp.eligibleNations === 'ALL') return true
    return tournament.comp.eligibleNations.includes(n)
  })
  // 排除小组赛已遇对手
  const groupOpps = tournament.playerGroupMatches.map(m => m.isPlayerHome ? m.awayNation : m.homeNation)
  const koRounds = tournament.comp.rounds.slice(1) // 去掉小组赛
  // 生成首轮淘汰赛
  const oppPool = candidates.filter(n => !groupOpps.includes(n))
  const firstRound = koRounds[0]
  const oppNation = oppPool.length ? pick(oppPool) : pick(candidates)
  const oppStr = nationStrength(oppNation)
  // 玩家始终是"主队"视角（实际中立场）
  tournament.knockoutMatches.push({
    phase: '淘汰赛',
    round: firstRound,
    homeNation: nat,
    awayNation: oppNation,
    homeStrength: myStr,
    awayStrength: oppStr,
    isPlayerHome: true,
    isNeutral: true,
    matchType: 'knockout',
  })
}

// 淘汰赛推进：赢了则生成下一轮，输了则结束
function advanceKnockout(tournament, player) {
  const lastWin = tournament._lastKoWin
  const lastRound = tournament._lastKoRound
  if (!lastWin) {
    // 输了，确定名次
    if (lastRound === '16强') tournament.finalPos = 16
    else if (lastRound === '8强') tournament.finalPos = 8
    else if (lastRound === '半决赛') tournament.finalPos = 4
    else if (lastRound === '决赛') tournament.finalPos = 2
    return
  }
  // 赢了，检查是否夺冠
  if (lastRound === '决赛') {
    tournament.finalPos = 1
    return
  }
  // 生成下一轮
  const koRounds = tournament.comp.rounds.slice(1)
  const lastIdx = koRounds.indexOf(lastRound)
  const nextRound = koRounds[lastIdx + 1]
  if (!nextRound) {
    tournament.finalPos = 1
    return
  }
  const nat = tournament.playerNation
  const myStr = nationStrength(nat)
  const candidates = Object.keys(NATION_TO_CONFED).filter(n => {
    if (n === nat) return false
    if (tournament.comp.eligibleNations === 'ALL') return true
    return tournament.comp.eligibleNations.includes(n)
  })
  const usedOpps = tournament.knockoutBracket.map(b => b.opponent)
  const groupOpps = tournament.playerGroupMatches.map(m => m.isPlayerHome ? m.awayNation : m.homeNation)
  const oppPool = candidates.filter(n => !usedOpps.includes(n) && !groupOpps.includes(n))
  const oppNation = oppPool.length ? pick(oppPool) : pick(candidates)
  const oppStr = nationStrength(oppNation)
  tournament.knockoutMatches.push({
    phase: '淘汰赛',
    round: nextRound,
    homeNation: nat,
    awayNation: oppNation,
    homeStrength: myStr,
    awayStrength: oppStr,
    isPlayerHome: true,
    isNeutral: true,
    matchType: 'knockout',
  })
}

// 赛事结束：生成荣誉和叙事
function finalizeTournament(tournament, player) {
  const { comp, year, finalPos, playerNation } = tournament
  let honor = null
  if (finalPos === 1) honor = { tier: 'gold', text: `${comp.short}冠军 (${playerNation})`, season: year, type: 'intl' }
  else if (finalPos === 2) honor = { tier: 'silver', text: `${comp.short}亚军 (${playerNation})`, season: year, type: 'intl' }
  else if (finalPos === 3 || finalPos === 4) honor = { tier: 'bronze', text: `${comp.short}${finalPos === 3 ? '季军' : '四强'} (${playerNation})`, season: year, type: 'intl' }
  let individualHonor = null
  if (tournament.playerGoals >= 5 && finalPos <= 4) individualHonor = { tier: 'gold', text: `${comp.short}金靴 (${tournament.playerGoals}球)`, season: year, type: 'intl' }
  else if (tournament.playerGoals >= 3 && finalPos <= 2) individualHonor = { tier: 'silver', text: `${comp.short}银靴 (${tournament.playerGoals}球)`, season: year, type: 'intl' }
  tournament.honor = honor
  tournament.individualHonor = individualHonor
  tournament.narrative = `${comp.icon} ${year}年${comp.name}，${playerNation}最终获得${finalPos === 1 ? '冠军' : finalPos === 2 ? '亚军' : finalPos === 3 ? '季军' : finalPos === 4 ? '四强' : `第${finalPos}名`}。`
}

// 获取赛事最终结果（用于应用奖励）
export function getTournamentResult(tournament) {
  return {
    comp: tournament.comp,
    year: tournament.year,
    matches: tournament.matches,
    groupStandings: tournament.groupTeams,
    knockoutBracket: tournament.knockoutBracket,
    finalPos: tournament.finalPos,
    playerGoals: tournament.playerGoals,
    playerAssists: tournament.playerAssists,
    apps: tournament.apps,
    honor: tournament.honor,
    individualHonor: tournament.individualHonor,
    narrative: tournament.narrative,
    playerNation: tournament.playerNation,
  }
}

// 模拟一场国际赛事比赛（用于直播观看）
export function simulateIntlMatchForView(matchInfo, player) {
  const { homeNation, awayNation, homeStrength, awayStrength, isNeutral } = matchInfo
  return simulateIntlMatch(homeNation, awayNation, homeStrength, awayStrength, player, isNeutral, null)
}

// 跳过模拟一场比赛（自动模式）
export function simulateIntlMatchAuto(matchInfo, player) {
  const { homeNation, awayNation, homeStrength, awayStrength, isNeutral } = matchInfo
  return simulateIntlMatch(homeNation, awayNation, homeStrength, awayStrength, player, isNeutral, 'auto')
}

// ===== 直播式国际赛事：逐步观看每场比赛 =====
// 准备一项可直播观看的国际赛事：生成小组赛对阵 + 赛事结构
// 返回可逐步推进的 liveTournament 对象，包含预生成的所有比赛对阵
export function prepareLiveTournament(player, comp, year) {
  const nat = player.nationality || '中国'
  const myStr = nationStrength(nat)
  // 生成3个小组赛对手
  const candidates = Object.keys(NATION_TO_CONFED).filter(n => {
    if (n === nat) return false
    if (comp.eligibleNations === 'ALL') return true
    return comp.eligibleNations.includes(n)
  })
  const groupOpps = shuffle(candidates).slice(0, 3).map(n => ({ nation: n, strength: nationStrength(n) }))

  // 4队小组
  const groupTeams = [
    { nation: nat, strength: myStr, played: 0, win: 0, draw: 0, loss: 0, gf: 0, ga: 0, points: 0, isPlayer: true },
    ...groupOpps.map(o => ({ nation: o.nation, strength: o.strength, played: 0, win: 0, draw: 0, loss: 0, gf: 0, ga: 0, points: 0, isPlayer: false })),
  ]
  // 6场小组赛对阵
  const groupFixtures = []
  for (let i = 0; i < groupTeams.length; i++) {
    for (let j = i + 1; j < groupTeams.length; j++) {
      groupFixtures.push({ homeIdx: i, awayIdx: j })
    }
  }
  // 玩家参与的3场小组赛
  const playerGroupMatches = groupFixtures
    .filter(fx => groupTeams[fx.homeIdx].isPlayer || groupTeams[fx.awayIdx].isPlayer)
    .map(fx => {
      const home = groupTeams[fx.homeIdx]
      const away = groupTeams[fx.awayIdx]
      const isPlayerHome = home.isPlayer
      return {
        phase: '小组赛',
        homeNation: home.nation,
        awayNation: away.nation,
        homeStrength: home.strength,
        awayStrength: away.strength,
        isPlayerHome,
        isNeutral: true,
        homeIdx: fx.homeIdx,
        awayIdx: fx.awayIdx,
        matchType: 'group',
      }
    })

  return {
    comp,
    year,
    playerNation: nat,
    groupTeams,
    groupFixtures,
    playerGroupMatches,
    groupMatchIdx: 0,
    knockoutMatches: [],
    knockoutIdx: 0,
    advanced: false,
    finalPos: 0,
    playerGoals: 0,
    playerAssists: 0,
    apps: 0,
    matches: [],
    knockoutBracket: [],
    phase: 'group', // group | knockout | done
    honor: null,
    individualHonor: null,
    narrative: '',
  }
}

// 模拟当前轮次其他小组赛（玩家比赛之外的）
function simulateOtherGroupMatchLive(homeTeam, awayTeam) {
  const diff = homeTeam.strength - awayTeam.strength
  const expHome = clamp(1.3 + diff * 0.04, 0.3, 3.2)
  const expAway = clamp(1.3 - diff * 0.04, 0.3, 3.2)
  const gHome = poisson(expHome)
  const gAway = poisson(expAway)
  return { goalsFor: gHome, goalsAgainst: gAway }
}

function updateGroupStandingsLive(team, gf, ga) {
  team.played++
  team.gf += gf
  team.ga += ga
  if (gf > ga) { team.win++; team.points += 3 }
  else if (gf < ga) { team.loss++ }
  else { team.draw++; team.points += 1 }
}

// 为直播模式生成下一场比赛（返回 matchInfo，若无则推进到淘汰赛/结束）
export function nextLiveMatch(tournament) {
  const { phase } = tournament
  if (phase === 'group') {
    if (tournament.groupMatchIdx < tournament.playerGroupMatches.length) {
      return tournament.playerGroupMatches[tournament.groupMatchIdx]
    }
    // 玩家小组赛结束，模拟剩余并进入淘汰赛
    finalizeLiveGroupStage(tournament)
    if (tournament.advanced) {
      buildLiveKnockoutMatches(tournament)
      if (tournament.knockoutMatches.length > 0) {
        tournament.phase = 'knockout'
        return tournament.knockoutMatches[0]
      }
    }
    tournament.phase = 'done'
    finalizeLiveTournament(tournament)
    return null
  }
  if (phase === 'knockout') {
    if (tournament.knockoutIdx < tournament.knockoutMatches.length) {
      return tournament.knockoutMatches[tournament.knockoutIdx]
    }
    advanceLiveKnockout(tournament)
    if (tournament.knockoutIdx < tournament.knockoutMatches.length) {
      return tournament.knockoutMatches[tournament.knockoutIdx]
    }
    tournament.phase = 'done'
    finalizeLiveTournament(tournament)
    return null
  }
  return null
}

// 提交直播比赛结果
export function submitLiveMatchResult(tournament, matchInfo, result, player) {
  const { homeNation, awayNation, homeStrength, awayStrength, isPlayerHome, matchType } = matchInfo
  const goalsFor = isPlayerHome ? result.homeGoals : result.awayGoals
  const goalsAgainst = isPlayerHome ? result.awayGoals : result.homeGoals
  // 点球判定（淘汰赛平局）
  let penalty = null
  let win = goalsFor > goalsAgainst
  if (matchType === 'knockout' && goalsFor === goalsAgainst) {
    const diff = (isPlayerHome ? homeStrength : awayStrength) - (isPlayerHome ? awayStrength : homeStrength)
    const pw = Math.random() < clamp(0.5 + diff * 0.02, 0.3, 0.7)
    penalty = pw ? '胜' : '负'
    win = pw
  }
  // 玩家进球助攻（从 matchResult.playerContribution 读取）
  let pg = 0, pa = 0
  if (result.playerContribution) {
    pg = result.playerContribution.goals || 0
    pa = result.playerContribution.assists || 0
  } else {
    const isAttacker = ['ST','CF','LW','RW','CAM'].includes(player.position)
    const goalChance = clamp((player.ovr - 60) * 0.02, 0.05, 0.5) * (isAttacker ? 1.5 : 0.5)
    const assistChance = clamp((player.ovr - 60) * 0.015, 0.04, 0.4)
    pg = goalsFor > 0 && Math.random() < goalChance * goalsFor ? randInt(1, Math.min(2, goalsFor)) : 0
    pa = goalsFor > 0 && Math.random() < assistChance * goalsFor ? randInt(0, 1) : 0
  }
  tournament.playerGoals += pg
  tournament.playerAssists += pa
  tournament.apps++

  const matchRecord = {
    phase: matchType === 'group' ? '小组赛' : matchInfo.round,
    opponent: isPlayerHome ? awayNation : homeNation,
    oppStrength: isPlayerHome ? awayStrength : homeStrength,
    goalsFor,
    goalsAgainst,
    penalty,
    win,
    playerGoals: pg,
    playerAssists: pa,
  }
  tournament.matches.push(matchRecord)

  // 更新小组积分
  if (matchType === 'group') {
    const home = tournament.groupTeams[matchInfo.homeIdx]
    const away = tournament.groupTeams[matchInfo.awayIdx]
    updateGroupStandingsLive(home, result.homeGoals, result.awayGoals)
    updateGroupStandingsLive(away, result.awayGoals, result.homeGoals)
    tournament.groupMatchIdx++
  } else {
    tournament.knockoutBracket.push({
      round: matchInfo.round,
      opponent: isPlayerHome ? awayNation : homeNation,
      oppStrength: isPlayerHome ? awayStrength : homeStrength,
      goalsFor,
      goalsAgainst,
      penalty,
      win,
      playerGoals: pg,
      playerAssists: pa,
    })
    tournament.knockoutIdx++
    tournament._lastKoWin = win
    tournament._lastKoRound = matchInfo.round
  }
}

// 小组赛结束：模拟剩余非玩家对阵 + 排名
function finalizeLiveGroupStage(tournament) {
  const { groupTeams, groupFixtures } = tournament
  const playerIdx = groupTeams.findIndex(t => t.isPlayer)
  const otherFixtures = groupFixtures.filter(fx => fx.homeIdx !== playerIdx && fx.awayIdx !== playerIdx)
  for (const fx of otherFixtures) {
    const home = groupTeams[fx.homeIdx]
    const away = groupTeams[fx.awayIdx]
    if (home.played >= 3 && away.played >= 3) continue
    const m = simulateOtherGroupMatchLive(home, away)
    updateGroupStandingsLive(home, m.goalsFor, m.goalsAgainst)
    updateGroupStandingsLive(away, m.goalsAgainst, m.goalsFor)
  }
  groupTeams.sort((a, b) => b.points - a.points || (b.gf - b.ga) - (a.gf - a.ga) || b.gf - a.gf)
  groupTeams.forEach((t, i) => { t.pos = i + 1 })
  const playerTeam = groupTeams.find(t => t.isPlayer)
  tournament.advanced = playerTeam && playerTeam.pos <= 2
  if (!tournament.advanced) {
    tournament.finalPos = playerTeam?.pos === 3 ? 3 : 4
  }
}

function buildLiveKnockoutMatches(tournament) {
  const nat = tournament.playerNation
  const myStr = nationStrength(nat)
  const candidates = Object.keys(NATION_TO_CONFED).filter(n => {
    if (n === nat) return false
    if (tournament.comp.eligibleNations === 'ALL') return true
    return tournament.comp.eligibleNations.includes(n)
  })
  const groupOpps = tournament.playerGroupMatches.map(m => m.isPlayerHome ? m.awayNation : m.homeNation)
  const koRounds = tournament.comp.rounds.slice(1)
  const firstRound = koRounds[0]
  const oppPool = candidates.filter(n => !groupOpps.includes(n))
  const oppNation = oppPool.length ? pick(oppPool) : pick(candidates)
  const oppStr = nationStrength(oppNation)
  tournament.knockoutMatches.push({
    phase: '淘汰赛',
    round: firstRound,
    homeNation: nat,
    awayNation: oppNation,
    homeStrength: myStr,
    awayStrength: oppStr,
    isPlayerHome: true,
    isNeutral: true,
    matchType: 'knockout',
  })
}

function advanceLiveKnockout(tournament) {
  const lastWin = tournament._lastKoWin
  const lastRound = tournament._lastKoRound
  if (!lastWin) {
    if (lastRound === '16强') tournament.finalPos = 16
    else if (lastRound === '8强') tournament.finalPos = 8
    else if (lastRound === '半决赛') tournament.finalPos = 4
    else if (lastRound === '决赛') tournament.finalPos = 2
    return
  }
  if (lastRound === '决赛') {
    tournament.finalPos = 1
    return
  }
  const koRounds = tournament.comp.rounds.slice(1)
  const lastIdx = koRounds.indexOf(lastRound)
  const nextRound = koRounds[lastIdx + 1]
  if (!nextRound) {
    tournament.finalPos = 1
    return
  }
  const nat = tournament.playerNation
  const myStr = nationStrength(nat)
  const candidates = Object.keys(NATION_TO_CONFED).filter(n => {
    if (n === nat) return false
    if (tournament.comp.eligibleNations === 'ALL') return true
    return tournament.comp.eligibleNations.includes(n)
  })
  const usedOpps = tournament.knockoutBracket.map(b => b.opponent)
  const groupOpps = tournament.playerGroupMatches.map(m => m.isPlayerHome ? m.awayNation : m.homeNation)
  const oppPool = candidates.filter(n => !usedOpps.includes(n) && !groupOpps.includes(n))
  const oppNation = oppPool.length ? pick(oppPool) : pick(candidates)
  const oppStr = nationStrength(oppNation)
  tournament.knockoutMatches.push({
    phase: '淘汰赛',
    round: nextRound,
    homeNation: nat,
    awayNation: oppNation,
    homeStrength: myStr,
    awayStrength: oppStr,
    isPlayerHome: true,
    isNeutral: true,
    matchType: 'knockout',
  })
}

function finalizeLiveTournament(tournament) {
  const { comp, year, finalPos, playerNation } = tournament
  let honor = null
  if (finalPos === 1) honor = { tier: 'gold', text: `${comp.short}冠军 (${playerNation})`, season: year, type: 'intl' }
  else if (finalPos === 2) honor = { tier: 'silver', text: `${comp.short}亚军 (${playerNation})`, season: year, type: 'intl' }
  else if (finalPos === 3 || finalPos === 4) honor = { tier: 'bronze', text: `${comp.short}${finalPos === 3 ? '季军' : '四强'} (${playerNation})`, season: year, type: 'intl' }
  let individualHonor = null
  if (tournament.playerGoals >= 5 && finalPos <= 4) individualHonor = { tier: 'gold', text: `${comp.short}金靴 (${tournament.playerGoals}球)`, season: year, type: 'intl' }
  else if (tournament.playerGoals >= 3 && finalPos <= 2) individualHonor = { tier: 'silver', text: `${comp.short}银靴 (${tournament.playerGoals}球)`, season: year, type: 'intl' }
  tournament.honor = honor
  tournament.individualHonor = individualHonor
  tournament.narrative = `${comp.icon} ${year}年${comp.name}，${playerNation}最终获得${finalPos === 1 ? '冠军' : finalPos === 2 ? '亚军' : finalPos === 3 ? '季军' : finalPos === 4 ? '四强' : `第${finalPos}名`}。`
}

// 应用直播赛事结果到球员（与 playIntlTournament 等价）
export function applyLiveTournamentResult(player, tournament) {
  const result = {
    comp: tournament.comp,
    year: tournament.year,
    matches: tournament.matches,
    groupStandings: tournament.groupTeams,
    knockoutBracket: tournament.knockoutBracket,
    finalPos: tournament.finalPos,
    playerGoals: tournament.playerGoals,
    playerAssists: tournament.playerAssists,
    apps: tournament.apps,
    honor: tournament.honor,
    individualHonor: tournament.individualHonor,
    narrative: tournament.narrative,
    playerNation: tournament.playerNation,
  }
  // 应用结果到球员
  player.careerStats.goals += result.playerGoals
  player.careerStats.assists += result.playerAssists
  player.caps += result.apps
  player.intlGoals += result.playerGoals
  // 声望提升
  let repGain = 0
  if (result.finalPos === 1) repGain = 15
  else if (result.finalPos === 2) repGain = 10
  else if (result.finalPos === 3) repGain = 7
  else if (result.finalPos === 4) repGain = 4
  else repGain = 2
  player.reputation = clamp(player.reputation + repGain, 0, 100)
  player.morale = clamp(player.morale + repGain, 0, 100)
  // 荣誉
  const honors = []
  if (result.honor) honors.push({ ...result.honor, season: tournament.year })
  if (result.individualHonor) honors.push({ ...result.individualHonor, season: tournament.year })
  player.honors.push(...honors)
  // 成年正式赛事锁定国家队归属
  if (['WC','Euro','AsianCup','CopaAmerica'].includes(tournament.comp.code) && !player.nationLocked) {
    lockNation(player)
  }
  // 记录国际赛事历史
  if (!player.intlHistory) player.intlHistory = []
  player.intlHistory.push({
    year: tournament.year,
    comp: tournament.comp.short,
    finalPos: result.finalPos,
    goals: result.playerGoals,
    assists: result.playerAssists,
    apps: result.apps,
    honor: result.honor?.text,
    individualHonor: result.individualHonor?.text,
  })
  return result
}

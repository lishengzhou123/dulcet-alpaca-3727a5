// 游戏响应式状态与流程控制
import { reactive, computed, nextTick } from 'vue'
import { createPlayer, applyEffects, ageGrowth, advanceAge, calcOVR, calcValue, categoryValues, applyArchetype } from './engine/player.js'
import { buildSeason, generateTransferOffers, evaluateHonors, nationalTeamCheck } from './engine/career.js'
import { simulateLeague, simulatePlayerSeason } from './engine/league.js'
import { TEAMS, LEAGUES } from './data/leagues.js'
import { ARCHETYPES, archetypesForPosition, getArchetype } from './data/archetypes.js'
import { generateSkillTree, canUnlock, applyNode, squadRole } from './engine/skilltree.js'
import { generateSchedule } from './engine/schedule.js'
import { eligibleCups } from './engine/cupdraw.js'
import { simulateClubCup, eligibleClubCups } from './engine/clubCup.js'
import { playerCompetitions, simulateIntlTournament, eligibleNations, needsNationChoice, chooseNationality, lockNation, prepareLiveTournament, nextLiveMatch, submitLiveMatchResult, simulateIntlMatchForView, applyLiveTournamentResult } from './engine/intlCareer.js'
import { simulateFullMatch, simulateIntlMatch } from './engine/matchSim.js'
import { rollInjury, advanceInjuryRecovery, applyInjuryPenalties, applyInjuryPostEffects, isInjuryRecovered } from './engine/injury.js'
import { executeTraining as execTraining } from './engine/training.js'
import { generateSeasonNews } from './engine/news.js'
import { clamp, randInt, pick } from './engine/util.js'

export const state = reactive({
  screen: 'create', // create | archetype | event | summary | skilltree | transfer | retirement | honors | coach | ranking | schedule | cupdraw | nationchoice | intltournament | clubcup | careerprofile | awards | negotiation | training
  player: null,
  season: null,
  currentEvent: null,
  lastOutcome: null,
  showOutcome: false,
  summary: null,
  seasonStartOvr: 0,
  seasonStartValue: 0,
  offers: [],
  usedEventIds: new Set(),
  careerLog: [],
  coachCareer: null,
  ended: false,
  // FC26 新增
  archetypeOptions: [],
  skillTreeNodes: [],
  unlockedNodeIds: new Set(),
  lastObjectiveResults: null,
  // 新增：赛程 / 杯赛 / 覆盖屏返回
  schedule: null,
  cupEligible: [],
  previousScreen: null,
  // 国际赛事 / 国家队选择
  intlTournaments: [], // 当年待进行的国际赛事 [{ comp, year }]
  intlResults: [], // 已模拟的国际赛事结果
  afterIntlScreen: null, // 国际赛事结束后返回的屏
  nationChoiceOptions: [],
  // 俱乐部杯赛
  clubCupResults: [], // 当赛季已模拟的俱乐部杯赛结果
  // 比赛直播 / 球队信息 / 积分榜
  matchResult: null, // 当前比赛模拟结果
  viewTeam: null, // 查看的球队名（TeamInfo弹窗）
  showTeamInfo: false, // 是否显示球队信息弹窗
  // ===== 新系统 =====
  seasonAwards: [],  // 当前赛季获得的奖项（颁奖典礼展示用）
  negotiation: null, // { type: 'renew'|'transfer', offer }
  lastTransferIntro: null, // 转会介绍信息
  currentNews: [], // 当前赛季足坛公告（转会/伤病/教练/赛事新闻）
  showNews: false, // 是否显示公告面板
  reactedNews: {}, // { newsId: reactionType } 玩家已反应的新闻
  // 直播式国际赛事
  liveTournament: null, // 当前直播中的国际赛事对象
  liveMatchInfo: null, // 当前正在观看的国际赛事比赛信息
  liveResults: [], // 已完成的直播国际赛事结果列表
  liveTournamentIdx: 0, // 当前直播赛事索引
})

// 玩家面板计算属性
export const playerPanel = computed(() => {
  if (!state.player) return null
  const p = state.player
  return {
    ovr: p.ovr,
    value: p.value,
    potential: p.potential,
    age: p.age,
    categories: categoryValues(p.attrs),
    morale: p.morale,
    fitness: p.fitness,
    reputation: p.reputation,
  }
})

// 创建生涯（仅创建球员，进入原型选择）
export function createCareer(cfg) {
  const player = createPlayer(cfg)
  state.player = player
  state.usedEventIds = new Set()
  state.careerLog = []
  state.ended = false
  state.unlockedNodeIds = new Set()
  state.lastObjectiveResults = null
  state.reactedNews = {}
  // 进入原型选择屏
  state.archetypeOptions = archetypesForPosition(player.position)
  state.screen = 'archetype'
}

// 选择原型（进入正式生涯）
export function chooseArchetype(archetypeId) {
  const archetype = getArchetype(archetypeId)
  if (!archetype) return
  applyArchetype(state.player, archetype)
  // 初始化技能树节点
  state.skillTreeNodes = generateSkillTree(archetype)
  startSeason()
}

// 生成赛季比赛目标（FC26式 3目标）
function generateObjectives(player) {
  const pos = player.position
  const isFW = ['ST', 'CF', 'LW', 'RW', 'CAM'].includes(pos)
  const isMF = ['CM', 'CDM'].includes(pos)
  const isDF = ['CB', 'LB', 'RB'].includes(pos)
  const isGK = pos === 'GK'
  const ovr = player.ovr
  const objs = []

  // 主目标：位置相关核心数据
  if (isFW) {
    objs.push({
      id: 'goals',
      icon: '⚽',
      label: '赛季进球',
      desc: `攻入 ${Math.max(5, Math.round((ovr - 40) * 0.4))} 球`,
      target: Math.max(5, Math.round((ovr - 40) * 0.4)),
      metric: 'goals',
    })
  } else if (isMF) {
    objs.push({
      id: 'assists',
      icon: '🅰️',
      label: '赛季助攻',
      desc: `送出 ${Math.max(4, Math.round((ovr - 45) * 0.3))} 次助攻`,
      target: Math.max(4, Math.round((ovr - 45) * 0.3)),
      metric: 'assists',
    })
  } else if (isDF || isGK) {
    objs.push({
      id: 'apps',
      icon: '🛡️',
      label: '出场数',
      desc: `出战 ${Math.max(15, Math.round((ovr - 40) * 0.5))} 场比赛`,
      target: Math.max(15, Math.round((ovr - 40) * 0.5)),
      metric: 'apps',
    })
  }

  // 次目标：评分
  objs.push({
    id: 'rating',
    icon: '⭐',
    label: '场均评分',
    desc: `场均评分达到 ${(6.8 + Math.min(0.7, (ovr - 50) * 0.02)).toFixed(1)}`,
    target: Math.round((6.8 + Math.min(0.7, (ovr - 50) * 0.02)) * 10) / 10,
    metric: 'rating',
  })

  // 第三目标：发展类（OVR提升 或 出场 或 关键属性）
  const obj3Pool = [
    { id: 'growth', icon: '📈', label: '总评提升', desc: 'OVR至少+1', target: 1, metric: 'ovr_growth' },
    { id: 'teamwin', icon: '🏆', label: '球队排名', desc: '联赛前6', target: 6, metric: 'league_pos' },
  ]
  if (player.age <= 21) obj3Pool.push({ id: 'potential', icon: '🌱', label: '潜力兑现', desc: '自然成长3项以上', target: 3, metric: 'growth_count' })
  objs.push(pick(obj3Pool))

  return objs.map(o => ({ ...o, done: false, progress: 0 }))
}

// 开始一个赛季
export function startSeason() {
  const player = state.player
  // 重置赛季数据
  player.seasonStats = { apps: 0, goals: 0, assists: 0, rating: 6.5 }
  // 新赛季开始：体能恢复到较高水平（假期休整后）
  player.fitness = clamp(player.fitness + 30, 60, 100)
  // 记录赛季初快照（用于赛季总结计算整个赛季的变化）
  state.seasonStartOvr = player.ovr
  state.seasonStartValue = player.value
  const season = buildSeason(player, state.usedEventIds)
  season.year = player.birthYear + player.age
  // 生成赛季目标
  season.objectives = generateObjectives(player)
  state.season = season
  state.season.eventIndex = 0
  state.currentEvent = season.events[0]
  state.showOutcome = false
  state.lastOutcome = null
  // 生成本赛季足坛公告（转会/伤病/教练/赛事新闻）
  state.currentNews = generateSeasonNews(season.year, player.team, player.teamLeague)
  // 生成玩家赛程
  state.schedule = generateSchedule(player.teamLeague, player.team, season.year)
  // 检查杯赛资格（基于上赛季排名）
  const lastLog = state.careerLog[state.careerLog.length - 1]
  const lastPos = lastLog?.leaguePos || null
  state.cupEligible = eligibleCups(player, lastPos)

  // 检查是否需要国家队选择（17岁首次触发，或有新可入籍国家）
  if (needsNationChoice(player)) {
    state.nationChoiceOptions = eligibleNations(player)
    player.nationChoiceShown = true
    state.screen = 'nationchoice'
    return
  }

  // 若有杯赛资格，先进入抽签；否则直接开始事件
  if (state.cupEligible.length > 0) {
    state.screen = 'cupdraw'
  } else {
    state.screen = 'event'
  }
}

// 国家队选择 - 确认
export function confirmNationChoice(nation) {
  const player = state.player
  chooseNationality(player, nation)
  // 重算身价（国家队归属可能影响声望）
  player.value = calcValue(player.attrs, player.position, player.age, player.ovr, player.potential, player.reputation)
  // 选择后进入杯赛抽签或事件
  if (state.cupEligible.length > 0) {
    state.screen = 'cupdraw'
  } else {
    state.screen = 'event'
  }
}

// 国家队选择 - 暂缓
export function deferNationChoice() {
  // 暂不做决定，进入赛季
  if (state.cupEligible.length > 0) {
    state.screen = 'cupdraw'
  } else {
    state.screen = 'event'
  }
}

// 模拟一项国际赛事并应用结果
export function playIntlTournament(comp, year) {
  const player = state.player
  const result = simulateIntlTournament(player, comp, year)
  // 应用结果到球员
  player.careerStats.goals += result.playerGoals
  player.careerStats.assists += result.playerAssists
  player.caps += result.apps
  player.intlGoals += result.playerGoals
  // 声望提升（基于名次）
  let repGain = 0
  if (result.finalPos === 1) repGain = 15
  else if (result.finalPos === 2) repGain = 10
  else if (result.finalPos === 3) repGain = 7
  else if (result.finalPos === 4) repGain = 4
  else repGain = 2
  player.reputation = clamp(player.reputation + repGain, 0, 100)
  // 士气提升
  player.morale = clamp(player.morale + repGain, 0, 100)
  // 荣誉
  const honors = []
  if (result.honor) {
    honors.push({ ...result.honor, season: year })
  }
  if (result.individualHonor) {
    honors.push({ ...result.individualHonor, season: year })
  }
  player.honors.push(...honors)
  // 成年正式赛事（世界杯/欧洲杯/亚洲杯/美洲杯）锁定国家队归属
  if (['WC','Euro','AsianCup','CopaAmerica'].includes(comp.code) && !player.nationLocked) {
    lockNation(player)
  }
  // 记录国际赛事历史
  if (!player.intlHistory) player.intlHistory = []
  player.intlHistory.push({
    year,
    comp: comp.short,
    finalPos: result.finalPos,
    goals: result.playerGoals,
    assists: result.playerAssists,
    apps: result.apps,
    honor: result.honor?.text,
    individualHonor: result.individualHonor?.text,
  })
  // 重算身价（声望变化）
  player.value = calcValue(player.attrs, player.position, player.age, player.ovr, player.potential, player.reputation)
  state.intlResults.push(result)
  return result
}

// 跳过剩余国际赛事
export function skipIntlTournament() {
  state.intlTournaments = []
  state.intlResults = []
  state.liveTournament = null
  state.liveMatchInfo = null
  state.liveResults = []
  state.liveTournamentIdx = 0
  state.screen = state.afterIntlScreen || 'skilltree'
}

// ===== 直播式国际赛事：观看每场比赛 =====
// 开始直播一项国际赛事（生成赛事结构，准备观看第一场）
export function startLiveIntlTournament(comp, year) {
  const player = state.player
  const tournament = prepareLiveTournament(player, comp, year)
  state.liveTournament = tournament
  state.liveResults = []
  // 进入赛事直播屏
  state.screen = 'intltournament'
}

// 观看下一场国际赛事比赛（生成比赛并跳转到 MatchView）
export function viewNextIntlMatch() {
  const tournament = state.liveTournament
  if (!tournament) return
  const player = state.player
  // 获取下一场比赛信息
  const matchInfo = nextLiveMatch(tournament)
  if (!matchInfo) {
    // 赛事已结束
    finalizeLiveTournament()
    return
  }
  state.liveMatchInfo = matchInfo
  // 模拟比赛（用于直播观看，互动模式）
  const matchResult = simulateIntlMatchForView(matchInfo, player)
  state.matchResult = matchResult
  state.previousScreen = 'intltournament'
  state.screen = 'matchview'
}

// 国际赛事比赛观看结束（从 MatchView 返回后调用）
export function finishIntlMatchView() {
  const tournament = state.liveTournament
  if (!tournament) {
    state.screen = 'intltournament'
    return
  }
  const matchInfo = state.liveMatchInfo
  const result = state.matchResult
  if (!matchInfo || !result) {
    state.screen = 'intltournament'
    return
  }
  // 提交比赛结果到赛事
  submitLiveMatchResult(tournament, matchInfo, result, state.player)
  // 检查是否还有下一场
  const nextMatch = nextLiveMatch(tournament)
  state.liveMatchInfo = null
  state.matchResult = null
  if (!nextMatch) {
    // 赛事结束
    finalizeLiveTournament()
  } else {
    // 还有下一场，回到赛事屏等待用户点击继续
    state.screen = 'intltournament'
  }
}

// 跳过当前赛事剩余比赛（快速模拟剩余）
export function skipRemainingLiveMatches() {
  const tournament = state.liveTournament
  if (!tournament) return
  const player = state.player
  // 快速模拟剩余比赛
  while (tournament.phase !== 'done') {
    const matchInfo = nextLiveMatch(tournament)
    if (!matchInfo) break
    // 自动模拟（auto 模式：选最优）
    const result = simulateIntlMatch(
      matchInfo.homeNation, matchInfo.awayNation,
      matchInfo.homeStrength, matchInfo.awayStrength,
      player, matchInfo.isNeutral, 'auto'
    )
    submitLiveMatchResult(tournament, matchInfo, result, player)
  }
  finalizeLiveTournament()
}

// 完成当前直播赛事（应用结果，保留直播对象用于结果展示，等待用户点击"下一项"）
function finalizeLiveTournament() {
  const tournament = state.liveTournament
  if (!tournament) return
  // 应用结果到球员
  const result = applyLiveTournamentResult(state.player, tournament)
  // 重算身价
  state.player.value = calcValue(state.player.attrs, state.player.position, state.player.age, state.player.ovr, state.player.potential, state.player.reputation)
  state.liveResults.push(result)
  // 保留 liveTournament（phase='done'）用于结果展示，由 proceedToNextTournament 推进
  state.liveMatchInfo = null
  state.matchResult = null
}

// 用户点击"下一项赛事"或"继续职业生涯"后调用：清理并推进
export function proceedToNextTournament() {
  state.liveTournament = null
  state.liveMatchInfo = null
  state.liveTournamentIdx += 1
  if (state.liveTournamentIdx >= state.intlTournaments.length) {
    // 全部赛事结束
    state.intlTournaments = []
    state.intlResults = state.liveResults
    state.liveResults = []
    state.liveTournamentIdx = 0
    state.screen = state.afterIntlScreen || 'skilltree'
  } else {
    // 还有下一项赛事，留在 intltournament 屏等待用户开始
    state.screen = 'intltournament'
  }
}

// 覆盖屏导航：排行榜 / 赛程 / 生涯档案
export function openRanking() {
  state.previousScreen = state.screen
  state.screen = 'ranking'
}
export function openSchedule() {
  state.previousScreen = state.screen
  state.screen = 'schedule'
}
export function openCareerProfile() {
  state.previousScreen = state.screen
  state.screen = 'careerprofile'
}
export function returnFromOverlay() {
  state.screen = state.previousScreen || 'event'
}

// 全局安全返回：根据当前屏智能回到上一屏（用于无明确返回键的页面）
export function goBack() {
  // 覆盖屏 → previousScreen
  if (['ranking','schedule','standings','careerprofile','matchview','negotiation'].includes(state.screen)) {
    state.screen = state.previousScreen || 'event'
    return
  }
  // 国际赛事阶段：保留赛事数据，回到 afterIntlScreen
  if (state.screen === 'intltournament') {
    // 直播中不允许直接退出（避免数据丢失），仅在介绍/结束阶段允许
    if (!state.liveTournament || state.liveTournament.phase === 'done') {
      state.liveTournament = null
      state.screen = state.afterIntlScreen || 'skilltree'
    }
    return
  }
  // 默认：回 event 屏
  state.screen = 'event'
}

// 比赛直播：模拟并观看一场比赛
export function startMatchView(opponentName) {
  const player = state.player
  const homeTeam = TEAMS.find(t => t.name === player.team)
  const awayTeam = TEAMS.find(t => t.name === opponentName) || { name: opponentName, city: '', strength: 65, league: player.teamLeague }
  // 如果玩家是客队，交换
  let home, away
  if (state.currentEvent?.home === false) {
    home = awayTeam
    away = homeTeam
  } else {
    home = homeTeam
    away = awayTeam
  }
  state.matchResult = simulateFullMatch(home, away, player)
  state.previousScreen = state.screen
  state.screen = 'matchview'
}

// 比赛直播结束
export function finishMatchView() {
  state.matchResult = null
  state.screen = state.previousScreen || 'event'
}

// 积分榜覆盖屏
export function openStandings() {
  state.previousScreen = state.screen
  state.screen = 'standings'
}

// 球队信息弹窗
export function openTeamInfo(teamName) {
  state.viewTeam = teamName
  state.showTeamInfo = true
}
export function closeTeamInfo() {
  state.showTeamInfo = false
  state.viewTeam = null
}

// 杯赛抽签完成后，进入赛季事件
export function finishCupDraw() {
  state.screen = 'event'
}

// 选择事件选项
export function chooseOption(optionIdx) {
  const ev = state.currentEvent
  if (!ev) return
  const option = ev.options[optionIdx]
  const prevOvr = state.player.ovr
  const prevValue = state.player.value
  const deltas = applyEffects(state.player, option.effects)
  // 比赛类事件消耗体能 + 有概率受伤
  if (ev.type === 'match' || ev.type === 'keymoment') {
    const matchFatigue = randInt(8, 18)
    state.player.fitness = clamp(state.player.fitness - matchFatigue, 0, 100)
    // 赛中受伤检查
    if (!state.player.injury) {
      const matchInjury = rollInjury(state.player, { isCongested: state.player.fitness < 50 })
      if (matchInjury) {
        applyInjuryPenalties(state.player)
        state.player.injury = matchInjury
        if (!state.player.injuryHistory) state.player.injuryHistory = []
        state.player.injuryHistory.push({ ...matchInjury, seasonYear: state.season.year })
      }
    }
  }
  state.lastOutcome = {
    option,
    deltas,
    prevOvr,
    newOvr: state.player.ovr,
    prevValue,
    newValue: state.player.value,
  }
  state.showOutcome = true
}

// 继续到下一事件或赛季结束
export function continueSeason() {
  const season = state.season
  season.eventIndex += 1
  state.showOutcome = false
  if (season.eventIndex >= season.events.length) {
    finishSeason()
  } else {
    state.currentEvent = season.events[season.eventIndex]
    // 每个事件之间恢复少量体能（模拟休息日）
    const player = state.player
    player.fitness = clamp(player.fitness + randInt(5, 12), 0, 100)
    // 如果有伤病，推进恢复
    if (player.injury) {
      advanceInjuryRecovery(player.injury, 1)
      if (isInjuryRecovered(player.injury)) {
        applyInjuryPostEffects(player, player.injury)
        player.injury = null
      }
    }
    // 比赛类事件前插入训练机会（每隔一场比赛可训练）
    const ev = state.currentEvent
    if (ev.type === 'match' || ev.type === 'keymoment') {
      if (!state._trainCounter) state._trainCounter = 0
      state._trainCounter++
      if (state._trainCounter % 2 === 0) {
        state.screen = 'training'
        return
      }
    }
    state.screen = 'event'
  }
}

// 执行训练
export function executeDrill(drillId) {
  return execTraining(state.player, drillId)
}

// 跳过训练
export function skipTraining() {
  state.screen = 'event'
}

// 赛季结束处理
export function finishSeason() {
  const player = state.player
  // 赛季初快照（含事件成长 + 自然成长的总变化）
  const prevOvr = state.seasonStartOvr
  const prevValue = state.seasonStartValue
  // 重算OVR确保最新
  player.ovr = calcOVR(player.attrs, player.position)
  // 模拟联赛
  const leagueResult = simulateLeague(player.teamLeague, player.team)
  leagueResult.year = state.season.year
  // 模拟球员赛季基础数据
  const team = TEAMS.find(t => t.name === player.team)
  const base = simulatePlayerSeason(player, team)
  // 合并事件进球助攻
  const eventGoals = player.seasonStats.goals
  const eventAssists = player.seasonStats.assists
  const totalGoals = base.baseGoals + eventGoals
  const totalAssists = base.baseAssists + eventAssists
  const finalRating = Math.round(clamp(base.avgRating + (eventGoals + eventAssists) * 0.03, 5.0, 9.5) * 10) / 10
  const seasonStats = {
    apps: base.apps,
    goals: totalGoals,
    assists: totalAssists,
    rating: finalRating,
    eventGoals,
    eventAssists,
  }
  // 累计生涯数据
  player.careerStats.apps += seasonStats.apps
  player.careerStats.goals += seasonStats.goals
  player.careerStats.assists += seasonStats.assists
  // 国家队
  const nt = nationalTeamCheck(player)
  if (nt.called) {
    player.caps += nt.caps
    player.intlGoals += nt.intlGoals
  }
  // 年龄成长（自然）
  const growth = ageGrowth(player)
  const newOvr = player.ovr
  const newValue = player.value
  // 荣誉
  const honors = evaluateHonors(player, leagueResult, seasonStats)
  player.honors.push(...honors)

  // ===== 俱乐部杯赛模拟（按现实时间线） =====
  // 基于本赛季联赛排名决定下赛季杯赛资格；这里用本赛季资格+本赛季联赛排名模拟本年度杯赛
  const cupEligibleThisSeason = state.cupEligible || []
  const clubCupResults = []
  for (const cup of cupEligibleThisSeason) {
    const result = simulateClubCup(player, cup.code, state.season.year)
    if (result) {
      // 应用结果到球员
      player.careerStats.goals += result.playerGoals
      player.careerStats.assists += result.playerAssists
      // 声望提升
      let repGain = 0
      if (result.finalPos === 1) repGain = 12
      else if (result.finalPos === 2) repGain = 8
      else if (result.finalPos === 4) repGain = 5
      else if (result.finalPos === 8) repGain = 3
      else repGain = 1
      player.reputation = clamp(player.reputation + repGain, 0, 100)
      player.morale = clamp(player.morale + repGain, 0, 100)
      // 累计杯赛进球到赛季数据
      seasonStats.goals += result.playerGoals
      seasonStats.assists += result.playerAssists
      seasonStats.apps += result.apps
      // 荣誉入账
      for (const h of (result.honors || [])) {
        player.honors.push(h)
        honors.push(h)
      }
      clubCupResults.push(result)
    }
  }
  state.clubCupResults = clubCupResults
  // 杯赛声望变化后重算身价
  player.value = calcValue(player.attrs, player.position, player.age, player.ovr, player.potential, player.reputation)

  // 合同年递减
  player.contractYears = Math.max(0, player.contractYears - 1)

  // FC26: 比赛目标结算 + SP奖励
  const objectives = (state.season.objectives || []).map(o => {
    let progress = 0
    let done = false
    if (o.metric === 'goals') progress = seasonStats.goals
    else if (o.metric === 'assists') progress = seasonStats.assists
    else if (o.metric === 'apps') progress = seasonStats.apps
    else if (o.metric === 'rating') progress = seasonStats.rating
    else if (o.metric === 'ovr_growth') progress = Math.max(0, newOvr - prevOvr)
    else if (o.metric === 'league_pos') progress = leagueResult?.playerRow?.pos || 99
    else if (o.metric === 'growth_count') progress = (growth || []).length
    // 完成判定
    if (o.metric === 'league_pos') done = progress <= o.target
    else done = progress >= o.target
    return { ...o, progress, done }
  })
  const completedCount = objectives.filter(o => o.done).length
  // SP奖励：基础2 + 完成目标数 + 评分奖励
  const ratingBonus = seasonStats.rating >= 7.5 ? 1 : 0
  const spGained = 2 + completedCount + ratingBonus
  player.skillPoints = (player.skillPoints || 0) + spGained
  state.lastObjectiveResults = { objectives, completedCount, spGained, ratingBonus }

  // 生涯日志（含俱乐部杯赛记录）
  const logEntry = {
    age: player.age,
    year: state.season.year,
    team: player.team,
    league: LEAGUES[player.teamLeague]?.short || '',
    ovr: newOvr,
    value: newValue,
    goals: seasonStats.goals,
    assists: seasonStats.assists,
    apps: seasonStats.apps,
    rating: seasonStats.rating,
    leaguePos: leagueResult?.playerRow?.pos,
    honors: honors.map(h => h.text),
    nationalTeam: nt.called ? `${nt.caps}场/${nt.intlGoals}球` : null,
    promoted: leagueResult?.promoted,
    relegated: leagueResult?.relegated,
    spGained,
    objectives: objectives.map(o => ({ label: o.label, done: o.done })),
    clubCups: clubCupResults.map(r => ({
      code: r.cup.code,
      name: r.cup.name,
      short: r.cup.short,
      icon: r.cup.icon,
      finalPos: r.finalPos,
      goals: r.playerGoals,
      assists: r.playerAssists,
      apps: r.apps,
      honor: r.honor?.text,
    })),
  }
  state.careerLog.push(logEntry)

  // 升降级：更新球队联赛
  if (leagueResult?.promoted && player.teamLeague === 'CSL2') {
    player.teamLeague = 'CSL'
  } else if (leagueResult?.relegated && player.teamLeague === 'CSL') {
    player.teamLeague = 'CSL2'
  }

  // 更新各联赛效力年数（用于居住入籍判定）
  if (!player.yearsInLeagues) player.yearsInLeagues = {}
  player.yearsInLeagues[player.teamLeague] = (player.yearsInLeagues[player.teamLeague] || 0) + 1

  // 检查当年的国际赛事
  const intlComps = playerCompetitions(player, state.season.year)
  state.intlTournaments = intlComps.map(c => ({ comp: c, year: state.season.year }))
  state.intlResults = []

  // ===== 颁奖系统：将赛季奖项存入 state.seasonAwards 以展示颁奖典礼 =====
  state.seasonAwards = honors

  // ===== 伤病随机：赛季末带疲劳进行恢复训练，有概率触发旧伤/疲劳性伤病 =====
  if (!player.injury) {
    const fatigueInjury = rollInjury(player, { isCongested: player.fitness < 65 })
    if (fatigueInjury) {
      // 赛季末发生的伤病影响下赛季初的比赛
      applyInjuryPenalties(player)
      player.injury = fatigueInjury
      player.morale = clamp(player.morale - (fatigueInjury.severity === 'severe' ? 18 : fatigueInjury.severity === 'moderate' ? 8 : 3), 0, 100)
      if (!player.injuryHistory) player.injuryHistory = []
      player.injuryHistory.push({ ...fatigueInjury, seasonYear: state.season.year })
    }
  } else {
    // 继续恢复（旧伤）
    advanceInjuryRecovery(player.injury, 4)
    if (isInjuryRecovered(player.injury)) {
      applyInjuryPostEffects(player, player.injury)
      player.injury = null
    }
  }
  // 无论是否受伤，赛季末都有1-4周假期恢复
  if (player.injury) advanceInjuryRecovery(player.injury, 3)

  state.summary = {
    seasonStats,
    leagueResult,
    growth,
    honors,
    nationalTeam: nt,
    prevOvr,
    newOvr,
    prevValue,
    newValue,
    logEntry,
    objectives,
    spGained,
    intlTournaments: state.intlTournaments,
    clubCupResults,
    newInjury: state.player.injury || null,
  }
  state.screen = 'summary'
}

// 赛季总结后：先进入颁奖典礼，再去技能树/国际赛事
export function proceedAfterSummary() {
  // 先去颁奖典礼（如果有奖项）
  if (state.seasonAwards && state.seasonAwards.length > 0) {
    state.screen = 'awards'
  } else {
    openAwardsNext()
  }
}

// 颁奖典礼下一步：技能树/国际赛事
export function openAwardsNext() {
  if (state.intlTournaments.length > 0) {
    state.afterIntlScreen = 'skilltree'
    state.screen = 'intltournament'
  } else {
    state.screen = 'skilltree'
  }
}

// 进入技能树（赛季总结后）
export function openSkillTree() {
  state.screen = 'skilltree'
}

// 解锁一个技能树节点
export function unlockSkillNode(nodeId) {
  const player = state.player
  const node = state.skillTreeNodes.find(n => n.id === nodeId)
  if (!node) return false
  if (state.unlockedNodeIds.has(nodeId)) return false
  if (!canUnlock(node, state.unlockedNodeIds)) return false
  if ((player.skillPoints || 0) < node.cost) return false
  // 扣SP、应用奖励、记录解锁
  player.skillPoints -= node.cost
  const archetype = getArchetype(player.archetype)
  applyNode(player, node, archetype)
  state.unlockedNodeIds.add(nodeId)
  // 重算OVR/身价（属性变化后）
  player.ovr = calcOVR(player.attrs, player.position)
  player.value = calcValue(player.attrs, player.position, player.age, player.ovr, player.potential, player.reputation)
  return true
}

// 进入转会窗
export function startTransferWindow() {
  const player = state.player
  state.offers = generateTransferOffers(player)
  state.screen = 'transfer'
}

// 打开合同谈判（续约/转会签约）
export function openNegotiation(cfg) {
  state.negotiation = { ...cfg }
  state.screen = 'negotiation'
}

// 谈判结果处理
export function resolveNegotiation(result) {
  const player = state.player
  if (!result.accepted) {
    // 放弃谈判：先切屏，下个 tick 再清数据
    state.screen = 'transfer'
    nextTick(() => { state.negotiation = null })
    return
  }
  const c = result.contract
  const n = state.negotiation
  if (n?.type === 'renew') {
    // 续约
    player.salary = c.salary
    player.contractYears = c.years
    player.money += c.signingBonus || 0
    player.morale = clamp(player.morale + 6, 0, 100)
  } else if (n?.type === 'transfer' && n.offer) {
    // 转会签约
    const offer = n.offer
    player.team = offer.team
    player.teamLeague = offer.league
    player.salary = c.salary || offer.salary
    player.contractYears = c.years || offer.contractYears
    player.reputation = clamp(player.reputation + (offer.repGain || 0), 0, 100)
    player.money += c.signingBonus || 0
    player.morale = clamp(player.morale + 10, 0, 100)
    player.coachRelation = 55
    player.teammateRelation = 50
  }
  // 先切屏（advanceToNext 会改 screen），下个 tick 再清 negotiation
  // 避免 NegotiationView 的 v-if 和 App.vue 的 v-else-if 同时变化导致 subTree 为 null
  advanceToNext()
  nextTick(() => { state.negotiation = null })
}

// 选择转会（FC26 增强：先进入签约谈判）
export function chooseTransfer(offer) {
  const player = state.player
  if (offer === 'stay') {
    // 留队：如果合同只剩1年或更少，建议续约
    if (player.contractYears <= 1) {
      openNegotiation({ type: 'renew' })
      return
    }
    // 有合同在身则直接留队
    player.morale = clamp(player.morale + 2, 0, 100)
    advanceToNext()
  } else {
    // 转会：先进入签约谈判
    openNegotiation({ type: 'transfer', offer })
  }
}

// 推进到下一年 / 退役判定
export function advanceToNext() {
  const player = state.player
  // 发放年薪（所有路径统一）
  player.money = (player.money || 0) + (player.salary || 0)
  advanceAge(player)
  // 重算身价（年龄变化）
  player.value = calcValue(player.attrs, player.position, player.age, player.ovr, player.potential, player.reputation)
  // 40岁退役判定
  if (player.age >= 40) {
    state.screen = 'retirement'
  } else {
    startSeason()
  }
}

// 退役选择
export function chooseRetirement(choice) {
  const player = state.player
  if (choice === 'retire') {
    state.screen = 'honors'
    state.ended = true
  } else if (choice === 'coach') {
    startCoachCareer()
  } else if (choice === 'manager') {
    startManagerCareer()
  } else if (choice === 'commentator') {
    startCommentatorCareer()
  } else if (choice === 'academy') {
    startAcademyCareer()
  } else if (choice === 'ambassador') {
    startAmbassadorCareer()
  } else {
    // 继续
    startSeason()
  }
}

// 教练生涯（简化模拟）
export function startCoachCareer() {
  const player = state.player
  state.coachCareer = reactive({
    type: 'coach',
    age: player.age,
    year: player.birthYear + player.age,
    club: player.team,
    league: player.teamLeague,
    reputation: 30,
    trophies: [],
    log: [],
  })
  state.screen = 'coach'
}

// 体育总监/俱乐部管理层
export function startManagerCareer() {
  const player = state.player
  state.coachCareer = reactive({
    type: 'manager',
    age: player.age,
    year: player.birthYear + player.age,
    club: player.team,
    league: player.teamLeague,
    reputation: 25,
    trophies: [],
    log: [],
  })
  state.screen = 'coach'
}

// 足球解说员/评论员
export function startCommentatorCareer() {
  const player = state.player
  state.coachCareer = reactive({
    type: 'commentator',
    age: player.age,
    year: player.birthYear + player.age,
    club: '电视台/网络平台',
    league: player.teamLeague,
    reputation: 20,
    trophies: [],
    log: [],
  })
  state.screen = 'coach'
}

// 青训学院创始人
export function startAcademyCareer() {
  const player = state.player
  state.coachCareer = reactive({
    type: 'academy',
    age: player.age,
    year: player.birthYear + player.age,
    club: `${player.name}足球学院`,
    league: player.teamLeague,
    reputation: 15,
    trophies: [],
    log: [],
  })
  state.screen = 'coach'
}

// 品牌大使/商业代言
export function startAmbassadorCareer() {
  const player = state.player
  state.coachCareer = reactive({
    type: 'ambassador',
    age: player.age,
    year: player.birthYear + player.age,
    club: '自由身份',
    league: player.teamLeague,
    reputation: 10,
    trophies: [],
    log: [],
  })
  state.screen = 'coach'
}

export function simulateCoachSeason() {
  const c = state.coachCareer
  if (!c) return
  const careerType = c.type || 'coach'

  if (careerType === 'coach' || careerType === 'manager') {
    // 教练/管理层：模拟联赛成绩
    const team = TEAMS.find(t => t.name === c.club)
    const leagueResult = simulateLeague(c.league, c.club)
    leagueResult.year = c.year
    const pos = leagueResult?.playerRow?.pos
    const trophies = []
    if (pos === 1) trophies.push(`${LEAGUES[c.league].short}冠军(${careerType === 'coach' ? '主教练' : '体育总监'})`)
    const repChange = pos === 1 ? 12 : pos <= 3 ? 6 : pos <= 6 ? 2 : -2
    c.reputation = clamp(c.reputation + repChange, 0, 100)
    c.log.push({
      age: c.age, year: c.year, club: c.club, league: LEAGUES[c.league].short,
      pos, points: leagueResult?.playerRow?.points, trophies, achievement: getCareerAchievement(careerType, c.reputation),
    })
    c.trophies.push(...trophies)
  } else if (careerType === 'commentator') {
    // 解说员：声望逐年增长，偶尔获得行业认可
    const repChange = randInt(3, 8)
    c.reputation = clamp(c.reputation + repChange, 0, 100)
    const trophies = []
    if (c.reputation >= 50 && Math.random() < 0.2) trophies.push(`${c.year}年度最佳解说员`)
    if (c.reputation >= 70 && Math.random() < 0.15) trophies.push(`${c.year}体育传媒大奖`)
    c.log.push({
      age: c.age, year: c.year, club: c.club, league: LEAGUES[c.league]?.short || '',
      pos: null, points: null, trophies, achievement: getCareerAchievement(careerType, c.reputation),
    })
    c.trophies.push(...trophies)
  } else if (careerType === 'academy') {
    // 青训学院：培养球员数量逐年增长
    const repChange = randInt(2, 6)
    c.reputation = clamp(c.reputation + repChange, 0, 100)
    const students = randInt(10, 50)
    const trophies = []
    if (c.reputation >= 40 && Math.random() < 0.15) trophies.push(`${c.year}青训培养新星入选国少队`)
    if (c.reputation >= 60 && Math.random() < 0.1) trophies.push(`${c.year}青训学院年度优秀基地`)
    c.log.push({
      age: c.age, year: c.year, club: c.club, league: '',
      pos: null, points: students, trophies, achievement: getCareerAchievement(careerType, c.reputation),
    })
    c.trophies.push(...trophies)
  } else if (careerType === 'ambassador') {
    // 品牌大使：商业价值增长
    const repChange = randInt(4, 10)
    c.reputation = clamp(c.reputation + repChange, 0, 100)
    const trophies = []
    if (c.reputation >= 40 && Math.random() < 0.25) trophies.push(`${c.year}年度体育商业代言`)
    if (c.reputation >= 60 && Math.random() < 0.15) trophies.push(`${c.year}品牌影响力大奖`)
    c.log.push({
      age: c.age, year: c.year, club: c.club, league: '',
      pos: null, points: null, trophies, achievement: getCareerAchievement(careerType, c.reputation),
    })
    c.trophies.push(...trophies)
  }

  c.age += 1
  c.year += 1
}

function getCareerAchievement(type, reputation) {
  if (type === 'coach') {
    if (reputation >= 90) return '传奇名帅'
    if (reputation >= 70) return '冠军教头'
    if (reputation >= 50) return '资深教练'
    if (reputation >= 30) return '职业教练'
    return '新晋教练'
  }
  if (type === 'manager') {
    if (reputation >= 90) return '足坛教父'
    if (reputation >= 70) return '顶级体育总监'
    if (reputation >= 50) return '资深管理者'
    return '新晋管理者'
  }
  if (type === 'commentator') {
    if (reputation >= 90) return '金牌解说'
    if (reputation >= 70) return '知名评论员'
    if (reputation >= 50) return '职业解说员'
    return '新晋解说'
  }
  if (type === 'academy') {
    if (reputation >= 90) return '青训教父'
    if (reputation >= 70) return '青训名家'
    if (reputation >= 50) return '优秀青训导师'
    return '青训创办者'
  }
  if (type === 'ambassador') {
    if (reputation >= 90) return '商业传奇'
    if (reputation >= 70) return '体育商业巨星'
    if (reputation >= 50) return '品牌代言人'
    return '体坛新面孔'
  }
  return ''
}

// 重新开始
export function resetGame() {
  state.player = null
  state.season = null
  state.currentEvent = null
  state.summary = null
  state.seasonStartOvr = 0
  state.seasonStartValue = 0
  state.offers = []
  state.usedEventIds = new Set()
  state.careerLog = []
  state.coachCareer = null
  state.ended = false
  state.archetypeOptions = []
  state.skillTreeNodes = []
  state.unlockedNodeIds = new Set()
  state.lastObjectiveResults = null
  state.schedule = null
  state.cupEligible = []
  state.previousScreen = null
  state.intlTournaments = []
  state.intlResults = []
  state.afterIntlScreen = null
  state.nationChoiceOptions = []
  state.clubCupResults = []
  state.matchResult = null
  state.viewTeam = null
  state.showTeamInfo = false
  state.currentNews = []
  state.showNews = false
  state.screen = 'create'
}

// 足坛公告面板
export function openNewsBoard() {
  state.showNews = true
}
export function closeNews() {
  state.showNews = false
}
export function refreshNews() {
  if (state.player && state.season) {
    state.currentNews = generateSeasonNews(state.season.year, state.player.team, state.player.teamLeague)
  }
}

// 对一条新闻做出反应（👍点赞 / 🔥火热 / 😮惊讶）
// 仅能给同一条新闻反应一次；与玩家相关的新闻反应效果翻倍
export function reactToNews(newsId, reactionType) {
  if (!state.player) return false
  if (state.reactedNews[newsId]) return false // 已反应过

  const news = state.currentNews.find(n => n.id === newsId)
  if (!news) return false

  const related = !!news.playerRelated
  const mul = related ? 2 : 1
  // 不同反应对应不同微小加成
  if (reactionType === 'like') {
    // 👍 点赞：士气 +1/+2
    state.player.morale = Math.min(100, (state.player.morale || 50) + 1 * mul)
  } else if (reactionType === 'fire') {
    // 🔥 火热：声望 +1/+2
    state.player.reputation = Math.min(100, (state.player.reputation || 0) + 1 * mul)
  } else if (reactionType === 'wow') {
    // 😮 惊讶：教练关系 +1/+2（被大新闻震惊，与教练讨论）
    state.player.coachRelation = Math.min(100, (state.player.coachRelation || 50) + 1 * mul)
  }
  // 标记已反应
  state.reactedNews[newsId] = reactionType
  return true
}

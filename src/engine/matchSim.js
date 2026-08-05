// 比赛模拟引擎 —— 分钟级事件时间线 + FC26 式关键时刻决策点
// 关键时刻类型：penalty(点球)、oneonone(单刀)、freekick(任意球)、counter(反击)、
//                penaltyArea(禁区混战)、cross(传中)、corner(角球)、lastevent(绝杀)
import { TEAMS } from '../data/leagues.js'
import { getStartingXI, squadOvr } from '../data/teamSquads.js'
import { clamp, randInt, pick, shuffle } from './util.js'

// ===== 模板：进球/机会/扑救描述 =====
const GOAL_DESCS = [
  '{scorer}禁区内接队友直塞，冷静推射远角破门！',
  '{scorer}禁区外起脚远射，皮球划出弧线钻入死角！',
  '{scorer}头球攻门！门将扑救不及，球进了！',
  '{scorer}单刀面对门将，一记挑射破门！',
  '{scorer}接角球头槌建功，球砸入网窝！',
  '{scorer}禁区内混战中抢点射门得分！',
  '{scorer}反击中长驱直入，低射远角入网！',
  '{scorer}任意球直接射门，皮球绕过人墙入网！',
  '{scorer}点球命中！冷静推射左下角！',
  '{scorer}接边路传中凌空抽射破门！',
]
const CHANCE_DESCS = [
  '{scorer}禁区前沿远射，皮球擦柱而出！',
  '{scorer}单刀球被门将神勇扑出！',
  '{scorer}头球攻门稍稍偏出立柱！',
  '{scorer}禁区内的射门被封堵！',
  '{scorer}凌空抽射打高，错失良机！',
]
const SAVE_DESCS = [
  '门将飞身扑出{scorer}的必进球！',
  '门将反应神速，单掌托出{scorer}的射门！',
  '{scorer}近距离头球被门将神扑化解！',
]
const FOUL_DESCS = [
  '{player}中场犯规，裁判鸣哨。',
  '{player}背后铲球犯规，被口头警告。',
  '{player}拉拽对手球衣，犯规。',
  '{player}拼抢中肘击对手，犯规。',
  '{player}滑铲时机不佳，犯规。',
]
const YELLOW_DESCS = [
  '{player}战术犯规吃到黄牌！',
  '{player}抗议判罚，裁判出示黄牌。',
  '{player}铲球过猛，黄牌警告。',
  '{player}连续犯规，累计黄牌。',
  '{player}手球阻挡进攻，黄牌。',
]
const RED_DESCS = [
  '{player}恶意犯规，裁判直接出示红牌！',
  '{player}两黄变一红，被罚下场！',
  '{player}禁区内犯规，红牌加点球！',
]
const SUB_DESCS = [
  '替补球员热身完毕，换下场上队员。',
  '教练做出换人调整，战术换人。',
  '因伤换人，队医搀扶受伤球员下场。',
]

// ===== FC26 式关键时刻选择模板 =====
// 每类关键时刻给出 3 个选项，每个选项有 baseGoalsFor/baseGoalsAgainst 调整系数和叙事模板
// { label, hint, goalMod (0~1 进球率加成), riskMod (0~1 丢球率加成), outcomes: [{success, narrative, goal, assist, rating, morale, fitness}, {fail, narrative, ...}] }
export const KEY_MOMENT_TEMPLATES = {
  // 点球
  penalty: {
    title: '⚽ 关键点球！',
    intro: '裁判指向点球点！你站在12码点前，全场屏住呼吸……',
    options: [
      {
        label: '低平推射球门下角（稳）',
        hint: '稳妥路线，成功率高但易被预判',
        goalMod: 0.75,
        narrative_ok: '你助跑、射门！低平球擦着门柱滚入死角！门将判断错了方向！',
        narrative_fail: '你大力射门，皮球打在立柱上弹回！你双手抱头，不敢相信……',
        effects_ok: { goals: 1, rating: 0.8, morale: 5 },
        effects_fail: { rating: -0.3, morale: -3, fitness: -3 },
      },
      {
        label: '勺子点球（技惊四座）',
        hint: '高风险高回报，考验心理素质',
        goalMod: 0.55,
        narrative_ok: '你冷静踢出一记勺子！门将跳起，皮球慢悠悠从中路坠进球门！全场沸腾！',
        narrative_fail: '你踢出勺子，但门将没有上当，稳稳将球抱住！看台上嘘声一片……',
        effects_ok: { goals: 1, rating: 1.2, morale: 8, reputation: 3 },
        effects_fail: { rating: -0.5, morale: -6, reputation: -2 },
      },
      {
        label: '大力抽射上角（暴力美学）',
        hint: '力量型打法，角度刁钻',
        goalMod: 0.65,
        narrative_ok: '你一脚爆射！皮球如炮弹般钻入球门死角！门将没有任何反应！',
        narrative_fail: '你大力抽射，皮球擦着横梁高出！你狠狠地踢了一脚草皮……',
        effects_ok: { goals: 1, rating: 1.0, morale: 6 },
        effects_fail: { rating: -0.4, morale: -4, fitness: -4 },
      },
    ],
  },
  // 单刀
  oneonone: {
    title: '🔥 单刀赴会！',
    intro: '你接到队友身后球，面对出击的门将，一场一对一的对决！',
    options: [
      {
        label: '挑射吊过门将',
        hint: '技术型打法，精准要求高',
        goalMod: 0.6,
        narrative_ok: '你冷静挑射！皮球越过门将头顶，缓缓坠入球门！完美的终结！',
        narrative_fail: '你挑射力量过大，皮球飞出横梁！教练在旁边激动地挥手……',
        effects_ok: { goals: 1, rating: 0.9, morale: 5 },
        effects_fail: { rating: -0.3, morale: -3 },
      },
      {
        label: '扣球过掉门将推空门',
        hint: '观赏性最高，风险较大',
        goalMod: 0.55,
        narrative_ok: '你一个假动作扣过门将！面对空门轻松推射入网！全场起立鼓掌！',
        narrative_fail: '你试图扣球过人，但门将迅速倒地将球没收！错失了绝佳机会……',
        effects_ok: { goals: 1, rating: 1.1, morale: 7, reputation: 2 },
        effects_fail: { rating: -0.4, morale: -5 },
      },
      {
        label: '直接低射远角（最稳）',
        hint: '稳妥路线，选择最常用的射门方式',
        goalMod: 0.7,
        narrative_ok: '你直接选择低射！皮球擦着草皮滚向远角，门将鞭长莫及！',
        narrative_fail: '你低射被门将伸腿挡出！补射的队友也没抢到落点……',
        effects_ok: { goals: 1, rating: 0.8, morale: 5 },
        effects_fail: { rating: -0.2, morale: -3 },
      },
    ],
  },
  // 前场任意球
  freekick: {
    title: '🎯 前场任意球机会！',
    intro: '球队在禁区前沿获得一个位置极佳的任意球，你站在球前……',
    options: [
      {
        label: '直接射门（绕人墙）',
        hint: '尝试直接破门，要求脚法精湛',
        goalMod: 0.3,
        narrative_ok: '你助跑后踢出一记弧线球！皮球绕过人墙直挂死角！全场一片死寂后爆发出欢呼！',
        narrative_fail: '你直接射门，皮球打在人墙上弹出……',
        effects_ok: { goals: 1, rating: 1.2, morale: 7, reputation: 3 },
        effects_fail: { rating: -0.2, morale: -2 },
      },
      {
        label: '传中给队友头球',
        hint: '团队配合，找禁区内高点',
        goalMod: 0.35,
        narrative_ok: '你精准传中！队友高高跃起头槌破门！你张开双臂庆祝这个绝妙助攻！',
        narrative_fail: '你传中被对方中卫顶出，错失了一个创造机会的好球……',
        effects_ok: { assists: 1, rating: 0.8, morale: 5, teammateRelation: 3 },
        effects_fail: { rating: -0.1, morale: -1 },
      },
      {
        label: '战术短传配合',
        hint: '耐心组织，寻找更好的射门角度',
        goalMod: 0.25,
        narrative_ok: '你短传配合后杀入禁区，一脚低射穿透门将小门！完美的战术执行！',
        narrative_fail: '配合后队友的射门被门将没收，教练在场边皱眉……',
        effects_ok: { goals: 1, rating: 0.7, morale: 4 },
        effects_fail: { rating: -0.1, morale: -1, coachRelation: -2 },
      },
    ],
  },
  // 反击
  counter: {
    title: '⚡ 绝佳反击机会！',
    intro: '对方全线压上！你拿球带球狂奔，前方是大片开阔地！',
    options: [
      {
        label: '长驱直入单干（一条龙）',
        hint: '展现个人能力，从后场一路杀到前场',
        goalMod: 0.45,
        narrative_ok: '你高速带球突破数人！最后一脚劲射破门！这是一个足以入选五佳球的进球！',
        narrative_fail: '你盘带过多，被对方回防的后卫断球！教练大声呼喊要求出球……',
        effects_ok: { goals: 1, rating: 1.3, morale: 8, reputation: 4, fitness: -8 },
        effects_fail: { rating: -0.4, morale: -4, coachRelation: -3, fitness: -5 },
      },
      {
        label: '分边给插上的队友',
        hint: '团队配合，利用边路宽度',
        goalMod: 0.4,
        narrative_ok: '你精准分边！队友下底传中，中路包抄到位破门！一次教科书般的反击！',
        narrative_fail: '你的传球被对方边后卫伸腿拦截，反击机会中断……',
        effects_ok: { assists: 1, rating: 0.8, morale: 5, teammateRelation: 3 },
        effects_fail: { rating: -0.1, morale: -1 },
      },
      {
        label: '控制节奏等待队友插上（稳）',
        hint: '不着急推进，等待更多队友进入进攻区域',
        goalMod: 0.35,
        narrative_ok: '你控住节奏后送出致命直塞！队友单刀破门！你展现了中场大师的视野！',
        narrative_fail: '你控球等待队友，但对方已经全部回防到位，反击机会消失了……',
        effects_ok: { assists: 1, rating: 0.7, morale: 4, coachRelation: 2 },
        effects_fail: { rating: -0.1, morale: -2, coachRelation: -1 },
      },
    ],
  },
  // 禁区混战
  penaltyArea: {
    title: '🏟️ 禁区混战！',
    intro: '角球发出后禁区内一片混乱！皮球落到你的脚下……',
    options: [
      {
        label: '大力抽射（不管角度）',
        hint: '来一脚再说，速度就是力量',
        goalMod: 0.5,
        narrative_ok: '你迎球怒射！皮球像炮弹一样穿透人群钻入球网！爆炸般的庆祝！',
        narrative_fail: '你大力抽射，皮球打在对方后卫身上弹出底线……',
        effects_ok: { goals: 1, rating: 0.8, morale: 5 },
        effects_fail: { rating: -0.2, morale: -2 },
      },
      {
        label: '晃开角度再射（技术）',
        hint: '冷静处理，闪出射门角度',
        goalMod: 0.55,
        narrative_ok: '你轻巧一扣闪开后卫，一记推射远角破门！冷静得像冰一样！',
        narrative_fail: '你试图晃开角度，但对方后卫果断上抢断球！',
        effects_ok: { goals: 1, rating: 0.9, morale: 5 },
        effects_fail: { rating: -0.3, morale: -3 },
      },
      {
        label: '传给位置更好的队友',
        hint: '无私的选择，找到更空当的队友',
        goalMod: 0.6,
        narrative_ok: '你看到无人盯防的队友，横传过去！队友轻松推射空门得分！全场为你的无私欢呼！',
        narrative_fail: '你的横传被对方后卫伸腿断下！队友举手示意应该射门……',
        effects_ok: { assists: 1, rating: 0.7, morale: 5, teammateRelation: 4 },
        effects_fail: { rating: -0.2, morale: -3, teammateRelation: -1 },
      },
    ],
  },
  // 边路传中
  cross: {
    title: '🎯 边路绝佳传中机会！',
    intro: '你在边路拿球，面前是开阔的传中走廊，禁区内两名队友已包抄到位！',
    options: [
      {
        label: '高球传后点',
        hint: '找后点包抄的队友，头球冲顶',
        goalMod: 0.35,
        narrative_ok: '你一脚高质量弧线传中！后点队友高高跃起头球破门！完美的落点！',
        narrative_fail: '你传中过高，直接飞出了底线……',
        effects_ok: { assists: 1, rating: 0.7, morale: 5, teammateRelation: 2 },
        effects_fail: { rating: -0.1, morale: -1 },
      },
      {
        label: '地平球倒三角回传',
        hint: '找禁区弧顶跟进的队友，推射空当',
        goalMod: 0.4,
        narrative_ok: '你倒三角回传！中路跟进的队友一脚推射破门！战术配合恰到好处！',
        narrative_fail: '你的回传被对方后腰拦截，一次好机会就这么没了……',
        effects_ok: { assists: 1, rating: 0.8, morale: 5, coachRelation: 2 },
        effects_fail: { rating: -0.1, morale: -1 },
      },
      {
        label: '突破下底后传中',
        hint: '先过人再传中，创造更好的角度',
        goalMod: 0.3,
        narrative_ok: '你晃过对方边后卫后下底传中！中路队友头槌破门！个人能力+团队配合！',
        narrative_fail: '你试图突破过人，但球被对方断下！教练示意你应该早点传中……',
        effects_ok: { assists: 1, rating: 1.0, morale: 6, reputation: 2, fitness: -5 },
        effects_fail: { rating: -0.3, morale: -3, coachRelation: -2, fitness: -3 },
      },
    ],
  },
  // 角球进攻
  cornerkick: {
    title: '🚩 角球机会！',
    intro: '球队获得角球！你是主罚手，禁区内队友已经就位！',
    options: [
      {
        label: '弧线球找远点高点',
        hint: '经典角球战术，找高中锋头球',
        goalMod: 0.35,
        narrative_ok: '你开出一记完美的弧线球！远点队友高高跃起头球破门！',
        narrative_fail: '你开的角球直接飞出了后点，什么都没碰到……',
        effects_ok: { assists: 1, rating: 0.7, morale: 5, teammateRelation: 2 },
        effects_fail: { rating: -0.1, morale: -1 },
      },
      {
        label: '战术短角球配合',
        hint: '不直接传禁区，耐心组织二次进攻',
        goalMod: 0.3,
        narrative_ok: '短角球配合后你45度传中！队友头球摆渡，中路有人包抄破门！',
        narrative_fail: '短角球配合失误，球直接被断，对方还打了反击……',
        effects_ok: { assists: 1, rating: 0.6, morale: 4, coachRelation: 2 },
        effects_fail: { rating: -0.3, morale: -4, coachRelation: -2 },
      },
      {
        label: '低平球传前点',
        hint: '快速突袭，找前点球员蹭球',
        goalMod: 0.25,
        narrative_ok: '你低平球传前点！队友机敏一蹭，皮球变线滚入远角！出其不意的角球！',
        narrative_fail: '你传前点被对方后卫抢先破坏出了底线……',
        effects_ok: { assists: 1, rating: 0.8, morale: 5 },
        effects_fail: { rating: -0.1, morale: -1 },
      },
    ],
  },
  // 读秒绝杀机会（比赛最后5分钟且平局或落后1球时触发）
  lastchance: {
    title: '⏱️ 最后机会！读秒绝杀！',
    intro: '补时最后30秒！球队仍在进攻，球落到你脚下！全场观众站了起来……',
    options: [
      {
        label: '外围直接远射（孤注一掷）',
        hint: '最不讲理的选择，但是最可能创造奇迹',
        goalMod: 0.2,
        narrative_ok: '你原地摆腿，一脚世界波直挂死角！全场疯狂！这是绝杀！这就是足球！！！',
        narrative_fail: '你一脚远射飞上了看台……全场叹息，比赛就这样结束了。',
        effects_ok: { goals: 1, rating: 1.8, morale: 12, reputation: 8, fitness: -4 },
        effects_fail: { rating: -0.5, morale: -6 },
      },
      {
        label: '突破杀入禁区（盘带绝杀）',
        hint: '用个人能力撕开防线，最后一博',
        goalMod: 0.18,
        narrative_ok: '你连续盘带突破两人杀入禁区！低射远角入网！！！绝杀！！！你脱掉球衣狂奔庆祝！！',
        narrative_fail: '你盘带时被对方多人围抢断球！比赛就此结束……',
        effects_ok: { goals: 1, rating: 1.6, morale: 11, reputation: 7, fitness: -6 },
        effects_fail: { rating: -0.4, morale: -5, fitness: -4 },
      },
      {
        label: '找禁区内空当队友（团队至上）',
        hint: '冷静观察，传最好的球',
        goalMod: 0.22,
        narrative_ok: '你冷静传中找到空位队友！队友一脚垫射破门！绝杀诞生！你和队友紧紧拥抱！',
        narrative_fail: '你的传中被对方解围！主裁判吹响了比赛结束的哨声……',
        effects_ok: { assists: 1, rating: 1.4, morale: 10, reputation: 5, teammateRelation: 6 },
        effects_fail: { rating: -0.3, morale: -4, teammateRelation: -1 },
      },
    ],
  },
}

// ===== 泊松采样 =====
function poisson(lambda) {
  const L = Math.exp(-lambda)
  let k = 0, p = 1
  do { k++; p *= Math.random() } while (p > L)
  return k - 1
}

// ===== 辅助函数 =====
function pickScorer(xi) {
  const weighted = []
  for (const p of xi) {
    const w = ['ST','CF','LW','RW','CAM'].includes(p.pos) ? 5 :
              ['CM','LM','RM'].includes(p.pos) ? 2 : 1
    for (let i = 0; i < w; i++) weighted.push(p)
  }
  return pick(weighted)
}
function pickAssister(xi, scorer) {
  const others = xi.filter(p => p.name !== scorer.name)
  const weighted = []
  for (const p of others) {
    const w = ['CAM','CM','LW','RW'].includes(p.pos) ? 3 : 1
    for (let i = 0; i < w; i++) weighted.push(p)
  }
  return weighted.length ? pick(weighted) : null
}

// ===== 生成关键时刻（3-5个，融入时间线） =====
function generateKeyMoments(homeStr, awayStr, diff, player, totalHomeGoals, totalAwayGoals) {
  // 玩家OVR越高，关键时刻越多（越有能力改变比赛）
  const playerInfluence = player ? clamp((player.ovr - 55) * 0.03, 0, 1) : 0.3
  const count = randInt(3, 5) + (Math.random() < playerInfluence ? 1 : 0)
  const types = Object.keys(KEY_MOMENT_TEMPLATES).filter(k => k !== 'lastchance')
  const moments = []
  const usedMinute = new Set()
  for (let i = 0; i < count; i++) {
    let minute
    let tries = 0
    do { minute = randInt(10, 85); tries++ } while (usedMinute.has(minute) && tries < 10)
    usedMinute.add(minute)
    // 关键时刻更多发生在玩家所在球队进攻优势时
    const mySide = 'playerSide' // 稍后在 simulateFullMatch 中确定
    const type = pick(types)
    moments.push({
      id: `km_${i}_${minute}`,
      minute,
      type,
      template: KEY_MOMENT_TEMPLATES[type],
      resolved: false,
    })
  }
  // 最后5分钟，如果平局或落后1球，触发读秒绝杀时刻
  moments.sort((a, b) => a.minute - b.minute)
  return moments
}

// ===== 基于玩家选择解决关键时刻（返回 effects） =====
export function resolveKeyMoment(moment, choiceIdx, player) {
  const option = moment.template.options[choiceIdx]
  const baseProb = option.goalMod
  // 玩家OVR加成
  const ovrBoost = player ? clamp((player.ovr - 60) * 0.01, 0, 0.2) : 0
  // 体力影响
  const fitnessPenalty = player ? clamp((100 - player.fitness) * 0.002, 0, 0.15) : 0
  const success = Math.random() < clamp(baseProb + ovrBoost - fitnessPenalty, 0.1, 0.9)
  return {
    moment,
    option,
    success,
    narrative: success ? option.narrative_ok : option.narrative_fail,
    effects: success ? option.effects_ok : option.effects_fail,
  }
}

// ===== 模拟一场完整比赛（返回事件列表 + 关键时刻） =====
// preResolveMoments: 如果为空，调用方会在直播中让用户选择（互动模式）
//                    如果预先填充，表明是跳过/模拟模式（随机或按OVR选最优）
export function simulateFullMatch(homeTeam, awayTeam, player = null, keyMomentChoices = null) {
  const homeStr = squadOvr(homeTeam.name) + 5  // 主场优势约+5
  const awayStr = squadOvr(awayTeam.name)
  const diff = homeStr - awayStr
  // 预期进球：主场略高，强弱差距影响呈递减曲线
  const expHome = clamp(1.5 + diff * 0.035, 0.25, 3.8)
  const expAway = clamp(1.15 - diff * 0.030, 0.15, 3.2)
  const totalHomeGoals = poisson(expHome)
  const totalAwayGoals = poisson(expAway)

  const homeXI = getStartingXI(homeTeam.name)
  const awayXI = getStartingXI(awayTeam.name)

  const goalMinutes = new Set()
  function randMinute(start, end, extraAvoid = []) {
    let m, tries = 0
    do { m = randInt(start, end); tries++ }
      while ((goalMinutes.has(m) || extraAvoid.includes(m)) && tries < 10)
    goalMinutes.add(m)
    return m
  }

  // 进球事件
  const goalEvents = []
  for (let i = 0; i < totalHomeGoals; i++) {
    const minute = randMinute(1, 90)
    const scorer = pickScorer(homeXI)
    const assister = pickAssister(homeXI, scorer)
    goalEvents.push({ minute, side: 'home', scorer, assister })
  }
  for (let i = 0; i < totalAwayGoals; i++) {
    const minute = randMinute(1, 90)
    const scorer = pickScorer(awayXI)
    const assister = pickAssister(awayXI, scorer)
    goalEvents.push({ minute, side: 'away', scorer, assister })
  }
  goalEvents.sort((a, b) => a.minute - b.minute)

  // 机会/扑救
  const chanceEvents = []
  const chanceCount = randInt(6, 10)
  for (let i = 0; i < chanceCount; i++) {
    const minute = randMinute(1, 90)
    const isHome = Math.random() < 0.5 + diff * 0.02
    const xi = isHome ? homeXI : awayXI
    const scorer = pickScorer(xi)
    chanceEvents.push({ minute, side: isHome ? 'home' : 'away', scorer, isSaved: Math.random() < 0.4 })
  }

  // 犯规/黄牌/红牌（真实比赛每队犯规10-20次，黄牌1-4张，红牌约0-1张）
  const disciplineEvents = []
  const foulCount = randInt(8, 16)
  for (let i = 0; i < foulCount; i++) {
    const minute = randMinute(1, 90)
    const isHome = Math.random() < 0.5 + diff * 0.01
    const xi = isHome ? homeXI : awayXI
    const p = pick(xi)
    const roll = Math.random()
    if (roll < 0.18) {
      disciplineEvents.push({ minute, side: isHome ? 'home' : 'away', player: p, isYellow: true, isRed: false })
    } else if (roll < 0.02) {
      disciplineEvents.push({ minute, side: isHome ? 'home' : 'away', player: p, isYellow: false, isRed: true })
    } else {
      disciplineEvents.push({ minute, side: isHome ? 'home' : 'away', player: p, isYellow: false, isRed: false })
    }
  }

  // 角球（真实比赛每队4-12个角球）
  const cornerEvents = []
  for (let i = 0; i < randInt(4, 10); i++) {
    cornerEvents.push({ minute: randMinute(1, 90), side: Math.random() < 0.5 + diff * 0.01 ? 'home' : 'away' })
  }

  // 换人事件（每队3个换人名额，通常在60-85分钟）
  const subEvents = []
  for (let i = 0; i < 3; i++) {
    const homeMin = randInt(55, 85)
    const awayMin = randInt(55, 85)
    subEvents.push({ minute: homeMin, side: 'home', desc: pick(SUB_DESCS) })
    subEvents.push({ minute: awayMin, side: 'away', desc: pick(SUB_DESCS) })
  }

  // ===== 关键时刻（FC26式） =====
  const keyMoments = generateKeyMoments(homeStr, awayStr, diff, player, totalHomeGoals, totalAwayGoals)
  // 为每个关键时刻分配进攻方：至少一半分配给玩家所在队
  const playerSide = homeTeam.name === (player?.team || '') ? 'home' : 'away'
  const totalKms = keyMoments.length
  const guaranteePlayer = Math.max(2, Math.ceil(totalKms / 2)) // 确保至少2个或一半是玩家侧
  let playerKmCount = 0
  keyMoments.sort((a, b) => a.minute - b.minute) // 先按时间排序，保证时间线分布
  for (let i = 0; i < keyMoments.length; i++) {
    const km = keyMoments[i]
    // 先按概率决定；如果不够保底就强制
    let side
    if (playerKmCount < guaranteePlayer) {
      side = Math.random() < 0.85 ? playerSide : (playerSide === 'home' ? 'away' : 'home')
    } else {
      side = Math.random() < 0.4 ? playerSide : (playerSide === 'home' ? 'away' : 'home')
    }
    // 如果是最后几个还不够保底，强制分配
    if (totalKms - i - 1 < guaranteePlayer - playerKmCount) {
      side = playerSide
    }
    km.side = side
    km.teamName = km.side === 'home' ? homeTeam.name : awayTeam.name
    km.playerSide = km.side === playerSide
    if (km.playerSide) playerKmCount++
  }

  // ===== 如果是预解决模式（跳过/自动模拟），按OVR选最优选项 =====
  const resolvedMoments = {}
  if (keyMomentChoices === 'auto' || keyMomentChoices === 'skip') {
    for (const km of keyMoments) {
      if (!km.playerSide) {
        resolvedMoments[km.id] = null
        continue
      }
      // 随机选（skip模式）或按最优概率选（auto模式）
      let choice
      if (keyMomentChoices === 'auto') {
        // 找 goalMod * 预期收益最高的
        choice = km.template.options.reduce((best, o, i) => {
          const score = o.goalMod * ((o.effects_ok?.goals || 0) * 2 + (o.effects_ok?.assists || 0) + (o.effects_ok?.rating || 0))
          return score > best.score ? { idx: i, score } : best
        }, { idx: 0, score: -Infinity }).idx
      } else {
        choice = randInt(0, km.template.options.length - 1)
      }
      resolvedMoments[km.id] = resolveKeyMoment(km, choice, player)
    }
  }

  // ===== 合并所有分钟级事件 =====
  const allMinuteEvents = []
  for (const g of goalEvents) {
    allMinuteEvents.push({
      minute: g.minute,
      type: 'goal',
      side: g.side,
      team: g.side === 'home' ? homeTeam.name : awayTeam.name,
      scorer: g.scorer,
      assister: g.assister,
      desc: pick(GOAL_DESCS).replace('{scorer}', g.scorer.name),
      homeGoals: 0, awayGoals: 0,
    })
  }
  for (const c of chanceEvents) {
    allMinuteEvents.push({
      minute: c.minute,
      type: c.isSaved ? 'save' : 'chance',
      side: c.side,
      team: c.side === 'home' ? homeTeam.name : awayTeam.name,
      scorer: c.scorer,
      desc: c.isSaved ? pick(SAVE_DESCS).replace('{scorer}', c.scorer.name) : pick(CHANCE_DESCS).replace('{scorer}', c.scorer.name),
    })
  }
  for (const d of disciplineEvents) {
    let desc, type
    if (d.isRed) {
      type = 'red'
      desc = pick(RED_DESCS).replace('{player}', d.player.name)
    } else if (d.isYellow) {
      type = 'yellow'
      desc = pick(YELLOW_DESCS).replace('{player}', d.player.name)
    } else {
      type = 'foul'
      desc = pick(FOUL_DESCS).replace('{player}', d.player.name)
    }
    allMinuteEvents.push({
      minute: d.minute,
      type,
      side: d.side,
      team: d.side === 'home' ? homeTeam.name : awayTeam.name,
      player: d.player,
      desc,
    })
  }
  for (const c of cornerEvents) {
    allMinuteEvents.push({
      minute: c.minute,
      type: 'corner',
      side: c.side,
      team: c.side === 'home' ? homeTeam.name : awayTeam.name,
      desc: `${c.side === 'home' ? homeTeam.name : awayTeam.name}获得角球。`,
    })
  }
  for (const s of subEvents) {
    allMinuteEvents.push({
      minute: s.minute,
      type: 'sub',
      side: s.side,
      team: s.side === 'home' ? homeTeam.name : awayTeam.name,
      desc: `${s.team}换人：${s.desc}`,
    })
  }
  // 关键时刻插入（标记为 keymoment 事件类型）
  for (const km of keyMoments) {
    allMinuteEvents.push({
      minute: km.minute,
      type: 'keymoment',
      side: km.side,
      team: km.teamName,
      keyMoment: km,
      desc: `${km.template.title} 由 ${km.teamName} 创造！`,
    })
  }
  // 读秒绝杀时刻：最后5分钟若玩家队平局或落后
  const playerGoals = playerSide === 'home' ? totalHomeGoals : totalAwayGoals
  const oppGoals = playerSide === 'home' ? totalAwayGoals : totalHomeGoals
  const lateNeedGoal = (playerGoals <= oppGoals) && Math.random() < 0.35
  if (lateNeedGoal) {
    const lastType = 'lastchance'
    allMinuteEvents.push({
      minute: 89,
      type: 'keymoment',
      side: playerSide,
      team: playerSide === 'home' ? homeTeam.name : awayTeam.name,
      keyMoment: {
        id: 'km_last',
        minute: 89,
        type: lastType,
        template: KEY_MOMENT_TEMPLATES[lastType],
        side: playerSide,
        teamName: playerSide === 'home' ? homeTeam.name : awayTeam.name,
        playerSide: true,
      },
      desc: `${KEY_MOMENT_TEMPLATES[lastType].title} 由 ${playerSide === 'home' ? homeTeam.name : awayTeam.name} 创造！`,
    })
  }

  // ===== 排序：按分钟；同分钟内 goal > keymoment > save/chance > 其他 =====
  allMinuteEvents.sort((a, b) => {
    if (a.minute !== b.minute) return a.minute - b.minute
    const order = { goal: 0, keymoment: 1, red: 2, save: 3, chance: 4, yellow: 5, sub: 6, foul: 7, corner: 8 }
    return (order[a.type] || 9) - (order[b.type] || 9)
  })

  // ===== 加入开场/半场/补时/终场 =====
  let hg = 0, ag = 0
  const finalEvents = []
  finalEvents.push({
    minute: 0, type: 'kickoff', side: 'home',
    desc: `比赛开始！${homeTeam.name} 主场对阵 ${awayTeam.name}。`,
    homeGoals: 0, awayGoals: 0,
  })
  let addedHalftime = false
  for (const ev of allMinuteEvents) {
    if (ev.type === 'goal') {
      if (ev.side === 'home') hg++; else ag++
    }
    ev.homeGoals = hg
    ev.awayGoals = ag
    finalEvents.push(ev)
    if (ev.minute > 45 && !addedHalftime) {
      addedHalftime = true
      finalEvents.push({
        minute: 45, type: 'halftime',
        desc: `上半场结束，${homeTeam.name} ${hg} : ${ag} ${awayTeam.name}。`,
        homeGoals: hg, awayGoals: ag,
      })
    }
  }
  if (Math.random() < 0.5) {
    finalEvents.push({
      minute: 90, type: 'extra',
      desc: `第四官员举牌：补时${randInt(2, 5)}分钟。`,
      homeGoals: hg, awayGoals: ag,
    })
  }
  finalEvents.push({
    minute: 90 + randInt(1, 4), type: 'end',
    desc: `全场比赛结束！${homeTeam.name} ${hg} : ${ag} ${awayTeam.name}。`,
    homeGoals: hg, awayGoals: ag,
  })

  // ===== 统计数据（真实比赛：射门8-20次，控球40-65%） =====
  const homeShots = totalHomeGoals + chanceEvents.filter(c => c.side === 'home').length + randInt(4, 8)
  const awayShots = totalAwayGoals + chanceEvents.filter(c => c.side === 'away').length + randInt(4, 8)
  const homePossession = clamp(52 + diff * 1.0 + randInt(-6, 6), 32, 68)
  const homeStats = {
    shots: homeShots,
    onTarget: totalHomeGoals + randInt(2, 5),
    possession: homePossession,
    corners: cornerEvents.filter(c => c.side === 'home').length + randInt(1, 4),
    fouls: disciplineEvents.filter(d => d.side === 'home').length + randInt(2, 6),
  }
  const awayStats = {
    shots: awayShots,
    onTarget: totalAwayGoals + randInt(2, 5),
    possession: 100 - homePossession,
    corners: cornerEvents.filter(c => c.side === 'away').length + randInt(1, 4),
    fouls: disciplineEvents.filter(d => d.side === 'away').length + randInt(2, 6),
  }

  // ===== MVP：优先选进球最多的球员，平局时选获胜方 =====
  let mvp = null
  const goalScorers = goalEvents.map(g => ({ ...g.scorer, team: g.side === 'home' ? homeTeam.name : awayTeam.name, goals: 1 }))
  if (goalScorers.length) {
    // 按进球数分组，选最多的
    const byScorer = {}
    for (const gs of goalScorers) {
      const key = gs.name
      if (!byScorer[key]) byScorer[key] = { ...gs, goals: 0 }
      byScorer[key].goals += 1
    }
    const sorted = Object.values(byScorer).sort((a, b) => b.goals - a.goals)
    // 优先选获胜方的进球者
    const winnerSide = hg > ag ? 'home' : (ag > hg ? 'away' : null)
    if (winnerSide) {
      const winnerTeam = winnerSide === 'home' ? homeTeam.name : awayTeam.name
      const winnerScorer = sorted.find(s => s.team === winnerTeam)
      mvp = winnerScorer || sorted[0]
    } else {
      mvp = sorted[0]
    }
  } else {
    const all = [...homeXI, ...awayXI]
    mvp = { ...pick(all), team: '' }
  }

  // ===== 玩家贡献（基础进球/助攻） + 关键时刻奖励 =====
  let playerContribution = { goals: 0, assists: 0, rating: 0, moraleD: 0, keyMomentGoals: 0, keyMomentAssists: 0, keyMoments: 0, goodChoices: 0, badChoices: 0 }
  if (player) {
    playerContribution.goals = goalEvents.filter(g => g.scorer.name === player.name).length
    playerContribution.assists = goalEvents.filter(g => g.assister?.name === player.name).length
    // 关键时刻效果
    for (const [kmId, res] of Object.entries(resolvedMoments)) {
      if (!res) continue
      playerContribution.keyMoments += 1
      if (res.success) playerContribution.goodChoices += 1; else playerContribution.badChoices += 1
      const ef = res.effects
      if (ef.goals) { playerContribution.keyMomentGoals += ef.goals; playerContribution.goals += ef.goals }
      if (ef.assists) { playerContribution.keyMomentAssists += ef.assists; playerContribution.assists += ef.assists }
      if (ef.rating) playerContribution.rating += ef.rating
      if (ef.morale) playerContribution.moraleD += ef.morale
    }
    // 如果玩家贡献为0且不是预解决模式，则不生成该字段（保留原行为兼容）
    if (keyMomentChoices === null && playerContribution.goals === 0 && playerContribution.assists === 0) {
      playerContribution = null
    }
  } else {
    playerContribution = null
  }

  return {
    events: finalEvents,
    homeGoals: hg,
    awayGoals: ag,
    homeTeam,
    awayTeam,
    homeStats,
    awayStats,
    mvp,
    playerContribution,
    keyMoments,
    resolvedMoments,
  }
}

// ===== 互动直播后，应用用户关键时刻选择结果，重算最终贡献 =====
// 传入：原 matchResult 结果 + { kmId: resolvedMoment } 对象
export function applyKeyMomentChoicesToResult(matchResult, choices, player) {
  const totalGoals = { home: matchResult.homeGoals, away: matchResult.awayGoals }
  const contrib = matchResult.playerContribution || { goals: 0, assists: 0, rating: 0, moraleD: 0, keyMomentGoals: 0, keyMomentAssists: 0, keyMoments: 0, goodChoices: 0, badChoices: 0 }
  for (const c of Object.values(choices)) {
    if (!c) continue
    contrib.keyMoments += 1
    if (c.success) contrib.goodChoices += 1; else contrib.badChoices += 1
    const ef = c.effects
    if (ef.goals) {
      contrib.keyMomentGoals += ef.goals
      contrib.goals += ef.goals
      totalGoals[c.moment.side] += ef.goals
    }
    if (ef.assists) { contrib.keyMomentAssists += ef.assists; contrib.assists += ef.assists }
    if (ef.rating) contrib.rating += ef.rating
    if (ef.morale) contrib.moraleD += ef.morale
  }
  return {
    ...matchResult,
    homeGoals: totalGoals.home,
    awayGoals: totalGoals.away,
    playerContribution: contrib,
  }
}

// ===== 国际赛事比赛模拟（国家队 vs 国家队） =====
// 为国家队生成简化阵容（基于实力）
const INTL_FILLER_NAMES = {
  '中国': ['武磊','张琳芃','吴曦','颜骏凌','王燊超','蒋光太','李可','韦世豪','艾克森','洛国富','阿兰','刘洋','高准翼','徐新','戴伟浚','林良铭','陈蒲','刘彬彬'],
  '日本': ['久保建英','三笘薫','伊东纯也','远藤航','吉田麻也','权田修一','富安健洋','堂安律','浅野拓磨','前田大然','镰田大地','板仓滉','伊藤洋辉','守田英正','田中碧','南野拓実'],
  '韩国': ['孙兴慜','金玟哉','黄喜灿','李刚仁','李在成','赵贤祐','金英权','洪喆','郑优营','曹圭成','黄仁范','李记帝','吴贤揆','薛英佑','郑昇炫'],
  '英格兰': ['凯恩','贝林厄姆','福登','萨卡','赖斯','皮克福德','斯通斯','沃克','特里皮尔','麦迪逊','格拉利什','拉什福德','梅努','戈登','邓克'],
  '法国': ['姆巴佩','格列兹曼','吉鲁','楚阿梅尼','萨利巴','迈尼昂','特奥','孔德','坎特','登贝莱','穆阿尼','科洛穆阿尼','卡马文加','福法纳','埃尔南德斯'],
  '德国': ['穆西亚拉','维尔茨','基米希','吕迪格','诺伊尔','京多安','哈弗茨','萨内','格纳布里','安德烈希','施洛特贝克','劳姆','菲尔克鲁格','拜尔','科赫'],
  '西班牙': ['亚马尔','尼科威廉姆斯','罗德里','莫拉塔','乌奈西蒙','拉波尔特','卡瓦哈尔','库库雷利亚','奥尔莫','法比安','佩德里','梅里诺','勒诺尔芒','维维安','费兰'],
  '巴西': ['维尼修斯','罗德里戈','内马尔','卡塞米罗','阿利松','马尔基尼奥斯','米利唐','吉马良斯','拉菲尼亚','理查利森','安东尼','布雷默','埃德森','达尼洛','加布里埃尔'],
  '阿根廷': ['梅西','劳塔罗','迪马利亚','德保罗','马丁内斯','奥塔门迪','塔利亚菲科','莫利纳','麦卡利斯特','恩佐','阿尔瓦雷斯','罗梅罗','帕雷德斯','冈萨雷斯','蒙铁尔'],
  '葡萄牙': ['C罗','B费','B席','莱奥','迪亚斯','科斯塔','坎塞洛','门德斯','维蒂尼亚','帕利尼亚','若塔','努涅斯','内维斯','安东尼奥席尔瓦','伊纳西奥'],
  '荷兰': ['范戴克','德容','加克波','德利赫特','弗莱肯','邓弗里斯','阿克','库普梅纳斯','西蒙斯','马伦','韦格霍斯特','德弗里','哈维西蒙斯','雷因德斯','弗林蓬'],
  '意大利': ['多纳鲁马','巴雷拉','基耶萨','斯卡马卡','若日尼奥','巴斯托尼','迪马尔科','弗拉泰西','托纳利','拉斯帕多里','布翁乔尔诺','坎比亚索','卡拉菲奥里','雷特吉','扎卡尼'],
  '默认': ['队长','核心','前锋','中场','后卫','门将','边锋','中卫','后腰','前腰','边卫','影锋','翼锋','清道夫','自由人'],
}
function genIntlSquad(nation, strength) {
  const names = INTL_FILLER_NAMES[nation] || INTL_FILLER_NAMES['默认']
  const positions = ['GK','LB','CB','CB','RB','CM','CM','CAM','LW','ST','RW']
  const squad = []
  for (let i = 0; i < 11; i++) {
    const pos = positions[i]
    const ovr = clamp(strength + randInt(-5, 3), 50, 92)
    squad.push({
      name: names[i % names.length],
      pos,
      age: randInt(22, 32),
      ovr,
      nation,
    })
  }
  return squad
}

// 模拟一场国家队比赛（返回与 simulateFullMatch 相同结构）
// homeNation/awayNation: 国家名
// homeStrength/awayStrength: 国家队实力
// player: 玩家球员对象（其 nationality 决定代表哪一方）
// isNeutral: 是否中立场（无主场优势）
// keyMomentChoices: null(互动) | 'auto' | 'skip'
export function simulateIntlMatch(homeNation, awayNation, homeStrength, awayStrength, player = null, isNeutral = false, keyMomentChoices = null) {
  const homeStr = homeStrength + (isNeutral ? 0 : 3)
  const awayStr = awayStrength
  const diff = homeStr - awayStr
  const expHome = clamp(1.3 + diff * 0.035, 0.2, 3.6)
  const expAway = clamp(1.15 - diff * 0.030, 0.15, 3.2)
  const totalHomeGoals = poisson(expHome)
  const totalAwayGoals = poisson(expAway)

  const homeXI = genIntlSquad(homeNation, homeStr)
  const awayXI = genIntlSquad(awayNation, awayStr)

  // 若玩家参与，将其放入对应阵容
  const playerSide = player && player.nationality === homeNation ? 'home' : (player && player.nationality === awayNation ? 'away' : null)
  if (player && playerSide) {
    const xi = playerSide === 'home' ? homeXI : awayXI
    // 替换同位置或最弱球员
    const idx = xi.findIndex(p => p.pos === player.position)
    if (idx >= 0) xi[idx] = { name: player.name, pos: player.position, age: player.age, ovr: player.ovr, nation: player.nationality, isPlayer: true }
    else xi[0] = { name: player.name, pos: player.position, age: player.age, ovr: player.ovr, nation: player.nationality, isPlayer: true }
  }

  const homeTeam = { name: homeNation, city: '', strength: homeStr }
  const awayTeam = { name: awayNation, city: '', strength: awayStr }

  const goalMinutes = new Set()
  function randMinute(start, end, extraAvoid = []) {
    let m, tries = 0
    do { m = randInt(start, end); tries++ }
      while ((goalMinutes.has(m) || extraAvoid.includes(m)) && tries < 10)
    goalMinutes.add(m)
    return m
  }

  // 进球事件
  const goalEvents = []
  for (let i = 0; i < totalHomeGoals; i++) {
    const minute = randMinute(1, 90)
    const scorer = pickScorer(homeXI)
    const assister = pickAssister(homeXI, scorer)
    goalEvents.push({ minute, side: 'home', scorer, assister })
  }
  for (let i = 0; i < totalAwayGoals; i++) {
    const minute = randMinute(1, 90)
    const scorer = pickScorer(awayXI)
    const assister = pickAssister(awayXI, scorer)
    goalEvents.push({ minute, side: 'away', scorer, assister })
  }
  goalEvents.sort((a, b) => a.minute - b.minute)

  // 机会/扑救
  const chanceEvents = []
  const chanceCount = randInt(5, 9)
  for (let i = 0; i < chanceCount; i++) {
    const minute = randMinute(1, 90)
    const isHome = Math.random() < 0.5 + diff * 0.02
    const xi = isHome ? homeXI : awayXI
    const scorer = pickScorer(xi)
    chanceEvents.push({ minute, side: isHome ? 'home' : 'away', scorer, isSaved: Math.random() < 0.4 })
  }

  // 犯规/黄牌/红牌
  const disciplineEvents = []
  const foulCount = randInt(8, 16)
  for (let i = 0; i < foulCount; i++) {
    const minute = randMinute(1, 90)
    const isHome = Math.random() < 0.5 + diff * 0.01
    const xi = isHome ? homeXI : awayXI
    const p = pick(xi)
    const roll = Math.random()
    if (roll < 0.18) disciplineEvents.push({ minute, side: isHome ? 'home' : 'away', player: p, isYellow: true, isRed: false })
    else if (roll < 0.02) disciplineEvents.push({ minute, side: isHome ? 'home' : 'away', player: p, isYellow: false, isRed: true })
    else disciplineEvents.push({ minute, side: isHome ? 'home' : 'away', player: p, isYellow: false, isRed: false })
  }

  // 角球
  const cornerEvents = []
  for (let i = 0; i < randInt(4, 10); i++) {
    cornerEvents.push({ minute: randMinute(1, 90), side: Math.random() < 0.5 + diff * 0.01 ? 'home' : 'away' })
  }

  // 换人
  const subEvents = []
  for (let i = 0; i < 3; i++) {
    subEvents.push({ minute: randInt(55, 85), side: 'home', desc: pick(SUB_DESCS) })
    subEvents.push({ minute: randInt(55, 85), side: 'away', desc: pick(SUB_DESCS) })
  }

  // 关键时刻（仅玩家参与时生成）
  let keyMoments = []
  if (player && playerSide) {
    keyMoments = generateKeyMoments(homeStr, awayStr, diff, player, totalHomeGoals, totalAwayGoals)
    const totalKms = keyMoments.length
    const guaranteePlayer = Math.max(2, Math.ceil(totalKms / 2))
    let playerKmCount = 0
    keyMoments.sort((a, b) => a.minute - b.minute)
    for (let i = 0; i < keyMoments.length; i++) {
      const km = keyMoments[i]
      let side
      if (playerKmCount < guaranteePlayer) {
        side = Math.random() < 0.85 ? playerSide : (playerSide === 'home' ? 'away' : 'home')
      } else {
        side = Math.random() < 0.4 ? playerSide : (playerSide === 'home' ? 'away' : 'home')
      }
      if (totalKms - i - 1 < guaranteePlayer - playerKmCount) side = playerSide
      km.side = side
      km.teamName = km.side === 'home' ? homeNation : awayNation
      km.playerSide = km.side === playerSide
      if (km.playerSide) playerKmCount++
    }
  }

  // 预解决模式
  const resolvedMoments = {}
  if (keyMomentChoices === 'auto' || keyMomentChoices === 'skip') {
    for (const km of keyMoments) {
      if (!km.playerSide) { resolvedMoments[km.id] = null; continue }
      let choice
      if (keyMomentChoices === 'auto') {
        choice = km.template.options.reduce((best, o, i) => {
          const score = o.goalMod * ((o.effects_ok?.goals || 0) * 2 + (o.effects_ok?.assists || 0) + (o.effects_ok?.rating || 0))
          return score > best.score ? { idx: i, score } : best
        }, { idx: 0, score: -Infinity }).idx
      } else {
        choice = randInt(0, km.template.options.length - 1)
      }
      resolvedMoments[km.id] = resolveKeyMoment(km, choice, player)
    }
  }

  // 合并事件
  const allMinuteEvents = []
  for (const g of goalEvents) {
    allMinuteEvents.push({ minute: g.minute, type: 'goal', side: g.side, team: g.side === 'home' ? homeNation : awayNation, scorer: g.scorer, assister: g.assister, desc: pick(GOAL_DESCS).replace('{scorer}', g.scorer.name), homeGoals: 0, awayGoals: 0 })
  }
  for (const c of chanceEvents) {
    allMinuteEvents.push({ minute: c.minute, type: c.isSaved ? 'save' : 'chance', side: c.side, team: c.side === 'home' ? homeNation : awayNation, scorer: c.scorer, desc: c.isSaved ? pick(SAVE_DESCS).replace('{scorer}', c.scorer.name) : pick(CHANCE_DESCS).replace('{scorer}', c.scorer.name) })
  }
  for (const d of disciplineEvents) {
    let desc, type
    if (d.isRed) { type = 'red'; desc = pick(RED_DESCS).replace('{player}', d.player.name) }
    else if (d.isYellow) { type = 'yellow'; desc = pick(YELLOW_DESCS).replace('{player}', d.player.name) }
    else { type = 'foul'; desc = pick(FOUL_DESCS).replace('{player}', d.player.name) }
    allMinuteEvents.push({ minute: d.minute, type, side: d.side, team: d.side === 'home' ? homeNation : awayNation, player: d.player, desc })
  }
  for (const c of cornerEvents) {
    allMinuteEvents.push({ minute: c.minute, type: 'corner', side: c.side, team: c.side === 'home' ? homeNation : awayNation, desc: `${c.side === 'home' ? homeNation : awayNation}获得角球。` })
  }
  for (const s of subEvents) {
    allMinuteEvents.push({ minute: s.minute, type: 'sub', side: s.side, team: s.side === 'home' ? homeNation : awayNation, desc: `${s.side === 'home' ? homeNation : awayNation}换人：${s.desc}` })
  }
  for (const km of keyMoments) {
    allMinuteEvents.push({ minute: km.minute, type: 'keymoment', side: km.side, team: km.teamName, keyMoment: km, desc: `${km.template.title} 由 ${km.teamName} 创造！` })
  }
  // 读秒绝杀
  if (player && playerSide) {
    const playerGoals = playerSide === 'home' ? totalHomeGoals : totalAwayGoals
    const oppGoals = playerSide === 'home' ? totalAwayGoals : totalHomeGoals
    if (playerGoals <= oppGoals && Math.random() < 0.35) {
      const lastType = 'lastchance'
      allMinuteEvents.push({ minute: 89, type: 'keymoment', side: playerSide, team: playerSide === 'home' ? homeNation : awayNation, keyMoment: { id: 'km_last', minute: 89, type: lastType, template: KEY_MOMENT_TEMPLATES[lastType], side: playerSide, teamName: playerSide === 'home' ? homeNation : awayNation, playerSide: true }, desc: `${KEY_MOMENT_TEMPLATES[lastType].title} 由 ${playerSide === 'home' ? homeNation : awayNation} 创造！` })
    }
  }

  // 排序
  allMinuteEvents.sort((a, b) => {
    if (a.minute !== b.minute) return a.minute - b.minute
    const order = { goal: 0, keymoment: 1, red: 2, save: 3, chance: 4, yellow: 5, sub: 6, foul: 7, corner: 8 }
    return (order[a.type] || 9) - (order[b.type] || 9)
  })

  // 开场/半场/终场
  let hg = 0, ag = 0
  const finalEvents = []
  finalEvents.push({ minute: 0, type: 'kickoff', side: 'home', desc: `比赛开始！${homeNation} vs ${awayNation}。`, homeGoals: 0, awayGoals: 0 })
  let addedHalftime = false
  for (const ev of allMinuteEvents) {
    if (ev.type === 'goal') { if (ev.side === 'home') hg++; else ag++ }
    ev.homeGoals = hg; ev.awayGoals = ag
    finalEvents.push(ev)
    if (ev.minute > 45 && !addedHalftime) {
      addedHalftime = true
      finalEvents.push({ minute: 45, type: 'halftime', desc: `上半场结束，${homeNation} ${hg} : ${ag} ${awayNation}。`, homeGoals: hg, awayGoals: ag })
    }
  }
  if (Math.random() < 0.5) {
    finalEvents.push({ minute: 90, type: 'extra', desc: `第四官员举牌：补时${randInt(2, 5)}分钟。`, homeGoals: hg, awayGoals: ag })
  }
  finalEvents.push({ minute: 90 + randInt(1, 4), type: 'end', desc: `全场比赛结束！${homeNation} ${hg} : ${ag} ${awayNation}。`, homeGoals: hg, awayGoals: ag })

  // 统计
  const homeShots = totalHomeGoals + chanceEvents.filter(c => c.side === 'home').length + randInt(4, 8)
  const awayShots = totalAwayGoals + chanceEvents.filter(c => c.side === 'away').length + randInt(4, 8)
  const homePossession = clamp(52 + diff * 1.0 + randInt(-6, 6), 32, 68)
  const homeStats = { shots: homeShots, onTarget: totalHomeGoals + randInt(2, 5), possession: homePossession, corners: cornerEvents.filter(c => c.side === 'home').length + randInt(1, 4), fouls: disciplineEvents.filter(d => d.side === 'home').length + randInt(2, 6) }
  const awayStats = { shots: awayShots, onTarget: totalAwayGoals + randInt(2, 5), possession: 100 - homePossession, corners: cornerEvents.filter(c => c.side === 'away').length + randInt(1, 4), fouls: disciplineEvents.filter(d => d.side === 'away').length + randInt(2, 6) }

  // MVP
  let mvp = null
  const goalScorers = goalEvents.map(g => ({ ...g.scorer, team: g.side === 'home' ? homeNation : awayNation, goals: 1 }))
  if (goalScorers.length) {
    const byScorer = {}
    for (const gs of goalScorers) { const key = gs.name; if (!byScorer[key]) byScorer[key] = { ...gs, goals: 0 }; byScorer[key].goals += 1 }
    const sorted = Object.values(byScorer).sort((a, b) => b.goals - a.goals)
    const winnerSide = hg > ag ? 'home' : (ag > hg ? 'away' : null)
    if (winnerSide) { const winnerTeam = winnerSide === 'home' ? homeNation : awayNation; const winnerScorer = sorted.find(s => s.team === winnerTeam); mvp = winnerScorer || sorted[0] }
    else mvp = sorted[0]
  } else { const all = [...homeXI, ...awayXI]; mvp = { ...pick(all), team: '' } }

  // 玩家贡献
  let playerContribution = null
  if (player && playerSide) {
    playerContribution = { goals: 0, assists: 0, rating: 0, moraleD: 0, keyMomentGoals: 0, keyMomentAssists: 0, keyMoments: 0, goodChoices: 0, badChoices: 0 }
    playerContribution.goals = goalEvents.filter(g => g.scorer.name === player.name).length
    playerContribution.assists = goalEvents.filter(g => g.assister?.name === player.name).length
    for (const [kmId, res] of Object.entries(resolvedMoments)) {
      if (!res) continue
      playerContribution.keyMoments += 1
      if (res.success) playerContribution.goodChoices += 1; else playerContribution.badChoices += 1
      const ef = res.effects
      if (ef.goals) { playerContribution.keyMomentGoals += ef.goals; playerContribution.goals += ef.goals }
      if (ef.assists) { playerContribution.keyMomentAssists += ef.assists; playerContribution.assists += ef.assists }
      if (ef.rating) playerContribution.rating += ef.rating
      if (ef.morale) playerContribution.moraleD += ef.morale
    }
    if (keyMomentChoices === null && playerContribution.goals === 0 && playerContribution.assists === 0) playerContribution = null
  }

  return {
    events: finalEvents,
    homeGoals: hg,
    awayGoals: ag,
    homeTeam,
    awayTeam,
    homeStats,
    awayStats,
    mvp,
    playerContribution,
    keyMoments,
    resolvedMoments,
    isIntl: true,
  }
}

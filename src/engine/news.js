// 足球新闻/转会公告系统：生成模拟的转会、伤病、解雇、赛事新闻
import { TEAMS, LEAGUES, teamsByLeague } from '../data/leagues.js'
import { STAR_PLAYERS } from '../data/starPlayers.js'
import { pick, randInt, clamp } from './util.js'
import { INJURY_TEMPLATES, INJURY_SEVERITY_MAP } from './injury.js'

const POSITION_NAMES = [
  '前锋', '边锋', '前腰', '中场', '后腰', '中后卫', '边后卫', '门将'
]

// 工具：从球队获取真实球员（优先 starPlayers，否则按联赛从 STAR_PLAYERS 取）
function pickPlayerFromTeam(team) {
  // 球队自带 starPlayers → 直接用
  if (team.starPlayers?.length) {
    return { name: pick(team.starPlayers), pos: null, nation: null }
  }
  // 否则从 STAR_PLAYERS 中按联赛筛选
  const pool = STAR_PLAYERS.filter(p => p.league === team.league)
  if (pool.length) {
    const p = pick(pool)
    return { name: p.name, pos: p.pos, nation: p.nation }
  }
  // 兜底：从全部 STAR_PLAYERS 取
  if (STAR_PLAYERS.length) {
    const p = pick(STAR_PLAYERS)
    return { name: p.name, pos: p.pos, nation: p.nation }
  }
  return { name: '某球员', pos: null, nation: null }
}

// 工具：把位置代码转中文标签
function posZh(code) {
  if (!code) return pick(POSITION_NAMES)
  const m = {
    ST: '前锋', CF: '影锋', LW: '左边锋', RW: '右边锋',
    CAM: '前腰', CM: '中场', CDM: '后腰',
    CB: '中后卫', LB: '左后卫', RB: '右后卫', GK: '门将',
  }
  return m[code] || pick(POSITION_NAMES)
}

// 生成一条转会新闻
function genTransferNews(year) {
  // 随机抽取两只不同联赛的球队
  const fromTeam = pick(TEAMS.filter(t => LEAGUES[t.league]?.tier === 1))
  let toTeam = pick(TEAMS.filter(t => LEAGUES[t.league]?.tier === 1))
  let guard = 0
  while (toTeam.name === fromTeam.name && guard++ < 10) toTeam = pick(TEAMS)
  // 从源球队获取真实球员
  const playerInfo = pickPlayerFromTeam(fromTeam)
  const playerName = playerInfo.name
  const position = posZh(playerInfo.pos)
  const isLoan = Math.random() < 0.18
  const isFree = !isLoan && Math.random() < 0.15
  const isSwap = !isLoan && !isFree && Math.random() < 0.08
  const base = (fromTeam.strength + toTeam.strength) / 2
  const fee = isFree ? 0 : Math.round((1.2 + Math.random() * 1.6 + Math.abs(toTeam.strength - fromTeam.strength) * 0.08) * base / 10 * 1000) * 1000
  const feeStr = isFree ? '自由转会' : fee >= 100000000 ? `${(fee/1e8).toFixed(2)}亿欧` : `${(fee/1e4).toFixed(0)}万欧`
  const feeLabel = isLoan ? '租借' : isSwap ? '球员交换' : feeStr
  // 转会费等级分类
  let category = '标准交易'
  if (isFree) category = '自由身'
  else if (isLoan) category = '租借'
  else if (fee >= 80000000) category = '重磅'
  else if (fee >= 40000000) category = '高价'
  else if (fee <= 1000000) category = '廉价'
  const league = LEAGUES[fromTeam.league]?.short || ''
  const toLeague = LEAGUES[toTeam.league]?.short || ''
  const crossBorder = fromTeam.country !== toTeam.country
  const nationTag = playerInfo.nation ? `（${playerInfo.nation}）` : ''
  const descTemplates = [
    `官方：${position} ${playerName}${nationTag} 从${fromTeam.name}转会至${toTeam.name}，${isLoan?'租借加盟':isFree?'自由签约':'转会费'+' '+feeLabel}。${crossBorder?'这是一笔跨越'+fromTeam.country+'与'+toTeam.country+'的交易。':''}`,
    `足坛传来重磅消息：${fromTeam.name}正式将${position} ${playerName}出售至${toTeam.name}，${isLoan?'租借费低':isFree?'0转会费加盟':'转会费高达'+feeLabel}。${fromTeam.name}将这笔收入投入青训体系。`,
    `💸 ${league} ${fromTeam.name} vs ${toLeague} ${toTeam.name}：${position} ${playerName}达成${isSwap?'互换东家':'个人协议'}，${isLoan?'租期半年，含买断条款':isFree?'签字费颇丰':'转会窗口最轰动交易之一，金额 '+feeLabel}。`,
    `【记者爆料】${position} ${playerName}已在${toTeam.city}完成体检，${fromTeam.name}将其出售至${toTeam.name}，${feeLabel}。球迷对此反应不一。`,
  ]
  return {
    id: 'trans-' + Math.random().toString(36).slice(2, 8) + '-' + year,
    type: 'transfer',
    year,
    category,
    icon: '💼',
    title: `${fromTeam.name} → ${toTeam.name}`,
    fromTeam: fromTeam.name,
    toTeam: toTeam.name,
    playerName,
    position,
    feeLabel,
    desc: pick(descTemplates),
    crossBorder,
    timestamp: Date.now() + Math.random(),
  }
}

// 生成一条伤病新闻
function genInjuryNews(year) {
  const team = pick(TEAMS.filter(t => LEAGUES[t.league]?.tier === 1))
  const playerInfo = pickPlayerFromTeam(team)
  const playerName = playerInfo.name
  const position = posZh(playerInfo.pos)
  const tpl = pick(INJURY_TEMPLATES)
  const weeks = randInt(tpl.minWeeks, tpl.maxWeeks)
  const matches = Math.round(weeks * 0.9)
  const sev = INJURY_SEVERITY_MAP[tpl.severity] || INJURY_SEVERITY_MAP.mild
  const league = LEAGUES[team.league]?.short || ''
  const descTemplates = [
    `${league} ${team.name}传来坏消息：${position}${playerName}在训练中${tpl.name}。预计缺阵 ${weeks} 周，约 ${matches} 场比赛。${sev.label}。`,
    `💔 官方公告：${team.name}的${playerName}遭遇${tpl.name}（${sev.label}）。主教练确认将缺席至少 ${matches} 场比赛，预计 ${weeks} 周后归队。${tpl.treatment?.[0] || '需要静养'}。`,
    `${team.city} ${team.name}官方：${playerName}${tpl.name}。${Array.isArray(tpl.cause)?tpl.cause[0]:tpl.cause}，${sev.label}。预计缺阵 ${weeks} 周。`,
  ]
  const sevLevel = weeks > 24 ? 3 : weeks > 10 ? 2 : 1
  return {
    id: 'inj-' + Math.random().toString(36).slice(2, 8) + '-' + year,
    type: 'injury',
    year,
    category: sevLevel === 3 ? '重伤' : sevLevel === 2 ? '中度' : '轻伤',
    icon: sevLevel === 3 ? '🚨' : sevLevel === 2 ? '⚠️' : '🩹',
    title: `${team.name} ${playerName} ${tpl.name}`,
    team: team.name,
    playerName,
    injuryName: tpl.name,
    weeks,
    matches,
    desc: pick(descTemplates),
    severity: sevLevel,
    timestamp: Date.now() + Math.random(),
  }
}

// 生成一条教练/解雇新闻
function genCoachNews(year) {
  const team = pick(TEAMS.filter(t => LEAGUES[t.league]?.tier === 1))
  const isSack = Math.random() < 0.55
  const coachName = pick([
    '穆里尼奥', '瓜迪奥拉', '克洛普', '安切洛蒂', '阿莱格里',
    '孔蒂', '西蒙尼', '哈维·阿隆索', '恩里克', '斯帕莱蒂',
    '图赫尔', '纳格尔斯曼', '德泽尔比', '小因扎吉',
    '加利亚多', '滕哈赫', '波特', '埃梅里',
  ])
  const league = LEAGUES[team.league]?.short || ''
  if (isSack) {
    const descs = [
      `💥 ${league} ${team.name}官宣解雇主帅！${team.city}风雨飘摇，赛季战绩未达预期。俱乐部高层已开启新帅遴选，传闻${coachName}等名帅已接触。`,
      `下课警报响起：${team.name}宣布与主帅分道扬镳。近期${team.name}${pick(['连负三场','接连被弱旅逼平','进攻哑火防守漏洞百出'])}，${pick(['俱乐部忍无可忍','更衣室矛盾公开化','高层信任崩塌'])}。`,
      `【突发】${league} ${team.name}主帅下课。${team.name}本赛季${pick(['仅排名联赛中游','欧冠小组赛即出局','遭遇三连败'])}，董事会已启动换帅程序。`,
    ]
    return {
      id: 'coach-sack-' + Math.random().toString(36).slice(2, 6) + '-' + year,
      type: 'coach',
      year, category: '下课', icon: '🔥',
      title: `${team.name}解雇主帅`,
      team: team.name,
      desc: pick(descs),
      timestamp: Date.now() + Math.random(),
    }
  } else {
    const descs = [
      `🆕 新帅就位：${coachName}正式入主${league} ${team.name}，签约${randInt(2,5)}年。${coachName}在媒体见面会上表示将带来${pick(['高位压迫','控球主导','铁血防守','攻势足球'])}风格。`,
      `${team.name}官方宣布${coachName}担任新任主教练。${pick(['球迷反应热烈','更衣室拭目以待','高层充满信心'])}，期待${team.name}新赛季的表现。`,
      `重磅签约！${coachName}成为${team.name}新任主帅。在${team.city}的${team.stadium}举行了亮相仪式，${pick(['大批球迷到场','与球员逐一握手','俱乐部主席高度评价'])}。`,
    ]
    return {
      id: 'coach-hire-' + Math.random().toString(36).slice(2, 6) + '-' + year,
      type: 'coach',
      year, category: '新帅', icon: '🎩',
      title: `${coachName}执教${team.name}`,
      team: team.name,
      coachName,
      desc: pick(descs),
      timestamp: Date.now() + Math.random(),
    }
  }
}

// 生成一条赛事新闻
function genTournamentNews(year) {
  const tournament = pick([
    { name: '欧冠联赛', icon: '🏆', tier: 'club' },
    { name: '欧联杯', icon: '🥇', tier: 'club' },
    { name: '英超联赛', icon: '⚔️', tier: 'league' },
    { name: '西甲联赛', icon: '⚔️', tier: 'league' },
    { name: '德甲联赛', icon: '⚔️', tier: 'league' },
    { name: '意甲联赛', icon: '⚔️', tier: 'league' },
    { name: '世界杯预选赛', icon: '🌍', tier: 'nation' },
    { name: '欧洲杯预选赛', icon: '🏴', tier: 'nation' },
    { name: '南美解放者杯', icon: '🌎', tier: 'club' },
    { name: '亚冠联赛', icon: '🏮', tier: 'club' },
  ])
  if (tournament.tier === 'club') {
    const a = pick(TEAMS.filter(t => t.strength >= 75))
    let b = pick(TEAMS.filter(t => t.strength >= 75))
    let g = 0
    while (b.name === a.name && g++ < 5) b = pick(TEAMS.filter(t => t.strength >= 75))
    const scoreA = randInt(0, 4)
    let scoreB = randInt(0, 4)
    if (scoreA === scoreB && Math.random() < 0.5) scoreB += 1
    const winner = scoreA > scoreB ? a : b
    const descs = [
      `🌟 ${tournament.icon} ${tournament.name}焦点战：${a.name} ${scoreA}-${scoreB} ${b.name}。${winner.name}笑到最后！${pick(
        ['补时绝杀点燃全场','下半场神奇逆转','红黄牌满天飞','精彩进球接连不断']
      )}。`,
      `${tournament.icon} ${tournament.name}快报：${a.name}主场${pick(['险胜','完胜','艰难战平','惨遭绝平'])}${b.name}，比分 ${scoreA}-${scoreB}。球迷评价${pick(['精彩绝伦','一言难尽','物超所值','令人扼腕'])}。`,
      `🏟️ 焦点对决：${tournament.name}第${randInt(5,10)}轮 ${a.name} vs ${b.name}以${scoreA}-${scoreB}结束。${winner.strength < (scoreA > scoreB ? b : a).strength ? `黑马狂奔，${winner.name}爆冷取胜！` : `${winner.name}延续${pick(['连胜','不败','统治力'])}表现。`}`,
    ]
    return {
      id: 'tour-' + Math.random().toString(36).slice(2, 6) + '-' + year,
      type: 'tournament',
      year, category: '焦点战', icon: tournament.icon,
      title: `${tournament.name}：${a.name} vs ${b.name}`,
      tournament: tournament.name,
      home: a.name, away: b.name,
      score: `${scoreA}-${scoreB}`,
      desc: pick(descs),
      timestamp: Date.now() + Math.random(),
    }
  } else {
    const nations = pick([
      ['德国', '西班牙', 1, 1], ['法国', '英格兰', 2, 1], ['巴西', '阿根廷', 0, 1],
      ['葡萄牙', '意大利', 1, 0], ['荷兰', '比利时', 2, 2], ['日本', '韩国', 2, 0],
      ['中国', '沙特', 0, 1], ['墨西哥', '美国', 1, 1], ['克罗地亚', '丹麦', 1, 0],
    ])
    const descs = [
      `🌍 ${tournament.icon} ${tournament.name}战报：${nations[0]} ${nations[2]}-${nations[3]} ${nations[1]}。${nations[2]===nations[3]?'双方握手言和。':(nations[2]>nations[3]?nations[0]+'主场凯旋。':nations[1]+'客场带走胜利。')}`,
      `${tournament.icon} ${tournament.name}：${nations[0]}${pick(['锋线哑火','猛攻不下','防线告急','后防稳固'])}，最终与${nations[1]}战成 ${nations[2]}-${nations[3]}。`,
    ]
    return {
      id: 'nat-' + Math.random().toString(36).slice(2, 6) + '-' + year,
      type: 'tournament',
      year, category: '国际赛事', icon: tournament.icon,
      title: `${tournament.name}：${nations[0]} vs ${nations[1]}`,
      tournament: tournament.name,
      home: nations[0], away: nations[1],
      score: `${nations[2]}-${nations[3]}`,
      desc: pick(descs),
      timestamp: Date.now() + Math.random(),
    }
  }
}

// 生成一条足球圈杂项新闻
function genMiscNews(year) {
  const topics = [
    () => {
      const legends = ['梅西', 'C罗', '莫德里奇', '莱万', '伊布', '本泽马', '苏亚雷斯', '姆巴佩', '哈兰德', '内马尔']
      const legend = pick(legends)
      return {
        category: '传奇', icon: '👑',
        title: `${legend}${pick(['再创里程碑','荣获生涯第40冠','宣布国家队回归','公开个人未来规划'])}`,
        desc: `${legend}近日在采访中表示${pick([
          '"我还能再踢几年"','"希望在退役前再拿一座欧冠"','"足球是我的生命"','"我已迫不及待地想开始新赛季"'
        ])}。`,
      }
    },
    () => {
      const team = pick(TEAMS.filter(t => t.strength >= 78))
      return {
        category: '俱乐部', icon: '📈',
        title: `${team.name}${pick(['市值突破100亿','新球场建设方案通过','签下创纪录赞助','青训营投资翻倍'])}`,
        desc: `${team.name}董事会宣布了一项重大决定，这将在未来${pick(['5','3','10'])}年内深刻改变俱乐部的命运。球迷${pick(['纷纷点赞','反应两极','翘首以盼','充满期待'])}。`,
      }
    },
    () => ({
      category: '规则改变', icon: '📋',
      title: 'FIFA/IFAB规则大变革' + pick(['来袭','公布','在即','提案通过']),
      desc: pick([
        '新规则包含：点球大战5次轮换制、门将不能提前移动规则修改、手球判罚放宽、补时严格统计等。',
        'FIFA官宣：VAR将引入半自动判罚系统，越位识别时间从70秒缩短到20秒以内。',
        'IFAB通过：10人以下一方自动判罚0-3负的规则在低级别联赛试行。',
      ]),
    }),
    () => {
      const record = [
        '英超进球纪录', '欧冠连续出场纪录', '国家队百场里程碑',
        '最年轻帽子戏法', '门将零封纪录', '赛季助攻纪录',
      ]
      const name = pick(['姆巴佩','哈兰德','维尼修斯','贝林厄姆','穆西亚拉','亚马尔'])
      const r = pick(record)
      return {
        category: '纪录', icon: '🏅',
        title: `${name}打破${r}`,
        desc: `${name}本赛季${pick(['状态爆炸','势如破竹','令人瞩目','一发不可收'])}，成功打破尘封${randInt(8,30)}年的${r}！足坛传奇又添一页。`,
      }
    },
  ]
  const t = pick(topics)()
  return {
    id: 'misc-' + Math.random().toString(36).slice(2, 6) + '-' + year,
    type: 'misc',
    year, ...t,
    timestamp: Date.now() + Math.random(),
  }
}

// 生成一批赛季新闻
export function generateSeasonNews(year, playerTeam, playerLeague) {
  const news = []
  const transferCount = randInt(8, 14)
  const injuryCount = randInt(4, 7)
  const coachCount = randInt(2, 4)
  const tournamentCount = randInt(4, 7)
  const miscCount = randInt(2, 4)
  for (let i = 0; i < transferCount; i++) news.push(genTransferNews(year))
  for (let i = 0; i < injuryCount; i++) news.push(genInjuryNews(year))
  for (let i = 0; i < coachCount; i++) news.push(genCoachNews(year))
  for (let i = 0; i < tournamentCount; i++) news.push(genTournamentNews(year))
  for (let i = 0; i < miscCount; i++) news.push(genMiscNews(year))
  // 按时间戳排序
  news.sort((a, b) => b.timestamp - a.timestamp)
  // 给与玩家相关的新闻加标记
  news.forEach(n => {
    const names = []
    if (playerTeam) names.push(playerTeam)
    if (n.fromTeam) names.push(n.fromTeam)
    if (n.toTeam) names.push(n.toTeam)
    if (n.team) names.push(n.team)
    n.playerRelated = (n.fromTeam === playerTeam) || (n.toTeam === playerTeam) || (n.team === playerTeam)
  })
  return news
}

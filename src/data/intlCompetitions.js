// 国际足球赛事数据库 —— 世界杯/欧洲杯/亚洲杯/美洲杯/奥运会/世青赛/世预赛
// baseYear = 该届赛事举办年份；cycle = 周期（年）
// eligibleNations: 赛事所属大洲的国家可参赛；'ALL' = 全球
// tier: gold(顶级) / silver(二级) / bronze(三级)

export const INTL_COMPETITIONS = {
  WC: {
    code: 'WC',
    name: 'FIFA世界杯',
    short: '世界杯',
    icon: '🌍',
    color: '#ffd700',
    tier: 'gold',
    desc: '世界足坛最高荣誉，每四年一届，32支球队争夺大力神杯',
    baseYear: 2022,
    cycle: 4,
    confederation: 'FIFA',
    eligibleNations: 'ALL',
    rounds: ['小组赛', '16强', '8强', '半决赛', '决赛'],
  },
  Euro: {
    code: 'Euro',
    name: '欧洲足球锦标赛',
    short: '欧洲杯',
    icon: '🇪🇺',
    color: '#1a237e',
    tier: 'gold',
    desc: '欧洲国家队最高荣誉，每四年一届，24支球队参赛',
    baseYear: 2024,
    cycle: 4,
    confederation: 'UEFA',
    eligibleNations: ['英格兰','法国','德国','西班牙','意大利','葡萄牙','荷兰','比利时','克罗地亚','丹麦','瑞士','奥地利','瑞典','挪威','波兰','塞尔维亚','希腊','土耳其','乌克兰','俄罗斯','苏格兰','威尔士','爱尔兰','捷克','匈牙利','罗马尼亚','斯洛文尼亚','斯洛伐克'],
    rounds: ['小组赛', '16强', '8强', '半决赛', '决赛'],
  },
  AsianCup: {
    code: 'AsianCup',
    name: '亚足联亚洲杯',
    short: '亚洲杯',
    icon: '🌏',
    color: '#b71c1c',
    tier: 'gold',
    desc: '亚洲国家队最高荣誉，每四年一届',
    baseYear: 2023,
    cycle: 4,
    confederation: 'AFC',
    eligibleNations: ['中国','日本','韩国','伊朗','沙特阿拉伯','澳大利亚','卡塔尔','阿联酋','伊拉克','乌兹别克斯坦','叙利亚','越南','泰国','约旦','巴林','黎巴嫩','巴勒斯坦','印度','马来西亚','印度尼西亚','菲律宾','阿曼','科威特','吉尔吉斯斯坦','塔吉克斯坦','中国香港','中国台北'],
    rounds: ['小组赛', '16强', '8强', '半决赛', '决赛'],
  },
  CopaAmerica: {
    code: 'CopaAmerica',
    name: '美洲杯',
    short: '美洲杯',
    icon: '🌎',
    color: '#2e7d32',
    tier: 'gold',
    desc: '南美洲国家队最高荣誉，每四年一届',
    baseYear: 2024,
    cycle: 4,
    confederation: 'CONMEBOL',
    eligibleNations: ['巴西','阿根廷','乌拉圭','智利','哥伦比亚','秘鲁','厄瓜多尔','巴拉圭','玻利维亚','委内瑞拉','墨西哥','美国','哥斯达黎加','巴拿马'],
    rounds: ['小组赛', '8强', '半决赛', '决赛'],
  },
  Olympics: {
    code: 'Olympics',
    name: '奥运会足球赛',
    short: '奥运会',
    icon: '🏅',
    color: '#ff6f00',
    tier: 'silver',
    desc: 'U-23国奥队+3名超龄球员，每四年一届',
    baseYear: 2024,
    cycle: 4,
    confederation: 'FIFA',
    eligibleNations: 'ALL',
    maxAge: 23,
    overageSlots: 3,
    rounds: ['小组赛', '8强', '半决赛', '决赛'],
  },
  U20WC: {
    code: 'U20WC',
    name: 'FIFA U-20世界杯',
    short: '世青赛',
    icon: '🌱',
    color: '#43b581',
    tier: 'silver',
    desc: '20岁以下青年国家队最高荣誉，每两年一届',
    baseYear: 2023,
    cycle: 2,
    confederation: 'FIFA',
    eligibleNations: 'ALL',
    maxAge: 20,
    rounds: ['小组赛', '16强', '8强', '半决赛', '决赛'],
  },
  NationsLeague: {
    code: 'NationsLeague',
    name: '欧洲国家联赛',
    short: '欧国联',
    icon: '🛡️',
    color: '#1565c0',
    tier: 'silver',
    desc: '欧洲国家队年度赛事，A级4组循环赛+决赛圈',
    baseYear: 2024,
    cycle: 2,
    confederation: 'UEFA',
    eligibleNations: ['英格兰','法国','德国','西班牙','意大利','葡萄牙','荷兰','比利时','克罗地亚','丹麦','瑞士','奥地利','瑞典','挪威','波兰','塞尔维亚'],
    rounds: ['小组赛', '半决赛', '决赛'],
  },
  EAFF: {
    code: 'EAFF',
    name: '东亚杯',
    short: '东亚杯',
    icon: '⛩️',
    color: '#8d6e63',
    tier: 'bronze',
    desc: '东亚足球联盟锦标赛，每两年一届',
    baseYear: 2022,
    cycle: 2,
    confederation: 'EAFF',
    eligibleNations: ['中国','日本','韩国','朝鲜','中国香港','中国台北','蒙古','关岛'],
    rounds: ['半决赛', '决赛'],
  },
}

// 大洲足协归属（用于判定玩家国家队可参加哪些赛事）
export const NATION_TO_CONFED = {
  '中国': 'AFC', '日本': 'AFC', '韩国': 'AFC', '伊朗': 'AFC', '沙特阿拉伯': 'AFC', '澳大利亚': 'AFC',
  '巴西': 'CONMEBOL', '阿根廷': 'CONMEBOL', '乌拉圭': 'CONMEBOL', '智利': 'CONMEBOL',
  '哥伦比亚': 'CONMEBOL', '秘鲁': 'CONMEBOL', '厄瓜多尔': 'CONMEBOL',
  '英格兰': 'UEFA', '法国': 'UEFA', '德国': 'UEFA', '西班牙': 'UEFA', '意大利': 'UEFA',
  '葡萄牙': 'UEFA', '荷兰': 'UEFA', '比利时': 'UEFA', '克罗地亚': 'UEFA', '丹麦': 'UEFA',
  '瑞士': 'UEFA', '奥地利': 'UEFA', '瑞典': 'UEFA', '挪威': 'UEFA', '波兰': 'UEFA',
  '塞尔维亚': 'UEFA', '希腊': 'UEFA', '土耳其': 'UEFA', '乌克兰': 'UEFA',
}

// 国家队实力档位（用于模拟赛事成绩）：confederation -> 国家 -> 实力(0-100)
export const NATIONAL_TEAM_STRENGTH = {
  // 亚洲
  '中国': { strength: 58, conf: 'AFC' },
  '日本': { strength: 86, conf: 'AFC' },
  '韩国': { strength: 84, conf: 'AFC' },
  '伊朗': { strength: 80, conf: 'AFC' },
  '沙特阿拉伯': { strength: 78, conf: 'AFC' },
  '澳大利亚': { strength: 80, conf: 'AFC' },
  '卡塔尔': { strength: 75, conf: 'AFC' },
  '阿联酋': { strength: 72, conf: 'AFC' },
  '伊拉克': { strength: 73, conf: 'AFC' },
  '乌兹别克斯坦': { strength: 72, conf: 'AFC' },
  '叙利亚': { strength: 66, conf: 'AFC' },
  '越南': { strength: 65, conf: 'AFC' },
  '泰国': { strength: 62, conf: 'AFC' },
  '约旦': { strength: 64, conf: 'AFC' },
  // 南美
  '巴西': { strength: 92, conf: 'CONMEBOL' },
  '阿根廷': { strength: 93, conf: 'CONMEBOL' },
  '乌拉圭': { strength: 85, conf: 'CONMEBOL' },
  '智利': { strength: 80, conf: 'CONMEBOL' },
  '哥伦比亚': { strength: 84, conf: 'CONMEBOL' },
  '秘鲁': { strength: 76, conf: 'CONMEBOL' },
  '厄瓜多尔': { strength: 78, conf: 'CONMEBOL' },
  '巴拉圭': { strength: 73, conf: 'CONMEBOL' },
  // 欧洲
  '英格兰': { strength: 90, conf: 'UEFA' },
  '法国': { strength: 92, conf: 'UEFA' },
  '德国': { strength: 88, conf: 'UEFA' },
  '西班牙': { strength: 89, conf: 'UEFA' },
  '意大利': { strength: 87, conf: 'UEFA' },
  '葡萄牙': { strength: 88, conf: 'UEFA' },
  '荷兰': { strength: 87, conf: 'UEFA' },
  '比利时': { strength: 86, conf: 'UEFA' },
  '克罗地亚': { strength: 84, conf: 'UEFA' },
  '丹麦': { strength: 82, conf: 'UEFA' },
  '瑞士': { strength: 81, conf: 'UEFA' },
  '奥地利': { strength: 79, conf: 'UEFA' },
  '挪威': { strength: 80, conf: 'UEFA' },
  '波兰': { strength: 78, conf: 'UEFA' },
  '塞尔维亚': { strength: 80, conf: 'UEFA' },
  '瑞典': { strength: 78, conf: 'UEFA' },
  // 其他
  '美国': { strength: 78, conf: 'CONCACAF' },
  '墨西哥': { strength: 79, conf: 'CONCACAF' },
  '加拿大': { strength: 75, conf: 'CONCACAF' },
}

// 判定某届赛事是否在给定年份举办
export function isCompetitionYear(comp, year) {
  const offset = year - comp.baseYear
  if (offset < 0) return false
  return offset % comp.cycle === 0
}

// 获取某年举办的所有国际赛事
export function competitionsInYear(year) {
  return Object.values(INTL_COMPETITIONS).filter(c => isCompetitionYear(c, year))
}

// 国家队是否可参加某项赛事
export function nationCanCompete(comp, nation) {
  if (comp.eligibleNations === 'ALL') return true
  return comp.eligibleNations.includes(nation)
}

// 获取国家的大洲归属
export function nationConfederation(nation) {
  return NATION_TO_CONFED[nation] || NATIONAL_TEAM_STRENGTH[nation]?.conf || 'AFC'
}

// 获取国家队实力（0-100）
export function nationStrength(nation) {
  return NATIONAL_TEAM_STRENGTH[nation]?.strength || 55
}

// 属性分组与标签定义（FIFA式）
// PAC速度 / SHO射门 / PAS传球 / DRI盘带 / DEF防守 / PHY身体 / GK门将

export const ATTRIBUTE_GROUPS = {
  PAC: { label: '速度 PAC', color: '#43b581', attrs: ['acceleration', 'sprintSpeed'] },
  SHO: { label: '射门 SHO', color: '#e74c3c', attrs: ['positioning', 'finishing', 'shotPower', 'longShots', 'volleys', 'penalties'] },
  PAS: { label: '传球 PAS', color: '#3498db', attrs: ['vision', 'shortPassing', 'longPassing', 'crossing', 'curve', 'freeKickAccuracy'] },
  DRI: { label: '盘带 DRI', color: '#9b59b6', attrs: ['agility', 'balance', 'reactions', 'ballControl', 'dribbling', 'composure'] },
  DEF: { label: '防守 DEF', color: '#e67e22', attrs: ['defensiveAwareness', 'interceptions', 'headingAccuracy', 'standingTackle', 'slidingTackle'] },
  PHY: { label: '身体 PHY', color: '#95a5a6', attrs: ['strength', 'stamina', 'jumping', 'aggression'] },
  GK: { label: '门将 GK', color: '#f1c40f', attrs: ['reflexes', 'handling', 'diving', 'gkPositioning', 'kicking'] },
}

export const ATTR_LABELS = {
  acceleration: '加速', sprintSpeed: '冲刺速度',
  positioning: '站位', finishing: '射术', shotPower: '射门力量', longShots: '远射', volleys: '凌空', penalties: '点球',
  vision: '视野', shortPassing: '短传', longPassing: '长传', crossing: '传中', curve: '弧线', freeKickAccuracy: '任意球精度',
  agility: '敏捷', balance: '平衡', reactions: '反应', ballControl: '控球', dribbling: '盘带', composure: '沉着',
  defensiveAwareness: '防守意识', interceptions: '拦截', headingAccuracy: '头球精度', standingTackle: '立定抢断', slidingTackle: '滑铲',
  strength: '力量', stamina: '耐力', jumping: '跳跃', aggression: '侵略性',
  reflexes: '扑救反应', handling: '接球', diving: '鱼跃', gkPositioning: '门将站位', kicking: '开球',
}

// 全部非门将属性键
export const ALL_ATTRS = [
  'acceleration', 'sprintSpeed',
  'positioning', 'finishing', 'shotPower', 'longShots', 'volleys', 'penalties',
  'vision', 'shortPassing', 'longPassing', 'crossing', 'curve', 'freeKickAccuracy',
  'agility', 'balance', 'reactions', 'ballControl', 'dribbling', 'composure',
  'defensiveAwareness', 'interceptions', 'headingAccuracy', 'standingTackle', 'slidingTackle',
  'strength', 'stamina', 'jumping', 'aggression',
]

export const GK_ATTRS = ['reflexes', 'handling', 'diving', 'gkPositioning', 'kicking']

// 位置定义
export const POSITIONS = {
  ST: { label: '中锋 ST', group: 'FW', side: 'C' },
  CF: { label: '影锋 CF', group: 'FW', side: 'C' },
  LW: { label: '左边锋 LW', group: 'FW', side: 'L' },
  RW: { label: '右边锋 RW', group: 'FW', side: 'R' },
  CAM: { label: '前腰 CAM', group: 'MF', side: 'C' },
  CM: { label: '中前卫 CM', group: 'MF', side: 'C' },
  CDM: { label: '后腰 CDM', group: 'MF', side: 'C' },
  LM: { label: '左前卫 LM', group: 'MF', side: 'L' },
  RM: { label: '右前卫 RM', group: 'MF', side: 'R' },
  CB: { label: '中后卫 CB', group: 'DF', side: 'C' },
  LB: { label: '左后卫 LB', group: 'DF', side: 'L' },
  RB: { label: '右后卫 RB', group: 'DF', side: 'R' },
  GK: { label: '门将 GK', group: 'GK', side: 'C' },
}

// 各位置OVR计算权重（运行时归一化，无需精确求和为1）
export const OVR_WEIGHTS = {
  ST: { finishing: 14, positioning: 11, composure: 10, reactions: 9, ballControl: 8, dribbling: 7, shotPower: 7, headingAccuracy: 7, strength: 6, acceleration: 6, sprintSpeed: 5, agility: 5, balance: 4, stamina: 5, jumping: 5, aggression: 4, shortPassing: 4, vision: 3, longShots: 4, volleys: 3, penalties: 2, standingTackle: 1, slidingTackle: 1, defensiveAwareness: 1, interceptions: 1 },
  CF: { finishing: 12, positioning: 10, composure: 9, reactions: 9, ballControl: 9, dribbling: 9, agility: 7, balance: 6, acceleration: 6, sprintSpeed: 5, vision: 5, shortPassing: 5, shotPower: 5, longShots: 4, stamina: 4, strength: 3, jumping: 3, headingAccuracy: 4, volleys: 3, penalties: 2, curve: 3, standingTackle: 1, defensiveAwareness: 1 },
  LW: { acceleration: 11, sprintSpeed: 9, agility: 10, balance: 9, dribbling: 11, ballControl: 10, composure: 7, finishing: 7, positioning: 6, reactions: 7, crossing: 6, shortPassing: 5, vision: 4, curve: 5, longShots: 4, shotPower: 4, stamina: 6, volleys: 3, strength: 3, jumping: 2, penalties: 2, standingTackle: 1, defensiveAwareness: 1 },
  RW: { acceleration: 11, sprintSpeed: 9, agility: 10, balance: 9, dribbling: 11, ballControl: 10, composure: 7, finishing: 7, positioning: 6, reactions: 7, crossing: 6, shortPassing: 5, vision: 4, curve: 5, longShots: 4, shotPower: 4, stamina: 6, volleys: 3, strength: 3, jumping: 2, penalties: 2, standingTackle: 1, defensiveAwareness: 1 },
  CAM: { vision: 11, shortPassing: 11, composure: 9, ballControl: 9, dribbling: 8, reactions: 8, longPassing: 7, curve: 6, longShots: 6, finishing: 5, positioning: 5, agility: 6, balance: 5, acceleration: 5, sprintSpeed: 4, shotPower: 5, stamina: 5, crossing: 4, freeKickAccuracy: 4, volleys: 3, penalties: 3, standingTackle: 1, defensiveAwareness: 2 },
  CM: { shortPassing: 11, vision: 10, composure: 9, ballControl: 9, reactions: 8, stamina: 8, longPassing: 7, dribbling: 6, agility: 5, balance: 5, positioning: 5, longShots: 5, shotPower: 5, interceptions: 5, standingTackle: 5, defensiveAwareness: 5, acceleration: 4, sprintSpeed: 4, strength: 5, aggression: 4, crossing: 3, curve: 3, finishing: 3, penalties: 2 },
  CDM: { interceptions: 12, defensiveAwareness: 12, standingTackle: 10, strength: 9, stamina: 9, shortPassing: 8, aggression: 8, reactions: 7, ballControl: 6, composure: 6, vision: 6, longPassing: 6, slidingTackle: 8, headingAccuracy: 6, balance: 4, agility: 4, positioning: 3, jumping: 5, acceleration: 3, sprintSpeed: 3, shotPower: 3, finishing: 2, longShots: 3 },
  LM: { acceleration: 10, sprintSpeed: 8, agility: 9, balance: 8, dribbling: 10, ballControl: 9, crossing: 9, stamina: 8, shortPassing: 7, composure: 5, vision: 5, reactions: 6, curve: 5, positioning: 4, finishing: 4, longPassing: 4, sprintSpeed: 6, shotPower: 3, longShots: 3, strength: 3, standingTackle: 3, defensiveAwareness: 3, interceptions: 3 },
  RM: { acceleration: 10, sprintSpeed: 8, agility: 9, balance: 8, dribbling: 10, ballControl: 9, crossing: 9, stamina: 8, shortPassing: 7, composure: 5, vision: 5, reactions: 6, curve: 5, positioning: 4, finishing: 4, longPassing: 4, shotPower: 3, longShots: 3, strength: 3, standingTackle: 3, defensiveAwareness: 3, interceptions: 3 },
  CB: { defensiveAwareness: 13, interceptions: 12, standingTackle: 11, slidingTackle: 9, strength: 10, jumping: 9, headingAccuracy: 9, reactions: 8, aggression: 7, stamina: 6, sprintSpeed: 6, acceleration: 5, composure: 6, ballControl: 4, shortPassing: 5, longPassing: 4, vision: 3, balance: 4, agility: 3, marking: 0 },
  LB: { acceleration: 10, sprintSpeed: 9, stamina: 10, standingTackle: 9, interceptions: 9, defensiveAwareness: 8, crossing: 8, agility: 7, balance: 7, reactions: 7, ballControl: 6, shortPassing: 6, dribbling: 6, composure: 5, strength: 5, jumping: 5, slidingTackle: 7, headingAccuracy: 5, aggression: 5, vision: 4, longPassing: 4, positioning: 3, finishing: 2 },
  RB: { acceleration: 10, sprintSpeed: 9, stamina: 10, standingTackle: 9, interceptions: 9, defensiveAwareness: 8, crossing: 8, agility: 7, balance: 7, reactions: 7, ballControl: 6, shortPassing: 6, dribbling: 6, composure: 5, strength: 5, jumping: 5, slidingTackle: 7, headingAccuracy: 5, aggression: 5, vision: 4, longPassing: 4, positioning: 3, finishing: 2 },
  GK: { reflexes: 14, handling: 11, diving: 12, gkPositioning: 12, kicking: 8, reactions: 6, composure: 5 },
}

// 各位置关键属性（用于成长倾向、事件判断）
export const POSITION_KEYS = {
  ST: ['finishing', 'positioning', 'composure', 'acceleration', 'reactions', 'strength', 'jumping', 'headingAccuracy'],
  CF: ['finishing', 'dribbling', 'ballControl', 'composure', 'agility', 'reactions'],
  LW: ['acceleration', 'agility', 'balance', 'dribbling', 'ballControl', 'crossing', 'longShots'],
  RW: ['acceleration', 'agility', 'balance', 'dribbling', 'ballControl', 'crossing', 'longShots'],
  CAM: ['vision', 'shortPassing', 'composure', 'reactions', 'longShots', 'curve'],
  CM: ['shortPassing', 'vision', 'composure', 'reactions', 'stamina', 'longShots'],
  CDM: ['interceptions', 'defensiveAwareness', 'strength', 'stamina', 'shortPassing', 'aggression'],
  LM: ['acceleration', 'stamina', 'crossing', 'dribbling', 'ballControl'],
  RM: ['acceleration', 'stamina', 'crossing', 'dribbling', 'ballControl'],
  CB: ['defensiveAwareness', 'interceptions', 'strength', 'jumping', 'reactions', 'headingAccuracy'],
  LB: ['acceleration', 'stamina', 'interceptions', 'standingTackle', 'crossing'],
  RB: ['acceleration', 'stamina', 'interceptions', 'standingTackle', 'crossing'],
  GK: ['reflexes', 'handling', 'diving', 'gkPositioning', 'kicking'],
}

// 花式星级与逆足星级映射
export const SKILL_STARS = [1, 2, 3, 4, 5]

// 比赛风格池
export const PLAYSTYLES = [
  '搓射', '直塞', '斗士', '预判', '远射', '头球', '快速带球', '强力射门',
  '拦截者', '长传', '传中', '蝎子摆尾', '倒钩', '门线铁闸', '手抛球',
]

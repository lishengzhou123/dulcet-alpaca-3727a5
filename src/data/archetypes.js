// FC26式 原型(Archetype)与技能树数据
// 每个原型：起始加成 + 3条分支(每条4阶节点) → 属性/比赛风格/特权

import { ATTR_LABELS } from './positions.js'

// 特权定义
export const PERKS = {
  growth_boost: { name: '加速成长', desc: '该分支关联属性自然成长+25%' },
  injury_resist: { name: '铁人', desc: '受伤风险-20%' },
  morale_master: { name: '进球鼓舞', desc: '每粒进球额外+3士气' },
  weak_foot: { name: '逆足精进', desc: '逆足星级+1' },
  skill_move: { name: '花式精进', desc: '花式星级+1' },
  clutch: { name: '大心脏', desc: '比赛评分+0.2' },
  stamina_saver: { name: '节能跑动', desc: '体能消耗-20%' },
  leader: { name: '领袖气质', desc: '队友关系获取+30%' },
  poacher: { name: '禁区嗅觉', desc: '射门类属性额外+1（每节点）' },
  playmaker: { name: '组织核心', desc: '传球类属性额外+1（每节点）' },
  anchor: { name: '防守铁闸', desc: '防守类属性额外+1（每节点）' },
}

// 原型定义
// bonuses: 起始属性加成（创建时一次性）
// branches: [{ name, attrs:[3个], playStyle, perk }]
export const ARCHETYPES = [
  // ===== ST =====
  {
    id: 'poacher', name: '猎手 Poacher', position: 'ST',
    desc: '禁区里的杀手，嗅觉灵敏，站位与射术一流，弱在参与组织。',
    bonuses: { finishing: 4, positioning: 3, composure: 3, reactions: 2, shortPassing: -2 },
    branches: [
      { name: '禁区杀手', attrs: ['finishing', 'positioning', 'composure'], playStyle: '强力射门', perk: 'poacher' },
      { name: '抢点大师', attrs: ['reactions', 'headingAccuracy', 'agility'], playStyle: '头球', perk: 'clutch' },
      { name: '终结本能', attrs: ['shotPower', 'volleys', 'penalties'], playStyle: '搓射', perk: 'morale_master' },
    ],
  },
  {
    id: 'complete_forward', name: '全能前锋 Complete Forward', position: 'ST',
    desc: '能传能射能护球，前场全能核心，无明显短板。',
    bonuses: { finishing: 2, ballControl: 3, shortPassing: 3, strength: 2, composure: 2 },
    branches: [
      { name: '支点回做', attrs: ['strength', 'shortPassing', 'ballControl'], playStyle: '直塞', perk: 'leader' },
      { name: '终结能力', attrs: ['finishing', 'positioning', 'shotPower'], playStyle: '强力射门', perk: 'morale_master' },
      { name: '全能体魄', attrs: ['stamina', 'balance', 'agility'], playStyle: '斗士', perk: 'stamina_saver' },
    ],
  },
  {
    id: 'target_man', name: '柱式中锋 Target Man', position: 'ST',
    desc: '高大的支点，背身护球、争顶制空，长传冲吊的终端。',
    bonuses: { strength: 5, jumping: 4, headingAccuracy: 4, balance: 2, agility: -3, sprintSpeed: -1 },
    branches: [
      { name: '空中霸主', attrs: ['jumping', 'headingAccuracy', 'strength'], playStyle: '头球', perk: 'morale_master' },
      { name: '背身护球', attrs: ['strength', 'balance', 'ballControl'], playStyle: '斗士', perk: 'injury_resist' },
      { name: '禁区分球', attrs: ['shortPassing', 'vision', 'composure'], playStyle: '直塞', perk: 'leader' },
    ],
  },
  {
    id: 'speedster_st', name: '突击手 Speedster', position: 'ST',
    desc: '靠速度生吃后卫，反越位长驱直入，单刀利器。',
    bonuses: { acceleration: 5, sprintSpeed: 4, agility: 3, finishing: 2, strength: -2 },
    branches: [
      { name: '极速反击', attrs: ['acceleration', 'sprintSpeed', 'reactions'], playStyle: '快速带球', perk: 'stamina_saver' },
      { name: '单刀冷静', attrs: ['finishing', 'composure', 'dribbling'], playStyle: '搓射', perk: 'clutch' },
      { name: '灵活走位', attrs: ['agility', 'balance', 'positioning'], playStyle: '预判', perk: 'growth_boost' },
    ],
  },
  {
    id: 'false9', name: '假九号 False 9', position: 'ST',
    desc: '回撤组织串联，拉开空间，用视野与传球撕裂防线。',
    bonuses: { vision: 4, shortPassing: 4, ballControl: 3, dribbling: 2, finishing: -1, strength: -1 },
    branches: [
      { name: '回撤组织', attrs: ['vision', 'shortPassing', 'ballControl'], playStyle: '直塞', perk: 'playmaker' },
      { name: '盘带渗透', attrs: ['dribbling', 'agility', 'balance'], playStyle: '快速带球', perk: 'skill_move' },
      { name: '突然前插', attrs: ['positioning', 'finishing', 'reactions'], playStyle: '预判', perk: 'clutch' },
    ],
  },

  // ===== LW / RW =====
  {
    id: 'winger', name: '边锋 Winger', position: 'LW',
    desc: '下底传中、拉开宽度，传统边路好手。',
    bonuses: { crossing: 4, acceleration: 3, sprintSpeed: 3, dribbling: 2, finishing: -1 },
    branches: [
      { name: '传中大师', attrs: ['crossing', 'curve', 'longPassing'], playStyle: '传中', perk: 'playmaker' },
      { name: '边路爆破', attrs: ['acceleration', 'sprintSpeed', 'dribbling'], playStyle: '快速带球', perk: 'stamina_saver' },
      { name: '内切射门', attrs: ['finishing', 'longShots', 'agility'], playStyle: '搓射', perk: 'morale_master' },
    ],
  },
  {
    id: 'inside_forward', name: '内锋 Inside Forward', position: 'RW',
    desc: '内切射门为主，逆足打入禁区，进球型边锋。',
    bonuses: { finishing: 3, dribbling: 4, agility: 3, longShots: 2, crossing: -2 },
    branches: [
      { name: '内切终结', attrs: ['finishing', 'longShots', 'curve'], playStyle: '搓射', perk: 'morale_master' },
      { name: '盘带突破', attrs: ['dribbling', 'agility', 'balance'], playStyle: '快速带球', perk: 'skill_move' },
      { name: '快速反击', attrs: ['acceleration', 'sprintSpeed', 'reactions'], playStyle: '预判', perk: 'stamina_saver' },
    ],
  },

  // ===== CAM =====
  {
    id: 'playmaker', name: '组织核心 Playmaker', position: 'CAM',
    desc: '前场大脑，直塞与视野撕裂防线，最后一传的制造者。',
    bonuses: { vision: 5, shortPassing: 4, curve: 3, composure: 2, strength: -2 },
    branches: [
      { name: '直塞大师', attrs: ['vision', 'shortPassing', 'longPassing'], playStyle: '直塞', perk: 'playmaker' },
      { name: '远射冷炮', attrs: ['longShots', 'shotPower', 'curve'], playStyle: '远射', perk: 'clutch' },
      { name: '组织护球', attrs: ['ballControl', 'composure', 'balance'], playStyle: '斗士', perk: 'leader' },
    ],
  },
  {
    id: 'shadow_striker', name: '影锋 Shadow Striker', position: 'CAM',
    desc: '后插上进球型前腰，隐藏的二号射手。',
    bonuses: { finishing: 4, positioning: 3, longShots: 3, agility: 2, defensiveAwareness: -2 },
    branches: [
      { name: '后插上', attrs: ['positioning', 'finishing', 'reactions'], playStyle: '预判', perk: 'clutch' },
      { name: '远射威胁', attrs: ['longShots', 'shotPower', 'curve'], playStyle: '远射', perk: 'morale_master' },
      { name: '灵动盘带', attrs: ['dribbling', 'agility', 'balance'], playStyle: '快速带球', perk: 'skill_move' },
    ],
  },

  // ===== CM =====
  {
    id: 'box_to_box', name: 'B2B全能中场 Box-to-Box', position: 'CM',
    desc: '攻守兼备，覆盖全场，体能怪兽。',
    bonuses: { stamina: 5, shortPassing: 3, interceptions: 2, strength: 2, finishing: -1 },
    branches: [
      { name: '全场覆盖', attrs: ['stamina', 'strength', 'agility'], playStyle: '斗士', perk: 'stamina_saver' },
      { name: '攻防转换', attrs: ['shortPassing', 'interceptions', 'reactions'], playStyle: '预判', perk: 'growth_boost' },
      { name: '远射插上', attrs: ['longShots', 'shotPower', 'positioning'], playStyle: '远射', perk: 'clutch' },
    ],
  },
  {
    id: 'dlp', name: '拖后组织核心 DLP', position: 'CM',
    desc: '深处调度，长传转移，节奏掌控者。',
    bonuses: { vision: 4, longPassing: 4, shortPassing: 3, composure: 2, sprintSpeed: -2 },
    branches: [
      { name: '长传转移', attrs: ['longPassing', 'vision', 'curve'], playStyle: '长传', perk: 'playmaker' },
      { name: '节奏掌控', attrs: ['composure', 'ballControl', 'shortPassing'], playStyle: '直塞', perk: 'leader' },
      { name: '防守意识', attrs: ['interceptions', 'defensiveAwareness', 'reactions'], playStyle: '预判', perk: 'injury_resist' },
    ],
  },

  // ===== CDM =====
  {
    id: 'destroyer', name: '清道夫 Destroyer', position: 'CDM',
    desc: '中场拦截者，拼抢凶狠，破坏对手进攻。',
    bonuses: { interceptions: 5, standingTackle: 4, aggression: 4, strength: 2, shortPassing: -1 },
    branches: [
      { name: '拦截机器', attrs: ['interceptions', 'defensiveAwareness', 'reactions'], playStyle: '拦截者', perk: 'anchor' },
      { name: '凶狠拼抢', attrs: ['standingTackle', 'aggression', 'strength'], playStyle: '斗士', perk: 'injury_resist' },
      { name: '夺回球权', attrs: ['slidingTackle', 'balance', 'stamina'], playStyle: '预判', perk: 'stamina_saver' },
    ],
  },
  {
    id: 'regista', name: '雷吉斯塔 Regista', position: 'CDM',
    desc: '深位组织型后腰，用传球主导进攻。',
    bonuses: { vision: 4, longPassing: 4, shortPassing: 3, interceptions: 2, strength: -1 },
    branches: [
      { name: '深位调度', attrs: ['longPassing', 'vision', 'shortPassing'], playStyle: '长传', perk: 'playmaker' },
      { name: '防守选位', attrs: ['interceptions', 'defensiveAwareness', 'reactions'], playStyle: '拦截者', perk: 'anchor' },
      { name: '冷静护球', attrs: ['composure', 'ballControl', 'balance'], playStyle: '斗士', perk: 'leader' },
    ],
  },

  // ===== CB =====
  {
    id: 'ball_playing_cb', name: '出球中卫 BPD', position: 'CB',
    desc: ' modern中卫，传球发起进攻，不仅是防守者。',
    bonuses: { shortPassing: 4, longPassing: 3, defensiveAwareness: 3, ballControl: 2, aggression: -1 },
    branches: [
      { name: '出球能力', attrs: ['shortPassing', 'longPassing', 'vision'], playStyle: '长传', perk: 'playmaker' },
      { name: '防守站位', attrs: ['defensiveAwareness', 'interceptions', 'reactions'], playStyle: '拦截者', perk: 'anchor' },
      { name: '制空对抗', attrs: ['jumping', 'headingAccuracy', 'strength'], playStyle: '头球', perk: 'injury_resist' },
    ],
  },
  {
    id: 'stopper', name: '拦截者 Stopper', position: 'CB',
    desc: '传统铁卫，拼抢凶狠，制空强势。',
    bonuses: { standingTackle: 4, headingAccuracy: 4, jumping: 3, strength: 3, shortPassing: -2 },
    branches: [
      { name: '铁血防守', attrs: ['standingTackle', 'slidingTackle', 'aggression'], playStyle: '斗士', perk: 'anchor' },
      { name: '空中统治', attrs: ['jumping', 'headingAccuracy', 'strength'], playStyle: '头球', perk: 'injury_resist' },
      { name: '预判拦截', attrs: ['defensiveAwareness', 'interceptions', 'reactions'], playStyle: '预判', perk: 'clutch' },
    ],
  },

  // ===== LB / RB =====
  {
    id: 'wingback', name: '翼卫 Wingback', position: 'LB',
    desc: '攻强守弱的边后卫，套边传中，覆盖整条边路。',
    bonuses: { stamina: 4, crossing: 4, acceleration: 3, sprintSpeed: 2, standingTackle: -1 },
    branches: [
      { name: '套边传中', attrs: ['crossing', 'curve', 'longPassing'], playStyle: '传中', perk: 'playmaker' },
      { name: '往返跑动', attrs: ['stamina', 'sprintSpeed', 'acceleration'], playStyle: '斗士', perk: 'stamina_saver' },
      { name: '边路防守', attrs: ['standingTackle', 'interceptions', 'agility'], playStyle: '拦截者', perk: 'growth_boost' },
    ],
  },
  {
    id: 'defensive_fb', name: '防守型边卫', position: 'RB',
    desc: '稳健为先，锁死边路，进攻参与有限。',
    bonuses: { standingTackle: 4, interceptions: 3, defensiveAwareness: 3, stamina: 2, crossing: -1 },
    branches: [
      { name: '锁边防守', attrs: ['standingTackle', 'interceptions', 'defensiveAwareness'], playStyle: '拦截者', perk: 'anchor' },
      { name: '体能保障', attrs: ['stamina', 'strength', 'agility'], playStyle: '斗士', perk: 'stamina_saver' },
      { name: '反击发起', attrs: ['shortPassing', 'crossing', 'reactions'], playStyle: '长传', perk: 'growth_boost' },
    ],
  },

  // ===== GK =====
  {
    id: 'sweeper_gk', name: '清道夫门将 Sweeper Keeper', position: 'GK',
    desc: '出击果断，脚下出球，现代型门将。',
    bonuses: { kicking: 4, gkPositioning: 3, reflexes: 3, handling: 2, strength: -1 },
    branches: [
      { name: '出击选位', attrs: ['gkPositioning', 'reflexes', 'reactions'], playStyle: '预判', perk: 'clutch' },
      { name: '脚下出球', attrs: ['kicking', 'ballControl', 'shortPassing'], playStyle: '长传', perk: 'playmaker' },
      { name: '扑救反应', attrs: ['reflexes', 'diving', 'handling'], playStyle: '门线铁闸', perk: 'growth_boost' },
    ],
  },
  {
    id: 'shot_stopper', name: '扑救专家 Shot Stopper', position: 'GK',
    desc: '反应神速，专精近距离极限扑救。',
    bonuses: { reflexes: 5, diving: 4, handling: 2, kicking: -1 },
    branches: [
      { name: '反应扑救', attrs: ['reflexes', 'diving', 'reactions'], playStyle: '门线铁闸', perk: 'clutch' },
      { name: '站位封堵', attrs: ['gkPositioning', 'handling', 'composure'], playStyle: '预判', perk: 'leader' },
      { name: '开球发动', attrs: ['kicking', 'strength', 'longPassing'], playStyle: '手抛球', perk: 'growth_boost' },
    ],
  },
]

// 兼容RW用winger/inside_forward、LB/RB共享
export function archetypesForPosition(pos) {
  if (pos === 'RW') return ARCHETYPES.filter(a => ['winger', 'inside_forward'].includes(a.id))
  if (pos === 'LW') return ARCHETYPES.filter(a => ['winger', 'inside_forward'].includes(a.id))
  if (pos === 'RB') return ARCHETYPES.filter(a => ['wingback', 'defensive_fb'].includes(a.id))
  if (pos === 'LB') return ARCHETYPES.filter(a => ['wingback', 'defensive_fb'].includes(a.id))
  return ARCHETYPES.filter(a => a.position === pos)
}

export function getArchetype(id) {
  return ARCHETYPES.find(a => a.id === id)
}

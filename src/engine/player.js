// 球员引擎：创建、OVR计算、身价计算、年龄成长、属性效果应用

import { ATTRIBUTE_GROUPS, OVR_WEIGHTS, POSITION_KEYS, ALL_ATTRS, GK_ATTRS } from '../data/positions.js'
import { TEAMS } from '../data/leagues.js'
import { getArchetype } from '../data/archetypes.js'
import { clamp, resolveValue } from './util.js'

// 计算单项分组数值（PAC/SHO/...）= 该组子属性均值
export function categoryValues(attrs) {
  const out = {}
  for (const [key, group] of Object.entries(ATTRIBUTE_GROUPS)) {
    const vals = group.attrs.filter(a => attrs[a] != null).map(a => attrs[a])
    out[key] = vals.length ? Math.round(vals.reduce((s, v) => s + v, 0) / vals.length) : 0
  }
  return out
}

// 计算OVR（位置加权，归一化）
export function calcOVR(attrs, position) {
  const weights = OVR_WEIGHTS[position] || OVR_WEIGHTS.ST
  let sum = 0
  let total = 0
  for (const [attr, w] of Object.entries(weights)) {
    if (attrs[attr] != null && w > 0) {
      sum += attrs[attr] * w
      total += w
    }
  }
  if (!total) return 50
  return Math.round(sum / total)
}

// 身价表 [OVR, 价值欧元]
const VALUE_TABLE = [
  [40, 30000], [45, 80000], [50, 200000], [53, 400000], [56, 800000],
  [59, 1500000], [62, 3000000], [65, 5000000], [67, 8000000], [69, 11000000],
  [71, 16000000], [73, 22000000], [75, 30000000], [77, 40000000], [79, 52000000],
  [81, 65000000], [83, 80000000], [85, 95000000], [87, 115000000], [89, 135000000],
  [91, 160000000], [93, 190000000], [95, 230000000],
]

function interpValue(ovr) {
  if (ovr <= VALUE_TABLE[0][0]) return VALUE_TABLE[0][1]
  for (let i = 0; i < VALUE_TABLE.length - 1; i++) {
    const [x1, y1] = VALUE_TABLE[i]
    const [x2, y2] = VALUE_TABLE[i + 1]
    if (ovr >= x1 && ovr <= x2) {
      const t = (ovr - x1) / (x2 - x1)
      return Math.round(y1 + (y2 - y1) * t)
    }
  }
  return VALUE_TABLE[VALUE_TABLE.length - 1][1]
}

// 年龄身价系数（峰值24-28）
function ageValueFactor(age) {
  if (age <= 17) return 1.7
  if (age <= 19) return 1.55
  if (age <= 21) return 1.35
  if (age <= 23) return 1.2
  if (age <= 27) return 1.1
  if (age === 28) return 1.0
  if (age === 29) return 0.92
  if (age === 30) return 0.78
  if (age === 31) return 0.62
  if (age === 32) return 0.48
  if (age === 33) return 0.36
  if (age <= 35) return 0.26
  if (age <= 37) return 0.16
  return 0.08
}

// 计算身价
export function calcValue(attrs, position, age, ovr, potential, reputation) {
  let base = interpValue(ovr)
  // 潜力溢价（年轻且潜力高）
  if (age <= 22 && potential > ovr) {
    base *= 1 + Math.min(0.4, (potential - ovr) * 0.03)
  }
  base *= ageValueFactor(age)
  // 声望小幅影响
  base *= 0.7 + reputation / 100 * 0.6
  // 位置稀缺：中锋/边锋略溢价
  if (['ST', 'LW', 'RW'].includes(position)) base *= 1.08
  // 18岁前封顶8000万
  if (age < 18) base = Math.min(base, 80000000)
  base = Math.max(base, 20000)
  return Math.round(base)
}

// 创建球员
export function createPlayer(cfg) {
  const { name, position, height, weight, academy, preferredFoot, birthYear = 2007 } = cfg
  const isGK = position === 'GK'
  const attrKeys = isGK ? GK_ATTRS : ALL_ATTRS
  const attrs = {}
  // 16岁青训球员基准 48，位置相关属性略高
  const keys = POSITION_KEYS[position] || POSITION_KEYS.ST
  for (const k of attrKeys) {
    let base = 46 + Math.floor(Math.random() * 6) // 46-51
    if (keys.includes(k)) base += 3 + Math.floor(Math.random() * 4) // 关键属性+3~6
    attrs[k] = base
  }
  // 身高/体重对模型属性微调
  if (!isGK) {
    if (height >= 185) { attrs.strength += 3; attrs.jumping += 2; attrs.agility -= 2; attrs.balance -= 2 }
    if (height <= 175) { attrs.agility += 3; attrs.balance += 3; attrs.strength -= 2 }
    if (weight >= 80) { attrs.strength += 3; attrs.balance += 2; attrs.acceleration -= 2; attrs.sprintSpeed -= 1 }
    if (weight <= 70) { attrs.acceleration += 2; attrs.agility += 1; attrs.strength -= 2 }
  }
  // 惯用脚 -> 逆足星级
  let weakFoot = 3
  if (preferredFoot === '双脚') weakFoot = 4 + (Math.random() < 0.3 ? 1 : 0)
  else weakFoot = 3
  // 花式星级
  const skillMoves = ['LW', 'RW', 'CAM', 'ST'].includes(position) ? 3 : 2
  // 潜力
  const potential = 78 + Math.floor(Math.random() * 13) // 78-90
  // 归一化到合理OVR
  for (const k of attrKeys) attrs[k] = clamp(attrs[k], 30, 70)
  const ovr = calcOVR(attrs, position)
  const value = calcValue(attrs, position, 16, ovr, potential, 10)

  // 青训队 -> 根据青训选择对应俱乐部
  const teamMap = {
    '广州(恒大)青训': '广州队',
    '山东泰山青训': '山东泰山',
    '上海海港青训': '上海海港',
    '浙江绿城青训': '浙江队',
  }
  const teamName = teamMap[academy] || '广州队'
  const team = TEAMS.find(t => t.name === teamName) || TEAMS[0]

  return {
    name,
    position,
    height,
    weight,
    preferredFoot,
    weakFoot,
    skillMoves,
    playStyles: [],
    perks: [],
    archetype: null,
    growthBoostAttrs: [],
    skillPoints: 3,
    trainingFocus: null,
    potential,
    age: 16,
    birthYear,
    nationality: '中国',
    academy,
    team: team.name,
    teamLeague: team.league,
    attrs,
    ovr,
    value,
    // 状态
    morale: 70,
    fitness: 90,
    injuryRisk: 0,
    reputation: 10,
    coachRelation: 50,
    teammateRelation: 50,
    money: 0,
    // 赛季数据
    seasonStats: { apps: 0, goals: 0, assists: 0, rating: 6.5 },
    // 生涯累计
    careerStats: { apps: 0, goals: 0, assists: 0 },
    honors: [],
    caps: 0, // 国家队出场
    intlGoals: 0,
    contractYears: 3,
    salary: 200000, // 年薪欧元
    // 国际赛事相关
    heritageNations: rollHeritage(), // 血统资格（父母/祖父母籍），0-2个
    yearsInLeagues: { [team.league]: 1 }, // 各联赛效力年数（用于居住入籍判定）
    nationChoiceShown: false, // 是否已展示过国家队选择
    nationLocked: false, // 是否已锁定国家队（参加正式比赛后）
    knownEligibleNations: ['中国'], // 已知的可选国家
    intlHistory: [], // 国际赛事历史
  }
}

// 随机生成血统资格（30%概率有1个海外血统，5%概率有2个）
function rollHeritage() {
  const pool = ['英格兰','法国','德国','西班牙','意大利','葡萄牙','荷兰','巴西','阿根廷','韩国','日本','美国','加拿大','澳大利亚']
  const result = []
  if (Math.random() < 0.30) {
    result.push(pool[Math.floor(Math.random() * pool.length)])
  }
  if (Math.random() < 0.05) {
    const second = pool[Math.floor(Math.random() * pool.length)]
    if (!result.includes(second)) result.push(second)
  }
  return result
}

// 应用原型（创建后选择原型时调用）
export function applyArchetype(player, archetype) {
  player.archetype = archetype.id
  // 起始属性加成
  if (archetype.bonuses) {
    for (const [k, v] of Object.entries(archetype.bonuses)) {
      player.attrs[k] = clamp((player.attrs[k] || 50) + v, 1, 99)
    }
  }
  // 记录加速成长属性（growth_boost特权用）
  player.growthBoostAttrs = []
  for (const b of archetype.branches) {
    for (const a of b.attrs) {
      if (!player.growthBoostAttrs.includes(a)) player.growthBoostAttrs.push(a)
    }
  }
  // 重算
  player.ovr = calcOVR(player.attrs, player.position)
  player.value = calcValue(player.attrs, player.position, player.age, player.ovr, player.potential, player.reputation)
}

// 应用一个选项的effects到球员
export function applyEffects(player, effects) {
  if (!effects) return { deltas: {}, text: '' }
  const perks = player.perks || []
  const deltas = { attrs: {}, stats: {} }
  if (effects.attrs) {
    for (const [k, v] of Object.entries(effects.attrs)) {
      const d = resolveValue(v)
      player.attrs[k] = clamp((player.attrs[k] || 50) + d, 1, 99)
      deltas.attrs[k] = d
    }
  }
  // 特权感知的状态变化
  const moraleBonus = (perks.includes('morale_master') && effects.goals) ? 3 : 0
  if (effects.morale != null) {
    const m = effects.morale + (effects.morale > 0 ? 0 : 0)
    player.morale = clamp(player.morale + m, 0, 100); deltas.morale = m
  }
  if (effects.fitness != null) {
    let f = effects.fitness
    if (f < 0 && perks.includes('stamina_saver')) f = Math.round(f * 0.8)
    player.fitness = clamp(player.fitness + f, 0, 100); deltas.fitness = f
  }
  if (effects.injuryRisk != null) {
    let ir = effects.injuryRisk
    if (ir > 0 && perks.includes('injury_resist')) ir = Math.round(ir * 0.8)
    player.injuryRisk = clamp(player.injuryRisk + ir, 0, 100); deltas.injuryRisk = ir
  }
  if (effects.reputation != null) { player.reputation = clamp(player.reputation + effects.reputation, 0, 100); deltas.reputation = effects.reputation }
  if (effects.coachRelation != null) { player.coachRelation = clamp(player.coachRelation + effects.coachRelation, 0, 100); deltas.coachRelation = effects.coachRelation }
  if (effects.teammateRelation != null) {
    let tr = effects.teammateRelation
    if (tr > 0 && perks.includes('leader')) tr = Math.round(tr * 1.3)
    player.teammateRelation = clamp(player.teammateRelation + tr, 0, 100); deltas.teammateRelation = tr
  }
  if (effects.money != null) { player.money += effects.money; deltas.money = effects.money }
  // 逆足星级提升
  if (effects.weakFootUp && player.weakFoot < 5) { player.weakFoot += 1; deltas.weakFoot = 1 }
  // 花式星级提升
  if (effects.skillMoveUp && player.skillMoves < 5) { player.skillMoves += 1; deltas.skillMoves = 1 }
  // 比赛数据
  if (effects.goals) {
    player.seasonStats.goals += effects.goals; deltas.goals = effects.goals
    if (moraleBonus) { player.morale = clamp(player.morale + moraleBonus, 0, 100); deltas.morale = (deltas.morale || 0) + moraleBonus }
  }
  if (effects.assists) { player.seasonStats.assists += effects.assists; deltas.assists = effects.assists }
  if (effects.matchRating) {
    let mr = effects.matchRating
    if (perks.includes('clutch')) mr += 2
    player.seasonStats.rating += mr * 0.1; deltas.matchRating = mr
  }
  // 重算OVR与身价
  player.ovr = calcOVR(player.attrs, player.position)
  player.value = calcValue(player.attrs, player.position, player.age, player.ovr, player.potential, player.reputation)
  return deltas
}

// 赛季末年龄成长（自然成长 + 衰退）
export function ageGrowth(player) {
  const age = player.age
  const isGK = player.position === 'GK'
  const keys = isGK ? GK_ATTRS : ALL_ATTRS
  // 成长系数（更贴近现实：28岁后逐步衰退，GK衰退更晚）
  let growthFactor
  if (isGK) {
    if (age <= 21) growthFactor = 1.3
    else if (age <= 25) growthFactor = 1.1
    else if (age <= 29) growthFactor = 0.6
    else if (age <= 32) growthFactor = 0.1
    else if (age <= 35) growthFactor = -0.3
    else growthFactor = -0.8
  } else {
    if (age <= 18) growthFactor = 1.5
    else if (age <= 21) growthFactor = 1.3
    else if (age <= 24) growthFactor = 1.0
    else if (age <= 27) growthFactor = 0.5
    else if (age <= 29) growthFactor = 0.15
    else if (age <= 31) growthFactor = -0.3
    else if (age <= 33) growthFactor = -0.6
    else if (age <= 36) growthFactor = -0.9
    else growthFactor = -1.2
  }

  const positionKeys = POSITION_KEYS[player.position] || POSITION_KEYS.ST
  const growthBoostAttrs = player.growthBoostAttrs || []
  const hasGrowthBoost = (player.perks || []).includes('growth_boost')
  const grown = []
  for (const k of keys) {
    if (growthFactor > 0) {
      // 朝潜力方向成长，关键属性成长更快
      const keyBonus = positionKeys.includes(k) ? 1.7 : 1.0
      // growth_boost特权：原型分支关联属性额外+25%
      const perkBonus = (hasGrowthBoost && growthBoostAttrs.includes(k)) ? 1.25 : 1.0
      const potentialGap = Math.max(0, player.potential - player.ovr)
      let delta = (potentialGap * 0.06 + Math.random() * 1.2) * growthFactor * keyBonus * 0.5 * perkBonus
      delta = Math.round(delta * 10) / 10
      if (delta !== 0) {
        player.attrs[k] = clamp(player.attrs[k] + delta, 1, 99)
        if (Math.abs(delta) >= 0.5) grown.push({ attr: k, delta })
      }
    } else if (growthFactor < 0) {
      // 衰退：身体属性衰退更快，技术属性衰退慢，守门员反应衰退更慢
      const phyAttrs = ['acceleration', 'sprintSpeed', 'stamina', 'agility', 'jumping', 'reflexes', 'diving']
      const techAttrs = ['finishing', 'shortPassing', 'vision', 'composure', 'penalties', 'positioning']
      let factor
      if (phyAttrs.includes(k)) factor = 1.8
      else if (techAttrs.includes(k)) factor = 0.3
      else factor = 0.7
      let delta = (Math.random() * 1.2 + 0.2) * growthFactor * factor
      delta = Math.round(delta * 10) / 10
      if (delta < -0.2) {
        player.attrs[k] = clamp(player.attrs[k] + delta, 1, 99)
        grown.push({ attr: k, delta })
      }
    }
  }
  // 状态恢复
  player.fitness = clamp(player.fitness + 30, 0, 100)
  player.injuryRisk = clamp(player.injuryRisk - 15, 0, 100)
  player.ovr = calcOVR(player.attrs, player.position)
  // 30岁后潜力下调（无再大幅成长空间）
  if (age >= 30 && player.potential > player.ovr) {
    player.potential = Math.max(player.ovr, player.potential - 1)
  }
  player.value = calcValue(player.attrs, player.position, player.age, player.ovr, player.potential, player.reputation)
  return grown
}

// 增长年龄
export function advanceAge(player) {
  player.age += 1
  return player
}

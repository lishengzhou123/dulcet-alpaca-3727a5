// FC26 风格伤病系统：伤病类型、伤停时间、恢复过程、后遗症
import { clamp, randInt, pick } from './util.js'

// ============ 伤病模板库（符合现实足球伤病）=========
export const INJURY_TEMPLATES = [
  // ===== 肌肉拉伤（最常见）=====
  {
    id: 'hamstring_strain',
    type: 'muscle',
    name: '腘绳肌拉伤',
    severity: 'mild',
    minWeeks: 2, maxWeeks: 4,
    riskFactors: ['stamina', 'sprintSpeed'],
    riskFactorWeight: 1.3,
    attrPenaltyDuring: { acceleration: -4, sprintSpeed: -6, stamina: -3 },
    attrPenaltyPost: { stamina: -1 },
    description: '后侧大腿肌肉纤维过度拉伸，常见于冲刺或急停后。',
    cause: ['高速冲刺后急停', '热身不足', '连续比赛疲劳累积'],
    treatment: ['物理治疗 + 深度按摩', '逐步恢复慢跑训练', '肌肉力量加强'],
  },
  {
    id: 'quad_strain',
    type: 'muscle',
    name: '股四头肌拉伤',
    severity: 'mild',
    minWeeks: 1, maxWeeks: 3,
    riskFactors: ['acceleration', 'stamina'],
    riskFactorWeight: 1.2,
    attrPenaltyDuring: { acceleration: -5, sprintSpeed: -4 },
    attrPenaltyPost: { acceleration: -1 },
    description: '大腿前侧肌群拉伤，影响启动和射门力量。',
    cause: ['射门发力过猛', '启动时爆发'],
    treatment: ['冰敷消肿', '渐进式力量训练'],
  },
  {
    id: 'calf_strain',
    type: 'muscle',
    name: '小腿肌肉拉伤',
    severity: 'mild',
    minWeeks: 1, maxWeeks: 3,
    riskFactors: ['stamina', 'jumping'],
    riskFactorWeight: 1.1,
    attrPenaltyDuring: { sprintSpeed: -3, jumping: -4, stamina: -2 },
    attrPenaltyPost: { jumping: -1 },
    description: '小腿腓肠肌拉伤，加速和起跳时疼痛明显。',
    cause: ['突然加速', '起跳落地'],
    treatment: ['康复性游泳', '小腿深层按摩'],
  },
  {
    id: 'groin_strain',
    type: 'muscle',
    name: '腹股沟拉伤',
    severity: 'moderate',
    minWeeks: 3, maxWeeks: 6,
    riskFactors: ['agility', 'acceleration'],
    riskFactorWeight: 1.25,
    attrPenaltyDuring: { acceleration: -4, agility: -5, dribbling: -3 },
    attrPenaltyPost: { agility: -1 },
    description: '腹股沟内收肌群损伤，变向时剧痛。',
    cause: ['急停变向', '侧滑拼抢'],
    treatment: ['髋关节灵活性训练', '核心力量加强'],
  },

  // ===== 韧带损伤（严重）=====
  {
    id: 'acl_tear',
    type: 'ligament',
    name: '前交叉韧带(ACL)撕裂',
    severity: 'severe',
    minWeeks: 32, maxWeeks: 48,
    riskFactors: ['agility', 'jumping'],
    riskFactorWeight: 0.6,  // 发生率低但非常严重
    attrPenaltyDuring: { acceleration: -10, sprintSpeed: -10, agility: -10, jumping: -10 },
    attrPenaltyPost: { acceleration: -2, sprintSpeed: -2, agility: -2, jumping: -2 },
    description: '膝盖前十字韧带完全撕裂，需要手术重建，恢复极其漫长。',
    cause: ['非接触性扭转落地', '高速急停变向', '被铲翻膝盖受力'],
    treatment: ['关节镜手术重建', '术后石膏固定 6 周', '半年以上康复训练', '心理辅导克服恐惧'],
    careerImpact: 'ACL 撕裂是足球运动员最严重的伤病之一，回归后爆发属性可能永久下降。',
  },
  {
    id: 'mcl_sprain',
    type: 'ligament',
    name: '内侧副韧带(MCL)扭伤',
    severity: 'moderate',
    minWeeks: 4, maxWeeks: 8,
    riskFactors: ['strength', 'jumping'],
    riskFactorWeight: 0.7,
    attrPenaltyDuring: { agility: -6, strength: -5 },
    attrPenaltyPost: { strength: -1 },
    description: '膝盖内侧副韧带拉伤，通常因外力撞击导致。',
    cause: ['被对手撞膝盖外侧', '侧面飞铲'],
    treatment: ['护膝固定', '肌肉等长收缩训练'],
  },
  {
    id: 'ankle_sprain',
    type: 'ligament',
    name: '脚踝扭伤',
    severity: 'mild',
    minWeeks: 1, maxWeeks: 4,
    riskFactors: ['agility', 'balance'],
    riskFactorWeight: 1.5,
    attrPenaltyDuring: { agility: -4, balance: -5, dribbling: -3 },
    attrPenaltyPost: { balance: -1 },
    description: '踝关节外侧韧带拉伤，最常见的足球伤病之一。',
    cause: ['踩别人脚上内翻', '变向时崴脚', '不平坦场地'],
    treatment: ['RICE原则(休息/冰敷/加压/抬高)', '踝关节平衡训练', '佩戴护踝'],
  },

  // ===== 骨折（严重）=====
  {
    id: 'metatarsal_fracture',
    type: 'fracture',
    name: '跖骨骨折（第五跖骨）',
    severity: 'moderate',
    minWeeks: 8, maxWeeks: 14,
    riskFactors: ['strength'],
    riskFactorWeight: 0.4,
    attrPenaltyDuring: { sprintSpeed: -8, jumping: -8, stamina: -4 },
    attrPenaltyPost: { jumping: -1 },
    description: '脚面跖骨断裂，俗称"贝克汉姆骨折"。',
    cause: ['被踢中脚背', '急停时应力集中', '旧伤复发'],
    treatment: ['石膏/靴固定', '非负重训练 6 周', '渐进式恢复跑'],
  },
  {
    id: 'clavicle_fracture',
    type: 'fracture',
    name: '锁骨骨折',
    severity: 'moderate',
    minWeeks: 6, maxWeeks: 10,
    riskFactors: ['strength'],
    riskFactorWeight: 0.3,
    attrPenaltyDuring: { strength: -6, heading: -4 },
    attrPenaltyPost: { heading: -1 },
    description: '争抢头球或对抗倒地时锁骨骨折。',
    cause: ['争顶时肩膀撞地', '被对手肘击肩部'],
    treatment: ['三角巾悬吊', '肩部肌群训练'],
  },

  // ===== 碰撞伤 =====
  {
    id: 'concussion',
    type: 'impact',
    name: '脑震荡',
    severity: 'moderate',
    minWeeks: 2, maxWeeks: 6,
    riskFactors: ['heading'],
    riskFactorWeight: 0.3,
    attrPenaltyDuring: { composure: -6, vision: -3, decisions: -3 },
    attrPenaltyPost: { composure: -1 },
    description: '头部撞击导致的脑震荡，需要严格遵循脑震荡恢复协议。',
    cause: ['争顶时头部相撞', '被球闷面', '摔倒后脑着地'],
    treatment: ['严格的阶梯式恢复训练', '避免再次受冲击', '神经认知评估'],
  },
  {
    id: 'rib_injury',
    type: 'impact',
    name: '肋骨挫伤',
    severity: 'mild',
    minWeeks: 1, maxWeeks: 3,
    riskFactors: ['strength'],
    riskFactorWeight: 0.6,
    attrPenaltyDuring: { stamina: -5, strength: -3 },
    attrPenaltyPost: { stamina: -1 },
    description: '肋骨或周围软组织挫伤，深呼吸和发力时疼痛。',
    cause: ['被对手膝盖撞到', '摔倒时撞向广告牌'],
    treatment: ['休息', '呼吸训练'],
  },
  {
    id: 'nasal_fracture',
    type: 'impact',
    name: '鼻骨骨折',
    severity: 'mild',
    minWeeks: 1, maxWeeks: 3,
    riskFactors: ['heading'],
    riskFactorWeight: 0.5,
    attrPenaltyDuring: {},
    attrPenaltyPost: {},
    description: '鼻部骨折，通常戴面罩即可恢复比赛。',
    cause: ['被球闷脸', '争顶肘击'],
    treatment: ['戴防护面罩训练', '消肿后即可上场'],
  },

  // ===== 炎症/劳损 =====
  {
    id: 'knee_tendonitis',
    type: 'overuse',
    name: '膝腱炎（跳跃膝）',
    severity: 'moderate',
    minWeeks: 4, maxWeeks: 10,
    riskFactors: ['jumping', 'stamina'],
    riskFactorWeight: 1.1,
    attrPenaltyDuring: { jumping: -7, acceleration: -4, stamina: -3 },
    attrPenaltyPost: { jumping: -1 },
    description: '髌腱反复刺激导致的劳损炎症。',
    cause: ['反复起跳落地', '训练量过大'],
    treatment: ['离心力量训练', '冷冻疗法', '超声波深层按摩'],
  },
  {
    id: 'shin_splints',
    type: 'overuse',
    name: '胫骨疲劳性骨膜炎',
    severity: 'mild',
    minWeeks: 1, maxWeeks: 4,
    riskFactors: ['stamina'],
    riskFactorWeight: 1.2,
    attrPenaltyDuring: { sprintSpeed: -4, stamina: -4 },
    attrPenaltyPost: {},
    description: '小腿胫骨前侧骨膜发炎，跑动时剧痛。',
    cause: ['突然增加运动量', '硬地训练过多'],
    treatment: ['降量训练', '更换更软的训练鞋'],
  },
  {
    id: 'hernia',
    type: 'overuse',
    name: '运动型疝气（体育疝）',
    severity: 'moderate',
    minWeeks: 6, maxWeeks: 12,
    riskFactors: ['strength', 'stamina'],
    riskFactorWeight: 0.5,
    attrPenaltyDuring: { strength: -6, stamina: -4, acceleration: -3 },
    attrPenaltyPost: { strength: -1 },
    description: '腹股沟区域肌肉/腹壁劳损，转身或射门时剧痛。',
    cause: ['长期核心力量不足', '反复扭转动作'],
    treatment: ['微创手术修复', '核心稳定性训练'],
  },
]

export const INJURY_SEVERITY_MAP = {
  mild:     { label: '轻伤', color: '#43b581', matchMissChance: 0.6,  fitnessPenalty: -8 },
  moderate: { label: '中度伤', color: '#e67e22', matchMissChance: 0.9, fitnessPenalty: -18 },
  severe:   { label: '重伤', color: '#e74c3c', matchMissChance: 1.0, fitnessPenalty: -35 },
}

// 基于球员状态评估伤病发生概率
export function calculateInjuryRisk(player, matchContext = {}) {
  const baseRisk = clamp(player.injuryRisk || 0, 0, 100)
  const fitness = player.fitness || 90
  const stamina = (player.attrs || {}).stamina || 60
  const age = player.age

  // 疲劳惩罚：体力越低风险越大（非线性）
  let fatiguePenalty = 0
  if (fitness < 60) fatiguePenalty += (60 - fitness) * 0.8
  if (fitness < 40) fatiguePenalty += (40 - fitness) * 1.5
  if (fitness < 20) fatiguePenalty += (20 - fitness) * 2.5

  // 耐力属性低则风险高
  const staminaPenalty = stamina < 70 ? (70 - stamina) * 0.3 : 0

  // 年龄因素：30+ 风险逐年略增，35+ 明显增加
  let agePenalty = 0
  if (age >= 30) agePenalty += (age - 29) * 0.5
  if (age >= 35) agePenalty += (age - 34) * 1.0

  // 连续作战（密集赛程）
  const congestionPenalty = matchContext.isCongested ? 12 : 0

  // 场地因素
  const pitchPenalty = matchContext.isBadPitch ? 8 : 0

  // 寒冷天气（肌肉更僵）
  const weatherPenalty = matchContext.isCold ? 5 : 0

  return clamp(baseRisk + fatiguePenalty + staminaPenalty + agePenalty + congestionPenalty + pitchPenalty + weatherPenalty, 0.1, 80)
}

// 在比赛/训练中随机触发伤病
export function rollInjury(player, matchContext = {}) {
  const risk = calculateInjuryRisk(player, matchContext)
  const roll = Math.random() * 100
  if (roll > risk) return null  // 无伤病

  // 发生伤病 -> 根据风险因素匹配模板
  return pickInjuryByProfile(player)
}

function pickInjuryByProfile(player) {
  const stamina = (player.attrs || {}).stamina || 60
  const agility = (player.attrs || {}).agility || 60
  const jumping = (player.attrs || {}).jumping || 60

  // 为每个伤病计算相对权重
  const weighted = INJURY_TEMPLATES.map(tpl => {
    let w = 100 / (tpl.riskFactorWeight || 1)
    // 体力低更容易肌肉拉伤
    if (tpl.type === 'muscle' && stamina < 70) w *= 1 + (70 - stamina) * 0.03
    // 敏捷属性高更容易 ACL / 脚踝伤（因为做更多变向动作）
    if (tpl.id === 'acl_tear' || tpl.id === 'ankle_sprain') {
      if (agility > 75) w *= 1 + (agility - 74) * 0.02
    }
    // 经常争顶的容易脑震荡/鼻骨骨折
    if (['concussion', 'nasal_fracture'].includes(tpl.id) && jumping > 75) {
      w *= 1 + (jumping - 74) * 0.02
    }
    // 年龄大更容易劳损伤
    if (tpl.type === 'overuse' && player.age >= 28) {
      w *= 1 + (player.age - 27) * 0.1
    }
    // 严重伤病权重降低
    if (tpl.severity === 'severe') w *= 0.08
    return { tpl, w }
  })
  const totalW = weighted.reduce((s, x) => s + x.w, 0)
  let r = Math.random() * totalW
  for (const it of weighted) {
    r -= it.w
    if (r <= 0) return buildInjuryInstance(it.tpl)
  }
  return buildInjuryInstance(weighted[0].tpl)
}

function buildInjuryInstance(tpl) {
  const weeks = randInt(tpl.minWeeks, tpl.maxWeeks)
  return {
    id: tpl.id,
    name: tpl.name,
    type: tpl.type,
    severity: tpl.severity,
    severityLabel: INJURY_SEVERITY_MAP[tpl.severity].label,
    severityColor: INJURY_SEVERITY_MAP[tpl.severity].color,
    totalWeeks: weeks,
    weeksRemaining: weeks,
    daysRemaining: weeks * 7,
    matchesMissed: Math.round(weeks * 1.8),  // 每周约1.8场比赛
    description: tpl.description,
    cause: pick(tpl.cause || ['训练意外']),
    treatment: tpl.treatment || ['常规休息恢复'],
    attrPenaltyDuring: { ...(tpl.attrPenaltyDuring || {}) },
    attrPenaltyPost: { ...(tpl.attrPenaltyPost || {}) },
    careerImpact: tpl.careerImpact || null,
    occurredAt: Date.now(),
    recoveryStage: 0,  // 0-100 恢复百分比
  }
}

// 每个训练日/比赛周推进恢复
export function advanceInjuryRecovery(injury, weeksPassed = 1) {
  if (!injury) return injury
  const dailyProgress = 100 / (injury.totalWeeks * 7)
  injury.recoveryStage = clamp(injury.recoveryStage + dailyProgress * weeksPassed * 7, 0, 100)
  injury.weeksRemaining = Math.max(0, injury.weeksRemaining - weeksPassed)
  injury.daysRemaining = Math.max(0, injury.daysRemaining - weeksPassed * 7)
  return injury
}

// 是否已经恢复（可上场但可能带后遗症）
export function isInjuryRecovered(injury) {
  return injury && injury.recoveryStage >= 100
}

// 对受伤球员应用"带伤/恢复中"的属性惩罚
export function applyInjuryPenalties(player) {
  const inv = player.injury
  if (!inv) return
  const penalty = inv.attrPenaltyDuring || {}
  for (const [k, v] of Object.entries(penalty)) {
    if (player.attrs[k] != null) player.attrs[k] = clamp(player.attrs[k] + v, 1, 99)
  }
}

// 伤病恢复完全后，应用"永久/持续一段时间"的轻微后遗症
export function applyInjuryPostEffects(player, injury) {
  if (!injury?.attrPenaltyPost) return
  const penalty = injury.attrPenaltyPost
  for (const [k, v] of Object.entries(penalty)) {
    if (player.attrs[k] != null) player.attrs[k] = clamp(player.attrs[k] + v, 1, 99)
  }
}

// FC26 风格训练系统：赛季中进行训练提升属性
import { clamp, randInt, pick } from './util.js'
import { POSITION_KEYS } from '../data/positions.js'

// 训练项目模板（每项针对不同属性组合）
export const TRAINING_DRILLS = [
  {
    id: 'shooting',
    name: '射门特训',
    icon: '🎯',
    desc: '反复练习各种角度射门，提升终结能力',
    attrs: ['finishing', 'positioning', 'composure'],
    fatigueCost: 12,
    injuryRiskAdd: 2,
    intensity: 'high',
  },
  {
    id: 'passing',
    name: '传球演练',
    icon: '📤',
    desc: '短传长传结合，提高传球精度与视野',
    attrs: ['shortPassing', 'vision', 'crossing'],
    fatigueCost: 8,
    injuryRiskAdd: 1,
    intensity: 'medium',
  },
  {
    id: 'dribbling',
    name: '盘带突破',
    icon: '🌀',
    desc: '绕桩变向、1v1过人训练',
    attrs: ['dribbling', 'agility', 'balance'],
    fatigueCost: 10,
    injuryRiskAdd: 2,
    intensity: 'medium',
  },
  {
    id: 'sprint',
    name: '速度冲刺',
    icon: '💨',
    desc: '短距离冲刺与加速训练',
    attrs: ['acceleration', 'sprintSpeed'],
    fatigueCost: 14,
    injuryRiskAdd: 3,
    intensity: 'high',
  },
  {
    id: 'strength',
    name: '力量强化',
    icon: '💪',
    desc: '健身房力量训练，增强对抗能力',
    attrs: ['strength', 'stamina', 'jumping'],
    fatigueCost: 13,
    injuryRiskAdd: 2,
    intensity: 'high',
  },
  {
    id: 'defending',
    name: '防守站位',
    icon: '🛡️',
    desc: '防守站位与拦截训练',
    attrs: ['standingTackle', 'interceptions', 'strength'],
    fatigueCost: 10,
    injuryRiskAdd: 2,
    intensity: 'medium',
  },
  {
    id: 'recovery',
    name: '恢复训练',
    icon: '🧘',
    desc: '低强度恢复瑜伽与拉伸，降低疲劳和伤病风险',
    attrs: [],
    fatigueCost: -15,
    injuryRiskAdd: -5,
    intensity: 'low',
    isRecovery: true,
  },
  {
    id: 'heading',
    name: '头球特训',
    icon: '🗼',
    desc: '传中头球与争顶训练',
    attrs: ['heading', 'jumping', 'strength'],
    fatigueCost: 11,
    injuryRiskAdd: 2,
    intensity: 'medium',
  },
  {
    id: 'gk_training',
    name: '门将特训',
    icon: '🧤',
    desc: '扑救、出击、高空球控制',
    attrs: ['reflexes', 'diving', 'handling'],
    fatigueCost: 10,
    injuryRiskAdd: 1,
    intensity: 'medium',
    gkOnly: true,
  },
]

// 根据球员位置推荐训练项目
export function recommendedDrills(player) {
  const isGK = player.position === 'GK'
  let drills = TRAINING_DRILLS.filter(d => d.gkOnly ? isGK : !isGK)
  // 非GK不推荐门将训练
  if (!isGK) drills = drills.filter(d => !d.gkOnly)
  return drills
}

// 执行一次训练
export function executeTraining(player, drillId) {
  const drill = TRAINING_DRILLS.find(d => d.id === drillId)
  if (!drill) return null

  const result = {
    drillId: drill.id,
    drillName: drill.name,
    icon: drill.icon,
    attrGains: [],
    fatigueChange: 0,
    injuryRiskChange: 0,
    narrative: '',
  }

  // 恢复训练
  if (drill.isRecovery) {
    const fatigueGain = drill.fatigueCost // 负数=恢复
    player.fitness = clamp(player.fitness - fatigueGain, 0, 100)
    player.injuryRisk = clamp(player.injuryRisk + drill.injuryRiskAdd, 0, 100)
    result.fatigueChange = fatigueGain
    result.injuryRiskChange = drill.injuryRiskAdd
    result.narrative = '一场轻松的恢复训练后，你感觉身体状态好多了。'
    return result
  }

  // 正常训练：有概率提升属性
  const positionKeys = POSITION_KEYS[player.position] || POSITION_KEYS.ST
  for (const attr of drill.attrs) {
    // 关键属性提升概率更高
    const isKeyAttr = positionKeys.includes(attr)
    const baseChance = isKeyAttr ? 0.45 : 0.25
    // 年轻球员提升概率更高
    const ageBonus = player.age <= 21 ? 0.15 : player.age <= 25 ? 0.05 : 0
    // 体力低则训练效果差
    const fitnessPenalty = player.fitness < 50 ? -0.15 : 0

    if (Math.random() < baseChance + ageBonus + fitnessPenalty) {
      const gain = Math.round((0.3 + Math.random() * 0.7) * 10) / 10
      player.attrs[attr] = clamp((player.attrs[attr] || 50) + gain, 1, 99)
      result.attrGains.push({ attr, gain })
    }
  }

  // 消耗体力
  player.fitness = clamp(player.fitness - drill.fatigueCost, 0, 100)
  player.injuryRisk = clamp(player.injuryRisk + drill.injuryRiskAdd, 0, 100)
  result.fatigueChange = -drill.fatigueCost
  result.injuryRiskChange = drill.injuryRiskAdd

  // 生成训练叙述
  if (result.attrGains.length === 0) {
    result.narrative = `${drill.desc}。训练结束了，今天状态一般，没有明显提升。`
  } else if (result.attrGains.length >= 2) {
    result.narrative = `${drill.desc}。训练效果出色！你感觉多项属性都有了明显进步。`
  } else {
    result.narrative = `${drill.desc}。${result.attrGains[0].attr === 'finishing' ? '射门感觉越来越好' : '训练有所收获'}。`
  }

  // 重算 OVR
  player.ovr = calcOVRLocal(player)

  return result
}

function calcOVRLocal(player) {
  // 不引入循环依赖，简单重算
  const isGK = player.position === 'GK'
  const gkKeys = ['reflexes','diving','handling','kicking','positioning']
  const outKeys = ['acceleration','sprintSpeed','stamina','agility','balance','jumping','strength','finishing','shortPassing','vision','composure','dribbling','crossing','heading','standingTackle','interceptions','positioning','penalties']
  const keys = isGK ? gkKeys : outKeys
  let sum = 0
  for (const k of keys) sum += player.attrs[k] || 50
  return Math.round(sum / keys.length)
}

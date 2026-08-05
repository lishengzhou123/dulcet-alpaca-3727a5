// FC26式 技能树引擎：节点生成、解锁判定、奖励应用

import { PERKS } from '../data/archetypes.js'
import { ATTR_LABELS } from '../data/positions.js'
import { clamp } from './util.js'

const TIER_COST = [1, 2, 2, 3]
const TIER_NAMES = ['入门', '进阶', '精通', '宗师']

// 为原型生成技能树节点（3分支 × 4阶 = 12节点）
export function generateSkillTree(archetype) {
  const nodes = []
  archetype.branches.forEach((branch, bi) => {
    for (let t = 0; t < 4; t++) {
      const reward = { attrs: {} }
      let descBits = []
      if (t === 0) { reward.attrs[branch.attrs[0]] = 2; descBits.push(`${ATTR_LABELS[branch.attrs[0]]||branch.attrs[0]} +2`) }
      else if (t === 1) { reward.attrs[branch.attrs[1 % branch.attrs.length]] = 2; descBits.push(`${ATTR_LABELS[branch.attrs[1 % branch.attrs.length]]||branch.attrs[1 % branch.attrs.length]} +2`) }
      else if (t === 2) {
        reward.attrs[branch.attrs[2 % branch.attrs.length]] = 1
        reward.perk = branch.perk
        descBits.push(`${ATTR_LABELS[branch.attrs[2 % branch.attrs.length]]||branch.attrs[2 % branch.attrs.length]} +1`)
        descBits.push(`解锁特权：${PERKS[branch.perk]?.name || branch.perk}`)
      } else if (t === 3) {
        reward.attrs[branch.attrs[0]] = 2
        reward.playStyle = branch.playStyle
        descBits.push(`${ATTR_LABELS[branch.attrs[0]]||branch.attrs[0]} +2`)
        descBits.push(`解锁比赛风格：${branch.playStyle}`)
      }
      nodes.push({
        id: `${archetype.id}_b${bi}_t${t}`,
        archetypeId: archetype.id,
        branchIndex: bi,
        branchName: branch.name,
        tier: t,
        cost: TIER_COST[t],
        name: `${branch.name}·${TIER_NAMES[t]}`,
        desc: descBits.join(' · '),
        reward,
      })
    }
  })
  return nodes
}

// 节点是否可解锁（前置条件：同分支上一阶已解锁）
export function canUnlock(node, unlockedIds) {
  if (unlockedIds.has(node.id)) return false
  if (node.tier === 0) return true
  const prevId = `${node.archetypeId}_b${node.branchIndex}_t${node.tier - 1}`
  return unlockedIds.has(prevId)
}

// 应用节点奖励到球员
export function applyNode(player, node, archetype) {
  const r = node.reward
  if (r.attrs) {
    for (const [k, v] of Object.entries(r.attrs)) {
      player.attrs[k] = clamp((player.attrs[k] || 50) + v, 1, 99)
    }
  }
  if (r.playStyle && !player.playStyles.includes(r.playStyle)) {
    player.playStyles.push(r.playStyle)
  }
  if (r.perk && !player.perks.includes(r.perk)) {
    player.perks.push(r.perk)
    // 即时型特权
    if (r.perk === 'weak_foot') player.weakFoot = clamp(player.weakFoot + 1, 1, 5)
    if (r.perk === 'skill_move') player.skillMoves = clamp(player.skillMoves + 1, 1, 5)
  }
}

// 球队角色判定（基于OVR与球队实力差）
export function squadRole(ovr, teamStrength) {
  const diff = ovr - teamStrength
  if (diff >= -1) return { key: 'starter', name: '绝对主力', color: '#43b581', playingTime: 1.0 }
  if (diff >= -5) return { key: 'rotation', name: '轮换主力', color: '#3498db', playingTime: 0.7 }
  if (diff >= -10) return { key: 'bench', name: '替补球员', color: '#e67e22', playingTime: 0.4 }
  return { key: 'prospect', name: '希望之星', color: '#9b59b6', playingTime: 0.25 }
}

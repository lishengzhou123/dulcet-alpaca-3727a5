<script setup>
import { computed } from 'vue'
import { state, unlockSkillNode, startTransferWindow } from '../store.js'
import { getArchetype, PERKS } from '../data/archetypes.js'
import { canUnlock } from '../engine/skilltree.js'

const player = computed(() => state.player)
const nodes = computed(() => state.skillTreeNodes)
const unlocked = computed(() => state.unlockedNodeIds)
const archetype = computed(() => player.value ? getArchetype(player.value.archetype) : null)

// 按分支分组
const branches = computed(() => {
  if (!archetype.value) return []
  return archetype.value.branches.map((b, bi) => ({
    name: b.name,
    playStyle: b.playStyle,
    perk: b.perk,
    perkName: PERKS[b.perk]?.name || b.perk,
    perkDesc: PERKS[b.perk]?.desc || '',
    nodes: nodes.value.filter(n => n.branchIndex === bi).sort((a, b) => a.tier - b.tier),
  }))
})

const tierNames = ['入门', '进阶', '精通', '宗师']
const tierColors = ['#43b581', '#3498db', '#9b59b6', '#ffd700']

function nodeStatus(node) {
  if (unlocked.value.has(node.id)) return 'unlocked'
  if (canUnlock(node, unlocked.value) && (player.value.skillPoints || 0) >= node.cost) return 'available'
  if (canUnlock(node, unlocked.value)) return 'locked-sp'
  return 'locked-prev'
}

function tryUnlock(node) {
  unlockSkillNode(node.id)
}

const totalUnlocked = computed(() => unlocked.value.size)
const totalNodes = computed(() => nodes.value.length)
</script>

<template>
  <div class="st-wrap" v-if="player && archetype">
    <div class="st-hero">
      <div class="hero-badge">🌳</div>
      <h1>技能树 · {{ archetype.name }}</h1>
      <p class="subtitle">消耗技能点 SP 解锁节点，每个分支四阶进阶，第三阶解锁特权，第四阶解锁专属比赛风格</p>
      <div class="sp-bar">
        <span class="sp-label">技能点 SP</span>
        <span class="sp-num">{{ player.skillPoints || 0 }}</span>
        <span class="sp-progress">已解锁 {{ totalUnlocked }} / {{ totalNodes }} 节点</span>
      </div>
    </div>

    <!-- 玩家档案概览 -->
    <div class="profile-row">
      <div class="pr-item"><b>{{ player.name }}</b><span>姓名</span></div>
      <div class="pr-item"><b>{{ player.position }}</b><span>位置</span></div>
      <div class="pr-item"><b class="ovr">{{ player.ovr }}</b><span>OVR</span></div>
      <div class="pr-item"><b>{{ player.playStyles.length }}</b><span>比赛风格</span></div>
      <div class="pr-item"><b>{{ player.perks.length }}</b><span>特权</span></div>
    </div>

    <!-- 三分支 -->
    <div class="branches-grid">
      <div v-for="(br, bi) in branches" :key="bi" class="branch-col">
        <div class="branch-head">
          <div class="bh-name">{{ br.name }}</div>
          <div class="bh-target">
            <span class="tgt">🎯 {{ br.playStyle }}</span>
            <span class="perk" :title="br.perkDesc">✨ {{ br.perkName }}</span>
          </div>
        </div>
        <div class="node-chain">
          <div
            v-for="(node, ni) in br.nodes"
            :key="node.id"
            class="node"
            :class="nodeStatus(node)"
            @click="tryUnlock(node)"
          >
            <div class="node-tier" :style="{ color: tierColors[node.tier] }">{{ tierNames[node.tier] }}</div>
            <div class="node-name">{{ node.name }}</div>
            <div class="node-desc">{{ node.desc }}</div>
            <div class="node-cost">
              <span class="cost-pill">💎 {{ node.cost }} SP</span>
              <span class="status-pill">{{ nodeStatus(node) === 'unlocked' ? '✓ 已解锁' : nodeStatus(node) === 'available' ? '可解锁' : nodeStatus(node) === 'locked-sp' ? 'SP不足' : '需前置' }}</span>
            </div>
            <div class="connector" v-if="ni < br.nodes.length - 1"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- 已激活特权与比赛风格 -->
    <div class="active-section">
      <div class="as-card">
        <div class="as-title">✨ 已激活特权</div>
        <div class="as-list" v-if="player.perks.length">
          <span v-for="p in player.perks" :key="p" class="as-tag perk">{{ PERKS[p]?.name || p }}</span>
        </div>
        <div v-else class="as-empty">尚未解锁任何特权</div>
      </div>
      <div class="as-card">
        <div class="as-title">🎯 已激活比赛风格</div>
        <div class="as-list" v-if="player.playStyles.length">
          <span v-for="ps in player.playStyles" :key="ps" class="as-tag ps">{{ ps }}</span>
        </div>
        <div v-else class="as-empty">尚未解锁任何比赛风格</div>
      </div>
    </div>

    <button class="next-btn" @click="startTransferWindow">进入转会窗 →</button>
  </div>
</template>

<style scoped>
.st-wrap { max-width: 1100px; margin: 0 auto; padding: 20px 16px; display: flex; flex-direction: column; gap: 18px; }
.st-hero { text-align: center; padding: 12px 0; }
.hero-badge { font-size: 40px; }
.st-hero h1 {
  font-size: 26px; margin: 4px 0; color: #fff;
  background: linear-gradient(90deg, #43b581, #9b59b6);
  -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent;
}
.subtitle { color: #9fb0c8; font-size: 13px; max-width: 600px; margin: 4px auto 12px; line-height: 1.7; }
.sp-bar {
  display: inline-flex; align-items: center; gap: 14px;
  padding: 10px 20px; background: linear-gradient(90deg, rgba(255,215,0,0.12), rgba(67,181,129,0.12));
  border: 1px solid rgba(255,215,0,0.3); border-radius: 12px;
}
.sp-label { font-size: 12px; color: #9fb0c8; }
.sp-num { font-size: 24px; font-weight: 800; color: #ffd700; }
.sp-progress { font-size: 12px; color: #c8d4e6; }

.profile-row { display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px; }
.pr-item {
  background: linear-gradient(160deg, #1a2332, #0f1620);
  border: 1px solid rgba(255,255,255,0.08); border-radius: 10px;
  padding: 10px; text-align: center;
}
.pr-item b { display: block; font-size: 18px; color: #e8eef7; }
.pr-item b.ovr { color: #43b581; }
.pr-item span { font-size: 11px; color: #8a99b0; }

.branches-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
.branch-col {
  background: linear-gradient(160deg, #1a2332, #0f1620);
  border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; padding: 14px;
}
.branch-head { padding-bottom: 10px; border-bottom: 1px solid rgba(255,255,255,0.08); margin-bottom: 12px; }
.bh-name { font-size: 16px; font-weight: 800; color: #fff; }
.bh-target { display: flex; flex-direction: column; gap: 4px; margin-top: 6px; }
.tgt, .perk { font-size: 11px; padding: 3px 8px; border-radius: 6px; align-self: flex-start; }
.tgt { background: rgba(255,215,0,0.12); color: #ffd700; }
.perk { background: rgba(155,89,182,0.15); color: #c39bd3; }

.node-chain { display: flex; flex-direction: column; gap: 10px; position: relative; }
.node {
  position: relative; padding: 10px 12px; border-radius: 10px;
  border: 1px solid rgba(255,255,255,0.08); background: rgba(255,255,255,0.02);
  cursor: pointer; transition: all 0.15s;
}
.node.unlocked {
  background: linear-gradient(135deg, rgba(67,181,129,0.15), rgba(67,181,129,0.05));
  border-color: rgba(67,181,129,0.5);
}
.node.available {
  background: rgba(52,152,219,0.08); border-color: rgba(52,152,219,0.4);
  animation: pulse 2s infinite;
}
.node.available:hover { background: rgba(52,152,219,0.15); transform: translateX(3px); }
.node.locked-sp { opacity: 0.6; }
.node.locked-prev { opacity: 0.4; cursor: not-allowed; }
@keyframes pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(52,152,219,0.4); }
  50% { box-shadow: 0 0 0 4px rgba(52,152,219,0); }
}
.node-tier { font-size: 10px; font-weight: 700; letter-spacing: 1px; }
.node-name { font-size: 13px; font-weight: 700; color: #e8eef7; margin: 2px 0 4px; }
.node-desc { font-size: 11px; color: #9fb0c8; line-height: 1.5; }
.node-cost { display: flex; justify-content: space-between; align-items: center; margin-top: 6px; gap: 6px; flex-wrap: wrap; }
.cost-pill { font-size: 10px; padding: 2px 6px; border-radius: 4px; background: rgba(255,215,0,0.12); color: #ffd700; font-weight: 700; }
.status-pill { font-size: 10px; padding: 2px 6px; border-radius: 4px; background: rgba(255,255,255,0.08); color: #9fb0c8; }
.node.unlocked .status-pill { background: rgba(67,181,129,0.15); color: #43b581; }
.node.available .status-pill { background: rgba(52,152,219,0.15); color: #3498db; }

.active-section { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.as-card {
  background: linear-gradient(160deg, #1a2332, #0f1620);
  border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 14px;
}
.as-title { font-size: 13px; font-weight: 800; color: #c8d4e6; margin-bottom: 8px; }
.as-list { display: flex; flex-wrap: wrap; gap: 6px; }
.as-tag { font-size: 11px; padding: 4px 10px; border-radius: 6px; font-weight: 600; }
.as-tag.perk { background: rgba(155,89,182,0.15); color: #c39bd3; }
.as-tag.ps { background: rgba(255,215,0,0.12); color: #ffd700; }
.as-empty { font-size: 12px; color: #8a99b0; font-style: italic; }

.next-btn {
  width: 100%; padding: 14px; font-size: 16px; font-weight: 800;
  background: linear-gradient(90deg, #43b581, #2ecc71);
  color: #07140e; border: none; border-radius: 12px; cursor: pointer;
  transition: transform 0.15s, box-shadow 0.15s;
}
.next-btn:hover { transform: translateY(-2px); box-shadow: 0 10px 30px rgba(67,181,129,0.3); }

@media (max-width: 860px) { .branches-grid { grid-template-columns: 1fr; } .active-section { grid-template-columns: 1fr; } .profile-row { grid-template-columns: repeat(3, 1fr); } }
</style>

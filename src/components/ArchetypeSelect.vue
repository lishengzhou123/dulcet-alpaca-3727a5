<script setup>
import { computed, ref } from 'vue'
import { state, chooseArchetype } from '../store.js'
import { ATTR_LABELS } from '../data/positions.js'
import { PERKS } from '../data/archetypes.js'
import PlayerCard from './PlayerCard.vue'

const options = computed(() => state.archetypeOptions)
const player = computed(() => state.player)
const selectedId = ref(null)

function bonusText(bonuses) {
  if (!bonuses) return ''
  return Object.entries(bonuses)
    .map(([k, v]) => `${ATTR_LABELS[k] || k} ${v > 0 ? '+' : ''}${v}`)
    .join(' · ')
}

function branchInfo(branch) {
  return {
    attrs: branch.attrs.map(a => ATTR_LABELS[a] || a).join('/'),
    playStyle: branch.playStyle,
    perk: PERKS[branch.perk]?.name || branch.perk,
    perkDesc: PERKS[branch.perk]?.desc || '',
  }
}

// 玩家档案条目（卡牌周围）
const profileItems = computed(() => {
  if (!player.value) return []
  const p = player.value
  return [
    { icon: '🎂', label: '年龄', value: `${p.age}岁` },
    { icon: '🎂', label: '出生', value: `${p.birthYear || 2007}年` },
    { icon: '📏', label: '身高', value: `${p.height || 180}cm` },
    { icon: '⚖️', label: '体重', value: `${p.weight || 75}kg` },
    { icon: '🦶', label: '惯用脚', value: p.preferredFoot || '右脚' },
    { icon: '🏫', label: '青训', value: p.academy || '青训营' },
    { icon: '🏳️', label: '国籍', value: p.nationality || '中国' },
    { icon: '🌱', label: '潜力', value: p.potential || '?' },
  ]
})

function confirm() {
  if (!selectedId.value) return
  chooseArchetype(selectedId.value)
}
</script>

<template>
  <div class="arch-wrap">
    <div class="arch-hero">
      <div class="hero-badge">🎭</div>
      <h1>选择你的球员原型</h1>
      <p class="subtitle">FC26 式生涯系统 · 原型决定起始加成与三条成长分支，每个分支可解锁专属比赛风格与特权</p>
    </div>

    <!-- 玩家卡牌 + 周围档案信息 -->
    <div class="me-showcase" v-if="player">
      <!-- 左侧档案 -->
      <div class="profile-side profile-left">
        <div v-for="(it, i) in profileItems.slice(0, 4)" :key="i" class="profile-item">
          <span class="pi-icon">{{ it.icon }}</span>
          <div class="pi-body">
            <div class="pi-label">{{ it.label }}</div>
            <div class="pi-value">{{ it.value }}</div>
          </div>
        </div>
      </div>

      <!-- 中央 PlayerCard -->
      <div class="me-card-wrap">
        <PlayerCard
          :player="player"
          size="normal"
          :show-team="false"
          :show-stats="false"
          class="me-card"
        />
        <div class="me-card-tag">{{ player.team }}</div>
      </div>

      <!-- 右侧档案 -->
      <div class="profile-side profile-right">
        <div v-for="(it, i) in profileItems.slice(4)" :key="i" class="profile-item">
          <span class="pi-icon">{{ it.icon }}</span>
          <div class="pi-body">
            <div class="pi-label">{{ it.label }}</div>
            <div class="pi-value">{{ it.value }}</div>
          </div>
        </div>
      </div>
    </div>

    <div class="arch-grid">
      <div
        v-for="a in options"
        :key="a.id"
        class="arch-card"
        :class="{ selected: selectedId === a.id }"
        @click="selectedId = a.id"
      >
        <div class="arch-head">
          <div class="arch-name">{{ a.name }}</div>
          <div class="arch-pos">{{ a.position }}</div>
        </div>
        <p class="arch-desc">{{ a.desc }}</p>
        <div class="arch-bonus">
          <span class="bonus-label">起始加成</span>
          <span class="bonus-text">{{ bonusText(a.bonuses) }}</span>
        </div>
        <div class="arch-branches">
          <div v-for="(b, i) in a.branches" :key="i" class="branch">
            <div class="b-name">{{ b.name }}</div>
            <div class="b-attrs">{{ branchInfo(b).attrs }}</div>
            <div class="b-rewards">
              <span class="r-ps">🎯 {{ b.playStyle }}</span>
              <span class="r-perk" :title="branchInfo(b).perkDesc">✨ {{ branchInfo(b).perk }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="arch-foot">
      <div class="sp-info">💡 初始技能点 SP: <b>3</b> · 完成赛季目标与高评分可获得更多</div>
      <button class="confirm-btn" :disabled="!selectedId" @click="confirm">
        {{ selectedId ? '确认原型，开启生涯 →' : '请选择一个原型' }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.arch-wrap { max-width: 980px; margin: 0 auto; padding: 24px 16px; display: flex; flex-direction: column; gap: 20px; }
.arch-hero { text-align: center; padding: 16px 0; }
.hero-badge { font-size: 44px; }
.arch-hero h1 {
  font-size: 28px; margin: 6px 0; color: #fff;
  background: linear-gradient(90deg, #43b581, #9b59b6);
  -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent;
}
.subtitle { color: #9fb0c8; font-size: 13px; max-width: 620px; margin: 6px auto 0; line-height: 1.7; }

/* ===== 玩家卡牌 + 周围档案 ===== */
.me-showcase {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 20px;
  align-items: center;
  padding: 20px 16px;
  background: linear-gradient(135deg, rgba(67,181,129,0.05), rgba(52,152,219,0.03));
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 16px;
}
.profile-side {
  display: flex; flex-direction: column; gap: 10px;
}
.profile-right { align-items: flex-end; }
.profile-item {
  display: flex; align-items: center; gap: 10px;
  padding: 8px 12px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.05);
  border-radius: 10px;
  min-width: 140px;
  transition: transform 0.2s, background 0.2s;
}
.profile-item:hover { transform: translateX(2px); background: rgba(67,181,129,0.08); }
.profile-right .profile-item:hover { transform: translateX(-2px); }
.profile-right .profile-item { text-align: right; flex-direction: row-reverse; }
.pi-icon { font-size: 18px; flex-shrink: 0; }
.pi-body { display: flex; flex-direction: column; gap: 1px; min-width: 0; }
.pi-label { font-size: 10px; color: #8a99b0; font-weight: 600; }
.pi-value { font-size: 13px; color: #fff; font-weight: 700; }

.me-card-wrap {
  display: flex; flex-direction: column; align-items: center; gap: 8px;
}
.me-card { margin: 0 auto; }
.me-card-tag {
  font-size: 12px; font-weight: 700; color: #43b581;
  padding: 4px 12px; border-radius: 6px;
  background: rgba(67,181,129,0.12); border: 1px solid rgba(67,181,129,0.25);
}

@media (max-width: 720px) {
  .me-showcase { grid-template-columns: 1fr; gap: 14px; }
  .profile-side { flex-direction: row; flex-wrap: wrap; justify-content: center; }
  .profile-right { align-items: center; }
  .profile-right .profile-item { flex-direction: row; text-align: left; }
}

.arch-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(290px, 1fr)); gap: 14px; }
.arch-card {
  background: linear-gradient(160deg, #1a2332 0%, #0f1620 100%);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 14px; padding: 16px; cursor: pointer;
  transition: all 0.2s; display: flex; flex-direction: column; gap: 10px;
}
.arch-card:hover { border-color: rgba(67,181,129,0.4); transform: translateY(-3px); }
.arch-card.selected {
  border-color: #43b581; box-shadow: 0 0 0 2px rgba(67,181,129,0.3), 0 10px 30px rgba(67,181,129,0.15);
}
.arch-head { display: flex; align-items: center; justify-content: space-between; }
.arch-name { font-size: 17px; font-weight: 800; color: #fff; }
.arch-pos { font-size: 12px; color: #43b581; font-weight: 700; background: rgba(67,181,129,0.15); padding: 3px 8px; border-radius: 6px; }
.arch-desc { font-size: 13px; line-height: 1.7; color: #c8d4e6; margin: 0; min-height: 44px; }
.arch-bonus {
  padding: 8px 10px; background: rgba(52,152,219,0.08); border-left: 3px solid #3498db;
  border-radius: 6px; font-size: 12px;
}
.bonus-label { display: block; color: #8a99b0; font-size: 11px; margin-bottom: 2px; }
.bonus-text { color: #c8d4e6; }
.arch-branches { display: flex; flex-direction: column; gap: 8px; }
.branch {
  padding: 8px 10px; background: rgba(255,255,255,0.03); border-radius: 8px;
  border-left: 2px solid #9b59b6;
}
.b-name { font-size: 12px; font-weight: 700; color: #c8d4e6; }
.b-attrs { font-size: 11px; color: #8a99b0; margin: 2px 0 4px; }
.b-rewards { display: flex; gap: 8px; flex-wrap: wrap; }
.r-ps, .r-perk { font-size: 10px; padding: 2px 6px; border-radius: 4px; }
.r-ps { background: rgba(255,215,0,0.12); color: #ffd700; }
.r-perk { background: rgba(155,89,182,0.15); color: #c39bd3; }

.arch-foot { text-align: center; padding: 16px 0; display: flex; flex-direction: column; gap: 12px; align-items: center; }
.sp-info { font-size: 13px; color: #9fb0c8; }
.sp-info b { color: #ffd700; }
.confirm-btn {
  padding: 14px 36px; font-size: 16px; font-weight: 800;
  background: linear-gradient(90deg, #43b581, #2ecc71);
  color: #07140e; border: none; border-radius: 12px; cursor: pointer;
  transition: transform 0.15s, box-shadow 0.15s;
}
.confirm-btn:disabled { background: rgba(255,255,255,0.08); color: #5a6b85; cursor: not-allowed; }
.confirm-btn:not(:disabled):hover { transform: translateY(-2px); box-shadow: 0 10px 30px rgba(67,181,129,0.3); }
</style>

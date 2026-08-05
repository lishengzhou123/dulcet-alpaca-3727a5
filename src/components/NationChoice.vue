<script setup>
import { computed, ref } from 'vue'
import { state, confirmNationChoice, deferNationChoice } from '../store.js'
import { nationNegotiationOptions } from '../engine/intlCareer.js'

const player = computed(() => state.player)
const options = computed(() => player.value ? nationNegotiationOptions(player.value) : [])
const selected = ref(null)
const showConfirm = ref(false)

function selectNation(opt) {
  if (!opt.canSelect) return
  selected.value = opt
  showConfirm.value = true
}

function confirm() {
  if (!selected.value) return
  confirmNationChoice(selected.value.nation)
  showConfirm.value = false
}

function defer() {
  deferNationChoice()
}

function strengthColor(s) {
  if (s >= 88) return '#ffd700'
  if (s >= 80) return '#43b581'
  if (s >= 70) return '#3498db'
  if (s >= 60) return '#e67e22'
  return '#95a5a6'
}
</script>

<template>
  <div class="nc-wrap" v-if="player">
    <div class="nc-hero">
      <div class="hero-badge">🌍</div>
      <h1>国家队归属谈判</h1>
      <div class="hero-sub">{{ player.name }} · {{ player.age }}岁 · OVR {{ player.ovr }}</div>
    </div>

    <div class="nc-intro">
      <p class="intro-text">
        随着你在俱乐部层面的表现越来越出色，多支国家队向你抛出了橄榄枝。
        选择为哪个国家效力，将决定你能参加的国际赛事（世界杯、欧洲杯、亚洲杯等），也会影响你的职业生涯走向。
      </p>
      <p class="intro-warn" v-if="!player.nationLocked">
        ⚠️ 注意：一旦参加成年队正式比赛（世界杯/洲际杯），将不能再更改国家队归属。
      </p>
      <p class="intro-warn locked" v-else>
        🔒 你已锁定为 <b>{{ player.nationality }}</b> 国家队，无法再更改。
      </p>
    </div>

    <div class="options-list">
      <div class="ol-title">📋 可选国家</div>
      <div
        v-for="opt in options"
        :key="opt.nation"
        class="nation-card"
        :class="{ disabled: !opt.canSelect, current: opt.nation === player.nationality, selected: selected?.nation === opt.nation }"
        @click="selectNation(opt)"
      >
        <div class="nc-flag">🏳️</div>
        <div class="nc-info">
          <div class="nc-name">
            {{ opt.nation }}
            <span v-if="opt.nation === player.nationality" class="current-tag">当前</span>
          </div>
          <div class="nc-reason">{{ opt.reason }}</div>
          <div class="nc-meta">
            <span class="meta-item">大洲：{{ opt.conf }}</span>
            <span class="meta-item">实力：<b :style="{ color: strengthColor(opt.strength) }">{{ opt.strength }}</b></span>
            <span class="meta-item">{{ opt.badge }}</span>
          </div>
        </div>
        <div class="nc-action" v-if="opt.canSelect && opt.nation !== player.nationality">
          <span class="action-text">谈判 →</span>
        </div>
        <div class="nc-action" v-else-if="!opt.canSelect">
          <span class="action-text disabled">未达条件</span>
        </div>
      </div>
    </div>

    <div class="nc-actions">
      <button class="defer-btn" @click="defer">暂不做决定（下赛季再选）</button>
    </div>

    <!-- 确认弹窗 -->
    <div class="confirm-mask" v-if="showConfirm" @click.self="showConfirm = false">
      <div class="confirm-modal">
        <div class="cm-icon">🤝</div>
        <h3>确认国家队归属</h3>
        <p class="cm-text">
          你确定要选择代表 <b>{{ selected?.nation }}</b> 出战国际赛事吗？
        </p>
        <div class="cm-info" v-if="selected">
          <div>大洲足协：{{ selected.conf }}</div>
          <div>国家队实力：{{ selected.strength }}</div>
          <div class="cm-events">
            <span>可参加赛事：</span>
            <span v-if="selected.conf === 'AFC'">亚洲杯、世界杯预选赛、东亚杯</span>
            <span v-else-if="selected.conf === 'UEFA'">欧洲杯、欧国联、世界杯预选赛</span>
            <span v-else-if="selected.conf === 'CONMEBOL'">美洲杯、世界杯预选赛</span>
            <span v-else>世界杯、相关洲际赛事</span>
          </div>
        </div>
        <div class="cm-warn">
          ⚠️ 参加成年队正式比赛后将无法更改。在青年赛事（世青赛/奥运会）中出场不锁定归属。
        </div>
        <div class="cm-actions">
          <button class="cm-cancel" @click="showConfirm = false">再想想</button>
          <button class="cm-confirm" @click="confirm">确认选择 🏳️</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.nc-wrap { max-width: 720px; margin: 0 auto; padding: 16px; display: flex; flex-direction: column; gap: 16px; }

.nc-hero { text-align: center; padding: 12px 0; }
.hero-badge { font-size: 44px; }
.nc-hero h1 { font-size: 24px; margin: 6px 0; color: #fff; background: linear-gradient(90deg,#ffd700,#3498db); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; }
.hero-sub { font-size: 13px; color: #9fb0c8; }

.nc-intro { background: rgba(255,255,255,0.04); border-radius: 10px; padding: 14px; }
.intro-text { font-size: 13px; line-height: 1.8; color: #c8d4e6; margin: 0 0 10px; }
.intro-warn { font-size: 12px; color: #e67e22; margin: 0; padding: 6px 10px; background: rgba(230,126,34,0.1); border-radius: 6px; }
.intro-warn.locked { color: #e74c3c; background: rgba(231,76,60,0.1); }
.intro-warn b { color: #fff; }

.options-list { display: flex; flex-direction: column; gap: 8px; }
.ol-title { font-size: 13px; font-weight: 800; color: #c8d4e6; }

.nation-card {
  display: flex; gap: 12px; align-items: center; padding: 12px 14px;
  background: linear-gradient(160deg,#1a2332,#0f1620); border: 1px solid rgba(255,255,255,0.08);
  border-radius: 12px; cursor: pointer; transition: all 0.15s;
}
.nation-card:hover:not(.disabled) { border-color: rgba(67,181,129,0.4); transform: translateY(-1px); }
.nation-card.disabled { opacity: 0.5; cursor: not-allowed; }
.nation-card.current { border-left: 3px solid #43b581; }
.nation-card.selected { border-color: #ffd700; box-shadow: 0 0 0 2px rgba(255,215,0,0.2); }

.nc-flag { font-size: 32px; }
.nc-info { flex: 1; min-width: 0; }
.nc-name { font-size: 16px; font-weight: 800; color: #fff; display: flex; align-items: center; gap: 8px; }
.current-tag { font-size: 10px; background: #43b581; color: #07140e; padding: 2px 6px; border-radius: 4px; font-weight: 800; }
.nc-reason { font-size: 12px; color: #9fb0c8; margin-top: 3px; }
.nc-meta { display: flex; gap: 12px; margin-top: 6px; flex-wrap: wrap; }
.meta-item { font-size: 11px; color: #8a99b0; }
.meta-item b { font-size: 12px; }

.nc-action { min-width: 80px; text-align: right; }
.action-text { font-size: 13px; color: #43b581; font-weight: 700; }
.action-text.disabled { color: #8a99b0; }

.nc-actions { display: flex; justify-content: center; padding: 8px 0; }
.defer-btn { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: #9fb0c8; padding: 8px 16px; border-radius: 8px; cursor: pointer; font-size: 12px; }
.defer-btn:hover { background: rgba(255,255,255,0.1); }

.confirm-mask { position: fixed; inset: 0; background: rgba(0,0,0,0.75); z-index: 100; display: flex; align-items: center; justify-content: center; padding: 16px; }
.confirm-modal { background: linear-gradient(160deg,#1a2332,#0f1620); border: 1px solid rgba(255,215,0,0.3); border-radius: 16px; max-width: 420px; width: 100%; padding: 24px; color: #e8eef7; animation: slideUp 0.25s; }
@keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
.cm-icon { font-size: 40px; text-align: center; }
.confirm-modal h3 { text-align: center; font-size: 18px; margin: 8px 0; color: #fff; }
.cm-text { text-align: center; font-size: 14px; color: #c8d4e6; }
.cm-text b { color: #ffd700; }
.cm-info { margin: 14px 0; padding: 12px; background: rgba(255,255,255,0.04); border-radius: 8px; font-size: 12px; color: #9fb0c8; line-height: 1.8; }
.cm-events { margin-top: 6px; }
.cm-events span:last-child { color: #43b581; font-weight: 600; }
.cm-warn { font-size: 11px; color: #e67e22; padding: 8px 10px; background: rgba(230,126,34,0.1); border-radius: 6px; line-height: 1.6; }
.cm-actions { display: flex; gap: 10px; margin-top: 16px; }
.cm-cancel { flex: 1; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: #c8d4e6; padding: 10px; border-radius: 8px; cursor: pointer; font-size: 13px; }
.cm-confirm { flex: 1; background: linear-gradient(90deg,#43b581,#2ecc71); color: #07140e; border: none; padding: 10px; border-radius: 8px; cursor: pointer; font-size: 13px; font-weight: 800; }
</style>

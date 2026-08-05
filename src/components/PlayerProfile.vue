<script setup>
import { computed } from 'vue'
import { formatMoney } from '../engine/util.js'

const props = defineProps({
  player: { type: Object, default: null }, // 球员数据对象
})
const emit = defineEmits(['close'])

const p = computed(() => props.player)
const posColor = { ST: '#e74c3c', CF: '#e74c3c', LW: '#e67e22', RW: '#e67e22', CAM: '#9b59b6', CM: '#3498db', CDM: '#16a085', CB: '#2ecc71', LB: '#27ae60', RB: '#27ae60', GK: '#f39c12' }
function ovrColor(ovr) {
  if (ovr >= 88) return '#ffd700'
  if (ovr >= 82) return '#43b581'
  if (ovr >= 75) return '#3498db'
  if (ovr >= 68) return '#e67e22'
  return '#95a5a6'
}
</script>

<template>
  <div class="profile-mask" v-if="p" @click.self="emit('close')">
    <div class="profile-modal">
      <button class="close-btn" @click="emit('close')">✕</button>

      <!-- 顶部 -->
      <div class="pm-top" :style="{ background: `linear-gradient(135deg, ${posColor[p.pos]||'#3498db'}33, transparent)` }">
        <div class="pm-ovr">
          <div class="ovr-num" :style="{ color: ovrColor(p.ovr) }">{{ p.ovr }}</div>
          <div class="ovr-label">OVR</div>
          <div class="pm-pos" :style="{ background: posColor[p.pos]||'#3498db' }">{{ p.pos }}</div>
        </div>
        <div class="pm-id">
          <div class="pm-name">{{ p.name }}<span class="me-tag" v-if="p.isPlayer">YOU</span></div>
          <div class="pm-team">🏟️ {{ p.team }}</div>
          <div class="pm-nation">🌍 {{ p.nation }}</div>
          <div class="pm-age">🎂 {{ p.age }}岁</div>
        </div>
        <div class="pm-value">
          <div class="pv-num">{{ formatMoney(p.value) }}</div>
          <div class="pv-label">身价</div>
          <div class="pv-rank" v-if="p.rank">第 {{ p.rank }} 位</div>
        </div>
      </div>

      <!-- 简介 -->
      <div class="pm-section">
        <div class="ps-title">📋 球员简介</div>
        <p class="ps-bio">{{ p.bio }}</p>
      </div>

      <!-- 比赛风格 -->
      <div class="pm-section" v-if="p.traits && p.traits.length">
        <div class="ps-title">🎯 比赛风格 / 特点</div>
        <div class="ps-traits">
          <span v-for="(t, i) in p.traits" :key="i" class="trait-tag">{{ t }}</span>
        </div>
      </div>

      <!-- 数据概览 -->
      <div class="pm-section">
        <div class="ps-title">📊 数据概览</div>
        <div class="ps-stats">
          <div class="ps-stat"><b>{{ p.ovr }}</b><span>总评</span></div>
          <div class="ps-stat"><b>{{ p.age }}</b><span>年龄</span></div>
          <div class="ps-stat"><b>{{ formatMoney(p.value) }}</b><span>身价</span></div>
          <div class="ps-stat"><b>{{ p.pos }}</b><span>位置</span></div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.profile-mask {
  position: fixed; inset: 0; background: rgba(0,0,0,0.7); z-index: 100;
  display: flex; align-items: center; justify-content: center; padding: 16px;
  animation: fadeIn 0.2s;
}
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
.profile-modal {
  background: linear-gradient(160deg, #1a2332, #0f1620);
  border: 1px solid rgba(255,255,255,0.1); border-radius: 16px;
  max-width: 460px; width: 100%; max-height: 90vh; overflow-y: auto;
  position: relative; color: #e8eef7;
  animation: slideUp 0.25s;
}
@keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
.close-btn {
  position: absolute; top: 10px; right: 12px; z-index: 2;
  background: rgba(0,0,0,0.4); border: none; color: #fff;
  width: 28px; height: 28px; border-radius: 50%; cursor: pointer; font-size: 14px;
}
.close-btn:hover { background: rgba(231,76,60,0.6); }

.pm-top { display: flex; align-items: center; gap: 14px; padding: 18px 16px; border-bottom: 1px solid rgba(255,255,255,0.08); }
.pm-ovr { text-align: center; min-width: 60px; }
.ovr-num { font-size: 40px; font-weight: 800; line-height: 1; }
.ovr-label { font-size: 10px; color: #8a99b0; letter-spacing: 1px; }
.pm-pos { font-size: 11px; color: #fff; font-weight: 700; padding: 3px 8px; border-radius: 6px; margin-top: 4px; display: inline-block; }
.pm-id { flex: 1; min-width: 0; }
.pm-name { font-size: 20px; font-weight: 800; display: flex; align-items: center; gap: 8px; }
.me-tag { font-size: 10px; background: #43b581; color: #07140e; padding: 2px 6px; border-radius: 4px; font-weight: 800; }
.pm-team { font-size: 13px; color: #c8d4e6; margin-top: 4px; }
.pm-nation, .pm-age { font-size: 12px; color: #9fb0c8; margin-top: 2px; }
.pm-value { text-align: center; min-width: 80px; }
.pv-num { font-size: 17px; font-weight: 800; color: #43b581; }
.pv-label { font-size: 10px; color: #8a99b0; }
.pv-rank { font-size: 11px; color: #ffd700; margin-top: 4px; font-weight: 700; }

.pm-section { padding: 14px 16px; border-bottom: 1px solid rgba(255,255,255,0.06); }
.pm-section:last-child { border-bottom: none; }
.ps-title { font-size: 13px; font-weight: 800; color: #c8d4e6; margin-bottom: 8px; }
.ps-bio { font-size: 13px; line-height: 1.8; color: #c8d4e6; margin: 0; }
.ps-traits { display: flex; flex-wrap: wrap; gap: 6px; }
.trait-tag { font-size: 11px; padding: 4px 10px; border-radius: 6px; background: rgba(255,215,0,0.12); color: #ffd700; font-weight: 600; }
.ps-stats { display: grid; grid-template-columns: repeat(4,1fr); gap: 8px; }
.ps-stat { text-align: center; background: rgba(255,255,255,0.04); padding: 8px 4px; border-radius: 8px; }
.ps-stat b { display: block; font-size: 15px; color: #43b581; }
.ps-stat span { font-size: 10px; color: #8a99b0; }
</style>

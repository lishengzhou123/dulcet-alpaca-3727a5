<script setup>
import { computed, ref } from 'vue'
import { state, closeNews, reactToNews } from '../store.js'
import { LEAGUES } from '../data/leagues.js'

const news = computed(() => state.currentNews || [])
const filter = ref('all') // all / transfer / injury / coach / tournament / misc
const reacted = computed(() => state.reactedNews || {})
const toast = ref('')

const filtered = computed(() => {
  if (filter.value === 'all') return news.value
  return news.value.filter(n => n.type === filter.value)
})

const typeLabels = {
  all: { label: '全部', icon: '📰' },
  transfer: { label: '转会', icon: '💼' },
  injury: { label: '伤病', icon: '🩹' },
  coach: { label: '教练', icon: '🎩' },
  tournament: { label: '赛事', icon: '🏆' },
  misc: { label: '杂项', icon: '🌟' },
}

// 反应配置
const REACTIONS = [
  { type: 'like', icon: '👍', label: '点赞', effect: '士气', related: '+2', normal: '+1' },
  { type: 'fire', icon: '🔥', label: '火热', effect: '声望', related: '+2', normal: '+1' },
  { type: 'wow', icon: '😮', label: '惊讶', effect: '教练关系', related: '+2', normal: '+1' },
]

function react(n, type) {
  if (reacted.value[n.id]) return
  const ok = reactToNews(n.id, type)
  if (ok) {
    const r = REACTIONS.find(r => r.type === type)
    const gain = n.playerRelated ? r.related : r.normal
    toast.value = `${r.icon} ${r.label}！${r.effect} ${gain}`
    setTimeout(() => { toast.value = '' }, 1800)
  }
}
</script>

<template>
  <div class="news-overlay" @click.self="closeNews()">
    <div class="news-panel">
      <div class="news-header">
        <h2>📰 足坛公告</h2>
        <div class="news-year">赛季：{{ state.season.year }}</div>
        <button class="close-btn" @click="closeNews()">✕</button>
      </div>

      <!-- 筛选标签 -->
      <div class="news-tabs">
        <button
          v-for="(t, k) in typeLabels"
          :key="k"
          :class="{active: filter === k}"
          @click="filter = k"
        >
          {{ t.icon }} {{ t.label }}
          <span class="tab-count">{{ news.filter(n => k === 'all' ? true : n.type === k).length }}</span>
        </button>
      </div>

      <!-- 新闻列表 -->
      <div class="news-list">
        <div
          v-for="n in filtered"
          :key="n.id"
          class="news-card"
          :class="[n.type, {related: n.playerRelated}]"
        >
          <div class="nc-head">
            <span class="nc-icon">{{ n.icon }}</span>
            <span class="nc-cat" :data-cat="n.category">{{ n.category }}</span>
            <span v-if="n.playerRelated" class="nc-related">关注</span>
          </div>
          <h4 class="nc-title">{{ n.title }}</h4>
          <p class="nc-desc">{{ n.desc }}</p>
          <div class="nc-meta" v-if="n.type === 'transfer'">
            <span>🔄 转会费：<b>{{ n.feeLabel }}</b></span>
            <span>👤 位置：{{ n.position }}</span>
            <span v-if="n.crossBorder" style="color:#43b581">✈️ 跨国转会</span>
          </div>
          <div class="nc-meta" v-else-if="n.type === 'injury'">
            <span>📅 缺阵：<b>{{ n.weeks }}周</b> / 约 {{ n.matches }}场</span>
            <span>🏥 伤情：{{ n.injuryName }}</span>
          </div>
          <div class="nc-meta" v-else-if="n.type === 'tournament'">
            <span>🏟️ {{ n.tournament }}</span>
            <span>比分：<b>{{ n.score }}</b></span>
          </div>
          <div class="nc-meta" v-else-if="n.type === 'coach' && n.coachName">
            <span>🎩 主帅：<b>{{ n.coachName }}</b></span>
          </div>

          <!-- 反应按钮组 -->
          <div class="nc-reactions">
            <template v-if="!reacted[n.id]">
              <button
                v-for="r in REACTIONS"
                :key="r.type"
                class="react-btn"
                :class="r.type"
                @click="react(n, r.type)"
                :title="`${r.label}（${r.effect} ${n.playerRelated ? r.related : r.normal}）`"
              >
                <span class="rb-icon">{{ r.icon }}</span>
                <span class="rb-label">{{ r.label }}</span>
              </button>
            </template>
            <div v-else class="reacted-tag">
              {{ REACTIONS.find(r => r.type === reacted[n.id])?.icon }}
              已{{ REACTIONS.find(r => r.type === reacted[n.id])?.label }}
            </div>
          </div>
        </div>

        <div v-if="filtered.length === 0" class="news-empty">
          📭 当前分类暂无公告
        </div>
      </div>

      <!-- 反应提示 toast -->
      <transition name="toast">
        <div v-if="toast" class="news-toast">{{ toast }}</div>
      </transition>
    </div>
  </div>
</template>

<style scoped>
.news-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.75);
  display: flex; align-items: center; justify-content: center; z-index: 200;
  backdrop-filter: blur(4px);
}
.news-panel {
  width: min(780px, 94vw); max-height: 88vh;
  background: linear-gradient(180deg, #111a28 0%, #0a111b 100%);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 14px; overflow: hidden; display: flex; flex-direction: column;
  box-shadow: 0 20px 60px rgba(0,0,0,0.6);
}
.news-header {
  padding: 14px 18px; display: flex; align-items: center; gap: 12px;
  border-bottom: 1px solid rgba(255,255,255,0.08); position: relative;
  background: linear-gradient(90deg, #1e2a3d, #0e1620);
}
.news-header h2 { margin: 0; font-size: 18px; }
.news-year { font-size: 12px; color: #9fb0c8; padding: 3px 10px; border-radius: 6px; background: rgba(67,181,129,0.15); color: #43b581; font-weight: 700; }
.close-btn {
  position: absolute; right: 12px; top: 12px;
  background: rgba(255,255,255,0.08); border: none; color: #9fb0c8;
  width: 30px; height: 30px; border-radius: 8px; cursor: pointer; font-size: 14px;
}
.close-btn:hover { background: rgba(255,255,255,0.16); color: #fff; }

.news-tabs {
  display: flex; gap: 6px; padding: 10px 14px; overflow-x: auto;
  border-bottom: 1px solid rgba(255,255,255,0.05);
}
.news-tabs button {
  padding: 7px 12px; border-radius: 8px; font-size: 12px; white-space: nowrap;
  background: rgba(255,255,255,0.04); border: 1px solid transparent;
  color: #9fb0c8; cursor: pointer; display: flex; align-items: center; gap: 5px;
  transition: all 0.15s;
}
.news-tabs button:hover { background: rgba(255,255,255,0.08); color: #c8d4e6; }
.news-tabs button.active {
  background: linear-gradient(90deg, #43b581, #2ecc71); color: #07140e;
  font-weight: 700; border-color: #43b581;
}
.tab-count {
  font-size: 10px; padding: 1px 6px; border-radius: 10px;
  background: rgba(0,0,0,0.2); font-weight: 600;
}
.news-tabs button.active .tab-count { background: rgba(255,255,255,0.25); color: #07140e; }

.news-list {
  padding: 14px; overflow-y: auto; display: flex; flex-direction: column; gap: 10px;
  flex: 1;
}
.news-card {
  padding: 12px 14px; border-radius: 10px;
  background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06);
  transition: all 0.15s;
}
.news-card:hover { border-color: rgba(67,181,129,0.35); background: rgba(67,181,129,0.05); }
.news-card.related {
  border-color: rgba(230, 126, 34, 0.45);
  background: linear-gradient(135deg, rgba(230,126,34,0.08), rgba(255,255,255,0.02));
}
.news-card.transfer { border-left: 3px solid #3498db; }
.news-card.injury { border-left: 3px solid #e74c3c; }
.news-card.coach { border-left: 3px solid #9b59b6; }
.news-card.tournament { border-left: 3px solid #43b581; }
.news-card.misc { border-left: 3px solid #f1c40f; }
.nc-head { display: flex; align-items: center; gap: 8px; margin-bottom: 4px; }
.nc-icon { font-size: 18px; }
.nc-cat {
  font-size: 10px; padding: 2px 8px; border-radius: 4px;
  background: rgba(255,255,255,0.08); color: #9fb0c8; font-weight: 700;
}
.nc-cat[data-cat="重磅"], .nc-cat[data-cat="重伤"] { background: rgba(231,76,60,0.2); color: #e74c3c; }
.nc-cat[data-cat="高价"] { background: rgba(230,126,34,0.2); color: #e67e22; }
.nc-cat[data-cat="下课"], .nc-cat[data-cat="中度"] { background: rgba(241,196,15,0.15); color: #f1c40f; }
.nc-cat[data-cat="自由身"], .nc-cat[data-cat="廉价"], .nc-cat[data-cat="轻伤"] { background: rgba(67,181,129,0.18); color: #43b581; }
.nc-cat[data-cat="租借"], .nc-cat[data-cat="新帅"] { background: rgba(52,152,219,0.18); color: #3498db; }
.nc-cat[data-cat="传奇"] { background: rgba(243, 156, 18, 0.2); color: #f39c12; }
.nc-cat[data-cat="纪录"] { background: rgba(155, 89, 182, 0.2); color: #9b59b6; }
.nc-related {
  font-size: 10px; padding: 2px 7px; border-radius: 4px;
  background: linear-gradient(90deg, #e67e22, #f1c40f); color: #1a1200; font-weight: 800;
  margin-left: auto;
}
.nc-title { margin: 3px 0 6px; font-size: 14px; line-height: 1.4; color: #e8eef7; }
.nc-desc { margin: 0; font-size: 12px; color: #9fb0c8; line-height: 1.6; }
.nc-meta {
  display: flex; gap: 14px; margin-top: 8px; padding-top: 8px;
  border-top: 1px dashed rgba(255,255,255,0.06); font-size: 11px; color: #9fb0c8; flex-wrap: wrap;
}
.nc-meta b { color: #e8eef7; font-weight: 700; }
.news-empty {
  text-align: center; padding: 40px 20px; color: #9fb0c8; font-size: 13px;
}

/* ===== 反应按钮 ===== */
.nc-reactions {
  display: flex; gap: 6px; margin-top: 8px;
  padding-top: 8px; border-top: 1px dashed rgba(255,255,255,0.06);
}
.react-btn {
  display: inline-flex; align-items: center; gap: 4px;
  padding: 4px 10px; border-radius: 16px;
  background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
  color: #9fb0c8; font-size: 11px; font-weight: 600; cursor: pointer;
  transition: all 0.15s;
}
.react-btn:hover { transform: translateY(-1px); }
.react-btn.like:hover { background: rgba(67,181,129,0.18); color: #43b581; border-color: rgba(67,181,129,0.5); }
.react-btn.fire:hover { background: rgba(231,76,60,0.18); color: #e74c3c; border-color: rgba(231,76,60,0.5); }
.react-btn.wow:hover { background: rgba(241,196,15,0.18); color: #f1c40f; border-color: rgba(241,196,15,0.5); }
.rb-icon { font-size: 13px; }
.rb-label { font-size: 10px; }
.reacted-tag {
  font-size: 11px; color: #43b581; font-weight: 700;
  padding: 4px 10px; border-radius: 16px;
  background: rgba(67,181,129,0.1); border: 1px solid rgba(67,181,129,0.2);
}

/* ===== 反应 toast ===== */
.news-toast {
  position: absolute; bottom: 20px; left: 50%; transform: translateX(-50%);
  background: linear-gradient(90deg, #43b581, #2ecc71);
  color: #07140e; padding: 10px 20px; border-radius: 12px;
  font-size: 13px; font-weight: 800; box-shadow: 0 8px 24px rgba(67,181,129,0.4);
  animation: toastPop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  pointer-events: none; z-index: 10;
}
@keyframes toastPop {
  from { transform: translate(-50%, 20px); opacity: 0; }
  to { transform: translate(-50%, 0); opacity: 1; }
}
.toast-enter-active, .toast-leave-active { transition: all 0.3s; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translate(-50%, 10px); }
@media (max-width: 600px) {
  .news-header h2 { font-size: 16px; }
  .news-tabs { flex-wrap: wrap; }
}
</style>

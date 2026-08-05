<script setup>
import { computed, ref } from 'vue'
import { state, openRanking, openSchedule, openStandings, openCareerProfile, returnFromOverlay, closeTeamInfo, openAwardsNext, resolveNegotiation, openNewsBoard, closeNews, refreshNews, goBack } from './store.js'
import CharacterCreation from './components/CharacterCreation.vue'
import ArchetypeSelect from './components/ArchetypeSelect.vue'
import PlayerPanel from './components/PlayerPanel.vue'
import EventCard from './components/EventCard.vue'
import SeasonSummary from './components/SeasonSummary.vue'
import SkillTree from './components/SkillTree.vue'
import TransferMarket from './components/TransferMarket.vue'
import EndGame from './components/EndGame.vue'
import ValueRanking from './components/ValueRanking.vue'
import ScheduleView from './components/ScheduleView.vue'
import CupDraw from './components/CupDraw.vue'
import IntlTournament from './components/IntlTournament.vue'
import NationChoice from './components/NationChoice.vue'
import MatchView from './components/MatchView.vue'
import LeagueStandings from './components/LeagueStandings.vue'
import TeamInfo from './components/TeamInfo.vue'
import CareerProfile from './components/CareerProfile.vue'
import SeasonAwards from './components/SeasonAwards.vue'
import NegotiationView from './components/NegotiationView.vue'
import TrainingView from './components/TrainingView.vue'
import NewsBoard from './components/NewsBoard.vue'
import { LEAGUES } from './data/leagues.js'

const screen = computed(() => state.screen)
const player = computed(() => state.player)
const showNews = computed(() => state.showNews)
const newsCount = computed(() => {
  const n = state.currentNews
  if (!n || !n.length) return 0
  const related = n.filter(x => x.playerRelated).length
  return related || n.length
})
// 需要侧边栏的屏
const withPanel = computed(() => ['event', 'summary', 'skilltree', 'transfer', 'retirement', 'honors', 'awards', 'training'].includes(screen.value))
const isCoach = computed(() => screen.value === 'coach')
const isOverlay = computed(() => ['ranking', 'schedule', 'standings', 'matchview', 'careerprofile', 'negotiation'].includes(screen.value))
const teamLeagueShort = computed(() => player.value ? LEAGUES[player.value.teamLeague]?.short : '')

// 移动端菜单展开
const mobileMenuOpen = ref(false)
// 是否显示返回键（覆盖屏/全屏页都显示）
const showBack = computed(() => isOverlay.value || ['intltournament','nationchoice','cupdraw','matchview'].includes(screen.value))

function formatVal(v) {
  if (v >= 1000000) return `€${(v / 1000000).toFixed(1)}M`
  if (v >= 1000) return `€${(v / 1000).toFixed(0)}K`
  return `€${v}`
}
</script>

<template>
  <div class="app-root">
    <CharacterCreation v-if="screen === 'create'" />
    <ArchetypeSelect v-else-if="screen === 'archetype'" />

    <template v-else>
      <header class="topbar" v-if="player">
        <!-- 左：返回键（仅覆盖屏显示） + 品牌 -->
        <div class="tb-left">
          <button v-if="showBack" class="back-key" @click="goBack" title="返回上一屏">
            <span class="bk-arrow">←</span><span class="bk-text">返回</span>
          </button>
          <div class="brand">⚽ FC26</div>
        </div>

        <!-- 中：球员信息（桌面） -->
        <div class="tb-info">
          <span class="tb-name">{{ player.name }}</span>
          <span class="tb-sep">·</span>
          <span>{{ player.team }}</span>
          <span class="tb-sep">·</span>
          <span>{{ teamLeagueShort }}</span>
          <span class="tb-sep">·</span>
          <span>{{ player.age }}岁</span>
          <span class="tb-sep">·</span>
          <span>🏳️ {{ player.nationality }}</span>
        </div>

        <!-- 桌面端导航按钮 -->
        <div class="tb-actions tb-desktop">
          <button class="nav-btn news-btn" @click="openNewsBoard" title="足坛公告转会伤病新闻">
            📰 公告
            <span v-if="newsCount" class="news-badge">{{ newsCount }}</span>
          </button>
          <button class="nav-btn" @click="openCareerProfile" title="球员生涯档案">📋 生涯</button>
          <button class="nav-btn" @click="openRanking" title="球员身价排行榜">💰 排行</button>
          <button class="nav-btn" @click="openSchedule" title="联赛赛程">📅 赛程</button>
          <button class="nav-btn" @click="openStandings" title="联赛积分榜">📊 积分</button>
        </div>

        <!-- 右侧 OVR 信息 -->
        <div class="tb-ovr">
          <span class="tb-ovr-label">OVR</span>
          <span class="tb-ovr-num">{{ player.ovr }}</span>
          <span class="tb-val">| 身价 {{ formatVal(player.value) }}</span>
          <span class="tb-sp">| 💎 {{ player.skillPoints || 0 }} SP</span>
        </div>

        <!-- 移动端汉堡菜单按钮 -->
        <button class="hamburger tb-mobile" @click="mobileMenuOpen = !mobileMenuOpen" title="菜单">
          <span></span><span></span><span></span>
        </button>

        <!-- 移动端展开菜单 -->
        <transition name="dropdown">
          <div v-if="mobileMenuOpen" class="mobile-menu tb-mobile">
            <button class="nav-btn news-btn" @click="openNewsBoard(); mobileMenuOpen=false">
              📰 公告
              <span v-if="newsCount" class="news-badge">{{ newsCount }}</span>
            </button>
            <button class="nav-btn" @click="openCareerProfile(); mobileMenuOpen=false">📋 生涯档案</button>
            <button class="nav-btn" @click="openRanking(); mobileMenuOpen=false">💰 排行榜</button>
            <button class="nav-btn" @click="openSchedule(); mobileMenuOpen=false">📅 赛程</button>
            <button class="nav-btn" @click="openStandings(); mobileMenuOpen=false">📊 积分榜</button>
          </div>
        </transition>
      </header>

      <main class="main" :class="{ full: isCoach || isOverlay || ['nationchoice','intltournament','cupdraw'].includes(screen) }">
        <aside class="sidebar" v-if="withPanel">
          <PlayerPanel />
        </aside>
        <section class="content">
          <EventCard v-if="screen === 'event'" />
          <SeasonSummary v-else-if="screen === 'summary'" />
          <SkillTree v-else-if="screen === 'skilltree'" />
          <TransferMarket v-else-if="screen === 'transfer'" />
          <CupDraw v-else-if="screen === 'cupdraw'" @continue="() => { state.screen = 'event' }" />
          <NationChoice v-else-if="screen === 'nationchoice'" />
          <IntlTournament v-else-if="screen === 'intltournament'" />
          <ValueRanking v-else-if="screen === 'ranking'" @back="returnFromOverlay" />
          <ScheduleView v-else-if="screen === 'schedule'" @back="returnFromOverlay" />
          <LeagueStandings v-else-if="screen === 'standings'" @back="returnFromOverlay" />
          <CareerProfile v-else-if="screen === 'careerprofile'" />
          <MatchView v-else-if="screen === 'matchview'" />
          <SeasonAwards v-else-if="screen === 'awards'" />
          <NegotiationView v-else-if="screen === 'negotiation'" />
          <TrainingView v-else-if="screen === 'training'" />
          <EndGame v-else-if="['retirement','honors','coach'].includes(screen)" />
        </section>
      </main>

      <!-- 球队信息弹窗（全局覆盖） -->
      <TeamInfo v-if="state.showTeamInfo" @close="closeTeamInfo" />
      <!-- 足坛公告弹窗（转会/伤病/教练/赛事新闻） -->
      <NewsBoard v-if="showNews" />
    </template>
  </div>
</template>

<style scoped>
.app-root { min-height: 100vh; }
.topbar {
  position: sticky; top: 0; z-index: 10;
  display: flex; align-items: center; gap: 12px;
  padding: 10px 16px;
  background: rgba(15,22,32,0.92); backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255,255,255,0.08);
  color: #e8eef7; flex-wrap: wrap;
}
.tb-left { display: flex; align-items: center; gap: 10px; }
/* 全局返回键 */
.back-key {
  display: inline-flex; align-items: center; gap: 4px;
  background: linear-gradient(90deg, rgba(52,152,219,0.25), rgba(67,181,129,0.15));
  border: 1px solid rgba(52,152,219,0.5);
  color: #fff; padding: 6px 12px; border-radius: 8px;
  cursor: pointer; font-size: 13px; font-weight: 700;
  transition: all 0.15s;
}
.back-key:hover { background: linear-gradient(90deg, rgba(52,152,219,0.4), rgba(67,181,129,0.25)); transform: translateX(-2px); }
.bk-arrow { font-size: 16px; font-weight: 900; }

.brand { font-size: 15px; font-weight: 800; background: linear-gradient(90deg,#43b581,#3498db); -webkit-background-clip:text; background-clip:text; -webkit-text-fill-color:transparent; white-space: nowrap; }
.tb-info { font-size: 12px; color: #9fb0c8; flex: 1; min-width: 160px; }
.tb-name { color: #fff; font-weight: 700; }
.tb-sep { color: #5a6b85; margin: 0 4px; }
.tb-actions { display: flex; gap: 6px; }
.nav-btn {
  background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1);
  color: #c8d4e6; padding: 6px 12px; border-radius: 8px; cursor: pointer;
  font-size: 12px; font-weight: 600; transition: all 0.15s;
  display: inline-flex; align-items: center; gap: 4px;
}
.nav-btn:hover { background: rgba(67,181,129,0.15); border-color: rgba(67,181,129,0.4); color: #fff; }
.news-btn {
  background: linear-gradient(90deg, rgba(230,126,34,0.2), rgba(241,196,15,0.1));
  border-color: rgba(230,126,34,0.4);
}
.news-btn:hover {
  background: linear-gradient(90deg, rgba(230,126,34,0.35), rgba(241,196,15,0.2));
  border-color: #e67e22;
}
.news-badge {
  display: inline-flex; align-items: center; justify-content: center;
  min-width: 18px; height: 18px; padding: 0 5px;
  border-radius: 10px;
  background: linear-gradient(90deg, #e74c3c, #e67e22); color: #fff;
  font-size: 10px; font-weight: 800;
}
.tb-ovr { display: flex; align-items: center; gap: 6px; font-size: 12px; }
.tb-ovr-label { color: #8a99b0; }
.tb-ovr-num { font-size: 18px; font-weight: 800; color: #43b581; }
.tb-val { color: #9fb0c8; font-size: 11px; }
.tb-sp { color: #3498db; font-size: 11px; font-weight: 700; }

/* 汉堡菜单按钮 */
.hamburger {
  display: none; flex-direction: column; justify-content: space-around;
  width: 32px; height: 32px; padding: 4px;
  background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1);
  border-radius: 8px; cursor: pointer;
}
.hamburger span {
  display: block; height: 2px; background: #c8d4e6; border-radius: 2px;
  transition: all 0.2s;
}
.mobile-menu {
  display: none; flex-direction: column; gap: 6px;
  width: 100%; padding: 10px 0 4px;
  border-top: 1px solid rgba(255,255,255,0.06);
}
.mobile-menu .nav-btn { width: 100%; justify-content: flex-start; padding: 10px 14px; font-size: 14px; }

.main {
  max-width: 1180px; margin: 0 auto; padding: 20px;
  display: grid; grid-template-columns: 320px 1fr; gap: 20px;
}
.main.full { grid-template-columns: 1fr; max-width: 860px; }
.sidebar { position: sticky; top: 70px; align-self: start; }
.content { min-width: 0; }

/* 移动端响应式 */
@media (max-width: 860px) {
  .main { grid-template-columns: 1fr; padding: 12px; gap: 12px; }
  .sidebar { position: static; }
  .tb-desktop { display: none; }
  .hamburger { display: flex; }
  .mobile-menu { display: flex; }
  .tb-info { display: none; } /* 移动端隐藏详细文字，由 sidebar 展示 */
  .tb-ovr { font-size: 11px; }
  .tb-ovr-num { font-size: 16px; }
  .tb-val, .tb-sp { display: none; } /* 移动端精简 */
  .topbar { padding: 8px 12px; gap: 8px; }
  .brand { font-size: 13px; }
  .back-key { padding: 5px 10px; font-size: 12px; }
  .bk-text { display: none; } /* 极小屏只显示箭头 */
  .back-key .bk-arrow { font-size: 18px; }
}

/* 下拉动画 */
.dropdown-enter-active, .dropdown-leave-active { transition: all 0.2s; overflow: hidden; }
.dropdown-enter-from, .dropdown-leave-to { opacity: 0; max-height: 0; }
.dropdown-enter-to, .dropdown-leave-from { opacity: 1; max-height: 320px; }

/* 大屏桌面端优化 */
@media (min-width: 1400px) {
  .main { max-width: 1280px; }
}
</style>

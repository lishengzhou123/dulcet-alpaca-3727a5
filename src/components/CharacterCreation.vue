<script setup>
import { reactive, computed } from 'vue'
import { createCareer } from '../store.js'

const form = reactive({
  name: '',
  position: 'ST',
  academy: '广州(恒大)青训',
  height: 185,
  weight: 78,
  preferredFoot: '右脚',
  birthYear: 2007,
})

const positions = [
  { v: 'ST', t: '中锋 ST' },
  { v: 'CF', t: '影锋 CF' },
  { v: 'LW', t: '左边锋 LW' },
  { v: 'RW', t: '右边锋 RW' },
  { v: 'CAM', t: '前腰 CAM' },
  { v: 'CM', t: '中前卫 CM' },
  { v: 'CDM', t: '后腰 CDM' },
  { v: 'CB', t: '中后卫 CB' },
  { v: 'LB', t: '左后卫 LB' },
  { v: 'RB', t: '右后卫 RB' },
  { v: 'GK', t: '门将 GK' },
]
const academies = ['广州(恒大)青训', '山东泰山青训', '上海海港青训', '浙江绿城青训']
const feet = ['右脚', '左脚', '双脚均衡']

// ===== 随机中文名生成器 =====
const SURNAMES = ['李','王','张','刘','陈','杨','黄','赵','吴','周','徐','孙','马','朱','胡','林','郭','何','高','罗','郑','梁','谢','宋','唐','许','韩','冯','邓','曹','彭','曾','肖','田','董','袁','潘','于','蒋','蔡']
const NAME_CHARS = ['宇','泽','轩','豪','然','磊','鑫','鹏','阳','龙','俊','刚','毅','峰','涛','浩','然','杰','凯','瑞','智','明','远','飞','翔','晨','旭','晗','皓','博','文','武','宁','安','康','健','翔','霖','霖','峰','凯']

function randomName() {
  const s = SURNAMES[Math.floor(Math.random() * SURNAMES.length)]
  // 80% 双字名，20% 单字名
  const isSingle = Math.random() < 0.2
  if (isSingle) {
    return s + NAME_CHARS[Math.floor(Math.random() * NAME_CHARS.length)]
  }
  return s + NAME_CHARS[Math.floor(Math.random() * NAME_CHARS.length)] + NAME_CHARS[Math.floor(Math.random() * NAME_CHARS.length)]
}

function generateName() {
  form.name = randomName()
}

// BMI 计算（用来提示体型）
const bmi = computed(() => {
  const h = form.height / 100
  return (form.weight / (h * h)).toFixed(1)
})
const bmiTag = computed(() => {
  const v = parseFloat(bmi.value)
  if (v < 18.5) return { t: '偏瘦', color: '#3498db' }
  if (v < 24) return { t: '标准', color: '#43b581' }
  if (v < 28) return { t: '偏壮', color: '#e67e22' }
  return { t: '壮硕', color: '#e74c3c' }
})

function start() {
  if (!form.name.trim()) {
    alert('请输入球员姓名')
    return
  }
  createCareer({ ...form })
}
</script>

<template>
  <div class="create-wrap">
    <div class="create-card">
      <div class="create-hero">
        <div class="hero-badge">⚽</div>
        <h1>足球生涯模拟</h1>
        <p class="subtitle">从十六岁青训少年到足坛传奇，你的每一个选择都将改写命运</p>
      </div>

      <div class="form-grid">
        <div class="field">
          <label>球员姓名</label>
          <div class="input-with-btn">
            <input v-model="form.name" type="text" placeholder="例如：林子轩" maxlength="12" />
            <button class="rand-btn" type="button" @click="generateName" title="随机生成中文名">🎲</button>
          </div>
        </div>

        <div class="field">
          <label>场上位置</label>
          <select v-model="form.position">
            <option v-for="p in positions" :key="p.v" :value="p.v">{{ p.t }}</option>
          </select>
        </div>

        <div class="field">
          <label>青训基地</label>
          <select v-model="form.academy">
            <option v-for="a in academies" :key="a" :value="a">{{ a }}</option>
          </select>
        </div>

        <div class="field">
          <label>惯用脚</label>
          <select v-model="form.preferredFoot">
            <option v-for="f in feet" :key="f" :value="f">{{ f }}</option>
          </select>
        </div>

        <div class="field">
          <label>身高 (cm) <span class="hint">{{ form.height }}</span></label>
          <input v-model.number="form.height" type="range" min="160" max="200" />
        </div>

        <div class="field">
          <label>体重 (kg) <span class="hint">{{ form.weight }}</span></label>
          <input v-model.number="form.weight" type="range" min="55" max="95" />
          <div class="bmi-tip">BMI <b>{{ bmi }}</b> · <span :style="{ color: bmiTag.color }">{{ bmiTag.t }}</span></div>
        </div>

        <div class="field">
          <label>出生年份</label>
          <select v-model="form.birthYear">
            <option :value="2007">2007 (16岁起)</option>
            <option :value="2006">2006 (17岁起)</option>
            <option :value="2008">2008 (15岁起·特殊)</option>
          </select>
        </div>
      </div>

      <div class="preview-bar">
        <span>📋 {{ form.name || '未命名' }}</span>
        <span>📍 {{ positions.find(p => p.v === form.position)?.t }}</span>
        <span>🏟️ {{ form.academy }}</span>
        <span>📏 {{ form.height }}cm / {{ form.weight }}kg</span>
        <span>🦶 {{ form.preferredFoot }}</span>
      </div>

      <button class="start-btn" @click="start">开启职业生涯 →</button>
    </div>
  </div>
</template>

<style scoped>
.create-wrap {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}
.create-card {
  width: 100%;
  max-width: 680px;
  background: linear-gradient(160deg, #1a2332 0%, #0f1620 100%);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 20px;
  padding: 36px 32px;
  box-shadow: 0 30px 80px rgba(0,0,0,0.5);
}
.create-hero { text-align: center; margin-bottom: 28px; }
.hero-badge { font-size: 48px; margin-bottom: 8px; }
.create-card h1 {
  font-size: 30px; margin: 0; color: #fff;
  background: linear-gradient(90deg, #43b581, #3498db);
  -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent;
}
.subtitle { color: #8a99b0; font-size: 14px; margin-top: 8px; }
.form-grid {
  display: grid; grid-template-columns: 1fr 1fr; gap: 16px 18px;
}
.field { display: flex; flex-direction: column; gap: 6px; }
.field label { font-size: 13px; color: #9fb0c8; font-weight: 600; }
.field .hint { color: #43b581; font-weight: 700; }
.field input[type="text"], .field select {
  background: #0c121b; border: 1px solid rgba(255,255,255,0.1);
  border-radius: 10px; padding: 11px 12px; color: #e8eef7; font-size: 14px;
}
.field input[type="range"] { accent-color: #43b581; }
.input-with-btn { display: flex; gap: 8px; }
.input-with-btn input { flex: 1; }
.rand-btn {
  flex-shrink: 0; width: 42px; height: 42px;
  background: linear-gradient(135deg, #43b581, #2ecc71);
  border: none; border-radius: 10px; cursor: pointer;
  font-size: 18px; transition: transform 0.15s, box-shadow 0.15s;
}
.rand-btn:hover { transform: rotate(15deg) scale(1.05); box-shadow: 0 6px 18px rgba(67,181,129,0.4); }
.bmi-tip { font-size: 11px; color: #9fb0c8; margin-top: 4px; }
.bmi-tip b { color: #fff; font-weight: 700; }
.preview-bar {
  display: flex; flex-wrap: wrap; gap: 12px;
  margin: 24px 0 18px; padding: 14px 16px;
  background: rgba(67,181,129,0.08); border: 1px solid rgba(67,181,129,0.2);
  border-radius: 12px; font-size: 13px; color: #c8d4e6;
}
.start-btn {
  width: 100%; padding: 16px; font-size: 17px; font-weight: 700;
  background: linear-gradient(90deg, #43b581, #2ecc71);
  color: #07140e; border: none; border-radius: 12px; cursor: pointer;
  transition: transform 0.15s, box-shadow 0.15s;
}
.start-btn:hover { transform: translateY(-2px); box-shadow: 0 10px 30px rgba(67,181,129,0.3); }
@media (max-width: 520px) { .form-grid { grid-template-columns: 1fr; } }
</style>

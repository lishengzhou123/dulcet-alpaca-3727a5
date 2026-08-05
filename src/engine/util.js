// 通用工具函数

export function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

export function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

// 解析随机值字符串 'r1-3' => 1~3 整数；数字原样返回
export function resolveValue(val) {
  if (typeof val === 'number') return val
  if (typeof val === 'string') {
    const m = val.match(/^r(-?\d+)-(-?\d+)$/)
    if (m) {
      const a = parseInt(m[1], 10)
      const b = parseInt(m[2], 10)
      return randInt(Math.min(a, b), Math.max(a, b))
    }
    const n = parseInt(val, 10)
    if (!isNaN(n)) return n
  }
  return 0
}

export function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v))
}

export function round1(v) {
  return Math.round(v * 10) / 10
}

export function formatMoney(eur) {
  if (eur >= 1000000) return `€${(eur / 1000000).toFixed(1)}M`
  if (eur >= 1000) return `€${(eur / 1000).toFixed(0)}K`
  return `€${eur}`
}

// 中文数字赛季年份转换（出生年 + 年龄 - 16 = 起始年份偏移）
export function seasonYear(birthYear, age) {
  return birthYear + age
}

export function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

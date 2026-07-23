<template>
  <div class="typing-page-container">
    <!-- 🎯 必须渲染 NotificationContainer 组件 -->
    <NotificationContainer />

    <!-- 顶部标题与分割线 -->
    <Title color="warm-peach-pink" size="large">暗房</Title>
    <Divider type="dashed-brown" style="margin-top: 20px; margin-bottom: 24px;" />

    <!-- 左右双栏主布局 -->
    <div class="typing-main-layout">
      <!-- 👈 左侧：统计面板与文本设置 Form 表单 -->
      <div class="sidebar-section">
        <Card class="sidebar-card" pattern="default">
          <Form
            :form="form"
            layout="vertical"
            :initial-values="formInitialValues"
            @finish="handleFormSubmit"
          >
            <div class="sidebar-title">数据</div>

            <!-- 数据展示看板 -->
            <div class="stats-grid">
              <div class="stat-item">
                <span class="stat-label">WPM</span>
                <span class="stat-value highlight">{{ wpm }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">正确率</span>
                <span class="stat-value">{{ accuracy }}%</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">替换文本数</span>
                <span class="stat-value">{{ completedCount }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">剩余字数</span>
                <span class="stat-value">{{ remainingChars }}</span>
              </div>
            </div>

            <Divider type="dashed-brown" style="margin: 16px 0;" />

            <div class="sidebar-title">替换文本</div>

            <FormItem

              name="customText"

            >
              <Input
                v-model:value="formTextValue"
                type="textarea"
                :rows="5"
                placeholder="只限英文..."
              />
            </FormItem>

            <FormItem>
              <div class="button-group">
                <Button type="primary" html-type="submit">应用文本</Button>
                <Button @click="resetSession">重置数据</Button>
              </div>
            </FormItem>
          </Form>
        </Card>
      </div>

      <!-- 👉 右侧：打字卡片容器 -->
      <div class="content-section">
        <Card class="typing-card-container" pattern="default" @click="focusInput">
          <div class="typing-playground" ref="playgroundRef">
            <div
              ref="caretRef"
              class="xt-caret"
              :class="{ 'animate-blink': isStartState }"
            ></div>

            <div class="words-container" ref="wordsContainerRef">
              <template v-for="(wordObj, wordIdx) in parsedWords" :key="wordIdx">
                <div v-if="wordObj.isLineBreak" class="line-break"></div>

                <div v-else class="word">
                  <span
                    v-for="(cObj, cIdx) in wordObj.chars"
                    :key="cIdx"
                    class="char"
                    :class="getCharClass(wordObj, wordIdx, cObj, cIdx)"
                  >
                    {{ cObj.char }}
                  </span>

                  <span
                    v-for="(extraChar, eIdx) in getExtraChars(wordIdx, wordObj)"
                    :key="'extra-' + eIdx"
                    class="char extra"
                  >
                    {{ extraChar }}
                  </span>
                </div>
              </template>
            </div>
          </div>

          <input
            ref="hiddenInputRef"
            type="text"
            id="xt-hidden-input"
            v-model="rawInputValue"
            @input="handleInput"
            @keydown="handleKeyDown"
            autocomplete="off"
            autocorrect="off"
            autocapitalize="off"
            spellcheck="false"
            autofocus
          />
        </Card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch, nextTick, onActivated } from 'vue'
import { Title, Divider, Card, Form, FormItem, useForm, Input, Button, Notification, select, NotificationContainer } from 'animal-island-vue'
import 'animal-island-vue/style'

// -----------------------------------------------------------------
// 1. 表单 & 统计数据
// -----------------------------------------------------------------
const [form] = useForm()

const defaultText = `Good Morning,
and in case I don't see you, good afternoon, good evening, and good night!
早上好！假如再也见不到你，那就再祝你下午好，晚上好，晚安！`

const textData = ref(defaultText)
const formTextValue = ref(defaultText)
const formInitialValues = { customText: defaultText }

const wpm = ref(0)
const accuracy = ref(100)
const completedCount = ref(0)
const totalTypedCharCount = ref(0)
const correctTypedCharCount = ref(0)

let startTime: number | null = null
let timerInterval: any = null

// -----------------------------------------------------------------
// 🚩 通知状态锁（防止重复弹窗提示）
// -----------------------------------------------------------------
const notifyFlags = ref({
  started: false,
  oneThird: false,
  half: false,
  completed: false,
  highErrorWarned: false
})

const resetNotifyFlags = () => {
  notifyFlags.value = {
    started: false,
    oneThird: false,
    half: false,
    completed: false,
    highErrorWarned: false
  }
}

// -----------------------------------------------------------------
// 2. 打字核心数据与 DOM
// -----------------------------------------------------------------
const parsedWords = ref<any[]>([])
const typedWords = ref<string[]>([])
const currentWordIndex = ref(0)
const rawInputValue = ref('')

const playgroundRef = ref<HTMLElement | null>(null)
const caretRef = ref<HTMLElement | null>(null)
const wordsContainerRef = ref<HTMLElement | null>(null)
const hiddenInputRef = ref<HTMLInputElement | null>(null)

let prevCaretPos = { x: 0, y: 0 }
let isInitialized = false

onActivated(() => {
  focusInput()
})

// -----------------------------------------------------------------
// 3. 文本解析
// -----------------------------------------------------------------
const totalTargetCharsCount = computed(() => {
  let count = 0
  parsedWords.value.forEach(w => {
    if (w.targetWord) count += w.targetWord.length
  })
  return count
})

const parseTextData = (rawText: any) => {
  const cleanText = String(rawText || '').replace(/\r\n/g, '\n').replace(/\r/g, '\n')
  
  const result: any[] = []
  const lines = cleanText.split('\n')

  lines.forEach((line, lineIdx) => {
    const isCommentLine = line.trim().startsWith('//')
    const rawTokens = line.split(' ')

    rawTokens.forEach((token, tokenIdx) => {
      if (!token && tokenIdx !== 0) return

      const wordObj: any = {
        chars: [],
        targetWord: '',
        isComment: isCommentLine
      }

      for (let i = 0; i < token.length; i++) {
        let ch = token[i]
        if (ch === '’' || ch === '‘' || ch === '`') ch = "'"
        if (ch === '”' || ch === '“') ch = '"'

        const isASCIIEnglish = /^[\x20-\x7E]$/.test(ch)
        const typeable = !isCommentLine && isASCIIEnglish

        wordObj.chars.push({
          char: ch,
          isTypeable: typeable
        })

        if (typeable) {
          wordObj.targetWord += ch
        }
      }
      result.push(wordObj)
    })

    if (lineIdx < lines.length - 1) {
      result.push({ isLineBreak: true })
    }
  })

  parsedWords.value = result
  typedWords.value = result.map(() => '')

  const firstIdx = result.findIndex(w => w.targetWord && w.targetWord.length > 0)
  currentWordIndex.value = firstIdx !== -1 ? firstIdx : 0
}

// -----------------------------------------------------------------
// 4. 计算属性与统计更新 & 🎯 俏皮话通知监控逻辑
// -----------------------------------------------------------------
const isStartState = computed(() => {
  return typedWords.value.every(w => w.length === 0)
})

// 🎯 修复：基于“当前光标位置”精确计算光标之后还有多少字符
const remainingChars = computed(() => {
  if (parsedWords.value.length === 0) return 0

  let count = 0

  parsedWords.value.forEach((wordObj, idx) => {
    // 忽略换行符和空项
    if (!wordObj.targetWord) return

    if (idx < currentWordIndex.value) {
      // 1. 光标之前的单词：已经打完/跳过，剩余字符为 0
      return
    } else if (idx === currentWordIndex.value) {
      // 2. 当前光标所在的单词：计算该单词内“尚未打”的字符数量
      const typed = typedWords.value[idx] || ''
      const unTypedInCurrentWord = wordObj.targetWord.length - typed.length
      
      // 如果在这个词里打超了（额外字符），当前词剩余不计为负数，按 0 算
      count += Math.max(0, unTypedInCurrentWord)
    } else {
      // 3. 光标之后的单词：全量累加目标字符数
      count += wordObj.targetWord.length
    }
  })

  return count
})

const calculateStats = () => {
  let totalInputChars = 0
  let correctInputChars = 0

  parsedWords.value.forEach((wordObj, idx) => {
    if (wordObj.targetWord) {
      const typed = typedWords.value[idx] || ''
      for (let i = 0; i < typed.length; i++) {
        totalInputChars++
        if (i < wordObj.targetWord.length && typed[i] === wordObj.targetWord[i]) {
          correctInputChars++
        }
      }
    }
  })

  totalTypedCharCount.value = totalInputChars
  correctTypedCharCount.value = correctInputChars

  if (totalInputChars > 0) {
    accuracy.value = Math.round((correctInputChars / totalInputChars) * 100)
  } else {
    accuracy.value = 100
  }

  if (startTime) {
    const elapsedMinutes = (Date.now() - startTime) / 60000
    if (elapsedMinutes > 0) {
      wpm.value = Math.round((correctInputChars / 5) / elapsedMinutes)
    }
  }

  // -------------------------------------------------------------
// 🌿 漫长旅途的记录监控区域（芙莉莲风格）
// -------------------------------------------------------------
if (totalInputChars > 0) {
  const totalTarget = totalTargetCharsCount.value
  const typedTarget = totalTarget - remainingChars.value
  const progress = totalTarget > 0 ? typedTarget / totalTarget : 0

  // 1. 🕯️ 开始打字通知
  if (!notifyFlags.value.started) {
    notifyFlags.value.started = true
    
    if (totalTarget < 30) {
      Notification.warning({
        message: '⏳ 短小的记事',
        description: '这段文字太短了呢……连稍微打个哈欠的时间都不够，换一段更长的旅途记录吧。'
      })
    } else {
      Notification.info({
        message: '🍃 旅程开启了呢',
        description: '既然决定了要写完，那就慢慢来吧。毕竟，我们有的是时间。'
      })
    }
  }

  // 2. 📜 进度达到 1/3 (33%)
  if (progress >= 0.33 && progress < 0.5 && !notifyFlags.value.oneThird) {
    notifyFlags.value.oneThird = true
    Notification.info({
      message: '📖 走过三分之一的路程',
      description: '‘重要的不是走了多远，而是沉淀下的记忆。’ 保持现在的呼吸节奏就好。'
    })
  }

  // 3. 🌙 进度达到 1/2 (50%)
  if (progress >= 0.5 && progress < 1 && !notifyFlags.value.half) {
    notifyFlags.value.half = true
    Notification.info({
      message: '🌙 已经过半了啊……',
      description: '感觉时间过得真快呢。指尖敲击的声音，倒也挺让人安心的。'
    })
  }

  // 4. 🪄 错误率过高警告
  const wrongChars = totalInputChars - correctInputChars
  if (totalInputChars >= 8 && wrongChars >= 3 && accuracy.value < 75 && !notifyFlags.value.highErrorWarned) {
    notifyFlags.value.highErrorWarned = true
    Notification.warning({
      message: '🌀 魔法咏唱中断了哦',
      description: `当前准确率只有 ${accuracy.value}%。稍微停一下，深呼吸……慌乱的话，可是会被宝箱怪咬住的。`
    })
  }

  // 5. 🌸 通关（完成全部字符）
  if (remainingChars.value === 0 && totalTarget > 0 && !notifyFlags.value.completed) {
    notifyFlags.value.completed = true
    if (timerInterval) clearInterval(timerInterval)

    if (accuracy.value === 100) {
      Notification.success({
        message: '✨ 无瑕的民间魔法',
        description: `100% 完美的精准度，速度 ${wpm.value} WPM。如果是勇者辛美尔的话，大概又会微笑着夸奖你了吧。`
      })
    } else if (wpm.value >= 70) {
      Notification.success({
        message: '⚡ 疾风般的技能咏唱',
        description: `速度达到了 ${wpm.value} WPM！太快了……就算是传说中的大魔法使，也会对这个手速感到惊讶吧。`
      })
    } else {
      Notification.success({
        message: '🌸 旅途的一页·终章',
        description: `全文字符完结。WPM: ${wpm.value}，准确率: ${accuracy.value}%。辛苦了，去喝杯花草茶放松一下吧。`
      })
    }
  }
}
}

const getCharClass = (wordObj: any, wordIdx: number, cObj: any, cIdx: number) => {
  if (!cObj.isTypeable) return 'decor'

  const typed = typedWords.value[wordIdx] || ''
  const typeableIndex = wordObj.chars
    .slice(0, cIdx)
    .filter((c: any) => c.isTypeable).length

  if (typeableIndex < typed.length) {
    return typed[typeableIndex] === cObj.char ? 'correct' : 'wrong'
  } else if (wordIdx < currentWordIndex.value) {
    return 'skipped'
  }
  return ''
}

const getExtraChars = (wordIdx: number, wordObj: any) => {
  const typed = typedWords.value[wordIdx] || ''
  if (typed.length > wordObj.targetWord.length) {
    return typed.slice(wordObj.targetWord.length).split('')
  }
  return []
}

// -----------------------------------------------------------------
// 5. 光标动画
// -----------------------------------------------------------------
const updateCaretPosition = () => {
  if (!playgroundRef.value || !wordsContainerRef.value || !caretRef.value) return

  const parentRect = playgroundRef.value.getBoundingClientRect()
  const currentWordEl = wordsContainerRef.value.children[currentWordIndex.value] as HTMLElement

  if (!currentWordEl) return

  const typeableCharEls = Array.from(currentWordEl.querySelectorAll('.char')).filter(
    el => !el.classList.contains('decor')
  ) as HTMLElement[]

  const currentTypedLen = (typedWords.value[currentWordIndex.value] || '').length

  let targetX = 0
  let targetY = 0

  if (typeableCharEls.length > 0) {
    if (currentTypedLen < typeableCharEls.length) {
      const activeCharEl = typeableCharEls[currentTypedLen]
      const rect = activeCharEl.getBoundingClientRect()
      targetX = rect.left - parentRect.left
      targetY = rect.top - parentRect.top
    } else {
      const activeCharEl = typeableCharEls[typeableCharEls.length - 1]
      const rect = activeCharEl.getBoundingClientRect()
      targetX = rect.right - parentRect.left
      targetY = rect.top - parentRect.top
    }
  }

  if (!isInitialized) {
    caretRef.value.style.transform = `translate3d(${targetX}px, ${targetY}px, 0)`
    prevCaretPos = { x: targetX, y: targetY }
    isInitialized = true
  } else {
    caretRef.value.animate(
      [
        { transform: `translate3d(${prevCaretPos.x}px, ${prevCaretPos.y}px, 0)` },
        { transform: `translate3d(${targetX}px, ${targetY}px, 0)` }
      ],
      {
        duration: 180,
        easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
        fill: 'forwards'
      }
    )
    prevCaretPos = { x: targetX, y: targetY }
  }
}

watch([typedWords, currentWordIndex], () => {
  calculateStats()
  nextTick(() => {
    updateCaretPosition()
  })
}, { deep: true })

// -----------------------------------------------------------------
// 6. 输入与表单交互
// -----------------------------------------------------------------
const focusInput = () => {
  hiddenInputRef.value?.focus({ preventScroll: true })
}

const handleInput = (e: Event) => {
  if (!startTime) {
    startTime = Date.now()
    timerInterval = setInterval(calculateStats, 1000)
  }

  const inputEvent = e as InputEvent
  let inputChar = inputEvent.data
  rawInputValue.value = ''

  if (!inputChar) return
  inputChar = inputChar.replace(/[’‘`´]/g, "'").replace(/[“”]/g, '"')

  if (inputChar === ' ') {
    if (typedWords.value[currentWordIndex.value].length > 0) {
      let nextIdx = currentWordIndex.value + 1
      while (
        nextIdx < parsedWords.value.length &&
        (!parsedWords.value[nextIdx] ||
          parsedWords.value[nextIdx].isLineBreak ||
          parsedWords.value[nextIdx].targetWord.length === 0)
      ) {
        nextIdx++
      }
      if (nextIdx < parsedWords.value.length) {
        currentWordIndex.value = nextIdx
      }
    }
    return
  }

  const targetWord = parsedWords.value[currentWordIndex.value]?.targetWord || ''
  if (typedWords.value[currentWordIndex.value].length < targetWord.length + 3) {
    typedWords.value[currentWordIndex.value] += inputChar
  }
}

const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Backspace') {
    if (typedWords.value[currentWordIndex.value].length > 0) {
      typedWords.value[currentWordIndex.value] = typedWords.value[currentWordIndex.value].slice(0, -1)
    } else {
      let prevIdx = currentWordIndex.value - 1
      while (
        prevIdx >= 0 &&
        (!parsedWords.value[prevIdx] ||
          parsedWords.value[prevIdx].isLineBreak ||
          parsedWords.value[prevIdx].targetWord.length === 0)
      ) {
        prevIdx--
      }
      if (prevIdx >= 0) {
        currentWordIndex.value = prevIdx
      }
    }
  }
}

const handleFormSubmit = async () => {
  const newText = form.getFieldValue('customText') || formTextValue.value || ''
  
  if (!newText.trim()) return

  textData.value = newText
  formTextValue.value = newText
  completedCount.value += 1

  await resetSession()
  
  Notification.info({
  message: '📜 记事已重写',
  description: '新的篇章已经铺开，随时可以开始敲击指尖。'
})
}

const resetSession = async () => {
  Notification.destroy() // 清除之前可能残余的通知
  resetNotifyFlags()     // 重置所有通知锁

  if (timerInterval) clearInterval(timerInterval)
  timerInterval = null
  startTime = null
  
  wpm.value = 0
  accuracy.value = 100
  rawInputValue.value = ''
  currentWordIndex.value = 0
  isInitialized = false

  parseTextData(textData.value)

  await nextTick()

  updateCaretPosition()
  focusInput()
}

onMounted(() => {
  parseTextData(textData.value)
  nextTick(() => {
    updateCaretPosition()
    focusInput()
  })

  window.addEventListener('resize', () => {
    isInitialized = false
    updateCaretPosition()
  })
})
</script>

<style scoped>
.typing-page-container {
  padding-top: calc(var(--vp-nav-height, 64px) + 24px);
  padding-bottom: 80px;
  max-width: 1280px;
  margin: 0 auto;
  padding-left: 24px;
  padding-right: 24px;
  box-sizing: border-box;
  width: 100%;
}

.typing-main-layout {
  display: grid;
  grid-template-columns: 340px 1fr;
  gap: 24px;
  align-items: start;
}

@media (max-width: 868px) {
  .typing-main-layout {
    grid-template-columns: 1fr;
  }
}

.sidebar-card {
  width: 100%;
  box-sizing: border-box;
}

.sidebar-title {
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 12px;
  color: #333333;
}

.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.stat-item {
  background-color: rgba(0, 0, 0, 0.03);
  padding: 10px;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-label {
  font-size: 12px;
  color: #888888;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 20px;
  font-weight: 700;
  color: #2c3e50;
}

.stat-value.highlight {
  color: #f5a623;
}

.button-group {
  display: flex;
  gap: 12px;
  margin-top: 8px;
}

.typing-card-container {
  width: 100%;
  height: auto;
  overflow-y: auto;
  box-sizing: border-box;
}

.typing-playground {
  position: relative;
  font-size: 20px;
  line-height: 1.6;
  letter-spacing: 0.02em;
  color: #999999;
  user-select: none;
  cursor: text;
}

.words-container {
  display: flex;
  flex-wrap: wrap;
  column-gap: 0.4em;
  row-gap: 0.2em;
}

.word {
  display: flex;
  position: relative;
}

.char {
  position: relative;
  transition: color 0.1s ease, opacity 0.1s ease;
  color: #8e8e93; 
}

.char.correct { color: #1d1d1f; font-weight: 600; }
.char.wrong { color: #ff3b30; }
.char.extra { color: #ff3b30; opacity: 0.8; }
.char.skipped { color: #c2c2c7; opacity: 0.5; }
.char.decor { color: #a1a1a6; opacity: 0.4; font-style: italic; }

.line-break {
  width: 100%;
  height: 0;
}

.xt-caret {
  position: absolute;
  width: 3.5px;
  height: 1.25em;
  background-color: #f5a623;
  border-radius: 2px;
  z-index: 10;
  pointer-events: none;
  top: 0;
  left: 0;
  opacity: 1;
  will-change: transform;
  margin-top: 3px;
}

.xt-caret.animate-blink {
  animation: xtCaretBlink 1.2s ease-in-out infinite;
}

@keyframes xtCaretBlink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.15; }
}

#xt-hidden-input {
  position: fixed;
  top: 50%;
  left: 50%;
  width: 1px;
  height: 1px;
  opacity: 0;
  pointer-events: none;
  z-index: -1;
}
</style>
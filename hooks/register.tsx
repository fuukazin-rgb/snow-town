import { atom, read, update } from 'claude-code'
import type { Register, SessionContextUsage, ThemeSetArgs } from 'claude-code'

import type { TokenUsage } from '../types'
import { makeColors } from './make-colors.js'
import { snowTownSvg } from './scene'

// 会話量（コンテキストの使用率 0〜100）。絵はこの値を読んで、変わるたびに描き直される。
const fill = atom({ plugin: 'snow-town', key: 'percent' } as const, 0)

// 入力欄の上に出すトークン数。変わるたびに表示が描き直される。
const tokens = atom({ plugin: 'snow-town', key: 'usage' } as const, null)

// 紺色の夜に合わせた文字・パネルの色（暗い画面専用）。
const { theme, problems } = makeColors({
  label: 'Snow Town',
  only: 'dark',
  roles: { accent: '#8fb4ff', danger: '#e0675f', success: '#7cc59a', warning: '#e8b25c', pro: '#b79cf0' },
  dark: {
    gray: {
      anchors: {
        'surface-0': '#11152a',
        'surface-1': '#171c34',
        'surface-2': '#1d233e',
        'surface-3': '#232a47',
        'text-primary': '#eef2ff',
        'text-secondary': '#c9d0e8',
        'text-muted': '#a3abc8',
      },
    },
  },
})

const LOOK: ThemeSetArgs = {
  colors: theme,
  backdrop: { scene: 'snow-town', glass: { blur: 3, tint: '#151a33', opacity: 0.3 } },
}

/** 使用量の数字を、画面に出す形にまとめる。 */
function toUsage(context: SessionContextUsage): TokenUsage {
  return { tokens: context.tokens ?? 0, window: context.window, percent: context.percent ?? 0 }
}

/** 表示する一行：使ったトークン数 / 上限（割合）。 */
function tokenLine(usage: TokenUsage): string {
  const used = usage.tokens.toLocaleString('en-US')
  const max = usage.window.toLocaleString('en-US')

  return `❄ ${used} / ${max} トークン（${usage.percent}%）`
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({
      name: 'snow',
      description: '背景を雪の夜の街に戻す（会話が進むほど雪が積もる）',
    })

    const unpainted = problems.find(line => line.startsWith("Desktop won't paint"))

    if (unpainted !== undefined) {
      $.ui.toast(unpainted)
    }

    const usage = await $.session.usage()
    await update($, fill, () => usage.context.percent ?? 0)
    await update($, tokens, () => toUsage(usage.context))

    const set = await $.theme.set(LOOK)

    // 以前の薄いステータス表示は消して、入力欄の上の表示だけにする
    $.ui.status(set.isDrawn ? undefined : set.reason)

    return next(e)
  })

  // /snow：雪の街のテーマを当て直す
  on('command.run', { command: 'snow' }, async $ => {
    const usage = await $.session.usage()
    await update($, fill, () => usage.context.percent ?? 0)
    await update($, tokens, () => toUsage(usage.context))
    const set = await $.theme.set(LOOK)
    const text = set.isDrawn
      ? `雪の街に切り替えました（${tokenLine(toUsage(usage.context))}）`
      : `雪の街を表示できませんでした：${set.reason}`

    return { text }
  })

  // 会話量が動くたびに、積雪とトークン数を更新する
  on('session.measure', async ($, e, next) => {
    const percent = e.context.percent

    if (e.changed.includes('context') && percent !== undefined) {
      await update($, fill, () => percent)
      await update($, tokens, () => toUsage(e.context))
    }

    return next(e)
  })

  // 入力欄の下（モデル名などと同じ行の右側）：やや明るい紺の帯に、白い太字でトークン数を出す
  on('ui.render', { component: 'SessionMode' }, async ($, e, next) => {
    const usage = await read($, tokens)

    if (usage === null) {
      return next(e)
    }

    const { Box, Text } = $.ui.resolve(e)
    const others = e.props.modes.join(' & ')

    return (
      <Box flexDirection="row">
        {others === '' ? null : <Text dimColor>{`${others}  `}</Text>}
        <Text bold color="#ffffff" backgroundColor="#3a4572">
          {` ${tokenLine(usage)} `}
        </Text>
      </Box>
    )
  })

  on('ui.render', { component: 'Backdrop' }, async ($, e, next) => {
    const isOurs = e.props.scene === 'snow-town'

    if (!isOurs || (e.surface !== 'desktop' && e.surface !== 'mobile')) {
      return next(e)
    }

    const percent = await read($, fill)
    const { Svg } = $.ui.resolve(e)

    return <Svg source={snowTownSvg(percent)} alt={`雪の夜の街と雪だるま。会話量 ${percent}% ぶん雪が積もっている`} />
  })
}

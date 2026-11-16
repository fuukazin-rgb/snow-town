export type SnowPercent = number

/** 画面に出すトークン数：使った数・上限・割合。 */
export type TokenUsage = { tokens: number; window: number; percent: number }

declare module 'claude-code' {
  interface PluginState {
    'snow-town': { percent: SnowPercent; usage: TokenUsage | null }
  }
}

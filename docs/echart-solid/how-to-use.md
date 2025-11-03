あくまで思考実験のため、実際に試してみたらエラーになる可能性があります。参考程度にしてください。

---

結論：**できます。**`echarts-solid` は `theme` プロパティを受け取り、ECharts 本体は**テーマ（例：`'dark'`）やテーマオブジェクト**をサポートしています。したがって **ダークモードやブランド配色に合わせたテーマ適用**が可能です。([GitHub][1])

# 何をすればよいか（要点）

1. **初期化時にテーマを適用**
   ECharts は `echarts.init(dom, theme, opts)` でテーマを指定します。`theme` には**テーマ名（例：`'dark'`）**または**事前登録したテーマオブジェクト**を渡せます。`echarts-solid` の `theme` プロップ経由で指定可能です。([plainheart.github.io][2])

2. **ダークモード切替は「再初期化（再マウント）」が本筋**
   ECharts は**テーマを実行時に差し替える公式 API を持ちません**（現状は「テーマは init 時のみ」）。従って **ダーク/ライト切り替え時はインスタンスを破棄→再 init** という運用が推奨です。`echarts-solid` では **`key` をテーマ名にして再マウント**するのが手軽です。([GitHub][3])

3. **テーマの入手・作成**
   公式の **`dark` テーマ**や他テーマをダウンロード／Theme Builder でカスタム可能。**Tailwind の CSS 変数**から色を読み取り、ECharts のテーマ JSON に流し込む、という運用も現実的です。([echarts.apache.org][4])

---

## Solid（`echarts-solid`）での最小パターン

* **ライト／ダークのトグル**（再マウントでテーマ切替）:

```tsx
import { createSignal, createMemo } from "solid-js";
import { EChartsAutoSize } from "echarts-solid";
import * as echarts from "echarts";
// 例: 公式の dark テーマを import して register 済みとする
// echarts.registerTheme('dark', darkThemeObject);

export function Chart({ option }: { option: echarts.EChartsOption }) {
  const [isDark, setIsDark] = createSignal(false);
  const themeName = createMemo(() => (isDark() ? "dark" : null)); // null=default

  return (
    <div class="relative">
      <button class="absolute right-2 top-2 btn" onClick={() => setIsDark(v => !v)}>
        Toggle
      </button>

      {/* テーマ名を key にして再マウント → 再 init */}
      <EChartsAutoSize
        key={String(themeName())}
        option={option}
        theme={themeName()}
      />
    </div>
  );
}
```

* **ブランドカラー連携**（Tailwind の CSS 変数→テーマへ）:

```ts
const css = getComputedStyle(document.documentElement);
const primary = css.getPropertyValue("--color-primary").trim();
const text = css.getPropertyValue("--color-text").trim();

const myTheme = {
  color: [primary],
  textStyle: { color: text },
  // 必要に応じて grid/axis/tooltip 等も定義
};
echarts.registerTheme("brand", myTheme);
```

> 上記のように、**`theme` にオブジェクト（`registerTheme` 済）や `'dark'` を渡す**ことで、shadcn 的な**ダークモード／ブランド配色**が容易に実現できます。テーマは **init 時に適用**されるため、**切替はインスタンス再作成**（再マウント）で行うのが確実です。([plainheart.github.io][2])

---

## 参考（公式ドキュメント）

* テーマ／スタイルの概念と適用方法（ECharts Handbook）。([echarts.apache.org][5])
* テーマ配布・Theme Builder（ダークを含む公式テーマ）。([echarts.apache.org][4])
* `echarts.init(dom, theme, opts)` とテーマ指定の仕様。([plainheart.github.io][2])

必要でしたら、**Tailwind の `:root` と `.dark` に置いた CSS 変数 → ECharts テーマ JSON 生成ユーティリティ**や、**`echarts-solid` 用のテーマトグルヘルパ**（`createEffect` で `dispose`→`init` を隠蔽）も提示します。

[1]: https://github.com/alxnddr/echarts-solid?utm_source=chatgpt.com "GitHub - alxnddr/echarts-solid: SolidJS components for ECharts"
[2]: https://plainheart.github.io/echarts-website/en/api.html?utm_source=chatgpt.com "Documentation - Apache ECharts - GitHub Pages"
[3]: https://github.com/apache/echarts/issues/18198?utm_source=chatgpt.com "[Feature] Change theme / dark mode dynamically. - GitHub"
[4]: https://echarts.apache.org/en/download-theme.html?utm_source=chatgpt.com "Download Themes - Apache ECharts"
[5]: https://echarts.apache.org/handbook/en/concepts/style/?utm_source=chatgpt.com "Style - Concepts - Handbook - Apache ECharts"

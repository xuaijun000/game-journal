# 防乱码操作规范（Windows / PowerShell）

> 目标：后续修改中文文件时，**不再出现 mojibake（乱码）**。

## 1. 必须遵守的原则

- 不做整文件重写（尤其是 `Get-Content -Raw` + `Set-Content` 这一类）。
- 优先使用**局部补丁**修改（最小改动范围）。
- 不用会隐式改编码/换行的批量替换方式改 HTML/CSS/JS。
- 每次改完都先做“乱码自检”，再提交。

## 2. 推荐修改方式（按优先级）

1. `apply_patch`（首选，局部编辑）
2. 编辑器内手动小范围修改（确认编码 UTF-8）
3. 仅在必要时用脚本改文件，且要显式指定 UTF-8 并做 diff 检查

## 3. 禁止方式（高风险）

- PowerShell 整文件读写：
  - `Get-Content xxx -Raw` 后再 `Set-Content xxx ...`
  - 正则整段替换整文件内容
- 不带编码参数的输出重定向覆盖源文件
- 一次性重写大文件后直接提交

## 4. 编辑器与 Git 设置

## 编辑器

- 文件编码固定为 `UTF-8`
- 行尾建议固定为 `LF`（或按项目约定）
- 关闭“自动猜测编码后保存”

## Git（建议）

```bash
git config core.autocrlf true
git config i18n.commitEncoding utf-8
git config i18n.logOutputEncoding utf-8
```

## 5. 提交前自检清单（每次必做）

```bash
git diff -- index.html js/battle.js css/battle.css
```

检查要点：

- 中文是否正常显示（无 `éå...`、`鈫?` 这类异常串）
- 是否只改了目标片段（没有大段无关改动）
- 是否出现异常“大规模删除/替换”

如发现异常，立刻回滚该文件：

```bash
git checkout -- <file>
```

## 6. 出现乱码时的应急流程

1. 停止继续编辑（避免污染扩大）
2. 用 `git diff` 定位污染文件
3. 回滚污染文件到上一个正常版本
4. 改用局部补丁重新实现改动
5. 再次自检后提交

## 7. 本仓库执行约定

- 涉及中文内容的文件（HTML/CSS/JS）默认按“高风险文件”处理
- 非必要不做批量脚本替换
- 任何大改动先分小步提交，确保可回退

---

如果后续需要，我可以再补一份 `.gitattributes` 和 pre-commit 检查脚本，把“乱码自检”自动化。

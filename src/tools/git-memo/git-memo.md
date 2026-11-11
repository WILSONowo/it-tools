## 配置

设置全局配置

```shell
git config --global user.name "[你的名字]"
git config --global user.email "[你的邮箱]"
```

## 开始

创建 Git 仓库

```shell
git init
```

克隆现有 Git 仓库

```shell
git clone [仓库地址]
```

## 提交

提交所有已跟踪的更改

```shell
git commit -am "[提交信息]"
```

将新的修改合并到上一次提交

```shell
git commit --amend --no-edit
```

## 操作失误

修改上一次提交的说明

```shell
git commit --amend
```

撤销最近一次提交但保留更改

```shell
git reset HEAD~1
```

撤销最近 N 次提交但保留更改

```shell
git reset HEAD~N
```

撤销最近一次提交并丢弃更改

```shell
git reset HEAD~1 --hard
```

将分支重置为远程状态

```shell
git fetch origin
git reset --hard origin/[分支名]
```

## 其他

将本地 master 分支重命名为 main

```shell
git branch -m master main
```

# 部署指南

## 方法一：GitHub Pages（推荐）

### 步骤：
1. 在GitHub上创建新仓库（例如：mc-crafting-demo）
2. 将本地文件推送到仓库
3. 在仓库设置中启用GitHub Pages

### 命令：
```bash
# 初始化Git仓库
git init

# 添加所有文件
git add .

# 提交
git commit -m "Initial commit: MC插件工艺系统演示"

# 添加远程仓库（替换为你的仓库地址）
git remote add origin https://github.com/你的用户名/mc-crafting-demo.git

# 推送到GitHub
git push -u origin main
```

### 启用GitHub Pages：
1. 进入仓库设置页面
2. 找到"Pages"选项
3. 选择"Deploy from a branch"
4. 选择"main"分支
5. 点击"Save"

## 方法二：Vercel（速度更快）

### 步骤：
1. 访问 vercel.com
2. 使用GitHub账号登录
3. 导入你的GitHub仓库
4. 自动部署完成

## 方法三：Netlify

### 步骤：
1. 访问 netlify.com
2. 拖拽整个文件夹到部署区域
3. 获得临时域名

## 访问地址：
- GitHub Pages: https://你的用户名.github.io/仓库名
- Vercel: https://项目名.vercel.app
- Netlify: https://随机名称.netlify.app

## 注意事项：
- 所有服务都支持自定义域名
- GitHub Pages在国内访问可能较慢
- Vercel和Netlify在国内访问速度相对较好
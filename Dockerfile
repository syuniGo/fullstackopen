FROM node:16-slim

WORKDIR /usr/src/app

# 1. 首先复制 package 文件
# 这层只有在依赖变化时才会重建
COPY package*.json ./

# 2. 安装依赖
# 这层也只在 package.json 变化时重建
RUN npm install

# 3. 一次性复制所有源代码和配置
# 源代码变化会触发这层重建，但会复用前面的层
COPY . .

EXPOSE 3001

CMD [ "npm", "start" ]
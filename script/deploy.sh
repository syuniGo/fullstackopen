#!/bin/bash

# 读取 .env 并转换成 yaml 格式
rm -f env.yaml && cat .env | grep -v PORT | sed 's/ //g' | sed 's/=/: "/' | sed 's/$/"/' > env.yaml
# docker push gcr.io/gcp-stock-analytics/my-app

gcloud run deploy my-app \
  --image gcr.io/gcp-stock-analytics/my-app \
  --platform managed \
  --region asia-east1 \
  --allow-unauthenticated \
  --port=3001 \
  --env-vars-file=env.yaml
import pandas as pd
import numpy as np
import json

# CSV 파일 경로
file_path = 'stay_live_work.csv'

# CSV 파일 읽기
df = pd.read_csv(file_path, encoding='utf-8')

# 데이터 확인
print("전체 데이터:\n", df.head())

# 기준_년분기_코드 필드 값 확인 및 필터링
df['기준_년분기_코드'] = df['기준_년분기_코드'].astype(str).str.strip()
data_20234 = df[df['기준_년분기_코드'] == '20234']
data_20233 = df[df['기준_년분기_코드'] == '20233']

# 자치구_코드_명 및 행정동_코드_명별로 유동인구 수 합산
days = ["월", "화", "수", "목", "금", "토", "일"]
rankings_by_day = {}

for day in days:
    day_key = f"{day}요일_유동인구_수"  # 요일별 유동인구 수 컬럼명

    if day_key not in data_20234.columns or day_key not in data_20233.columns:
        print(f"Warning: '{day_key}' not found in columns.")
        continue
    
    # 데이터 그룹화 및 합계 계산
    current_grouped = data_20234.groupby(['자치구_코드_명', '행정동_코드_명'])[day_key].sum().reset_index()
    previous_grouped = data_20233.groupby(['자치구_코드_명', '행정동_코드_명'])[day_key].sum().reset_index()

    current_grouped = current_grouped.rename(columns={day_key: 'current_population'})
    previous_grouped = previous_grouped.rename(columns={day_key: 'previous_population'})
    
    # 병합
    merged_data = pd.merge(current_grouped, previous_grouped, on=['자치구_코드_명', '행정동_코드_명'])
    
    # 변화율 계산
    merged_data['change'] = merged_data['current_population'] - merged_data['previous_population']
    merged_data['change_percentage'] = round((merged_data['change'] / merged_data['previous_population'].replace(0, np.nan)) * 100, 2)

    # NaN 값 및 이상치 제거
    merged_data = merged_data.dropna(subset=['change_percentage'])
    merged_data = merged_data[merged_data['change_percentage'] < np.inf]
    merged_data = merged_data.replace([np.inf, -np.inf], np.nan).dropna(subset=['change_percentage'])

    # 상위 10개 추출
    top_10 = merged_data.nlargest(10, 'change_percentage')
    
    rankings_by_day[day] = top_10[['자치구_코드_명', '행정동_코드_명', 'current_population', 'change_percentage']].to_dict(orient='records')

# JSON 파일로 저장
output_path = 'rankings_top10.json'
with open(output_path, 'w', encoding='utf-8') as f:
    json.dump(rankings_by_day, f, ensure_ascii=False, indent=4)

print(f"JSON 파일이 저장되었습니다: {output_path}")

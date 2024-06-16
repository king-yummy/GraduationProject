import pandas as pd
import json
import numpy as np

# CSV 파일 경로 설정
file_path = '매출.csv'

# 데이터 불러오기
data = pd.read_csv(file_path)

# 필요한 열만 선택 (구, 동, category20, 기준_년분기_코드, 당월_매출_금액, 점포_수)
data = data[['자치구_코드_명', '행정동_코드_명', 'category20', '기준_년분기_코드', '당월_매출_금액', '점포_수']]

# 20233과 20234 데이터 분리
data_20233 = data[data['기준_년분기_코드'] == 20233]
data_20234 = data[data['기준_년분기_코드'] == 20234]

# 구, 동, category20별로 그룹화하여 총합 계산
sum_20233 = data_20233.groupby(['자치구_코드_명', '행정동_코드_명', 'category20']).agg({
    '당월_매출_금액': 'sum',
    '점포_수': 'sum'
}).reset_index()

sum_20234 = data_20234.groupby(['자치구_코드_명', '행정동_코드_명', 'category20']).agg({
    '당월_매출_금액': 'sum',
    '점포_수': 'sum'
}).reset_index()

# 각 분기의 총합 평균 계산
sum_20233['평균_매출_20233'] = sum_20233['당월_매출_금액'] / sum_20233['점포_수']
sum_20234['평균_매출_20234'] = sum_20234['당월_매출_금액'] / sum_20234['점포_수']

# 두 분기 데이터 병합
merged_data = pd.merge(
    sum_20233,
    sum_20234,
    on=['자치구_코드_명', '행정동_코드_명', 'category20'],
    suffixes=('_20233', '_20234')
)

# 평균 매출 변화량 계산
merged_data['평균_매출_변화량'] = (
    (merged_data['평균_매출_20234'] - merged_data['평균_매출_20233']) / 
    merged_data['평균_매출_20233'] * 100
)

# 예외 처리: Infinity 또는 NaN 값을 가진 행 제거
merged_data.replace([np.inf, -np.inf], np.nan, inplace=True)
merged_data.dropna(subset=['평균_매출_변화량'], inplace=True)

# 평균 매출과 변화량 반올림
merged_data['평균_매출_20234'] = merged_data['평균_매출_20234'].round(0).astype(int)
merged_data['평균_매출_변화량'] = merged_data['평균_매출_변화량'].round(2)

# category20별로 평균 매출 변화량 상위 10개 추출
top10_by_category = merged_data.groupby('category20').apply(
    lambda x: x.nlargest(10, '평균_매출_변화량')
).reset_index(drop=True)

# JSON 데이터 구조화
output = top10_by_category.groupby('category20').apply(
    lambda x: x[['자치구_코드_명', '행정동_코드_명', '평균_매출_20234', '평균_매출_변화량']].to_dict('records')
).to_dict()

# JSON 파일로 저장
output_file_path = '매출_변화량_top10_by_category.json'
with open(output_file_path, 'w', encoding='utf-8') as f:
    json.dump(output, f, ensure_ascii=False, indent=4)

print(f"JSON 파일이 '{output_file_path}'에 저장되었습니다.")

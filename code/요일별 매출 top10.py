import pandas as pd
import json

# CSV 파일 읽기
file_path = '매출.csv'
df = pd.read_csv(file_path)

# 필요한 컬럼만 추출
df = df[['자치구_코드_명', '행정동_코드_명', '기준_년분기_코드',
         '월요일_매출_금액', '화요일_매출_금액', '수요일_매출_금액',
         '목요일_매출_금액', '금요일_매출_금액', '토요일_매출_금액',
         '일요일_매출_금액']]

# 기준 년분기 코드별로 데이터 분리
df_20233 = df[df['기준_년분기_코드'] == 20233]
df_20234 = df[df['기준_년분기_코드'] == 20234]

# 각 요일별 매출 금액의 합을 구한 데이터프레임 생성
days = ['월요일', '화요일', '수요일', '목요일', '금요일', '토요일', '일요일']

# 결과를 담을 딕셔너리 초기화
top_10_sales_change_by_day = {}

for day in days:
    column_name = f'{day}_매출_금액'
    if column_name in df.columns:
        df_20233_sum = df_20233.groupby(['자치구_코드_명', '행정동_코드_명'])[column_name].sum().reset_index()
        df_20234_sum = df_20234.groupby(['자치구_코드_명', '행정동_코드_명'])[column_name].sum().reset_index()

        # 매출 변화량 계산
        merged_df = pd.merge(df_20233_sum, df_20234_sum, on=['자치구_코드_명', '행정동_코드_명'], suffixes=('_20233', '_20234'))
        merged_df[f'{day}_변화량'] = round(((merged_df[f'{column_name}_20234'] - merged_df[f'{column_name}_20233']) / merged_df[f'{column_name}_20233']) * 100, 2)

        # 상위 10개 추출
        top_10 = merged_df.nlargest(10, f'{day}_변화량')
        top_10_sales_change_by_day[day] = top_10[['자치구_코드_명', '행정동_코드_명', f'{column_name}_20234', f'{day}_변화량']].to_dict(orient='records')

# JSON 파일로 저장
output_path = '매출_변화량_top10.json'
with open(output_path, 'w', encoding='utf-8') as json_file:
    json.dump(top_10_sales_change_by_day, json_file, ensure_ascii=False, indent=4)

print("매출 변화량 상위 10개 데이터를 JSON으로 변환하여 저장했습니다.")

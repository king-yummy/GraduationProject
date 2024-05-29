import pandas as pd
import numpy as np
from matplotlib import pyplot as plt
import seaborn as sns

data = pd.read_csv('../merge_data/final_data.csv', encoding='cp949')

plt.rcParams['font.family'] = 'Malgun Gothic'
plt.rcParams['axes.unicode_minus'] = False

# 점포 수 , 개업점포수 , 폐업점포수 시각화
# 필요 컬럼들
data_extracted = data[['기준_년분기_코드', '자치구_코드_명', '행정동_코드_명',
                       'category20', '점포_수', '개업_점포_수', '폐업_점포_수', '당월_매출_건수']]

# 광진구 데이터만
data_filtered = data_extracted[data_extracted['자치구_코드_명'] == '광진구']

# Group by 기준_년분기_코드, 행정동_코드_명, and category20 and sum the counts
data_grouped = data_filtered.groupby(
    ['기준_년분기_코드', '행정동_코드_명', 'category20']).sum().reset_index()

# bar별 이름 넣어주기
data_grouped['기준_년분기'] = data_grouped['기준_년분기_코드'].apply(
    lambda x: f"{str(x)[:4]}년 {int(str(x)[4])}분기")


def plot_bar_chart(data, y_column, title, color='grey', last_color='skyblue'):
    plt.figure(figsize=(10, 6))
    bars = plt.bar(data['기준_년분기'], data[y_column], color=[
                   last_color if i == len(data) - 1 else color for i in range(len(data))])
    for bar in bars:
        height = bar.get_height()
        plt.text(bar.get_x() + bar.get_width() / 2, height / 2, str(int(height)),
                 ha='center', va='center', color='white', fontsize=12)
    plt.title(title, loc='left', fontsize=16)
    # Grid lines with lower alpha for lighter color
    plt.grid(True, axis='y', alpha=0.3)
    plt.show()


unique_dongs = data_grouped['행정동_코드_명'].unique()
unique_categories = data_grouped['category20'].unique()

for dong in unique_dongs:
    for category in unique_categories:
        subset_data = data_grouped[(data_grouped['행정동_코드_명'] == dong) & (
            data_grouped['category20'] == category)]
        if not subset_data.empty:
            plot_bar_chart(subset_data, '점포_수',
                           f'{dong} - {category} 점포수', color='grey')
            plot_bar_chart(subset_data, '개업_점포_수',
                           f'{dong} - {category} 개업수', color='grey')
            plot_bar_chart(subset_data, '폐업_점포_수',
                           f'{dong} - {category} 폐업수', color='grey')


# 매출액, 매출건수 lineplot
# Extract necessary columns including 자치구_코드_명
data_extracted = data[['기준_년분기_코드', '자치구_코드_명', '행정동_코드_명', '상권_코드',
                       'category20', '점포_수', '개업_점포_수', '폐업_점포_수', '당월_매출_건수', '당월_매출_금액']]

# Convert 기준_년분기_코드 to readable format
data_extracted['기준_년분기'] = data_extracted['기준_년분기_코드'].apply(
    lambda x: f"{str(x)[:4]}년 {int(str(x)[4])}분기")

# Filter data for 광진구
data_gwangjin = data_extracted[data_extracted['자치구_코드_명'] == '광진구']

# Group by 기준_년분기_코드 and calculate the sum for each group to remove duplicates
data_gwangjin_grouped = data_gwangjin.groupby(
    ['기준_년분기_코드', '자치구_코드_명', '행정동_코드_명', '상권_코드', 'category20', '기준_년분기']).sum().reset_index()

# Calculate the means for 전체 and 광진구 by category20


def calculate_means(data, category):
    mean_all = data[data['category20'] == category].groupby(
        '기준_년분기')[['당월_매출_건수', '당월_매출_금액']].mean().reset_index()
    mean_gwangjin = data_gwangjin_grouped[data_gwangjin_grouped['category20'] == category].groupby(
        '기준_년분기')[['당월_매출_건수', '당월_매출_금액']].mean().reset_index()
    return mean_all, mean_gwangjin

# Function to plot line charts


def plot_line_chart(data, mean_all, mean_gwangjin, y_column, title, 상권_코드, unit=None):
    plt.figure(figsize=(12, 6))

    if unit == '만원':
        mean_all[y_column] = mean_all[y_column] / 10000 / 3
        mean_gwangjin[y_column] = mean_gwangjin[y_column] / 10000 / 3
        data[y_column] = data[y_column] / 10000 / 3

    # Plot 전체 평균
    plt.plot(mean_all['기준_년분기'], mean_all[y_column],
             marker='o', label='서울시', color='grey', linewidth=2)
    for i, txt in enumerate(mean_all[y_column]):
        plt.text(mean_all['기준_년분기'].iloc[i], txt,
                 int(txt), ha='right', fontsize=9)

    # Plot 광진구 평균
    plt.plot(mean_gwangjin['기준_년분기'], mean_gwangjin[y_column],
             marker='o', label='자치구', color='orange', linewidth=2)
    for i, txt in enumerate(mean_gwangjin[y_column]):
        plt.text(mean_gwangjin['기준_년분기'].iloc[i], txt,
                 int(txt), ha='right', fontsize=9)

    # Plot 특정 상권 데이터
    subset = data[(data['상권_코드'] == 상권_코드) & (data['자치구_코드_명'] == '광진구')]
    if not subset.empty:
        plt.plot(subset['기준_년분기'], subset[y_column], marker='o',
                 label=f'선택상권 {상권_코드}',  color='skyblue')
        for i, txt in enumerate(subset[y_column]):
            plt.text(subset['기준_년분기'].iloc[i], txt,
                     int(txt), ha='right', fontsize=9)

#     plt.xlabel('기준_년분기')
#     plt.ylabel(f'{y_column}' + (f' ({unit})' if unit else ''))
    plt.title(title, loc='left', fontsize=16)
    plt.legend(loc='upper center', bbox_to_anchor=(
        0.5, -0.15), ncol=3, fontsize='small')
    # Grid lines with lower alpha for lighter color
    plt.grid(True, axis='y', alpha=0.3)

    # 단위 표시 (매출액 그래프에만)
    if unit:
        plt.annotate(f'단위: {unit} / 점포당 평균 월 매출', xy=(1, 1), xytext=(0, 10), fontsize=10,
                     xycoords='axes fraction', textcoords='offset points',
                     ha='right', va='top')

    plt.tight_layout()
    plt.show()


# Plot for 매출건수 and 매출액 for each category and 상권
unique_categories = data_gwangjin_grouped['category20'].unique()
unique_상권_코드 = data_gwangjin_grouped['상권_코드'].unique()

for category in unique_categories:
    category_data = data_gwangjin_grouped[data_gwangjin_grouped['category20'] == category]
    mean_all, mean_gwangjin = calculate_means(data_extracted, category)
    for 상권_코드 in unique_상권_코드:
        subset_data = category_data[category_data['상권_코드'] == 상권_코드]
        if not subset_data.empty:
            # 각 상권에 대한 평균값을 유지
            plot_line_chart(subset_data, mean_all.copy(), mean_gwangjin.copy(
            ), '당월_매출_건수', f'{category} 매출건수 추이', 상권_코드)
            plot_line_chart(subset_data, mean_all.copy(), mean_gwangjin.copy(
            ), '당월_매출_금액', f'{category} 매출액 추이', 상권_코드, unit='만원')

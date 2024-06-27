import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Pie } from "react-chartjs-2";
import * as d3 from "d3";
import styled from "styled-components";

const TopSalesAnalysis = ({ csvPath, selectedDistrict }) => {
  const [chartData, setChartData] = useState(null);
  const [countMessage, setCountMessage] = useState("");
  const [trendMessage, setTrendMessage] = useState("");

  useEffect(() => {
    d3.csv(csvPath).then((data) => {
      processAndSetData(data, selectedDistrict);
    });
  }, [csvPath, selectedDistrict]);

  const processAndSetData = (data, selectedDistrict) => {
    const dataExtracted = data.map((d) => ({
      자치구_코드_명: d["자치구_코드_명"],
      행정동_코드_명: d["행정동_코드_명"],
      category20: d["category20"],
      당월_매출_금액: +d["당월_매출_금액"],
    }));

    const districtData = dataExtracted.filter(
      (d) => d["행정동_코드_명"] === selectedDistrict
    );

    if (districtData.length > 0) {
      const categorySum = districtData.reduce((acc, cur) => {
        if (!acc[cur["category20"]]) {
          acc[cur["category20"]] = 0;
        }
        acc[cur["category20"]] += cur["당월_매출_금액"];
        return acc;
      }, {});

      const totalSum = Object.values(categorySum).reduce(
        (acc, val) => acc + val,
        0
      );

      // 2% 이하 항목을 "기타"로 묶기
      const sortedCategories = Object.entries(categorySum)
        .sort(([, a], [, b]) => b - a)
        .filter(([, value]) => value > 0);

      const filteredCategories = sortedCategories.filter(
        ([, value]) => (value / totalSum) * 100 > 5
      );

      const othersSum = sortedCategories
        .filter(([, value]) => (value / totalSum) * 100 <= 5)
        .reduce((acc, [, value]) => acc + value, 0);

      if (othersSum > 0) {
        filteredCategories.push(["기타", othersSum]);
      }

      const labels = filteredCategories.map(([key]) => key);
      const dataValues = filteredCategories.map(([, value]) =>
        ((value / totalSum) * 100).toFixed(1)
      );

      setChartData({
        labels,
        datasets: [
          {
            data: dataValues,
            backgroundColor: [
              ...labels
                .slice(0, labels.length - 1)
                .map((_, i) => `hsl(${(i * 360) / labels.length}, 70%, 70%)`),
              "grey",
            ],
          },
        ],
      });

      setCountMessage(`${selectedDistrict}의 업종별 매출 비율`);

      // 매출 상위 3개 업종 추출
      const top3Categories = sortedCategories.slice(0, 3).map(([key]) => key);
      setTrendMessage(`${selectedDistrict}에서는 ${top3Categories.join("/")} 업종의 매출이 가장 높습니다.`);
    }
  };

  return (
    <AnalysisContainer>
      <CountMessage>{countMessage}</CountMessage>
      <TrendMessage>{trendMessage}</TrendMessage>
      <ChartContainer>
        {chartData && (
          <Pie
            data={chartData}
            options={{
              maintainAspectRatio: false,
              plugins: {
                tooltip: {
                  callbacks: {
                    label: (context) => `${context.label}: ${context.raw}%`,
                  },
                },
                legend: {
                  position: "top",
                  labels: {
                    generateLabels: (chart) => {
                      const data = chart.data;
                      return data.labels.map((label, i) => ({
                        text: label,
                        fillStyle: data.datasets[0].backgroundColor[i],
                        strokeStyle: data.datasets[0].backgroundColor[i],
                      }));
                    },
                  },
                },
              },
            }}
          />
        )}
      </ChartContainer>
    </AnalysisContainer>
  );
};

TopSalesAnalysis.propTypes = {
  csvPath: PropTypes.string.isRequired,
  selectedDistrict: PropTypes.string.isRequired,
};

export default TopSalesAnalysis;

const AnalysisContainer = styled.div`
  border: 3px solid #ddd;
  padding: 30px 20px;
  border-radius: 5px;
  margin-bottom: 20px;
  box-sizing: border-box;
`;

const ChartContainer = styled.div`
  width: 100%;
  height: 400px;
`;

const CountMessage = styled.p`
  font-size: 18px;
  font-weight: bold;
  text-align: start;
`;

const TrendMessage = styled.p`
  font-size: 16px;
  margin: 15px 0 50px 0;
  text-align: start;
  color: red;
  line-height: 1.5;
`;

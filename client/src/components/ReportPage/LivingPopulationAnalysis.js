import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Bar } from "react-chartjs-2";
import styled from "styled-components";
import Papa from "papaparse";

const LivingPopulationAnalysis = ({ csvPath, selectedDistrict }) => {
  const [chartData, setChartData] = useState(null);
  const [countMessage, setCountMessage] = useState("");
  const [trendMessage, setTrendMessage] = useState("");
  const ageGroups = ["10대", "20대", "30대", "40대", "50대", "60대 이상"];

  const recommendationMessages = {
    "남성10대": "젊고 활기찬 분위기의 매장 분위기를 추천합니다.",
    "여성10대": "트렌디하고 감각적인 매장 분위기를 추천합니다.",
    "남성20대": "스타일리시하고 현대적인 느낌의 매장 분위기를 추천합니다.",
    "여성20대": "트렌디하면서도 감각적인 매장 분위기를 추천합니다.",
    "남성30대": "실용적이고 효율적인 매장 분위기를 추천합니다.",
    "여성30대": "퀄리티 좋고 심미적인 컨셉의 매장 분위기를 추천합니다.",
    "남성40대": "가족 친화적이고 편안한 매장 분위기를 추천합니다.",
    "여성40대": "건강과 웰빙을 강조하는 매장 분위기를 추천합니다.",
    "남성50대": "전통적이고 신뢰할 수 있는 매장 분위기를 추천합니다.",
    "여성50대": "안정적이고 편안한 느낌의 매장 분위기를 추천합니다.",
    "남성60대 이상": "편안하고 접근성 좋은 매장 분위기를 추천합니다.",
    "여성60대 이상": "편안하고 여유로운 매장 분위기를 추천합니다."
  };

  useEffect(() => {
    Papa.parse(csvPath, {
      download: true,
      header: true,
      complete: (result) => {
        processPopulationData(result.data, selectedDistrict);
      },
    });
  }, [csvPath, selectedDistrict]);

  const processPopulationData = (data, selectedDistrict) => {
    const relevantData = data.filter(
      (d) => d["행정동_코드_명"] === selectedDistrict
    );

    if (relevantData.length === 0) {
      setChartData(null);
      return;
    }

    const summedData = relevantData.reduce(
      (acc, cur) => {
        ageGroups.forEach((age, index) => {
          const maleKey = index === 5 ? `남성연령대_60_이상_상주인구_수` : `남성연령대_${index + 1}0_상주인구_수`;
          const femaleKey = index === 5 ? `여성연령대_60_이상_상주인구_수` : `여성연령대_${index + 1}0_상주인구_수`;

          acc[`남성${age}`] += +cur[maleKey] || 0;
          acc[`여성${age}`] += +cur[femaleKey] || 0;
        });
        return acc;
      },
      ageGroups.reduce(
        (obj, age) => ({
          ...obj,
          [`남성${age}`]: 0,
          [`여성${age}`]: 0,
        }),
        {}
      )
    );

    const totalPopulation = {
      남성: ageGroups.reduce((sum, age) => sum + summedData[`남성${age}`], 0),
      여성: ageGroups.reduce((sum, age) => sum + summedData[`여성${age}`], 0),
    };

    const percentages = ageGroups.map((age) => ({
      남성: (summedData[`남성${age}`] / totalPopulation["남성"]) * 100,
      여성: (summedData[`여성${age}`] / totalPopulation["여성"]) * 100,
    }));

    const maleMaxIndex = percentages
      .map((p) => p.남성)
      .indexOf(Math.max(...percentages.map((p) => p.남성)));
    const femaleMaxIndex = percentages
      .map((p) => p.여성)
      .indexOf(Math.max(...percentages.map((p) => p.여성)));

    const maleMaxPercentage = percentages[maleMaxIndex].남성;
    const femaleMaxPercentage = percentages[femaleMaxIndex].여성;

    let countMessage;
    let trendMessage;
    if (maleMaxPercentage > femaleMaxPercentage) {
      countMessage = `주거인구는 ${ageGroups[maleMaxIndex]}의 남성이 가장 많습니다.`;
      trendMessage = recommendationMessages[`남성${ageGroups[maleMaxIndex]}`];
    } else {
      countMessage = `주거인구는 ${ageGroups[femaleMaxIndex]}의 여성이 가장 많습니다.`;
      trendMessage = recommendationMessages[`여성${ageGroups[femaleMaxIndex]}`];
    }

    setCountMessage(countMessage);
    setTrendMessage(trendMessage);

    setChartData({
      labels: ageGroups,
      datasets: [
        {
          label: "남성",
          data: percentages.map((p) => p.남성),
          backgroundColor: "skyblue",
          borderColor: "blue",
          borderWidth: 1,
        },
        {
          label: "여성",
          data: percentages.map((p) => p.여성),
          backgroundColor: "lightgreen",
          borderColor: "green",
          borderWidth: 1,
        },
      ],
    });
  };

  return (
    <AnalysisContainer>
      <CountMessage>{countMessage}</CountMessage>
      <TrendMessage>{trendMessage}</TrendMessage>
      <ChartContainer>
        {chartData && (
          <Bar
            data={chartData}
            options={{
              maintainAspectRatio: false,
              scales: {
                x: {
                  title: {
                    display: true,
                    text: "연령대",
                  },
                },
                y: {
                  title: {
                    display: true,
                    text: "주거인구 비율 (%)",
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

LivingPopulationAnalysis.propTypes = {
  csvPath: PropTypes.string.isRequired,
  selectedDistrict: PropTypes.string.isRequired,
};

export default LivingPopulationAnalysis;

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

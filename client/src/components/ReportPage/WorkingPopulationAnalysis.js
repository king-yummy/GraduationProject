import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Bar } from "react-chartjs-2";
import styled from "styled-components";
import Papa from "papaparse";
import { count } from "d3";

const WorkingPopulationAnalysis = ({ csvPath, selectedDistrict }) => {
  const [chartData, setChartData] = useState(null);
  const [countMessage, setCountMessage] = useState("");
  const [trendMessage, setTrendMessage] = useState("");
  const ageGroups = ["10대", "20대", "30대", "40대", "50대", "60대 이상"];

  useEffect(() => {
    Papa.parse(csvPath, {
      download: true,
      header: true,
      complete: (result) => {
        processWorkingPopulationData(result.data, selectedDistrict);
      },
    });
  }, [csvPath, selectedDistrict]);

  const processWorkingPopulationData = (data, selectedDistrict) => {
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
          acc[`남성${age}`] +=
            +cur[`남성연령대_${index + 1}0_직장_인구_수`] || 0;
          acc[`여성${age}`] +=
            +cur[`여성연령대_${index + 1}0_직장_인구_수`] || 0;
        });
        acc["남성60대 이상"] += +cur["남성연령대_60_이상_직장_인구_수"] || 0;
        acc["여성60대 이상"] += +cur["여성연령대_60_이상_직장_인구_수"] || 0;
        return acc;
      },
      ageGroups.reduce(
        (obj, age) => ({
          ...obj,
          [`남성${age}`]: 0,
          [`여성${age}`]: 0,
        }),
        { "남성60대 이상": 0, "여성60대 이상": 0 }
      )
    );

    const totalPopulation = {
      남성: ageGroups.reduce((sum, age) => sum + summedData[`남성${age}`], 0),
      여성: ageGroups.reduce((sum, age) => sum + summedData[`여성${age}`], 0),
    };
    totalPopulation["남성"] += summedData["남성60대 이상"];
    totalPopulation["여성"] += summedData["여성60대 이상"];

    const percentages = ageGroups.map((age) => ({
      남성: (summedData[`남성${age}`] / totalPopulation["남성"]) * 100,
      여성: (summedData[`여성${age}`] / totalPopulation["여성"]) * 100,
    }));
    percentages.push({
      남성: (summedData["남성60대 이상"] / totalPopulation["남성"]) * 100,
      여성: (summedData["여성60대 이상"] / totalPopulation["여성"]) * 100,
    });

    const maleMaxIndex = percentages
      .map((p) => p.남성)
      .indexOf(Math.max(...percentages.map((p) => p.남성)));
    const femaleMaxIndex = percentages
      .map((p) => p.여성)
      .indexOf(Math.max(...percentages.map((p) => p.여성)));

    let countMessage = "";
    if (percentages[maleMaxIndex].남성 > percentages[femaleMaxIndex].여성) {
      countMessage = `${ageGroups[maleMaxIndex]} 남성 직장인구가 가장 많습니다.`;
      setTrendMessage(
        `${selectedDistrict} 상권에서는 ${ageGroups[maleMaxIndex]} 남성 직장인을 유의하세요.`
      );
    } else if (
      percentages[maleMaxIndex].남성 < percentages[femaleMaxIndex].여성
    ) {
      countMessage = `${ageGroups[femaleMaxIndex]} 여성 직장인구가 가장 많습니다.`;
      setTrendMessage(
        `${selectedDistrict} 상권에서는 ${ageGroups[femaleMaxIndex]} 여성 직장인을 유의하세요.`
      );
    } else {
      countMessage = `${ageGroups[maleMaxIndex]} 남성과 ${ageGroups[femaleMaxIndex]} 여성의 직장인구가 가장 많습니다.`;
      setTrendMessage(
        `${selectedDistrict} 상권에서는 ${ageGroups[maleMaxIndex]} 남성 직장인과 ${ageGroups[femaleMaxIndex]} 여성 직장인을 유의하세요.`
      );
    }

    setCountMessage(countMessage);

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
                    text: "직장인구 비율 (%)",
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

WorkingPopulationAnalysis.propTypes = {
  csvPath: PropTypes.string.isRequired,
  selectedDistrict: PropTypes.string.isRequired,
};

export default WorkingPopulationAnalysis;

const div = styled.div`
  display: flex;
`;

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

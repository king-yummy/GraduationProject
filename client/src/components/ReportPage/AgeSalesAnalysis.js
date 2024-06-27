import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Bar } from "react-chartjs-2";
import * as d3 from "d3";
import styled from "styled-components";

const AgeSalesAnalysis = ({ csvPath, selectedDistrict, selectedIndustry }) => {
  const [ageChartData, setAgeChartData] = useState(null);
  const [countMessage, setCountMessage] = useState("");
  const [trendMessage, setTrendMessage] = useState("");

  useEffect(() => {
    d3.csv(csvPath).then((data) => {
      processAndSetData(data, selectedDistrict, selectedIndustry);
    });
  }, [csvPath, selectedDistrict, selectedIndustry]);

  const processAndSetData = (data, selectedDistrict, selectedIndustry) => {
    const dataExtracted = data
      .filter((d) => d["category20"] === selectedIndustry)
      .map((d) => ({
        자치구_코드_명: d["자치구_코드_명"],
        행정동_코드_명: d["행정동_코드_명"],
        category20: d["category20"],
        연령대_10_매출_금액: +d["연령대_10_매출_금액"],
        연령대_20_매출_금액: +d["연령대_20_매출_금액"],
        연령대_30_매출_금액: +d["연령대_30_매출_금액"],
        연령대_40_매출_금액: +d["연령대_40_매출_금액"],
        연령대_50_매출_금액: +d["연령대_50_매출_금액"],
        연령대_60_이상_매출_금액: +d["연령대_60_이상_매출_금액"],
      }));

    const districtData = dataExtracted.filter(
      (d) => d["행정동_코드_명"] === selectedDistrict
    );

    if (districtData.length > 0) {
      const summedData = districtData.reduce(
        (acc, cur) => {
          acc["연령대_10_매출_금액"] += cur["연령대_10_매출_금액"];
          acc["연령대_20_매출_금액"] += cur["연령대_20_매출_금액"];
          acc["연령대_30_매출_금액"] += cur["연령대_30_매출_금액"];
          acc["연령대_40_매출_금액"] += cur["연령대_40_매출_금액"];
          acc["연령대_50_매출_금액"] += cur["연령대_50_매출_금액"];
          acc["연령대_60_이상_매출_금액"] += cur["연령대_60_이상_매출_금액"];
          return acc;
        },
        {
          연령대_10_매출_금액: 0,
          연령대_20_매출_금액: 0,
          연령대_30_매출_금액: 0,
          연령대_40_매출_금액: 0,
          연령대_50_매출_금액: 0,
          연령대_60_이상_매출_금액: 0,
        }
      );

      const totalSales = Object.values(summedData).reduce(
        (acc, val) => acc + val,
        0
      );

      const labels = ["10대", "20대", "30대", "40대", "50대", "60대 이상"];
      const dataValues = Object.values(summedData).map(
        (value) => (value / totalSales) * 100
      );

      // 최대값의 색깔 지정
      const maxIndex = dataValues.indexOf(Math.max(...dataValues));
      const backgroundColors = dataValues.map((_, index) =>
        index === maxIndex ? "skyblue" : "grey"
      );

      setAgeChartData({
        labels,
        datasets: [
          {
            label: `${selectedIndustry}의 연령대별 매출 현황 (%)`,
            data: dataValues,
            backgroundColor: backgroundColors,
            borderColor: backgroundColors.map((color) =>
              color === "skyblue" ? "deepskyblue" : "darkgrey"
            ),
            borderWidth: 1,
          },
        ],
      });

      const maxAgeGroup = labels[maxIndex];
      setCountMessage(
        `${selectedDistrict}의 ${selectedIndustry} 업종에서는 ${maxAgeGroup}(${dataValues[
          maxIndex
        ].toFixed(1)}%)가 가장 높은 매출을 보입니다.`
      );

      const trendMessages = {
        "10대":
          "학생들의 트렌드에 맞춰 마케팅을 진행하세요. 최신 유행 아이템과 SNS를 적극 활용하는 것이 좋습니다.",
        "20대":
          "젊은 직장인과 대학생들을 겨냥한 트렌디한 상품과 프로모션을 기획하세요. 온라인 마케팅과 모바일 앱 활용을 고려해 보세요.",
        "30대":
          "안정적인 소득을 가진 이들을 위해 품질 좋은 제품과 서비스 제공이 중요합니다.",
        "40대":
          "가족 단위 고객을 타겟으로 한 다양한 상품과 서비스를 제공하세요. 주차 시설과 가족 친화적인 환경을 강조하는 것이 좋습니다.",
        "50대":
          "건강과 웰빙에 관심이 많은 이들을 위해 관련 상품과 서비스를 강화하세요.",
        "60대 이상":
          "은퇴 후 여유를 즐기는 고객을 위해 편안하고 여유로운 쇼핑 환경을 조성하세요. 노인 친화적인 제품과 서비스를 제공하는 것이 중요합니다.",
      };

      setTrendMessage(trendMessages[maxAgeGroup]);
    }
  };

  return (
    <AnalysisContainer>
      <CountMessage>{countMessage}</CountMessage>
      <TrendMessage>{trendMessage}</TrendMessage>
      <ChartContainer>
        {ageChartData && (
          <Bar
            data={ageChartData}
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
                    text: "매출 비율 (%)",
                  },
                },
              },
              plugins: {
                tooltip: {
                  callbacks: {
                    label: (context) => `${context.raw.toFixed(1)}%`,
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

AgeSalesAnalysis.propTypes = {
  csvPath: PropTypes.string.isRequired,
  selectedDistrict: PropTypes.string.isRequired,
  selectedIndustry: PropTypes.string.isRequired,
};

export default AgeSalesAnalysis;

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

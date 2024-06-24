import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Line } from "react-chartjs-2";
import styled from "styled-components";
import Papa from "papaparse";
import _ from "lodash";

const SurvivalRateAnalysis = ({ csvPath, selectedDistrict, selectedIndustry }) => {
  const [chartData, setChartData] = useState(null);
  const [survivalMessage, setSurvivalMessage] = useState("");

  useEffect(() => {
    fetch(csvPath)
      .then((response) => response.text())
      .then((text) => {
        Papa.parse(text, {
          header: true,
          complete: (results) => {
            const parsedData = results.data;

            // 필요한 열만 추출
            const columnsOfInterest = [
              "기준_년분기_코드",
              "자치구_코드_명",
              "행정동_코드_명",
              "1년생존율",
              "2년생존율",
              "3년생존율",
              "4년생존율",
              "5년생존율",
              "category20",
            ];

            const dataExtracted = parsedData.map((row) =>
              _.pick(row, columnsOfInterest)
            );

            // 해당 동과 업종에 대한 필터링
            const filteredData = dataExtracted.filter(
              (row) =>
                row["행정동_코드_명"] === selectedDistrict &&
                row["category20"] === selectedIndustry
            );

            if (filteredData.length === 0) {
              setSurvivalMessage("선택된 동과 업종에 대한 데이터가 없습니다.");
              setChartData(null);
              return;
            }

            // 자치구 및 서울시 평균 생존율 계산
            const survivalYears = [
              "1년생존율",
              "2년생존율",
              "3년생존율",
              "4년생존율",
              "5년생존율",
            ];

            const meanCity = survivalYears.reduce((acc, year) => {
              acc[year] = _.meanBy(
                dataExtracted.filter((row) => !isNaN(parseFloat(row[year]))),
                (row) => parseFloat(row[year])
              );
              return acc;
            }, {});

            const meanDistrict = survivalYears.reduce((acc, year) => {
              acc[year] = _.meanBy(
                filteredData.filter((row) => !isNaN(parseFloat(row[year]))),
                (row) => parseFloat(row[year])
              );
              return acc;
            }, {});

            // 차트 데이터 생성
            const chartDatasets = [
              {
                label: "자치구 평균",
                data: survivalYears.map((year) => meanDistrict[year]),
                fill: false,
                borderColor: "orange",
                backgroundColor: "orange",
                tension: 0.1,
              },
              {
                label: "서울시 평균",
                data: survivalYears.map((year) => meanCity[year]),
                fill: false,
                borderColor: "grey",
                backgroundColor: "grey",
                tension: 0.1,
              },
            ];

            // 메시지 생성
            let survivalMessage = "생존율 데이터를 분석할 수 없습니다.";
            if (filteredData.length > 1) {
              const latestSurvival = meanDistrict["5년생존율"];
              const previousSurvival = meanDistrict["4년생존율"];
              if (latestSurvival > previousSurvival) {
                survivalMessage = "생존율이 전년 대비 증가하고 있습니다.";
              } else if (latestSurvival === previousSurvival) {
                survivalMessage = "생존율이 전년 대비 동일합니다.";
              } else {
                survivalMessage = "생존율이 전년 대비 감소하고 있습니다.";
              }
            }

            setSurvivalMessage(survivalMessage);

            setChartData({
              labels: survivalYears,
              datasets: chartDatasets,
            });
          },
        });
      });
  }, [csvPath, selectedDistrict, selectedIndustry]);

  return (
    <AnalysisContainer>
      <CountMessage>생존율</CountMessage>
      <TrendMessage>{survivalMessage}</TrendMessage>
      <ChartContainer>
        {chartData ? (
          <Line data={chartData} options={{ maintainAspectRatio: false }} />
        ) : (
          <p>데이터를 불러오는 중...</p>
        )}
      </ChartContainer>
    </AnalysisContainer>
  );
};

SurvivalRateAnalysis.propTypes = {
  csvPath: PropTypes.string.isRequired,
  selectedDistrict: PropTypes.string.isRequired,
  selectedIndustry: PropTypes.string.isRequired,
};

export default SurvivalRateAnalysis;

const AnalysisContainer = styled.div`
  flex: 1;
  margin-bottom: 20px;
`;

const ChartContainer = styled.div`
  width: 100%;
  height: 400px;
`;

const CountMessage = styled.p`
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 20px;
  text-align: start;
  color: #000000;
`;

const TrendMessage = styled.p`
  font-size: 16px;
  margin-bottom: 20px;
  text-align: start;
  color: #474242;
`;

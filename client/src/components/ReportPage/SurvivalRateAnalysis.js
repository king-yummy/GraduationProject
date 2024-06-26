import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Line } from "react-chartjs-2";
import styled from "styled-components";
import Papa from "papaparse";
import _ from "lodash";

const SurvivalRateAnalysis = ({
  csvPath,
  cityInfo,
  selectedDistrict,
  selectedIndustry,
}) => {
  const [chartData, setChartData] = useState(null);
  const [countMessage, setCountMessage] = useState("");
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

            // 해당 자치구와 업종에 대한 필터링
            const filteredCityData = dataExtracted.filter(
              (row) =>
                row["자치구_코드_명"] === cityInfo &&
                row["category20"] === selectedIndustry
            );

            // 해당 행정동과 업종에 대한 필터링
            const filteredDistrictData = filteredCityData.filter(
              (row) => row["행정동_코드_명"] === selectedDistrict
            );

            // 서울시 전체 데이터 필터링
            const filteredSeoulData = dataExtracted.filter(
              (row) => row["category20"] === selectedIndustry
            );

            if (filteredDistrictData.length === 0) {
              setSurvivalMessage(
                "선택된 자치구와 행정동, 업종에 대한 데이터가 없습니다."
              );
              setChartData(null);
              return;
            }

            // 생존율 계산
            const survivalYears = [
              "1년생존율",
              "2년생존율",
              "3년생존율",
              "4년생존율",
              "5년생존율",
            ];

            const meanSeoul = survivalYears.reduce((acc, year) => {
              acc[year] = _.meanBy(
                filteredSeoulData.filter(
                  (row) => !isNaN(parseFloat(row[year]))
                ),
                (row) => parseFloat(row[year])
              );
              return acc;
            }, {});

            const meanCity = survivalYears.reduce((acc, year) => {
              acc[year] = _.meanBy(
                filteredCityData.filter((row) => !isNaN(parseFloat(row[year]))),
                (row) => parseFloat(row[year])
              );
              return acc;
            }, {});

            const meanDistrict = survivalYears.reduce((acc, year) => {
              acc[year] = _.meanBy(
                filteredDistrictData.filter(
                  (row) => !isNaN(parseFloat(row[year]))
                ),
                (row) => parseFloat(row[year])
              );
              return acc;
            }, {});

            // 차트 데이터 생성
            const chartDatasets = [
              {
                label: "서울시 평균",
                data: survivalYears.map((year) => meanSeoul[year]),
                fill: false,
                borderColor: "grey",
                backgroundColor: "grey",
                tension: 0.1,
              },
              {
                label: "자치구 평균",
                data: survivalYears.map((year) => meanCity[year]),
                fill: false,
                borderColor: "orange",
                backgroundColor: "orange",
                tension: 0.1,
              },
              {
                label: "행정동 평균",
                data: survivalYears.map((year) => meanDistrict[year]),
                fill: false,
                borderColor: "skyblue",
                backgroundColor: "skyblue",
                tension: 0.1,
              },
            ];

            // 메시지 생성
            let survivalMessage = "생존율 데이터를 분석할 수 없습니다.";
            if (
              meanDistrict["5년생존율"] > meanCity["5년생존율"] &&
              meanDistrict["5년생존율"] > meanSeoul["5년생존율"]
            ) {
              setCountMessage(`${selectedDistrict}의 생존율이 ${cityInfo}와 서울시 평균보다 높습니다.`)
              survivalMessage =
                `${cityInfo}내에서의 ${selectedIndustry} 상권 안정적으로 보입니다.`;
            } else if (meanDistrict["5년생존율"] > meanCity["5년생존율"]) {
              setCountMessage(`${selectedDistrict}의 생존율이 ${cityInfo} 평균보다 높지만, 서울시 평균보다는 낮습니다.`)
              survivalMessage =
                `${cityInfo} 내에서는 ${selectedIndustry} 상권은 유리한 위치입니다.`;
            } else if (meanDistrict["5년생존율"] > meanSeoul["5년생존율"]) {
              setCountMessage(`${selectedDistrict}의 생존율이 서울시 평균보다 높지만, ${cityInfo} 평균보다는 낮습니다.`)
              survivalMessage =
                `${selectedDistrict}내에서 ${selectedIndustry} 상권이 성장할 가능성이 있습니다.`;
            } else {
              setCountMessage(`${selectedDistrict}의 생존율이 ${cityInfo}와 서울시 평균보다 낮습니다.`)
              survivalMessage =
                `${selectedDistrict}내에서는 ${selectedIndustry} 상권 분석 및 리스크 관리를 신중히 하세요.`;
            }

            setSurvivalMessage(survivalMessage);

            setChartData({
              labels: survivalYears,
              datasets: chartDatasets,
            });
          },
        });
      });
  }, [csvPath, cityInfo, selectedDistrict, selectedIndustry]);

  return (
    <AnalysisContainer>
      <CountMessage>{countMessage}</CountMessage>
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
  cityInfo: PropTypes.string.isRequired,
  selectedDistrict: PropTypes.string.isRequired,
  selectedIndustry: PropTypes.string.isRequired,
};

export default SurvivalRateAnalysis;

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

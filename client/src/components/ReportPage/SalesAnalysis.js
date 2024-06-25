import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import * as d3 from "d3";
import styled from "styled-components";
import PropTypes from "prop-types";

const SalesAnalysis = ({ csvPath, selectedDistrict, cityInfo, selectedIndustry }) => {
    const [chartData, setChartData] = useState(null);
    const [timeChartData, setTimeChartData] = useState(null);
  
    useEffect(() => {
      d3.csv(csvPath).then((data) => {
        processAndSetData(data, cityInfo, selectedDistrict, selectedIndustry);
        processAndSetTimeData(data, selectedDistrict, selectedIndustry);
      });
    }, [csvPath, cityInfo, selectedDistrict, selectedIndustry]);
  
    const processAndSetData = (data, cityInfo, selectedDistrict, selectedIndustry) => {
      const columnsOfInterest = [
        "기준_년분기_코드",
        "자치구_코드_명",
        "행정동_코드_명",
        "category20",
        "당월_매출_건수",
        "당월_매출_금액",
        "점포_수",
      ];
  
      const dataExtracted = data
        .filter(d => {
          const 분기 = Number(String(d["기준_년분기_코드"]).slice(4));
          return (
            분기 >= 1 && 분기 <= 4 &&
            d["category20"] === selectedIndustry
          );
        })
        .map((d) => {
          const 분기 = Number(String(d["기준_년분기_코드"]).slice(4));
          return {
            기준_년분기_코드: +d["기준_년분기_코드"],
            자치구_코드_명: d["자치구_코드_명"],
            행정동_코드_명: d["행정동_코드_명"],
            당월_매출_건수: +d["당월_매출_건수"],
            당월_매출_금액: +d["당월_매출_금액"],
            점포_수: +d["점포_수"],
            기준_년분기: `${String(d["기준_년분기_코드"]).slice(0, 4)}년 ${분기}분기`,
          };
        });
  
      // 2023년 4분기까지만 포함하도록 필터링
      const filteredData = dataExtracted.filter(
        (d) => d["기준_년분기_코드"] <= 20234
      );
  
      const calculateMeans = (data) => {
        return d3
          .groups(data, (d) => d["기준_년분기"])
          .map(([key, values]) => ({
            기준_년분기: key,
            당월_매출_건수:
              d3.sum(values, (d) => d["당월_매출_건수"]) /
              d3.sum(values, (d) => d["점포_수"]),
            당월_매출_금액:
              d3.sum(values, (d) => d["당월_매출_금액"]) /
              d3.sum(values, (d) => d["점포_수"]),
          }));
      };
  
      // 전체 평균 계산
      const meanAll = calculateMeans(filteredData);
  
      // 자치구 평균 계산
      const meanCity = calculateMeans(
        filteredData.filter((d) => d["자치구_코드_명"] === cityInfo)
      );
  
      // 특정 동 매출 데이터 필터링
      const districtData = filteredData.filter(
        (d) => d["행정동_코드_명"] === selectedDistrict
      );
  
      const meanDistrict = calculateMeans(districtData);
  
      // X축 라벨 중복 제거 및 정렬
      const labels = Array.from(new Set(meanAll.map(d => d["기준_년분기"]))).sort();
  
      setChartData({
        labels: labels,
        datasets: [
          {
            label: "서울시 평균",
            data: meanAll.map((d) => d["당월_매출_금액"] / 10000), // 단위 변환
            borderColor: "grey",
            fill: false,
            tension: 0.4,
          },
          {
            label: `${cityInfo} 평균`,
            data: meanCity.map((d) => d["당월_매출_금액"] / 10000), // 단위 변환
            borderColor: "orange",
            fill: false,
            tension: 0.4,
          },
          {
            label: `${selectedDistrict} 매출`,
            data: meanDistrict.map((d) => d["당월_매출_금액"] / 10000), // 단위 변환
            borderColor: "skyblue",
            fill: false,
            tension: 0.4,
          },
        ],
      });
    };
  
    const processAndSetTimeData = (data, selectedDistrict, selectedIndustry) => {
      const columns = [
        "자치구_코드_명",
        "행정동_코드_명",
        "category20",
        "시간대_00~06_매출_금액",
        "시간대_06~11_매출_금액",
        "시간대_11~14_매출_금액",
        "시간대_14~17_매출_금액",
        "시간대_17~21_매출_금액",
        "시간대_21~24_매출_금액",
      ];
  
      const dataExtracted = data
        .filter(d => d["category20"] === selectedIndustry)
        .map((d) => ({
          자치구_코드_명: d["자치구_코드_명"],
          행정동_코드_명: d["행정동_코드_명"],
          category20: d["category20"],
          시간대_00_06_매출_금액: +d["시간대_00~06_매출_금액"],
          시간대_06_11_매출_금액: +d["시간대_06~11_매출_금액"],
          시간대_11_14_매출_금액: +d["시간대_11~14_매출_금액"],
          시간대_14_17_매출_금액: +d["시간대_14~17_매출_금액"],
          시간대_17_21_매출_금액: +d["시간대_17~21_매출_금액"],
          시간대_21_24_매출_금액: +d["시간대_21~24_매출_금액"],
        }));
  
      const districtData = dataExtracted.filter(
        (d) => d["행정동_코드_명"] === selectedDistrict
      );
  
      if (districtData.length > 0) {
        const summedData = districtData.reduce(
          (acc, cur) => {
            acc["시간대_00_06_매출_금액"] += cur["시간대_00_06_매출_금액"];
            acc["시간대_06_11_매출_금액"] += cur["시간대_06_11_매출_금액"];
            acc["시간대_11_14_매출_금액"] += cur["시간대_11_14_매출_금액"];
            acc["시간대_14_17_매출_금액"] += cur["시간대_14_17_매출_금액"];
            acc["시간대_17_21_매출_금액"] += cur["시간대_17_21_매출_금액"];
            acc["시간대_21_24_매출_금액"] += cur["시간대_21_24_매출_금액"];
            return acc;
          },
          {
            시간대_00_06_매출_금액: 0,
            시간대_06_11_매출_금액: 0,
            시간대_11_14_매출_금액: 0,
            시간대_14_17_매출_금액: 0,
            시간대_17_21_매출_금액: 0,
            시간대_21_24_매출_금액: 0,
          }
        );
  
        const totalSales = Object.values(summedData).reduce(
          (acc, val) => acc + val,
          0
        );
  
        const timeMapping = {
          시간대_00_06_매출_금액: "00~06시",
          시간대_06_11_매출_금액: "06~11시",
          시간대_11_14_매출_금액: "11~14시",
          시간대_14_17_매출_금액: "14~17시",
          시간대_17_21_매출_금액: "17~21시",
          시간대_21_24_매출_금액: "21~24시",
        };
  
        const labels = Object.keys(summedData).map((key) => timeMapping[key]);
        const dataValues = Object.values(summedData).map(
          (value) => (value / totalSales) * 100
        );
  
        setTimeChartData({
          labels,
          datasets: [
            {
              label: `${selectedDistrict} ${selectedIndustry} 업종 시간대별 매출 비율 (%)`,
              data: dataValues,
              borderColor: "purple",
              backgroundColor: "rgba(128, 0, 128, 0.3)",
              fill: true,
              tension: 0.4,
            },
          ],
        });
      }
    };
  
    return (
      <AnalysisContainer>
        <CountMessage>
          {selectedIndustry} 업종 매출액 비교
        </CountMessage>
        <ChartContainer>
          {chartData && (
            <Line
              data={chartData}
              options={{
                maintainAspectRatio: false,
                scales: {
                  x: {
                    title: {
                      display: true,
                      text: "기준 년분기",
                    },
                  },
                  y: {
                    title: {
                      display: true,
                      text: "평균 매출액 (만원)",
                    },
                  },
                },
              }}
            />
          )}
        </ChartContainer>
        <TrendMessage>시간대별 매출액 비율 (2023년 4분기 기준)</TrendMessage>
        <ChartContainer>
          {timeChartData && (
            <Line
              data={timeChartData}
              options={{
                maintainAspectRatio: false,
                scales: {
                  x: {
                    title: {
                      display: true,
                      text: "시간대",
                    },
                  },
                  y: {
                    title: {
                      display: true,
                      text: "매출 비율 (%)",
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
  
  SalesAnalysis.propTypes = {
    csvPath: PropTypes.string.isRequired,
    selectedDistrict: PropTypes.string.isRequired,
    cityInfo: PropTypes.string.isRequired,
    selectedIndustry: PropTypes.string.isRequired,
  };

export default SalesAnalysis;

const AnalysisContainer = styled.div`
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

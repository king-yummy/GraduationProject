import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useLocation } from "react-router-dom";
import { Bar, Pie } from "react-chartjs-2";
import Papa from "papaparse";
import "chart.js/auto";

const ReportPage = () => {
  const location = useLocation();
  const { cityInfo, selectedDistrict, selectedIndustry } = location.state || {};
  const [chartData, setChartData] = useState(null);
  const [pieData, setPieData] = useState(null);
  const [trendMessage, setTrendMessage] = useState("");

  useEffect(() => {
    fetch("/assets/data/매출.csv")
      .then((response) => response.text())
      .then((text) => {
        Papa.parse(text, {
          header: true,
          complete: (results) => {
            const parsedData = results.data;
            const filteredData = parsedData.filter(
              (row) =>
                row.category20 === selectedIndustry &&
                row.행정동_코드_명 === selectedDistrict
            );

            // 분기별 점포 수 계산
            const storeCounts = filteredData.reduce((acc, curr) => {
              const quarter = curr.기준_년분기_코드;
              acc[quarter] = (acc[quarter] || 0) + parseInt(curr.점포_수, 10);
              return acc;
            }, {});

            const quarters = Object.keys(storeCounts).sort();
            const counts = quarters.map(quarter => storeCounts[quarter]);

            // 점포 수 변동 분석
            let trendMessage = "점포 수 데이터를 분석할 수 없습니다.";
            if (counts.length > 1) {
              const lastCount = counts[counts.length - 1];
              const previousCount = counts[counts.length - 2];
              if (lastCount > previousCount) {
                trendMessage = "점포수가 전분기대비 증가하고 있습니다. 상권이 발달하는 시기인 경우 입지선정에 신중하셔야 합니다.";
              } else if (lastCount === previousCount) {
                trendMessage = "점포수가 전분기대비 정체 상태입니다. 업소수 변동폭이 비교적 작습니다. 추가 개업시 경쟁이 심해지지 않을지 점검하세요.";
              } else {
                trendMessage = "점포수가 전년동기에 비해 감소하고 있습니다. 상권이 쇠퇴하는 시기인 경우 창업에 유의하셔야 합니다.";
              }
            }

            setTrendMessage(trendMessage);

            // 바 차트 데이터 구성
            const chartData = {
              labels: quarters,
              datasets: [
                {
                  label: "점포 수",
                  data: counts,
                  backgroundColor: "rgba(75, 192, 192, 0.2)",
                  borderColor: "rgba(75, 192, 192, 1)",
                  borderWidth: 1,
                },
              ],
            };
            setChartData(chartData);

            // 프랜차이즈와 일반 점포 수 계산
            let franchiseCount = 0;
            let generalCount = 0;

            filteredData.forEach((row) => {
              franchiseCount += parseInt(row.프랜차이즈_점포_수, 10);
              generalCount += parseInt(row.점포_수, 10) - parseInt(row.프랜차이즈_점포_수, 10);
            });

            // 파이차트 데이터 구성
            const pieData = {
              labels: ["일반점포", "프랜차이즈"],
              datasets: [
                {
                  data: [generalCount, franchiseCount],
                  backgroundColor: ["#36A2EB", "#4BC0C0"],
                },
              ],
            };

            setPieData(pieData);
          },
        });
      });
  }, [selectedDistrict, selectedIndustry]);

  return (
    <ReportContainer>
      <Header>
        <h1>{cityInfo?.title} 리포트</h1>
        <p>선택된 동: {selectedDistrict || "전체 동"}</p>
        <p>선택된 업종: {selectedIndustry || "전체 업종"}</p>
      </Header>
      <Content>
        <TrendMessage>{trendMessage}</TrendMessage>
        <ChartContainer>
          {chartData ? <Bar data={chartData} options={{ maintainAspectRatio: false }} /> : <p>데이터를 불러오는 중...</p>}
        </ChartContainer>
        <ChartContainer>
          {pieData ? <Pie data={pieData} options={{ maintainAspectRatio: false }} /> : <p>데이터를 불러오는 중...</p>}
        </ChartContainer>
      </Content>
    </ReportContainer>
  );
};

export default ReportPage;

const ReportContainer = styled.div`
  padding: 20px;
  max-width: 900px;
  margin: auto;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 20px;
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const ChartContainer = styled.div`
  width: 100%;
  height: 400px; // 높이를 적절히 조정할 수 있습니다
  margin-bottom: 20px;
`;

const TrendMessage = styled.p`
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 20px;
  text-align: center;
  color: #333;
`;

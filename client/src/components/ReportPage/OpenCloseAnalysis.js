import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Bar } from "react-chartjs-2";
import styled from "styled-components";
import Papa from "papaparse";

const OpenCloseAnalysis = ({ csvPath, selectedDistrict, selectedIndustry }) => {
  const [openChartData, setOpenChartData] = useState(null);
  const [closeChartData, setCloseChartData] = useState(null);
  const [latestOpenCounts, setLatestOpenCounts] = useState("");
  const [latestCloseCounts, setLatestCloseCounts] = useState("");
  const [changingCountMessage, setChangingCountMessage] = useState("");

  useEffect(() => {
    fetch(csvPath)
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

            const openCounts = filteredData.reduce((acc, curr) => {
              const quarter = curr.기준_년분기_코드;
              acc[quarter] =
                (acc[quarter] || 0) + parseInt(curr.개업_점포_수, 10);
              return acc;
            }, {});

            const closeCounts = filteredData.reduce((acc, curr) => {
              const quarter = curr.기준_년분기_코드;
              acc[quarter] =
                (acc[quarter] || 0) + parseInt(curr.폐업_점포_수, 10);
              return acc;
            }, {});

            const quarters = Object.keys(openCounts).sort();

            const latestOpenCounts =
              openCounts[quarters[quarters.length - 1]] || 0;
            const previousOpenCounts =
              openCounts[quarters[quarters.length - 2]] || 0;
            const latestCloseCounts =
              closeCounts[quarters[quarters.length - 1]] || 0;
            const previousCloseCounts =
              closeCounts[quarters[quarters.length - 2]] || 0;

            setLatestOpenCounts(latestOpenCounts);
            setLatestCloseCounts(latestCloseCounts);

            // 개폐업수 변동 분석
            let changingCountMessage = "점포 수 데이터를 분석할 수 없습니다.";
            if (latestOpenCounts > previousOpenCounts) {
              if (latestCloseCounts > previousCloseCounts) {
                changingCountMessage =
                  "개업 점포 수와 폐업 점포 수가 모두 증가하고 있습니다. 상권 변화가 매우 활발하고 유동적입니다. 입지선정에 유의하세요.";
              } else if (latestCloseCounts < previousCloseCounts) {
                changingCountMessage =
                  "개업 점포 수가 증가하고, 폐업 점포 수가 감소하고 있습니다. 상권이 확장되고 있습니다. 경쟁 관계 변화에 유의하세요.";
              } else {
                changingCountMessage =
                  "개업 점포 수가 증가하고, 폐업 점포 수는 동일합니다. 상권이 성장하는 추세입니다. 기회를 포착하고 시장 진입 전략을 세우세요.";
              }
            } else if (latestOpenCounts < previousOpenCounts) {
              if (latestCloseCounts > previousCloseCounts) {
                changingCountMessage =
                  "개업 점포 수는 감소하고, 폐업 점포 수가 증가하고 있습니다. 상권이 위축되고 있습니다. 입지선정과 사업 리스크 관리에 신중을 기하세요.";
              } else if (latestCloseCounts < previousCloseCounts) {
                changingCountMessage =
                  "개업 점포 수와 폐업 점포 수 모두 감소하고 있습니다. 상권의 활력이 줄어들고 있습니다. 비용 효율화와 시장 수요 변화에 적응할 준비를 하세요.";
              } else {
                changingCountMessage =
                  "개업 점포 수는 감소하고, 폐업 점포 수는 동일합니다. 상권이 안정기인 것 같습니다. 마케팅 활동에 유의하세요.";
              }
            } else {
              if (latestCloseCounts > previousCloseCounts) {
                changingCountMessage =
                  "개업 점포 수는 동일하고, 폐업 점포 수가 증가하고 있습니다. 상권 내 경쟁이 심화되고 있습니다. 기존 업체와의 경쟁력 강화 방안을 마련하세요.";
              } else if (latestCloseCounts < previousCloseCounts) {
                changingCountMessage =
                  "개업 점포 수는 동일하고, 폐업 점포 수가 감소하고 있습니다. 상권 내 안정성이 높아지고 있습니다. 신규 진입에 유리한 시기를 활용하세요.";
              } else {
                changingCountMessage =
                  "개업 점포 수와 폐업 점포 수 모두 동일합니다. 상권의 안정성이 유지되고 있습니다. 안정적인 성장 기회를 찾고 꾸준한 운영을 목표로 하세요.";
              }
            }

            setChangingCountMessage(changingCountMessage);

            const openChartData = {
              labels: quarters,
              datasets: [
                {
                  label: "개업 점포 수",
                  data: quarters.map((quarter) => openCounts[quarter] || 0),
                  backgroundColor: "rgba(54, 162, 235, 0.2)",
                  borderColor: "rgba(54, 162, 235, 1)",
                  borderWidth: 1,
                },
              ],
            };
            setOpenChartData(openChartData);

            const closeChartData = {
              labels: quarters,
              datasets: [
                {
                  label: "폐업 점포 수",
                  data: quarters.map((quarter) => closeCounts[quarter] || 0),
                  backgroundColor: "rgba(255, 99, 132, 0.2)",
                  borderColor: "rgba(255, 99, 132, 1)",
                  borderWidth: 1,
                },
              ],
            };
            setCloseChartData(closeChartData);
          },
        });
      });
  }, [csvPath, selectedDistrict, selectedIndustry]);

  return (
    <div>
      <AnalysisContainer>
        <CountMessage>개업수는 {latestOpenCounts}개 입니다.</CountMessage>
        <TrendMessage>{changingCountMessage}</TrendMessage>
        <ChartContainer>
          {openChartData && (
            <Bar
              data={openChartData}
              options={{ maintainAspectRatio: false }}
            />
          )}
        </ChartContainer>
      </AnalysisContainer>
      <AnalysisContainer>
        <CountMessage>폐업수는 {latestCloseCounts}개 입니다.</CountMessage>
        <TrendMessage>{changingCountMessage}</TrendMessage>
        <ChartContainer>
          {closeChartData && (
            <Bar
              data={closeChartData}
              options={{ maintainAspectRatio: false }}
            />
          )}
        </ChartContainer>
      </AnalysisContainer>
    </div>
  );
};

OpenCloseAnalysis.propTypes = {
  csvPath: PropTypes.string.isRequired,
  selectedDistrict: PropTypes.string.isRequired,
  selectedIndustry: PropTypes.string.isRequired,
};

export default OpenCloseAnalysis;

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

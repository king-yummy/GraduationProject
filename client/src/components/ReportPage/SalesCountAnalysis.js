import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Line } from "react-chartjs-2";
import * as d3 from "d3";
import styled from "styled-components";

const SalesCountAnalysis = ({
  csvPath,
  cityInfo,
  selectedDistrict,
  selectedIndustry,
}) => {
  const [chartData, setChartData] = useState(null);
  const [countMessage, setCountMessage] = useState("");
  const [trendMessage, setTrendMessage] = useState("");

  useEffect(() => {
    d3.csv(csvPath).then((data) => {
      processAndSetData(data, cityInfo, selectedDistrict, selectedIndustry);
    });
  }, [csvPath, cityInfo, selectedDistrict, selectedIndustry]);

  const processAndSetData = (
    data,
    cityInfo,
    selectedDistrict,
    selectedIndustry
  ) => {
    const dataExtracted = data.map((d) => ({
      기준_년분기_코드: +d["기준_년분기_코드"],
      자치구_코드_명: d["자치구_코드_명"],
      행정동_코드_명: d["행정동_코드_명"],
      category20: d["category20"],
      당월_매출_건수: +d["당월_매출_건수"],
      점포_수: +d["점포_수"],
      기준_년분기: `${String(d["기준_년분기_코드"]).slice(0, 4)}년 ${Number(
        String(d["기준_년분기_코드"]).slice(4)
      )}분기`,
    }));

    const cityData = dataExtracted.filter(
      (d) => d["자치구_코드_명"] === cityInfo
    );
    const districtData = cityData.filter(
      (d) =>
        d["행정동_코드_명"] === selectedDistrict &&
        d["category20"] === selectedIndustry
    );

    const meanAll = calculateMeans(dataExtracted, selectedIndustry);
    const meanCity = calculateMeans(cityData, selectedIndustry);

    if (districtData.length > 0) {
      const labels = [...new Set(districtData.map((d) => d["기준_년분기"]))];
      const dataValues = labels.map(
        (label) =>
          districtData
            .filter((d) => d["기준_년분기"] === label)
            .reduce((acc, cur) => acc + cur["당월_매출_건수"], 0) /
          districtData
            .filter((d) => d["기준_년분기"] === label)
            .reduce((acc, cur) => acc + cur["점포_수"], 0)
      );

      setChartData({
        labels,
        datasets: [
          {
            label: "서울시 평균",
            data: meanAll,
            borderColor: "grey",
            fill: false,
          },
          {
            label: `${cityInfo} 평균`,
            data: meanCity,
            borderColor: "orange",
            fill: false,
          },
          {
            label: `${selectedDistrict} 매출 건수`,
            data: dataValues,
            borderColor: "skyblue",
            fill: false,
          },
        ],
      });

      setCountMessage(`서울시, ${cityInfo}, ${selectedDistrict} 매출건수`)

      // 23년 3분기와 4분기의 매출 건수를 비교
      const thirdQuarter = districtData.find(
        (d) => d["기준_년분기_코드"] === 20233
      );
      const fourthQuarter = districtData.find(
        (d) => d["기준_년분기_코드"] === 20234
      );

      if (thirdQuarter && fourthQuarter) {
        const thirdQuarterSales =
          thirdQuarter["당월_매출_건수"] / thirdQuarter["점포_수"];
        const fourthQuarterSales =
          fourthQuarter["당월_매출_건수"] / fourthQuarter["점포_수"];

        if (fourthQuarterSales > thirdQuarterSales) {
          setTrendMessage(
            `${selectedDistrict}의 ${selectedIndustry} 업종 매출 건수가 전분기 대비 증가했습니다. 고객 유입이 활발하니 추가 마케팅 전략을 고려해보세요.`
          );
        } else if (fourthQuarterSales < thirdQuarterSales) {
          setTrendMessage(
            `${selectedDistrict}의 ${selectedIndustry} 업종 매출 건수가 전분기 대비 감소했습니다. 매출 증대를 위해 프로모션과 마케팅 전략을 재검토해보세요.`
          );
        } else {
          setTrendMessage(
            `${selectedDistrict}의 ${selectedIndustry} 업종 매출 건수가 전분기와 동일합니다. 안정적인 매출을 바탕으로 새로운 성장 기회를 모색해보세요.`
          );
        }
      } else {
        setTrendMessage(
          `${selectedDistrict}의 23년 3분기 또는 4분기 데이터가 부족합니다.`
        );
      }
    }
  };

  const calculateMeans = (data, category) => {
    return d3
      .groups(
        data.filter((d) => d["category20"] === category),
        (d) => d["기준_년분기"]
      )
      .map(
        ([key, values]) =>
          values.reduce((acc, cur) => acc + cur["당월_매출_건수"], 0) /
          values.reduce((acc, cur) => acc + cur["점포_수"], 0)
      );
  };

  return (
    <AnalysisContainer>
      <CountMessage>{countMessage}</CountMessage>
      <TrendMessage>{trendMessage}</TrendMessage>
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
                    text: "매출 건수",
                  },
                },
              },
              plugins: {
                tooltip: {
                  callbacks: {
                    label: (context) => `${context.raw} 건`,
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

SalesCountAnalysis.propTypes = {
  csvPath: PropTypes.string.isRequired,
  cityInfo: PropTypes.string.isRequired,
  selectedDistrict: PropTypes.string.isRequired,
  selectedIndustry: PropTypes.string.isRequired,
};

export default SalesCountAnalysis;

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

import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Bar } from "react-chartjs-2";
import * as d3 from "d3";
import styled from "styled-components";

const IncomeAnalysis = ({ csvPath, cityInfo, selectedDistrict }) => {
  const [chartData, setChartData] = useState(null);
  const [countMessage, setCountMessage] = useState("");
  const [trendMessage, setTrendMessage] = useState("");

  useEffect(() => {
    d3.csv(csvPath).then((data) => {
      processAndSetData(data, cityInfo, selectedDistrict);
    });
  }, [csvPath, cityInfo, selectedDistrict]);

  const processAndSetData = (data, cityInfo, selectedDistrict) => {
    const dataExtracted = data.map((d) => ({
      자치구_코드_명: d["자치구_코드_명"],
      행정동_코드_명: d["행정동_코드_명"],
      소득_구간_코드: +d["소득_구간_코드"],
    }));

    const cityData = dataExtracted.filter(
      (d) => d["자치구_코드_명"] === cityInfo
    );

    const districtData = cityData.filter(
      (d) => d["행정동_코드_명"] === selectedDistrict
    );

    const meanCity =
      cityData.reduce((acc, cur) => acc + cur["소득_구간_코드"], 0) /
      cityData.length;

    const meanDistrict =
      districtData.reduce((acc, cur) => acc + cur["소득_구간_코드"], 0) /
      districtData.length;

    const meanCityRounded = Math.ceil(meanCity);
    const meanDistrictRounded = Math.ceil(meanDistrict);
    const meanSeoul = Math.ceil(
      dataExtracted.reduce((acc, cur) => acc + cur["소득_구간_코드"], 0) /
        dataExtracted.length
    );

    setChartData({
      labels: [selectedDistrict, cityInfo, "서울시"],
      datasets: [
        {
          label: `평균 소득 구간`,
          data: [meanDistrictRounded, meanCityRounded, meanSeoul],
          backgroundColor: ["skyblue", "orange", "grey"],
          borderColor: ["deepskyblue", "darkorange", "darkgrey"],
          borderWidth: 1,
        },
      ],
    });

    let countMessage = "";
    countMessage = `${selectedDistrict}의 평균 소득 구간은 ${meanDistrictRounded} 구간입니다.`;

    setCountMessage(countMessage);

    let trendMessage = "";

    if (
      meanDistrictRounded > meanCityRounded &&
      meanDistrictRounded > meanSeoul
    ) {
      trendMessage =
        "소득 수준이 높은 지역입니다. 고급화된 서비스와 프리미엄 제품에 대한 수요가 클 것으로 예상됩니다.";
    } else if (
      meanDistrictRounded < meanCityRounded &&
      meanDistrictRounded < meanSeoul
    ) {
      trendMessage =
        "소득 수준이 상대적으로 낮은 지역입니다. 가성비가 좋은 제품과 실용적인 서비스에 대한 수요가 높을 것으로 예상됩니다.";
    } else if (
      meanDistrictRounded === meanCityRounded &&
      meanDistrictRounded === meanSeoul
    ) {
      trendMessage =
        "평균 소득 수준이 도시 평균과 같습니다. 다양한 고객층을 겨냥한 균형 잡힌 상품 구성을 고려해보세요.";
    } else if (
      meanDistrictRounded > meanCityRounded &&
      meanDistrictRounded === meanSeoul
    ) {
      trendMessage =
        "소득 수준이 도시 평균보다 높고, 서울시 전체 평균과 같습니다. 중고급 제품에 대한 수요가 있을 수 있습니다.";
    } else if (
      meanDistrictRounded === meanCityRounded &&
      meanDistrictRounded > meanSeoul
    ) {
      trendMessage =
        "소득 수준이 도시 평균과 같고, 서울시 전체 평균보다 높습니다. 중고급 제품 및 서비스를 제공해보세요.";
    } else if (
      meanDistrictRounded < meanCityRounded &&
      meanDistrictRounded === meanSeoul
    ) {
      trendMessage =
        "소득 수준이 도시 평균보다 낮고, 서울시 전체 평균과 같습니다. 실용적이고 경제적인 제품을 제공해보세요.";
    } else if (
      meanDistrictRounded === meanCityRounded &&
      meanDistrictRounded < meanSeoul
    ) {
      trendMessage =
        "소득 수준이 도시 평균과 같고, 서울시 전체 평균보다 낮습니다. 경제적인 상품과 서비스를 제공하는 것이 좋습니다.";
    } else if (
      meanDistrictRounded > meanCityRounded &&
      meanDistrictRounded < meanSeoul
    ) {
      trendMessage =
        "소득 수준이 도시 평균보다 높고, 서울시 전체 평균보다 낮습니다. 중간 가격대의 제품과 서비스를 제공해보세요.";
    } else if (
      meanDistrictRounded < meanCityRounded &&
      meanDistrictRounded > meanSeoul
    ) {
      trendMessage =
        "소득 수준이 도시 평균보다 낮고, 서울시 전체 평균보다 높습니다. 중간 가격대의 제품과 서비스를 제공해보세요.";
    }

    setTrendMessage(trendMessage);
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
                    text: "구분",
                  },
                },
                y: {
                  title: {
                    display: true,
                    text: "평균 소득 구간",
                  },
                },
              },
              plugins: {
                tooltip: {
                  callbacks: {
                    label: (context) => `${context.raw} 구간`,
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

IncomeAnalysis.propTypes = {
  csvPath: PropTypes.string.isRequired,
  cityInfo: PropTypes.string.isRequired,
  selectedDistrict: PropTypes.string.isRequired,
};

export default IncomeAnalysis;

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

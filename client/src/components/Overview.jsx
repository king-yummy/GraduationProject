import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import mainSeoul from "../assets/images/mainSeoul.jpg";
import logo from "../assets/images/logo.png"; // 로고 이미지 임포트
import cityData from "../assets/data/updated_data_sorted.json";
import Map from "./seoulMap";
import RankingsList from "./RankingsList";
import populationRankingsData from "../assets/data/유동인구_top10.json";
import salesChangeRankingsData from "../assets/data/매출_변화량_top10_by_category.json";
import NewsBanner from "./NewsBanner"; // 새로 만든 컴포넌트 임포트]

export default function Overview(props) {
  const navigate = useNavigate();
  const [cityId, setCityId] = useState(1);
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState("");
  const [populationRankingsByDay, setPopulationRankingsByDay] = useState({});
  const [salesChangeRankingsByCategory, setSalesChangeRankingsByCategory] =
    useState({});
  const [selectedCategory, setSelectedCategory] =
    useState("개인_소비용품_수리"); // 기본값

  const cityInfo = cityData.find((cityInfo) => cityInfo.id === cityId);

  const industryOptions = [
    "식료품",
    "음식점",
    "소매업",
    "주점업",
    "의류_미용",
    "기타_개인_서비스",
    "보건",
    "음료",
    "교육",
    "스포츠_및_오락관련_서비스업",
  ];

  useEffect(() => {
    if (props.cityId) {
      setCityId(parseInt(props.cityId, 10));
    }
  }, [props.cityId]);

  useEffect(() => {
    setPopulationRankingsByDay(populationRankingsData);
    setSalesChangeRankingsByCategory(salesChangeRankingsData);
  }, []);

  const handleDistrictChange = (event) => {
    setSelectedDistrict(event.target.value);
  };

  const handleIndustryChange = (event) => {
    setSelectedIndustry(event.target.value);
  };

  const handleCategoryChange = (event) => {
    setSelectedCategory(event.target.value);
  };

  const handleReportButtonClick = () => {
    navigate("/report", {
      state: { cityInfo, selectedDistrict, selectedIndustry },
    });
  };

  const handleFranchiseButtonClick = () => {
    navigate("/franchise");
  };

  if (
    Object.keys(populationRankingsByDay).length === 0 ||
    Object.keys(salesChangeRankingsByCategory).length === 0
  ) {
    return <div>로딩 중...</div>;
  }

  return (
    <Section>
      <LogoContainer>
        <img src={logo} />
      </LogoContainer>

      <NewsBanner />

      <FranchiseButton onClick={handleFranchiseButtonClick}>
        프랜차이즈 분석
      </FranchiseButton>

      <div className="districtName">
        <StyledH2 key={cityInfo.id}>{cityInfo.title}</StyledH2>
      </div>

      <div className="rankingsLists">
        <div></div>
        <CategoryWrapper>
          <h3>요일별 유동인구 변화율 순위</h3>
          <RankingsList
            title="요일별 유동인구 변화율 순위"
            rankingsByDay={populationRankingsByDay}
            type="population"
          />
        </CategoryWrapper>
        <CategoryWrapper>
          <h3>카테고리별 매출 변화율 순위</h3>
          <select value={selectedCategory} onChange={handleCategoryChange}>
            {Object.keys(salesChangeRankingsByCategory).map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          <RankingsList
            title={`${selectedCategory} 매출 변화량`}
            rankingsByDay={salesChangeRankingsByCategory[selectedCategory]}
            type="sales"
          />
        </CategoryWrapper>
      </div>

      <div className="contentMap">
        <Map />
      </div>

      <div className="selections">
        <div className="selection">
          <label htmlFor="selectDistrict">동 선택</label>
          <select
            name="selectDistrict"
            id="selectDistrict"
            value={selectedDistrict}
            onChange={handleDistrictChange}
          >
            <option value="" disabled>
              전체 동
            </option>
            {cityInfo.districtOptions &&
              cityInfo.districtOptions.map((district, index) => (
                <option key={index} value={district}>
                  {district}
                </option>
              ))}
          </select>
        </div>

        <div className="selection">
          <label htmlFor="selectIndustry">업종 선택</label>
          <select
            name="selectIndustry"
            id="selectIndustry"
            value={selectedIndustry}
            onChange={handleIndustryChange}
          >
            <option value="" disabled>
              전체 업종
            </option>
            {industryOptions.map((industry, index) => (
              <option key={index} value={industry}>
                {industry}
              </option>
            ))}
          </select>
        </div>
        <div>
          <button className="reportButton" onClick={handleReportButtonClick}>
            리포트 확인
          </button>
        </div>
      </div>
    </Section>
  );
}

const LogoContainer = styled.div`
  position: absolute;
  top: 20px;
  right: 20px; /* 로고를 오른쪽 상단으로 이동 */
  z-index: 1000;

  img {
    width: 170px; /* 로고의 너비를 적절히 조절 */
    height: auto;
  }
`;

const FranchiseButton = styled.button`
  background-color: rgb(52, 235, 101);
  color: #000000;
  text-align: center;
  padding: 10px;
  cursor: pointer;
  font-size: 13px;
  border-radius: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  top: 70px;
  left: 20px; /* 왼쪽 상단으로 위치 변경 */
  z-index: 1000;
  width: auto;
  max-width: 600px;
  box-shadow: 0 0 10px rgba(52, 235, 101, 0.8), 0 0 20px rgba(52, 235, 101, 0.6),
    0 0 30px rgba(52, 235, 101, 0.4);

  &:hover {
    background-color: #1d872d;
  }

  &:before {
    content: "";
    position: absolute;
    top: -10px;
    left: -10px;
    right: -10px;
    bottom: -10px;
    border-radius: 10px;
    background: rgba(52, 235, 101, 0.5);
    filter: blur(20px);
    opacity: 0;
    transition: opacity 0.5s;
  }

  &:hover:before {
    opacity: 1;
  }

  span {
    font-weight: bold;
    animation: neon 1.5s infinite alternate;
  }

  @keyframes neon {
    from {
      text-shadow: 0 0 5px rgba(255, 255, 255, 0.8),
        0 0 10px rgba(52, 235, 101, 0.8), 0 0 15px rgba(52, 235, 101, 0.8),
        0 0 20px rgba(52, 235, 101, 0.8), 0 0 25px rgba(52, 235, 101, 0.8),
        0 0 30px rgba(52, 235, 101, 0.8);
    }
    to {
      text-shadow: 0 0 10px rgba(255, 255, 255, 1),
        0 0 20px rgba(52, 235, 101, 1), 0 0 30px rgba(52, 235, 101, 1),
        0 0 40px rgba(52, 235, 101, 1), 0 0 50px rgba(52, 235, 101, 1),
        0 0 60px rgba(52, 235, 101, 1);
    }
  }
`;

const CategoryWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  margin: 0; /* 위아래 여백 추가 */
  padding: 0;

  h3 {
    color: white;
    padding: 10px;
  }

  select {
    padding: 10px;
    margin-top: 10px;
    width: 100%;
    max-width: 300px;
    border: 1px solid #ccc;
    border-radius: 5px;
    background-color: rgb(255, 255, 255, 0.8);
  }
`;

const StyledH2 = styled.h2`
  font-size: 70px;
  font-weight: 400;
  text-shadow: 0.4rem 0.2rem black;
  letter-spacing: 1.5rem;
  color: #f2f2f2;
  position: relative; /* 가상 요소를 위한 상대 위치 */
  margin-bottom: 40px; /* 콘텐츠와의 간격 */

  &::after {
    content: "";
    position: absolute;
    left: 0;
    bottom: -20px; /* 텍스트 아래의 간격 */
    width: 100%;
    height: 10px;
    border-bottom: 5px dotted white; /* 점선 스타일 */
    border-radius: 50%; /* 점선의 동그란 모양 */
  }
`;

const Section = styled.section`
  display: grid;
  grid-template-areas:
    "districtName districtName"
    "contentMap rankingsLists"
    "selections rankingsLists";

  grid-template-columns: 35% 65%;
  grid-template-rows: 0.4fr 1fr 0.7fr;
  height: 100vh;

  background: linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.6)),
    url(${mainSeoul});

  background-size: cover;
  background-position: center;
  color: white;

  .districtName {
    grid-area: districtName;
    display: flex;
    align-items: start;
    justify-content: center;
    margin-top: 30px;
  }

  .contentMap {
    grid-area: contentMap;
    width: 100%;
    height: 100%;
    justify-content: start;
    display: flex;
    padding: 80px 0px 0px 80px;
    align-items: flex-end;
  }

  .rankingsLists {
    grid-area: rankingsLists;
    display: flex;
    flex-direction: row;
    gap: 0px; /* 리스트 사이의 간격 */
    justify-content: center; /* 중앙 정렬 */
    align-items: flex-start;
    width: 100%; /* 부모 요소의 너비에 맞춰 확장 (패딩 고려) */
    box-sizing: border-box; /* 패딩을 너비에 포함 */
  }

  .selections {
    grid-area: selections;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: flex-end;
    gap: 20px; /* 선택 상자 사이의 간격을 조정합니다. */
    margin-left: 10px;
    margin-bottom: 40px;
  }

  .selection {
    background: rgba(14, 9, 45, 0.8);
    padding: 15px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    border-radius: 5px;
    width: 150px;
  }

  .selection label {
    display: block;
    margin-bottom: 15px; /* 레이블과 선택 상자 사이의 간격을 조정합니다. */
    color: white;
    font-weight: bold;
  }

  .selection select {
    padding: 10px; /* 선택 상자 내부 패딩을 조정합니다. */
    width: 130px;
    background: white;
    border: 1px solid #ccc;
    border-radius: 5px;
  }

  .reportButton {
    width: 100px;
    background: rgba(14, 9, 45, 0.8);
    padding: 10px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    border-radius: 5px;
    color: white;
    font-size: 14px;
    margin-bottom: 30px;
  }
`;

import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import mainSeoul from "../assets/images/mainSeoul.jpg";
import cityData from "../assets/data/updated_data_sorted.json";
import Map from "./seoulMap";
import RankingsList from "./RankingsList";
import populationRankingsData from "../assets/data/유동인구_top10.json";
import salesChangeRankingsData from "../assets/data/매출_변화량_top10_by_category.json";

export default function Overview(props) {
  const navigate = useNavigate();
  const [cityId, setCityId] = useState(1);
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState("");
  const [populationRankingsByDay, setPopulationRankingsByDay] = useState({});
  const [salesChangeRankingsByCategory, setSalesChangeRankingsByCategory] = useState({});
  const [selectedCategory, setSelectedCategory] = useState('개인_소비용품_수리'); // 기본값

  const cityInfo = cityData.find((cityInfo) => cityInfo.id === cityId);

  const industryOptions = [
    '식료품', '음식점', '소매업', '주점업', '의류_미용', '기타_개인_서비스', '보건', '음료', '교육', '스포츠_및_오락관련_서비스업'
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
    navigate("/report", { state: { cityInfo, selectedDistrict, selectedIndustry } });
  };

  if (Object.keys(populationRankingsByDay).length === 0 || Object.keys(salesChangeRankingsByCategory).length === 0) {
    return <div>로딩 중...</div>;
  }

  return (
    <Section>
      <div className="districtName">
        <h2 key={cityInfo.id}>{cityInfo.title}</h2>
      </div>

      <div className="rankingsLists">
        <div>

        </div>
        <CategoryWrapper>
          <h3>요일별 유동인구 변화율 순위</h3>
          <RankingsList title="요일별 유동인구 변화율 순위" rankingsByDay={populationRankingsByDay} type="population" />
        </CategoryWrapper>
        <CategoryWrapper>
          <h3>카테고리별 매출 변화량</h3>
          <select value={selectedCategory} onChange={handleCategoryChange}>
            {Object.keys(salesChangeRankingsByCategory).map((category) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          <RankingsList title={`${selectedCategory} 매출 변화량`} rankingsByDay={salesChangeRankingsByCategory[selectedCategory]} type="sales" />
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

const CategoryWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  margin: 20px 0; /* 위아래 여백 추가 */
  padding: 20px 0;

  h3 {
    margin-bottom: 10px;
    color: white;
  }

  select {
    margin-bottom: 20px;
    padding: 10px;
    width: 100%;
    max-width: 300px;
    border: 1px solid #ccc;
    border-radius: 5px;
    background-color: #fff;
  }
`;


const Section = styled.section`
  display: grid;
  grid-template-areas:
    "districtName districtName"
    "contentMap rankingsLists"
    "selections rankingsLists";

  grid-template-columns: 40% 60%;
  grid-template-rows: 0.7fr 1fr 1fr;
  height: 100vh;

  background: linear-gradient(
      to bottom,
      rgba(20, 27, 46, 0) 0%,
      rgba(20, 27, 46, 0.3) 40%,
      rgba(20, 27, 46, 0.6) 50%,
      rgba(20, 27, 46, 0.8) 95%,
      rgba(20, 27, 46, 1) 100%
    ),
    url(${mainSeoul});

  background-size: cover;
  background-position: center;
  color: white;

  .districtName {
    grid-area: districtName;
    display: flex;
    align-items: center;
    justify-content: center;

    h2 {
      font-size: 5rem;
      font-weight: 400;
      text-shadow: 0.2rem 0.2rem black;
      letter-spacing: 1.5rem;
      color: #f2f2f2;
    }
  }

  .contentMap {
    grid-area: contentMap;
    width: 100%;
    height: 100%;
    justify-content: center;
    display: flex;
  }

  .rankingsLists {
  grid-area: rankingsLists;
  display: flex;
  flex-direction: row;
  gap: 0px; /* 리스트 사이의 간격 */
  justify-content: center; /* 중앙 정렬 */
  align-items: flex-start;
  width: calc(100% - 40px); /* 부모 요소의 너비에 맞춰 확장 (패딩 고려) */
  padding: 20px;
  box-sizing: border-box; /* 패딩을 너비에 포함 */
}

  .selections {
    grid-area: selections;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    gap: 50px; /* 선택 상자 사이의 간격을 조정합니다. */
    margin-left: 50px;
  }

  .selection {
    background: rgba(131, 125, 173, 0.5);
    padding: 15px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    border-radius: 5px;
    width: 200px;
  }

  .selection label {
    display: block;
    margin-bottom: 15px; /* 레이블과 선택 상자 사이의 간격을 조정합니다. */
    color: white;
    font-weight: bold;
  }

  .selection select {
    padding: 10px; /* 선택 상자 내부 패딩을 조정합니다. */
    width: 160px;
    background: white;
    border: 1px solid #ccc;
    border-radius: 5px;
  }

  .reportButton {
    width: 120px;
    background: rgba(131, 125, 173, 0.5);
    padding: 15px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    border-radius: 5px;
    color: white;
    font-size: 14px;
  }

  @media screen and (min-width: 320px) and (max-width: 425px) {
    display: grid;
    grid-template-columns: 1fr;
    width: 100%;
    background: linear-gradient(
        to bottom,
        rgba(20, 27, 46, 0) 0%,
        rgba(20, 27, 46, 0) 25%,
        rgba(20, 27, 46, 0.3) 40%,
        rgba(20, 27, 46, 0.5) 50%,
        rgba(20, 27, 46, 0.6) 95%,
        rgba(20, 27, 46, 1) 100%
      ),
      url(${mainSeoul});

    background-size: cover;
    background-position: center;

    .districtName {
      h2 {
        font-size: 3rem;
        letter-spacing: 0;
      }
    }

    .contentMap {
      svg {
        display: none;
      }
    }

    .rankingsLists {
      grid-area: rankingsLists;
      display: flex;
      flex-direction: row;
      gap: 20px;
      justify-content: space-between; /* 공간 분배로 변경 */
      align-items: flex-start;
      width: 100%; /* 부모 요소의 너비에 맞춤 */
      padding: 0 20px; /* 좌우 패딩을 설정하여 균형 조정 */
      box-sizing: border-box; /* 패딩을 너비에 포함 */
    }

    .rankingsLists > div {
      flex-grow: 1; /* 리스트 항목들이 가능한 만큼 너비를 차지하게 설정 */
    }

    .selections {
      grid-area: selections;
      display: flex;
      flex-direction: row;
      justify-content: center;
      align-items: center;
      gap: 50px; /* 선택 상자 사이의 간격을 조정합니다. */
      margin-left: 50px; /* 좌측 여백 조정 */
    }
  }
`;

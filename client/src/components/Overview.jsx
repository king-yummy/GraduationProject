import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import mainSeoul from "../assets/images/mainSeoul.jpg";
import cityData from "../assets/data/updated_data_sorted.json";
import Map from "./seoulMap";
import NavBar from "./NavBar";
import Selection from "./Selection";
import SearchBar from "./SearchBar";

export const industryOptions = [
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

export const industrySynonyms = {
  식료품: ["식료", "식품", "마트", "슈퍼"],
  음식점: ["식당", "레스토랑", "음식", "먹거리"],
  소매업: ["소매", "잡화점", "상점", "판매"],
  주점업: ["술집", "바", "호프", "주점"],
  의류_미용: ["옷가게", "의류", "미용실", "뷰티"],
  기타_개인_서비스: ["개인 서비스", "기타 서비스", "개인"],
  보건: ["보건", "병원", "의료", "건강"],
  음료: ["카페", "커피숍", "차", "음료수"],
  교육: ["학원", "교육기관", "학교", "교육"],
  스포츠_및_오락관련_서비스업: ["헬스", "스포츠", "오락", "놀이", "레저"],
};

export default function Overview(props) {
  const navigate = useNavigate();
  const [cityId, setCityId] = useState(1);
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState("");

  const cityInfo = cityData.find((cityInfo) => cityInfo.id === cityId);

  useEffect(() => {
    if (props.cityId) {
      setCityId(parseInt(props.cityId, 10));
    }
  }, [props.cityId]);

  const handleDistrictChange = (event) => {
    setSelectedDistrict(event.target.value);
  };

  const handleIndustryChange = (event) => {
    setSelectedIndustry(event.target.value);
  };

  const handleReportButtonClick = () => {
    navigate("/report", {
      state: { cityInfo, selectedDistrict, selectedIndustry },
    });
  };

  const [selectedArea, setSelectedArea] = useState(null);

  const handleAreaClick = (areaId) => {
    setSelectedArea(areaId);
  };

  const parseSearchQuery = (
    query,
    industryOptions,
    cityData,
    industrySynonyms
  ) => {
    const areaRegex = /(\S*동)/; // '동' 추출
    const area = query.match(areaRegex)?.[1] || "";

    // 유사 단어 매핑을 통해 업종 찾기
    const industry = mapToIndustry(query, industrySynonyms);

    // '구' 찾기
    let district = "";
    let cityInfo = null;

    if (Array.isArray(cityData)) {
      cityInfo = cityData.find(
        (city) =>
          Array.isArray(city.districtOptions) &&
          city.districtOptions.includes(area)
      );
    }

    if (cityInfo) {
      district = cityInfo.title; // 해당 '구'의 이름
    }

    return { district, area, industry, cityInfo };
  };

  const handleSearch = (query) => {
    const { district, area, industry, cityInfo } = parseSearchQuery(
      query,
      industryOptions,
      cityData,
      industrySynonyms
    );

    if (!district || !area || !industry) {
      alert(
        "검색어에서 '구', '동', '업종'을 찾을 수 없습니다. 다시 입력해주세요."
      );
      return;
    }

    navigate("/report", {
      state: {
        searchQuery: query,
        selectedDistrict: area,
        selectedIndustry: industry,
        cityInfo,
      },
    });
  };

  const mapToIndustry = (query, industrySynonyms) => {
    for (const [key, synonyms] of Object.entries(industrySynonyms)) {
      if (synonyms.some((synonym) => query.includes(synonym))) {
        return key; // 매핑된 업종 반환
      }
    }
    return ""; // 매핑되지 않을 경우 빈 문자열 반환
  };

  return (
    <Section>
      <div className="navbarWrapper">
        <NavBar />
      </div>
      <div className="mapWrapper">
        <div className="contentMap">
          <Map selectedArea={selectedArea} handleAreaClick={handleAreaClick} />
        </div>
        <SelectionWrap>
          <SelectedAreaDisplay key={cityInfo.id}>
            {cityInfo.title}
          </SelectedAreaDisplay>
          <Selection
            selectedDistrict={selectedDistrict}
            selectedIndustry={selectedIndustry}
            handleDistrictChange={handleDistrictChange}
            handleIndustryChange={handleIndustryChange}
            districtOptions={cityInfo.districtOptions}
            industryOptions={industryOptions}
            handleReportButtonClick={handleReportButtonClick}
          />
        </SelectionWrap>
      </div>
      <div className="searchWrapper">
        <SearchBar onSearch={handleSearch} />
      </div>
    </Section>
  );
}

const Section = styled.section`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.6)),
    url(${mainSeoul});

  .navbarWrapper {
    height: 100px;
    margin-bottom: 5px;
  }

  .mapWrapper {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: end;
    height: 80%;
    padding: 75px 0;
    margin: 20px 30px 10px 30px;
  }

  .contentMap {
    width: auto;
    margin-right: 150px;
  }

  .searchWrapper {
    margin-top: 20px;
    height: 40%;
    padding: 10px;
    margin: 20px 30px;
  }
`;

const SelectionWrap = styled.div`
  display: flex;
  flex-direction: column;
`;

const SelectedAreaDisplay = styled.div`
  display: flex;
  color: white;
  margin: 20px;
  padding: 0 0 0 30px;
  font-size: 40px;
  font-weight: 400;
  text-shadow: 0.4rem 0.2rem black;
  letter-spacing: 0.5rem;
  color: #f2f2f2;
`;

import React from "react";
import styled from "styled-components";

export default function Selection({
  selectedDistrict,
  selectedIndustry,
  handleDistrictChange,
  handleIndustryChange,
  districtOptions,
  industryOptions,
  handleReportButtonClick,
}) {
  return (
    <SelectionWrapper>
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
          {districtOptions &&
            districtOptions.map((district, index) => (
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
    </SelectionWrapper>
  );
}

const SelectionWrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: end;
  width: 430px;

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
    margin-bottom: 15px; /* 레이블과 선택 상자 사이의 간격 */
    color: white;
    font-weight: bold;
  }

  .selection select {
    padding: 10px; /* 선택 상자 내부 패딩 */
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
    /* justify-content: center; */
    align-items: end;
    border-radius: 5px;
    color: white;
    font-size: 14px;
  }
`;

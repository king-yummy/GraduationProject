import React from "react";
import styled from "styled-components";
import mainSeoul from "../assets/images/mainSeoul.jpg";
import { VscListUnordered } from "react-icons/vsc";
import { AiOutlineDollarCircle } from "react-icons/ai";
import { BsPeople } from "react-icons/bs";
import { VscBriefcase } from "react-icons/vsc";
import { BiBuildingHouse } from "react-icons/bi";
import { BsBarChart } from "react-icons/bs";
import cityData from "../assets/data/data.json";
import Map from "./seoulMap";

export default function Overview(props) {
  const cityId = parseInt(props.cityId, 10) || 1;
  const cityInfo = cityData.find((cityInfo) => cityInfo.id === cityId);

  return (
    <Section>
      {/* districtName: 메인페이지 도시이름 */}
      <div className="districtName">
        <h2 key={cityInfo.id}>{cityInfo.title}</h2>
      </div>

      {/* districtTable: 메인페이지 도시별 요약현황 */}
      <div className="districtTable">
        <div className="Table">
          <div className="column">
            <h3>유동인구</h3>
            <p>
              {new Intl.NumberFormat().format(
                Math.floor(cityInfo.content[0] / 1000000)
              )}
              백만명
            </p>
          </div>
          <div className="column">
            <h3>평균매출액</h3>
            <p>
              {new Intl.NumberFormat().format(
                Math.floor(cityInfo.content[1] / 1000000)
              )}
              백만원
            </p>
          </div>
          <div className="column">
            <h3>주거인구</h3>
            <p>
              {new Intl.NumberFormat().format(
                Math.floor(cityInfo.content[0] / 1000000)
              )}
              백만명
            </p>
          </div>
        </div>
        <div className="Table">
          <div className="column">
            <h3>점포수</h3>
            <p>{new Intl.NumberFormat().format(cityInfo.content[3])}개</p>
          </div>
          <div className="column">
            <h3>펑균영업기간</h3>
            <p>
              {new Intl.NumberFormat().format(Math.floor(cityInfo.content[4]))}
              개월
            </p>
          </div>
          <div className="column">
            <h3>창업/폐업률</h3>
            <p>
              <span>
                {new Intl.NumberFormat("ko", {
                  maximumFractionDigits: 2,
                }).format(cityInfo.content[5])}
                /
                {new Intl.NumberFormat("ko", {
                  maximumFractionDigits: 2,
                }).format(cityInfo.content[6])}
              </span>
              %
            </p>
          </div>
        </div>
      </div>

      <div className="contentMap">
        <Map />
      </div>

      <div className="selections">
        <div className="selection">
          <label htmlFor="selectDistrict">상권 선택</label>
          <select name="selectDistrict" id="selectDistrict">
            {/* 옵션들을 여기에 추가합니다. */}
            <option value="" disabled selected>
              전체 상권
            </option>
            <option value="1">건대입구역</option>
            <option value="2">건대입구역 1번</option>
            <option value="3">광진구청</option>
            <option value="4">어린이대공원역4번</option>
            <option value="5">성수초등학교</option>
          </select>
        </div>

        <div className="selection">
          <label htmlFor="selectIndustry">업종 선택</label>
          <select name="selectIndustry" id="selectIndustry">
            {/* 옵션들을 여기에 추가합니다. */}
            <option value="" disabled selected>
              전체 업종
            </option>
            <option value="1">음식점</option>
            <option value="2">주점업</option>
            <option value="3">음료</option>
            <option value="4">의류 및 미용</option>
            <option value="5">소매업 기타</option>
            <option value="6">자동차 및 부품판매업</option>
            <option value="7">도매 및 상품중개업</option>
            <option value="8">교육 서비스업</option>
            <option value="9">보건업</option>
            <option value="10">전문 서비스업</option>
          </select>
        </div>
        <div>
          <button className="reportButton"> > 리포트 확인</button>
        </div>
      </div>

      {/* linkTodetail: 메인페이지 세부 분석 navigation bar */}
      {/* <div className="linkTodetail">
        <ul>
          <li>
            <a href="#summary">
              <VscListUnordered />
              <h3>요약</h3>
            </a>
          </li>
          <li>
            <a href="#revenue">
              <AiOutlineDollarCircle />
              <h3>매출분석</h3>
            </a>
          </li>
          <li>
            <a href="#population">
              <BsPeople />
              <h3>인구분석</h3>
            </a>
          </li>
          <li>
            <a href="#sector">
              <VscBriefcase />
              <h3>업종분석</h3>
            </a>
          </li>
          <li>
            <a href="#facility">
              <BiBuildingHouse />
              <h3>주변시설</h3>
            </a>
          </li>
          <li>
            <a href="#es">
              <BsBarChart />
              <h3>소득/소비</h3>
            </a>
          </li>
        </ul>
      </div> */}
    </Section>
  );
}

const Section = styled.section`
  display: grid;
  grid-template-areas:
    "districtName districtName"
    "districtTable contentMap"
    "selections selections";

  grid-template-columns: 60% 40%;
  grid-template-rows: 1fr 1fr 1fr;
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
    margin-top: 10vh;

    h2 {
      font-size: 5rem;
      font-weight: 400;
      text-shadow: 0.2rem 0.2rem black;
      letter-spacing: 1.5rem;
      color: #f2f2f2;
    }
  }

  .districtTable {
    contain: inline-size;
    grid-area: districtTable;
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: 50px;

    .Table {
      width: 100%;
      display: flex;
      align-items: center;
      flex-direction: row;
      justify-content: center;
      text-shadow: 0.1rem 0.1rem black;
      padding: 2rem;

      .column {
        width: 30%;
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;

        h3 {
          color: #f2e8e8;
          font-size: 1.2rem;
          font-weight: 400;
          margin-bottom: 0.5rem;
        }

        p {
          font-size: 2.2rem;

          span {
            font-size: 2rem;
          }
        }
      }
    }
  }

  .contentMap {
    grid-area: contentMap;
    width: 100%;
    height: 100%;
    margin-top: 50px;
    display: flex;
  }

  .selections {
    width: 500px;
    height: 170px;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    gap: 50px; /* 선택 상자 사이의 간격을 조정합니다. */
    margin-left: 200px;
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

  .linkTodetail {
    /* contain: style layout inline-size; */
    grid-area: linkTodetail;
    display: flex;
    justify-content: center;
    align-items: center;
    padding-bottom: 8vh;
    margin-top: 130px;

    ul {
      display: flex;
      list-style-type: none;
      gap: 7vw;

      li {
        a {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          color: white;
          text-decoration: none;

          svg {
            width: 100%;
            font-size: 2rem;
            transition: 0.3s ease-in-out;
            margin-bottom: 0.3vw;
          }

          h3 {
            font-size: 1rem;
            font-weight: 400;
            transition: 0.3s ease-in-out;
          }

          &:hover {
            svg {
              transform: scale(1.1);
              color: white;
            }

            h3 {
              transform: scale(1.1);
              color: white;
            }
          }
        }
      }
    }
  }

  /* @container (min-witdh: 320px) and (max-width:350) {
            .districtTable {
                font-size: 15px;
            }
    } */

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

    .districtTable {
      display: flex;
      margin: 0;
      padding: 0;
      .Table {
        width: 100%;
        .column {
          h3 {
            color: white;
            font-size: 1rem;
          }

          p {
            font-size: 1.2rem;

            span {
              font-size: 1rem;
            }
          }
        }
      }
    }

    .linkTodetail {
      display: flex;
      justify-content: center;
      align-items: center;
      margin: 0;
      ul {
        gap: 1vw;
        li {
          a {
            h3 {
              font-size: 0.8rem;
            }
          }
        }
      }
    }
  }
`;

import React from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";
import logo from "../assets/images/logo.png"; // 로고 이미지 임포트
import NewsBanner from "./NewsBanner"; // 새로 만든 컴포넌트 임포트
import { useNavigate } from "react-router-dom";

export default function NavBar() {
  const navigate = useNavigate();

  const handleFranchiseButtonClick = () => {
    navigate("/franchise");
  };

  return (
    <Nav>
      <div>
        <LogoContainer>
          <img src={logo} />
        </LogoContainer>
        <NewsBanner />
        <FranchiseButton onClick={handleFranchiseButtonClick}>
          프랜차이즈 정보
        </FranchiseButton>
      </div>
    </Nav>
  );
}

const Nav = styled.div`
  display: flex;
  justify-content: flex-start; /* 왼쪽 정렬 */
  align-items: center;
  width: 100%;
  height: 70px; /* 네비게이션바 높이 */
  position: fixed; 
  top: 0;
  left: 0;
  z-index: 2;
  padding: 0 1rem; /* 네비게이션바 양쪽 패딩 */
  margin-bottom: 
  border-bottom: 2px solid red; /* 빨간색 테두리 */

  @media screen and (max-width: 450px) {
    padding: 0 1rem;
  }
`;

const LogoContainer = styled.div`
  position: absolute;
  top: 10px;
  left: 20px; /* 로고를 오른쪽 상단으로 이동 */
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
  top: 20px;
  right: 20px; /* 왼쪽 상단으로 위치 변경 */
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

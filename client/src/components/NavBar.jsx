import React from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";

export default function NavBar() {
  return (
    <Nav>
      <Logo>
        <Link to="/">
          서울시<span> 상권분석 </span>얼마 벌어?
        </Link>
      </Logo>
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

  @media screen and (max-width: 450px) {
    padding: 0 1rem;
  }
`;

const Logo = styled.div`
  padding: 15px;
  a {
    text-decoration: none;
    color: #ffffff;
    font-size: 1.3rem;
    font-weight: 600;
  }
  span {
    font-weight: 800;
    color: red;
  }
`;

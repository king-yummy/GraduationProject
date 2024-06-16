import React from "react";
import styled from "styled-components";

const getArrow = (changePercentage) => {
  if (changePercentage > 0) {
    return '▲';
  } else if (changePercentage < 0) {
    return '▼';
  }
  return '-';
};

const RankingItem = ({ rank, district, neighborhood, value, changePercentage, type }) => {
  const isIncrease = changePercentage > 0;

  // 유동인구와 매출 데이터를 구분하여 표시
  const displayValue = () => {
    if (type === "population") {
      return `${value.toLocaleString()}명`;
    } else if (type === "sales") {
      return `${value.toLocaleString()} 원`;
    }
    return "N/A";
  };

  return (
    <Item>
      <span>{rank}</span>
      <span>{district}</span>
      <span>{neighborhood}</span>
      <span>{displayValue()}</span>
      <ChangePercentage isIncrease={isIncrease}>
        {getArrow(changePercentage)} {Math.abs(changePercentage).toFixed(2)}%
      </ChangePercentage>
    </Item>
  );
};

export default RankingItem;

const Item = styled.li`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 3px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 5px;
  max-width: 100%;

  span {
    flex: 1;
    text-align: center;
    &:first-child {
      flex: 0.5;
    }
  }
`;

const ChangePercentage = styled.span`
  width: 20%;
  text-align: center;
  color: ${({ isIncrease }) => (isIncrease ? 'rgba(255, 99, 71, 0.7)' : 'rgba(70, 130, 180, 0.7)')};
`;

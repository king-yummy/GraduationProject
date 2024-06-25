import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Overview from './components/Overview';


const CITY_IDS = [
  '11740', '11710', '11680', '11650', '11620', '11590', '11560', '11545',
  '11530', '11500', '11470', '11440', '11410', '11380', '11350', '11320',
  '11305', '11290', '11260', '11230', '11215', '11200', '11170', '11140',
  '11110',
];

export default function App() {
  let { cityId } = useParams();
  const navigate = useNavigate();
  cityId = CITY_IDS.includes(cityId) ? cityId : null;

  useEffect(() => {
    if (!cityId) {
      navigate("/", {replace: true});
    }
  }, [cityId, navigate])

  return (
    <div>
      <Overview cityId={cityId}/>
    </div>
    
  );
}
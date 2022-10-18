import { useEffect } from 'react';

const Home = () => {
  useEffect(() => {
    const request = async () => {
      const API_KEY =
        'UolNVywvsMHemhNmPZ7aXQPmon5gw61Mal8ZfQSMHEb1yyM1WEWTUptrhZXuoltRRJz7baKWcgE0cKAlOjgNEw%3D%3D';
      const url = `http://apis.data.go.kr/1741000/HeatWaveShelter2/getHeatWaveShelterList2?serviceKey=${API_KEY}&pageNo=1&numOfRows=3&type=json&year=2022&areaCd=3023010800&equptype=010`;
      const options = {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      };
      const response = await fetch(url, {
        method: 'POST',
        headers: options,
      }).then(data => data.json());
      response
        .then(res => res.json())
        .then(data => {
          console.log(data);
        });
    };
    request();
  }, []);
  return (
    <div>
      <h1>Home</h1>
    </div>
  );
};

export default Home;

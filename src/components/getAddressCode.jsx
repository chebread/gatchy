const getAddressCode = async ({ name }) => {
  if (name === null) return null;
  const url = `https://apis.data.go.kr/1741000/StanReginCd/getStanReginCdList?serviceKey=UolNVywvsMHemhNmPZ7aXQPmon5gw61Mal8ZfQSMHEb1yyM1WEWTUptrhZXuoltRRJz7baKWcgE0cKAlOjgNEw%3D%3D&locatadd_nm=${name}&type=json`;
  const data = await fetch(url).then(data => data.json());
  const row = data.StanReginCd[1].row[0];
  const sido = row.sido_cd; // 30 (대전시)
  const sgg = row.sgg_cd; // 230 (대덕구)
  const addressCode = `${sido}${sgg}`; // 30 + 230 => 30230
  return addressCode;
};

export default getAddressCode;

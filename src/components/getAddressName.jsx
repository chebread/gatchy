const getAddressName = async ({ position }) => {
  const { lat, lng } = position;
  const GEOCODER_API_KEY = process.env.REACT_APP_GEOCODER_API_KEY;
  const url = `req/address?service=address&request=getAddress&version=2.0&crs=epsg:4326&point=${lng},${lat}&format=json&type=PARCEL&zipcode=false&simple=true&key=${GEOCODER_API_KEY}`;
  const data = await fetch(url, {
    // 지을 요청해야 함! 도로명주소는 요청하지 않음.
    method: 'GET',
    mode: 'cors',
  }).then(data => data.json());
  if (data.response.status === 'OK') {
    const structure = data.response.result[0].structure;
    const cityName = structure.level1;
    const guName = structure.level2;
    const addressName = `${cityName}%20${guName}`;
    return addressName;
  }
  return null;
};

export default getAddressName;

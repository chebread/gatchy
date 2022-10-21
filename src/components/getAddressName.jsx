const getAddressName = async ({ position }) => {
  const { lat, lng } = position;
  const GEOCODER_API_KEY = process.env.REACT_APP_GEOCODER_API_KEY;
  const isDevelopment = process.env.NODE_ENV === 'development';
  const url = `${
    isDevelopment ? '' : 'https://api.vworld.kr/'
  }req/address?service=address&request=getAddress&version=2.0&crs=epsg:4326&point=${lng},${lat}&format=json&type=PARCEL&zipcode=false&simple=true&key=${GEOCODER_API_KEY}`;
  const data = await fetch(url).then(data => data.json());
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

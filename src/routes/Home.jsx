import { useEffect, useState } from 'react';
import { Layer, Source, useMap, Marker } from 'react-map-gl';
import styled from 'styled-components';
import Maps from 'routes/Maps';
import { layer, cluster, countCuster, lineLayer } from 'components/layers';
import flyTo from 'components/flyTo';
import useGeolocation from 'react-hook-geolocation';
import toast from 'react-hot-toast';
import getAddressName from 'components/getAddressName';
import getAddressCode from 'components/getAddressCode';

const Home = () => {
  const mapRef = useMap();
  const [datas, setDatas] = useState([]);
  const [processedData, setProcessedData] = useState({});
  const [isData, setIsData] = useState(false);
  const [mainDatas, setMainDatas] = useState({});
  const [isGeolocation, setIsGeolocation] = useState(false);
  const [isMapLoad, setIsMapLoad] = useState(false);
  const geolocation = useGeolocation({
    enableHighAccuracy: true,
  });
  const [cp, setCp] = useState({
    // current position
    lng: null,
    lat: null,
  });
  const [isMarkerClick, setIsMarkerClick] = useState(false);
  const [clickedMarkerData, setClickedMarkerData] = useState({});
  const [isDirections, setIsDirections] = useState(false);
  const [directionsDatas, setDirectionsDatas] = useState({});
  const [isFocusing, setIsFoucsing] = useState(false);

  const onMapLoad = () => {
    // 맵이 최초로 불러와지면 위치에 포커스합니다
    const { lng, lat } = cp;
    flyTo({ ref: mapRef, lng: lng, lat: lat });
    setIsMapLoad(true); // 맵 로드됨
    // console.log(mapRef.current);
  };

  const onClickMarker = e => {
    // 지도 상에 있는 마커 클릭시
    const feature = e.features[0];
    if (feature) {
      const id = feature.layer.id;
      if (id === 'data') {
        // 마커 클릭!
        const {
          properties: { lng, lat, name, address, cityAddress }, // 표시자 및 청소자 이름 및 청소됨을 알리는 값
        } = feature;
        flyTo({ ref: mapRef, lng: lng, lat: lat });
        // 길찾기 기능 활성화 하기
        // 또한, 다른 길찾기 활성화시 없에기
        if (isDirections) {
          // 기존에 생성된 길찾기 및 데이터들을 없엔다
          setIsMarkerClick(false);
          setClickedMarkerData({});
          setIsDirections(false); // 원래 값으로 되돌림
          setIsFoucsing(false); // 자동 포커싱 비활성화함
        }
        setClickedMarkerData({
          lng: lng,
          lat: lat,
          name: name,
          address: address,
          cityAddress: cityAddress,
        });
        setIsMarkerClick(true);
        return;
      }
      // 클러스터 포커싱!
      const mapboxSource = mapRef.current.getSource('datas');
      const clusterId = feature.properties.cluster_id;
      mapboxSource.getClusterExpansionZoom(clusterId, (err, zoom) => {
        if (err) {
          return;
        }
        const lng = feature.geometry.coordinates[0];
        const lat = feature.geometry.coordinates[1];
        mapRef.current.flyTo({
          center: [lng, lat],
          zoom,
          duration: 500,
        });
      });
    }
  };

  const onClickDirections = async () => {
    // 길찾기
    const { lng, lat, name, address, cityAddress } = clickedMarkerData;
    const start = [cp.lng, cp.lat];
    const end = [lng, lat];
    const data = await fetch(
      `https://api.mapbox.com/directions/v5/mapbox/walking/${start[0]},${start[1]};${end[0]},${end[1]}?steps=true&geometries=geojson&access_token=${process.env.REACT_APP_MAPBOX_API_KEY}`,
      { method: 'GET' }
    ).then(data => data.json());
    // 라인 그릴 데이터로 변환하기
    const routes = data.routes[0].geometry.coordinates;
    const directionDatas = [...routes];
    setDirectionsDatas({
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'LineString',
        coordinates: [...directionDatas],
      },
    }); // 라인 데이터 완료
    setIsDirections(true); // 길찾기 수행함
    setIsFoucsing(true); // 자동 포커싱 활성화 함
    flyTo({ ref: mapRef, lat: cp.lat, lng: cp.lng }); // 또한, 자동 포커싱 해도 바로는 안되니 현재위치로 포커싱함!
  };

  const onClickCp = () => {
    // 자동 줌 해제 및 활성화
    if (isFocusing) {
      setIsFoucsing(false);
      return;
    }
    const { lng, lat } = cp;
    flyTo({ ref: mapRef, lng: lng, lat: lat });
    setIsFoucsing(true); // zoom을 하며 자동 포커싱 함
    // (0): 나침 반 같이 정렬하기!!
  };

  const onClickCancelDirections = () => {
    // 길찾기 취소
    setIsMarkerClick(false);
    setClickedMarkerData({});
    setIsDirections(false); // 원래 값으로 되돌림
    setIsFoucsing(false); // 자동 포커싱 비활성화함
  };

  useEffect(() => {
    // 현재 위치 구하기 (실시간)
    const { longitude, latitude } = geolocation;
    const { lng, lat } = cp;
    const isDifferent = longitude != lng && latitude != lat; // 변경된 위치인지 구하는 변수
    if (isDifferent) {
      // 위치가 변동할때만 현재위치를 재정의함
      const newCurrentPosition = {
        lng: longitude,
        lat: latitude,
      };
      setCp({
        ...newCurrentPosition,
      });
      if (!isGeolocation) {
        setIsGeolocation(true);
      }
      // 자동 포커싱 true시에만 자동 포커싱 함!
      if (isMapLoad) {
        if (isFocusing) {
          // alert('zoom foucsing!');
          flyTo({ ref: mapRef, lng: longitude, lat: latitude });
          // (0): 나침 반 같이 정렬하기!!
        }
      }
    }
  }, [geolocation]);

  useEffect(() => {
    // 데이터 가져오기
    const request = async () => {
      // 여기서 법정동 주소를 가져와야 함
      const addressName = await getAddressName({ position: cp });
      const addressCode = await getAddressCode({ name: addressName });
      if (addressCode === null) {
        toast.error('행정동 수집에서 오류가 발생했습니다');
        return;
      }
      const rawDatas = [];
      let pageNo = 0;
      while (1) {
        pageNo++;
        const OPEN_API_KEY = process.env.REACT_APP_OPEN_API_KEY;
        const url = `http://apis.data.go.kr/1741000/HeatWaveShelter2/getHeatWaveShelterList2?serviceKey=${OPEN_API_KEY}&type=json&year=2022&areaCd=${addressCode}&pageNo=${pageNo}`;
        const data = await fetch(url).then(data => data.json());
        const rawData = [];
        if (data.RESULT) {
          // RESULT를 가지면 에러가 발생한다는 것임
          break;
        } else {
          const raw = data.HeatWaveShelter[1].row;
          raw.map(a => {
            const { lo, la, restaddr, areaNm, restname } = a;
            if ((lo, la, restaddr, areaNm, restname)) {
              const newRawData = {
                lng: lo,
                lat: la,
                address: restaddr, // 대전광역시 대덕구  비래서로  42   (비래동, 삼호아파트)
                cityAddress: areaNm, // 대전광역시 대덕구 비래동
                name: restname, // 삼호(아)경로당
              };
              rawData.push(newRawData);
            }
          });
          rawDatas.push(...rawData);
        }
        setDatas([...datas, ...rawDatas]);
      }
    };
    if (isGeolocation) {
      // console.log('데이터가 로드되었습니다.');
      request();
    }
  }, [isGeolocation]);

  useEffect(() => {
    // 데이터를 가공하기
    const processedData = [];
    datas.map(a => {
      const { lng, lat, name, address, cityAddress } = a;
      const newGeojson = {
        type: 'Feature',
        properties: {
          lng: lng,
          lat: lat,
          address: address, //대전광역시 대덕구  비래서로  42   (비래동, 삼호아파트)
          cityAddress: cityAddress, // 대전광역시 대덕구 비래동
          name: name,
        },
        geometry: {
          type: 'Point',
          coordinates: [lng, lat],
        },
      };
      processedData.push(newGeojson);
    });
    setProcessedData(processedData);
  }, [datas]);

  useEffect(() => {
    // 데이터 2차 가공하기 (데이터를 geojson으로 바꾸어 지도에 뿌리기)
    setMainDatas({
      type: 'FeatureCollection',
      features: processedData,
    });
    setIsData(true);
    // console.log(mainDatas);
  }, [processedData]);

  // JSX
  return isGeolocation && isData ? (
    <FullScreen>
      {isMarkerClick ? <div>{clickedMarkerData.name}</div> : ''}
      <Maps
        ref={mapRef}
        onClick={onClickMarker}
        interactiveLayerIds={[cluster.id, countCuster.id, layer.id]}
        onLoad={onMapLoad}
      >
        <SourceWrapper>
          {/* isMainDatasLoad는 없어도 됨 왜냐면 기본 데이터가 {}이기에 로드 되지 아니함!*/}
          <Source
            id="datas"
            type="geojson"
            data={mainDatas}
            cluster={true}
            clusterMaxZoom={14}
            clusterRadius={50}
          >
            <Layer {...layer} />
            <Layer {...countCuster} />
            <Layer {...cluster} />
          </Source>
          {isDirections ? (
            // 이게 초기화 해야하기에 이렇게 로직을 구성한 것임
            <Source id="directionsDatas" type="geojson" data={directionsDatas}>
              <Layer {...lineLayer}></Layer>
            </Source>
          ) : (
            ''
          )}
        </SourceWrapper>
        <ButtonWrapper>
          {isMarkerClick ? (
            <>
              <Button onClick={onClickCancelDirections}>cancel</Button>
              <Button onClick={onClickDirections}>directions</Button>
            </>
          ) : (
            ''
          )}
          <Button onClick={onClickCp}>
            {isFocusing ? 'unfocusing' : 'focusing'}
          </Button>
        </ButtonWrapper>
        <MarkerWrapper>
          <Marker
            // 현위치 마커
            latitude={cp.lat}
            longitude={cp.lng}
          />
        </MarkerWrapper>
      </Maps>
    </FullScreen>
  ) : (
    'loading'
  );
};

// Styling
const FullScreen = styled.div`
  position: relative;
  height: 100%;
  width: 100%;
  // mapbox 로고 지우기
  .mapboxgl-ctrl-logo {
    display: none;
  }
  // mapbox copyright 로고 지우기
  .mapboxgl-ctrl-attrib {
    display: none;
  }
`;
const SourceWrapper = styled.div``;
const ButtonWrapper = styled.div`
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-end;
`;
const Button = styled.button`
  z-index: 1;
  margin: 15px;
`;
const MarkerWrapper = styled.div``;

export default Home;

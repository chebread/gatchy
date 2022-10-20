import Map from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { forwardRef } from 'react';

const Maps = forwardRef(
  ({ children, onClick, interactiveLayerIds, onLoad }, ref) => {
    const MAPBOX_API_KEY = process.env.REACT_APP_MAPBOX_API_KEY;
    const initView = {
      longitude: 126.97674,
      latitude: 37.575937,
      zoom: 5,
    };
    return (
      <Map
        ref={ref}
        onLoad={onLoad}
        mapboxAccessToken={MAPBOX_API_KEY}
        initialViewState={initView}
        mapStyle="mapbox://styles/haneum/cl9gr9fbp000714qq7bo1bqvq" // mapbox://styles/haneum/cl9grk81g000z15qs17mxc5ya
        onClick={onClick}
        interactiveLayerIds={interactiveLayerIds}
      >
        {children}
      </Map>
    );
  }
);

export default Maps;

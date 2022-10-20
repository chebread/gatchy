const notZoomflyTo = ({ ref, lng, lat }) => {
  ref.current.flyTo({
    center: [lng, lat],
    duration: 500,
  });
};

export default notZoomflyTo;

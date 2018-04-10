// from https://stackoverflow.com/a/26230989/1955997
module.exports = function toGlobal(e) {
    const box = e.getBoundingClientRect();

    const body = document.body;
    const docEl = document.documentElement;

    const scrollTop = window.pageYOffset || docEl.scrollTop || body.scrollTop;
    const scrollLeft = window.pageXOffset || docEl.scrollLeft || body.scrollLeft;

    const clientTop = docEl.clientTop || body.clientTop || 0;
    const clientLeft = docEl.clientLeft || body.clientLeft || 0;

    const top = box.top + scrollTop - clientTop;
    const left = box.left + scrollLeft - clientLeft;

    return { y: Math.round(top), x: Math.round(left) };
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy90b0dsb2JhbC5qcyJdLCJuYW1lcyI6WyJtb2R1bGUiLCJleHBvcnRzIiwidG9HbG9iYWwiLCJlIiwiYm94IiwiZ2V0Qm91bmRpbmdDbGllbnRSZWN0IiwiYm9keSIsImRvY3VtZW50IiwiZG9jRWwiLCJkb2N1bWVudEVsZW1lbnQiLCJzY3JvbGxUb3AiLCJ3aW5kb3ciLCJwYWdlWU9mZnNldCIsInNjcm9sbExlZnQiLCJwYWdlWE9mZnNldCIsImNsaWVudFRvcCIsImNsaWVudExlZnQiLCJ0b3AiLCJsZWZ0IiwieSIsIk1hdGgiLCJyb3VuZCIsIngiXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0FBLE9BQU9DLE9BQVAsR0FBaUIsU0FBU0MsUUFBVCxDQUFrQkMsQ0FBbEIsRUFDakI7QUFDSSxVQUFNQyxNQUFNRCxFQUFFRSxxQkFBRixFQUFaOztBQUVBLFVBQU1DLE9BQU9DLFNBQVNELElBQXRCO0FBQ0EsVUFBTUUsUUFBUUQsU0FBU0UsZUFBdkI7O0FBRUEsVUFBTUMsWUFBWUMsT0FBT0MsV0FBUCxJQUFzQkosTUFBTUUsU0FBNUIsSUFBeUNKLEtBQUtJLFNBQWhFO0FBQ0EsVUFBTUcsYUFBYUYsT0FBT0csV0FBUCxJQUFzQk4sTUFBTUssVUFBNUIsSUFBMENQLEtBQUtPLFVBQWxFOztBQUVBLFVBQU1FLFlBQVlQLE1BQU1PLFNBQU4sSUFBbUJULEtBQUtTLFNBQXhCLElBQXFDLENBQXZEO0FBQ0EsVUFBTUMsYUFBYVIsTUFBTVEsVUFBTixJQUFvQlYsS0FBS1UsVUFBekIsSUFBdUMsQ0FBMUQ7O0FBRUEsVUFBTUMsTUFBTWIsSUFBSWEsR0FBSixHQUFVUCxTQUFWLEdBQXNCSyxTQUFsQztBQUNBLFVBQU1HLE9BQU9kLElBQUljLElBQUosR0FBV0wsVUFBWCxHQUF3QkcsVUFBckM7O0FBRUEsV0FBTyxFQUFFRyxHQUFHQyxLQUFLQyxLQUFMLENBQVdKLEdBQVgsQ0FBTCxFQUFzQkssR0FBR0YsS0FBS0MsS0FBTCxDQUFXSCxJQUFYLENBQXpCLEVBQVA7QUFDSCxDQWpCRCIsImZpbGUiOiJ0b0dsb2JhbC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vIGZyb20gaHR0cHM6Ly9zdGFja292ZXJmbG93LmNvbS9hLzI2MjMwOTg5LzE5NTU5OTdcclxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiB0b0dsb2JhbChlKVxyXG57XHJcbiAgICBjb25zdCBib3ggPSBlLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpXHJcblxyXG4gICAgY29uc3QgYm9keSA9IGRvY3VtZW50LmJvZHlcclxuICAgIGNvbnN0IGRvY0VsID0gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50XHJcblxyXG4gICAgY29uc3Qgc2Nyb2xsVG9wID0gd2luZG93LnBhZ2VZT2Zmc2V0IHx8IGRvY0VsLnNjcm9sbFRvcCB8fCBib2R5LnNjcm9sbFRvcFxyXG4gICAgY29uc3Qgc2Nyb2xsTGVmdCA9IHdpbmRvdy5wYWdlWE9mZnNldCB8fCBkb2NFbC5zY3JvbGxMZWZ0IHx8IGJvZHkuc2Nyb2xsTGVmdFxyXG5cclxuICAgIGNvbnN0IGNsaWVudFRvcCA9IGRvY0VsLmNsaWVudFRvcCB8fCBib2R5LmNsaWVudFRvcCB8fCAwXHJcbiAgICBjb25zdCBjbGllbnRMZWZ0ID0gZG9jRWwuY2xpZW50TGVmdCB8fCBib2R5LmNsaWVudExlZnQgfHwgMFxyXG5cclxuICAgIGNvbnN0IHRvcCA9IGJveC50b3AgKyBzY3JvbGxUb3AgLSBjbGllbnRUb3BcclxuICAgIGNvbnN0IGxlZnQgPSBib3gubGVmdCArIHNjcm9sbExlZnQgLSBjbGllbnRMZWZ0XHJcblxyXG4gICAgcmV0dXJuIHsgeTogTWF0aC5yb3VuZCh0b3ApLCB4OiBNYXRoLnJvdW5kKGxlZnQpIH1cclxufSJdfQ==
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.containsClassName = containsClassName;
exports.distance = distance;
exports.distanceToClosestCorner = distanceToClosestCorner;
exports.inside = inside;
exports.toGlobal = toGlobal;
exports.options = options;
exports.style = style;
/**
 * Whether element contains classname
 * @param {HTMLElement} e
 * @param {string} name
 * @returns {boolean}
 * @private
 */
function containsClassName(e, name) {
    if (e.className) {
        var list = e.className.split(' ');
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
            for (var _iterator = list[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                var entry = _step.value;

                if (entry === name) {
                    return true;
                }
            }
        } catch (err) {
            _didIteratorError = true;
            _iteratorError = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion && _iterator.return) {
                    _iterator.return();
                }
            } finally {
                if (_didIteratorError) {
                    throw _iteratorError;
                }
            }
        }
    }
    return false;
}

/**
 * measure distance between two points
 * @param {number} x1
 * @param {number} y1
 * @param {number} x2
 * @param {number} y2
 */
function distance(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
}

/**
 * find closest distance from UIEvent to a corner of an element
 * @param {number} x
 * @param {number} y
 * @param {HTMLElement} element
 */
function distanceToClosestCorner(x, y, element) {
    var pos = toGlobal(element);
    var topLeft = distance(x, y, pos.x, pos.y);
    var topRight = distance(x, y, pos.x + element.offsetWidth, pos.y);
    var bottomLeft = distance(x, y, pos.x, pos.y + element.offsetHeight);
    var bottomRight = distance(x, y, pos.x + element.offsetWidth, pos.y + element.offsetHeight);
    return Math.min(topLeft, topRight, bottomLeft, bottomRight);
}

/**
 * determine whether the mouse is inside an element
     * @param {HTMLElement} dragging
 * @param {HTMLElement} element
 */
function inside(x, y, element) {
    var pos = toGlobal(element);
    var x1 = pos.x;
    var y1 = pos.y;
    var w1 = element.offsetWidth;
    var h1 = element.offsetHeight;
    return x >= x1 && x <= x1 + w1 && y >= y1 && y <= y1 + h1;
}

/**
 * determines global location of a div
 * from https://stackoverflow.com/a/26230989/1955997
 * @param {HTMLElement} e
 * @returns {PointLike}
 */
function toGlobal(e) {
    var box = e.getBoundingClientRect();

    var body = document.body;
    var docEl = document.documentElement;

    var scrollTop = window.pageYOffset || docEl.scrollTop || body.scrollTop;
    var scrollLeft = window.pageXOffset || docEl.scrollLeft || body.scrollLeft;

    var clientTop = docEl.clientTop || body.clientTop || 0;
    var clientLeft = docEl.clientLeft || body.clientLeft || 0;

    var top = box.top + scrollTop - clientTop;
    var left = box.left + scrollLeft - clientLeft;

    return { y: Math.round(top), x: Math.round(left) };
}

/**
 * @typedef {object} PointLike
 * @property {number} x
 * @property {number} y
 */

/**
 * combines options and default options
 * @param {object} options
 * @param {object} defaults
 * @returns {object} options+defaults
 */
function options(options, defaults) {
    options = options || {};
    for (var option in defaults) {
        options[option] = typeof options[option] !== 'undefined' ? options[option] : defaults[option];
    }
    return options;
}

/**
 * set a style on an element
 * @param {HTMLElement} element
 * @param {string} style
 * @param {(string|string[])} value - single value or list of possible values (test each one in order to see if it works)
 */
function style(element, style, value) {
    if (Array.isArray(value)) {
        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
            for (var _iterator2 = value[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                var entry = _step2.value;

                element.style[style] = entry;
                if (element.style[style] === entry) {
                    break;
                }
            }
        } catch (err) {
            _didIteratorError2 = true;
            _iteratorError2 = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion2 && _iterator2.return) {
                    _iterator2.return();
                }
            } finally {
                if (_didIteratorError2) {
                    throw _iteratorError2;
                }
            }
        }
    } else {
        element.style[style] = value;
    }
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy91dGlscy5qcyJdLCJuYW1lcyI6WyJjb250YWluc0NsYXNzTmFtZSIsImRpc3RhbmNlIiwiZGlzdGFuY2VUb0Nsb3Nlc3RDb3JuZXIiLCJpbnNpZGUiLCJ0b0dsb2JhbCIsIm9wdGlvbnMiLCJzdHlsZSIsImUiLCJuYW1lIiwiY2xhc3NOYW1lIiwibGlzdCIsInNwbGl0IiwiZW50cnkiLCJ4MSIsInkxIiwieDIiLCJ5MiIsIk1hdGgiLCJzcXJ0IiwicG93IiwieCIsInkiLCJlbGVtZW50IiwicG9zIiwidG9wTGVmdCIsInRvcFJpZ2h0Iiwib2Zmc2V0V2lkdGgiLCJib3R0b21MZWZ0Iiwib2Zmc2V0SGVpZ2h0IiwiYm90dG9tUmlnaHQiLCJtaW4iLCJ3MSIsImgxIiwiYm94IiwiZ2V0Qm91bmRpbmdDbGllbnRSZWN0IiwiYm9keSIsImRvY3VtZW50IiwiZG9jRWwiLCJkb2N1bWVudEVsZW1lbnQiLCJzY3JvbGxUb3AiLCJ3aW5kb3ciLCJwYWdlWU9mZnNldCIsInNjcm9sbExlZnQiLCJwYWdlWE9mZnNldCIsImNsaWVudFRvcCIsImNsaWVudExlZnQiLCJ0b3AiLCJsZWZ0Iiwicm91bmQiLCJkZWZhdWx0cyIsIm9wdGlvbiIsInZhbHVlIiwiQXJyYXkiLCJpc0FycmF5Il0sIm1hcHBpbmdzIjoiOzs7OztRQU9nQkEsaUIsR0FBQUEsaUI7UUF1QkFDLFEsR0FBQUEsUTtRQVdBQyx1QixHQUFBQSx1QjtRQWdCQUMsTSxHQUFBQSxNO1FBZUFDLFEsR0FBQUEsUTtRQStCQUMsTyxHQUFBQSxPO1FBZ0JBQyxLLEdBQUFBLEs7QUF2SGhCOzs7Ozs7O0FBT08sU0FBU04saUJBQVQsQ0FBMkJPLENBQTNCLEVBQThCQyxJQUE5QixFQUNQO0FBQ0ksUUFBSUQsRUFBRUUsU0FBTixFQUNBO0FBQ0ksWUFBTUMsT0FBT0gsRUFBRUUsU0FBRixDQUFZRSxLQUFaLENBQWtCLEdBQWxCLENBQWI7QUFESjtBQUFBO0FBQUE7O0FBQUE7QUFFSSxpQ0FBa0JELElBQWxC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ckM7O0FBRUEsV0FBTyxFQUFFeEIsR0FBR0osS0FBSytCLEtBQUwsQ0FBV0YsR0FBWCxDQUFMLEVBQXNCMUIsR0FBR0gsS0FBSytCLEtBQUwsQ0FBV0QsSUFBWCxDQUF6QixFQUFQO0FBQ0g7O0FBRUQ7Ozs7OztBQU1BOzs7Ozs7QUFNTyxTQUFTMUMsT0FBVCxDQUFpQkEsT0FBakIsRUFBMEI0QyxRQUExQixFQUNQO0FBQ0k1QyxjQUFVQSxXQUFXLEVBQXJCO0FBQ0EsU0FBSyxJQUFJNkMsTUFBVCxJQUFtQkQsUUFBbkIsRUFDQTtBQUNJNUMsZ0JBQVE2QyxNQUFSLElBQWtCLE9BQU83QyxRQUFRNkMsTUFBUixDQUFQLEtBQTJCLFdBQTNCLEdBQXlDN0MsUUFBUTZDLE1BQVIsQ0FBekMsR0FBMkRELFNBQVNDLE1BQVQsQ0FBN0U7QUFDSDtBQUNELFdBQU83QyxPQUFQO0FBQ0g7O0FBRUQ7Ozs7OztBQU1PLFNBQVNDLEtBQVQsQ0FBZWdCLE9BQWYsRUFBd0JoQixLQUF4QixFQUErQjZDLEtBQS9CLEVBQ1A7QUFDSSxRQUFJQyxNQUFNQyxPQUFOLENBQWNGLEtBQWQsQ0FBSixFQUNBO0FBQUE7QUFBQTtBQUFBOztBQUFBO0FBQ0ksa0NBQWtCQSxLQUFsQixtSUFDQTtBQUFBLG9CQURTdkMsS0FDVDs7QUFDSVUsd0JBQVFoQixLQUFSLENBQWNBLEtBQWQsSUFBdUJNLEtBQXZCO0FBQ0Esb0JBQUlVLFFBQVFoQixLQUFSLENBQWNBLEtBQWQsTUFBeUJNLEtBQTdCLEVBQ0E7QUFDSTtBQUNIO0FBQ0o7QUFSTDtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBU0MsS0FWRCxNQVlBO0FBQ0lVLGdCQUFRaEIsS0FBUixDQUFjQSxLQUFkLElBQXVCNkMsS0FBdkI7QUFDSDtBQUNKIiwiZmlsZSI6InV0aWxzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXHJcbiAqIFdoZXRoZXIgZWxlbWVudCBjb250YWlucyBjbGFzc25hbWVcclxuICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZVxyXG4gKiBAcGFyYW0ge3N0cmluZ30gbmFtZVxyXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn1cclxuICogQHByaXZhdGVcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBjb250YWluc0NsYXNzTmFtZShlLCBuYW1lKVxyXG57XHJcbiAgICBpZiAoZS5jbGFzc05hbWUpXHJcbiAgICB7XHJcbiAgICAgICAgY29uc3QgbGlzdCA9IGUuY2xhc3NOYW1lLnNwbGl0KCcgJylcclxuICAgICAgICBmb3IgKGxldCBlbnRyeSBvZiBsaXN0KVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaWYgKGVudHJ5ID09PSBuYW1lKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIGZhbHNlXHJcbn1cclxuXHJcbi8qKlxyXG4gKiBtZWFzdXJlIGRpc3RhbmNlIGJldHdlZW4gdHdvIHBvaW50c1xyXG4gKiBAcGFyYW0ge251bWJlcn0geDFcclxuICogQHBhcmFtIHtudW1iZXJ9IHkxXHJcbiAqIEBwYXJhbSB7bnVtYmVyfSB4MlxyXG4gKiBAcGFyYW0ge251bWJlcn0geTJcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBkaXN0YW5jZSh4MSwgeTEsIHgyLCB5Milcclxue1xyXG4gICAgcmV0dXJuIE1hdGguc3FydChNYXRoLnBvdyh4MSAtIHgyLCAyKSArIE1hdGgucG93KHkxIC0geTIsIDIpKVxyXG59XHJcblxyXG4vKipcclxuICogZmluZCBjbG9zZXN0IGRpc3RhbmNlIGZyb20gVUlFdmVudCB0byBhIGNvcm5lciBvZiBhbiBlbGVtZW50XHJcbiAqIEBwYXJhbSB7bnVtYmVyfSB4XHJcbiAqIEBwYXJhbSB7bnVtYmVyfSB5XHJcbiAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsZW1lbnRcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBkaXN0YW5jZVRvQ2xvc2VzdENvcm5lcih4LCB5LCBlbGVtZW50KVxyXG57XHJcbiAgICBjb25zdCBwb3MgPSB0b0dsb2JhbChlbGVtZW50KVxyXG4gICAgY29uc3QgdG9wTGVmdCA9IGRpc3RhbmNlKHgsIHksIHBvcy54LCBwb3MueSlcclxuICAgIGNvbnN0IHRvcFJpZ2h0ID0gZGlzdGFuY2UoeCwgeSwgcG9zLnggKyBlbGVtZW50Lm9mZnNldFdpZHRoLCBwb3MueSlcclxuICAgIGNvbnN0IGJvdHRvbUxlZnQgPSBkaXN0YW5jZSh4LCB5LCBwb3MueCwgcG9zLnkgKyBlbGVtZW50Lm9mZnNldEhlaWdodClcclxuICAgIGNvbnN0IGJvdHRvbVJpZ2h0ID0gZGlzdGFuY2UoeCwgeSwgcG9zLnggKyBlbGVtZW50Lm9mZnNldFdpZHRoLCBwb3MueSArIGVsZW1lbnQub2Zmc2V0SGVpZ2h0KVxyXG4gICAgcmV0dXJuIE1hdGgubWluKHRvcExlZnQsIHRvcFJpZ2h0LCBib3R0b21MZWZ0LCBib3R0b21SaWdodClcclxufVxyXG5cclxuXHJcbi8qKlxyXG4gKiBkZXRlcm1pbmUgd2hldGhlciB0aGUgbW91c2UgaXMgaW5zaWRlIGFuIGVsZW1lbnRcclxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGRyYWdnaW5nXHJcbiAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsZW1lbnRcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBpbnNpZGUoeCwgeSwgZWxlbWVudClcclxue1xyXG4gICAgY29uc3QgcG9zID0gdG9HbG9iYWwoZWxlbWVudClcclxuICAgIGNvbnN0IHgxID0gcG9zLnhcclxuICAgIGNvbnN0IHkxID0gcG9zLnlcclxuICAgIGNvbnN0IHcxID0gZWxlbWVudC5vZmZzZXRXaWR0aFxyXG4gICAgY29uc3QgaDEgPSBlbGVtZW50Lm9mZnNldEhlaWdodFxyXG4gICAgcmV0dXJuIHggPj0geDEgJiYgeCA8PSB4MSArIHcxICYmIHkgPj0geTEgJiYgeSA8PSB5MSArIGgxfVxyXG5cclxuLyoqXHJcbiAqIGRldGVybWluZXMgZ2xvYmFsIGxvY2F0aW9uIG9mIGEgZGl2XHJcbiAqIGZyb20gaHR0cHM6Ly9zdGFja292ZXJmbG93LmNvbS9hLzI2MjMwOTg5LzE5NTU5OTdcclxuICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZVxyXG4gKiBAcmV0dXJucyB7UG9pbnRMaWtlfVxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHRvR2xvYmFsKGUpXHJcbntcclxuICAgIGNvbnN0IGJveCA9IGUuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KClcclxuXHJcbiAgICBjb25zdCBib2R5ID0gZG9jdW1lbnQuYm9keVxyXG4gICAgY29uc3QgZG9jRWwgPSBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnRcclxuXHJcbiAgICBjb25zdCBzY3JvbGxUb3AgPSB3aW5kb3cucGFnZVlPZmZzZXQgfHwgZG9jRWwuc2Nyb2xsVG9wIHx8IGJvZHkuc2Nyb2xsVG9wXHJcbiAgICBjb25zdCBzY3JvbGxMZWZ0ID0gd2luZG93LnBhZ2VYT2Zmc2V0IHx8IGRvY0VsLnNjcm9sbExlZnQgfHwgYm9keS5zY3JvbGxMZWZ0XHJcblxyXG4gICAgY29uc3QgY2xpZW50VG9wID0gZG9jRWwuY2xpZW50VG9wIHx8IGJvZHkuY2xpZW50VG9wIHx8IDBcclxuICAgIGNvbnN0IGNsaWVudExlZnQgPSBkb2NFbC5jbGllbnRMZWZ0IHx8IGJvZHkuY2xpZW50TGVmdCB8fCAwXHJcblxyXG4gICAgY29uc3QgdG9wID0gYm94LnRvcCArIHNjcm9sbFRvcCAtIGNsaWVudFRvcFxyXG4gICAgY29uc3QgbGVmdCA9IGJveC5sZWZ0ICsgc2Nyb2xsTGVmdCAtIGNsaWVudExlZnRcclxuXHJcbiAgICByZXR1cm4geyB5OiBNYXRoLnJvdW5kKHRvcCksIHg6IE1hdGgucm91bmQobGVmdCkgfVxyXG59XHJcblxyXG4vKipcclxuICogQHR5cGVkZWYge29iamVjdH0gUG9pbnRMaWtlXHJcbiAqIEBwcm9wZXJ0eSB7bnVtYmVyfSB4XHJcbiAqIEBwcm9wZXJ0eSB7bnVtYmVyfSB5XHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIGNvbWJpbmVzIG9wdGlvbnMgYW5kIGRlZmF1bHQgb3B0aW9uc1xyXG4gKiBAcGFyYW0ge29iamVjdH0gb3B0aW9uc1xyXG4gKiBAcGFyYW0ge29iamVjdH0gZGVmYXVsdHNcclxuICogQHJldHVybnMge29iamVjdH0gb3B0aW9ucytkZWZhdWx0c1xyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIG9wdGlvbnMob3B0aW9ucywgZGVmYXVsdHMpXHJcbntcclxuICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9XHJcbiAgICBmb3IgKGxldCBvcHRpb24gaW4gZGVmYXVsdHMpXHJcbiAgICB7XHJcbiAgICAgICAgb3B0aW9uc1tvcHRpb25dID0gdHlwZW9mIG9wdGlvbnNbb3B0aW9uXSAhPT0gJ3VuZGVmaW5lZCcgPyBvcHRpb25zW29wdGlvbl0gOiBkZWZhdWx0c1tvcHRpb25dXHJcbiAgICB9XHJcbiAgICByZXR1cm4gb3B0aW9uc1xyXG59XHJcblxyXG4vKipcclxuICogc2V0IGEgc3R5bGUgb24gYW4gZWxlbWVudFxyXG4gKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbGVtZW50XHJcbiAqIEBwYXJhbSB7c3RyaW5nfSBzdHlsZVxyXG4gKiBAcGFyYW0geyhzdHJpbmd8c3RyaW5nW10pfSB2YWx1ZSAtIHNpbmdsZSB2YWx1ZSBvciBsaXN0IG9mIHBvc3NpYmxlIHZhbHVlcyAodGVzdCBlYWNoIG9uZSBpbiBvcmRlciB0byBzZWUgaWYgaXQgd29ya3MpXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gc3R5bGUoZWxlbWVudCwgc3R5bGUsIHZhbHVlKVxyXG57XHJcbiAgICBpZiAoQXJyYXkuaXNBcnJheSh2YWx1ZSkpXHJcbiAgICB7XHJcbiAgICAgICAgZm9yIChsZXQgZW50cnkgb2YgdmFsdWUpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBlbGVtZW50LnN0eWxlW3N0eWxlXSA9IGVudHJ5XHJcbiAgICAgICAgICAgIGlmIChlbGVtZW50LnN0eWxlW3N0eWxlXSA9PT0gZW50cnkpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBlbHNlXHJcbiAgICB7XHJcbiAgICAgICAgZWxlbWVudC5zdHlsZVtzdHlsZV0gPSB2YWx1ZVxyXG4gICAgfVxyXG59Il19
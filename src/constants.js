/* global THREE */

const ARENAColors = {
    text: new THREE.Color(0x3c3c3c),
    bg: new THREE.Color(0xf3f3f3),
};

const ARENALayout = {
    containerPadding: 0.025,
    borderRadius: 0.05,
    textImageRatio: 0.5, // ratio of text to image width
};

const EVENTS = {
    INTERSECT: 'raycaster-intersected',
    INTERSECTION: 'raycaster-intersection',
    INTERSECT_CLEAR: 'raycaster-intersected-cleared',
    INTERSECTION_CLEAR: 'raycaster-intersection-cleared',
    INTERSECTION_CLOSEST_ENTITY_CHANGED: 'raycaster-closest-entity-changed',
};

export { ARENAColors, ARENALayout, EVENTS };

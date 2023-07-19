/* global AFRAME */

import ThreeMeshUI from 'three-mesh-ui';
import FontJSON from './fonts/Roboto-msdf.json';
import FontImage from './fonts/Roboto-msdf.png';

import './click-listener';
import './buttons';
import './card';

AFRAME.registerSystem('arena-ui', {
    init() {
        ThreeMeshUI.FontLibrary.prepare(
            ThreeMeshUI.FontLibrary.addFontFamily('Roboto').addVariant('400', 'normal', FontJSON, FontImage),
        ).then(() => {
            // console.log('Roboto font loaded');
        });
    },
    tick() {
        ThreeMeshUI.update();
    },
});

/**
 * Copy contents of one array to another without allocating new array.
 */
function copyArray(a, b) {
    let i;
    a.length = b.length;
    for (i = 0; i < b.length; i++) {
        a[i] = b[i];
    }
}

const EVENTS = {
    INTERSECT: 'raycaster-intersected',
    INTERSECTION: 'raycaster-intersection',
    INTERSECT_CLEAR: 'raycaster-intersected-cleared',
    INTERSECTION_CLEAR: 'raycaster-intersection-cleared',
    INTERSECTION_CLOSEST_ENTITY_CHANGED: 'raycaster-closest-entity-changed',
};

AFRAME.components.raycaster.Component.prototype.checkIntersections = function checkIntersections() {
    const { clearedIntersectedEls } = this;
    const { el } = this;
    const { data } = this;
    let i;
    const { intersectedEls } = this;
    let intersection;
    const { intersections } = this;
    const { newIntersectedEls } = this;
    const { newIntersections } = this;
    const { prevIntersectedEls } = this;
    const { rawIntersections } = this;

    // Refresh the object whitelist if needed.
    if (this.dirty) {
        this.refreshObjects();
    }

    // Store old previously intersected entities.
    copyArray(this.prevIntersectedEls, this.intersectedEls);

    // Raycast.
    this.updateOriginDirection();
    rawIntersections.length = 0;
    this.raycaster.intersectObjects(this.objects, true, rawIntersections);

    // Only keep intersections against objects that have a reference to an entity.
    intersections.length = 0;
    intersectedEls.length = 0;
    for (i = 0; i < rawIntersections.length; i++) {
        intersection = rawIntersections[i];
        // Don't intersect with own line.
        if (data.showLine && intersection.object === el.getObject3D('line')) {
            continue;
        }
        if (intersection.object.name === 'UIBackgroundBox') {
            if (intersection.object.parent?.isMeshUIButton) {
                console.log('UI Button intersected', intersection.object.parent.name);
                intersections.push(intersection);
                intersectedEls.push(intersection.object.parent.el);
            }
        } else if (intersection.object.el) {
            intersections.push(intersection);
            intersectedEls.push(intersection.object.el);
        }
    }

    // Get newly intersected entities.
    newIntersections.length = 0;
    newIntersectedEls.length = 0;
    for (i = 0; i < intersections.length; i++) {
        if (prevIntersectedEls.indexOf(intersections[i].object.el) === -1) {
            newIntersections.push(intersections[i]);
            newIntersectedEls.push(intersections[i].object.el);
        }
    }

    // Emit intersection cleared on both entities per formerly intersected entity.
    clearedIntersectedEls.length = 0;
    for (i = 0; i < prevIntersectedEls.length; i++) {
        if (intersectedEls.indexOf(prevIntersectedEls[i]) !== -1) {
            continue;
        }
        prevIntersectedEls[i].emit(EVENTS.INTERSECT_CLEAR, this.intersectedClearedDetail);
        clearedIntersectedEls.push(prevIntersectedEls[i]);
    }
    if (clearedIntersectedEls.length) {
        el.emit(EVENTS.INTERSECTION_CLEAR, this.intersectionClearedDetail);
    }

    // Emit intersected on intersected entity per intersected entity.
    for (i = 0; i < newIntersectedEls.length; i++) {
        newIntersectedEls[i].emit(EVENTS.INTERSECT, this.intersectedDetail);
    }

    // Emit all intersections at once on raycasting entity.
    if (newIntersections.length) {
        this.intersectionDetail.els = newIntersectedEls;
        this.intersectionDetail.intersections = newIntersections;
        el.emit(EVENTS.INTERSECTION, this.intersectionDetail);
    }

    // Emit event when the closest intersected entity has changed.
    if (
        (prevIntersectedEls.length === 0 && intersections.length > 0) ||
        (prevIntersectedEls.length > 0 && intersections.length === 0) ||
        (prevIntersectedEls.length && intersections.length && prevIntersectedEls[0] !== intersections[0].object.el)
    ) {
        this.intersectionDetail.els = this.intersectedEls;
        this.intersectionDetail.intersections = intersections;
        el.emit(EVENTS.INTERSECTION_CLOSEST_ENTITY_CHANGED, this.intersectionDetail);
    }

    // Update line length.
    if (data.showLine) {
        setTimeout(this.updateLine);
    }
};

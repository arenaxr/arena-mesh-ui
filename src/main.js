/* global AFRAME */

import ThreeMeshUI from 'three-mesh-ui';

import './card';

AFRAME.registerSystem('arena-ui', {
    init() {}, // TODO: Init core UI menus
    tick() {
        ThreeMeshUI.update();
    },
});

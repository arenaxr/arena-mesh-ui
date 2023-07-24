/* global AFRAME, THREE */
import ThreeMeshUI from 'three-mesh-ui';
import { ARENAColors } from './constants';

// BUTTONS

// We start by creating objects containing options that we will use with the two buttons,
// in order to write less code.

const buttonOptions = {
    width: 'auto',
    height: 'auto',
    padding: 0.05,
    justifyContent: 'center',
    offset: 0.05,
    margin: 0.02,
    borderRadius: 0.075,
    textAlign: 'center',
};

// Options for component.setupState().
// It must contain a 'state' parameter, which you will refer to with component.setState( 'name-of-the-state' ).

const BUTTONSTATES = {
    default: {
        offset: 0.035,
        backgroundColor: new THREE.Color(0xff0000),
        backgroundOpacity: 0.3,
        color: ARENAColors.text,
        padding: [0.015, 0.05],
    },
    hover: {
        backgroundColor: new THREE.Color(0x0000ff),
    },
    selected: {
        offset: 0.02,
        backgroundColor: new THREE.Color(0x00ff00),
    },
};

const buttonTextOptions = {
    offset: 0,
    padding: [0.015, 0.05],
};

const EVENTS = {
    INTERSECT: 'raycaster-intersected',
    INTERSECT_CLEAR: 'raycaster-intersected-cleared',
};

AFRAME.registerComponent('arena-ui-buttons', {
    buttonMap: {},
    schema: {
        buttons: { type: 'array', default: ['Confirm', 'Cancel'] },
    },

    init() {
        const meshContainer = new THREE.Group();
        meshContainer.position.set(0, 1, -1.9);

        const object3DContainer = new THREE.Object3D();
        this.object3DContainer = object3DContainer;
        object3DContainer.add(meshContainer);
        this.makePanel();
        this.el.setObject3D('mesh', this.object3DContainer);
        this.el.addEventListener('mousedown', this.mouseDownHandler.bind(this));
        this.el.addEventListener('mouseup', this.mouseUpHandler.bind(this));
        this.el.addEventListener(EVENTS.INTERSECT, this.mouseEnterHandler.bind(this));
        this.el.addEventListener(EVENTS.INTERSECT_CLEAR, this.mouseLeaveHandler.bind(this));
    },

    mouseEnterHandler(evt) {
        // console.log('raycaster-entered', evt.detail);
        if ('UIEl' in evt.detail) {
            const hoveredButton = this.buttonMap[evt.detail.UIEl];
            // console.log('enter intersection', hoveredButton);
            if (hoveredButton) {
                hoveredButton.el.set(BUTTONSTATES.hover);
                hoveredButton.prevState = 'default';
                hoveredButton.state = 'hover';
            }
        }
    },
    mouseLeaveHandler(evt) {
        // console.log('raycaster-cleared', evt.detail.clearedUIEls);
        evt.detail.clearedUIEls?.forEach((el) => {
            // console.log('clearing', el.parent.name);
            const hoveredButton = this.buttonMap[el.parent.name];
            if (hoveredButton) {
                hoveredButton.el.set(BUTTONSTATES.default); // Force default state
                hoveredButton.prevState = 'default';
                hoveredButton.state = 'default';
            }
        });
    },

    mouseDownHandler(evt) {
        if ('cursorEl' in evt.detail) {
            // console.log('down', evt.detail);
            const selectedButton = this.buttonMap[evt.detail.intersection?.object.parent.name];
            if (selectedButton) {
                selectedButton.el.set(BUTTONSTATES.selected);
                selectedButton.prevState = 'hover'; // Assume that we are hovering before click
                selectedButton.state = 'selected';
                selectedButton.selector = evt.detail.cursorEl;
            }
        }
    },
    mouseUpHandler(evt) {
        // console.log('up', evt.detail);
        if ('cursorEl' in evt.detail) {
            const curSelectedButton = this.buttonMap[evt.detail.intersection?.object.parent.name];
            // If this is the same button we clicked on, then call its function
            if (curSelectedButton && curSelectedButton.selector === evt.detail.cursorEl) {
                curSelectedButton.clickFn();
            }
            // Clear previously selected button from this cursor in any case
            const prevSelectedButton = Object.values(this.buttonMap).find((b) => b.selector === evt.detail.cursorEl);
            if (prevSelectedButton) {
                prevSelectedButton.el.set(BUTTONSTATES[prevSelectedButton.prevState]);
                prevSelectedButton.prevState = 'default';
                prevSelectedButton.state = 'default';
                prevSelectedButton.selector = undefined;
            }
        }
    },

    makePanel() {
        const { object3DContainer } = this;

        const meshContainer = new THREE.Group();
        meshContainer.position.set(0, 1, -1.9);
        object3DContainer.add(meshContainer);

        let currentMesh = 0;
        const objsToTest = [];

        const sphere = new THREE.Mesh(
            new THREE.IcosahedronGeometry(0.3, 1),
            new THREE.MeshStandardMaterial({ color: 0x3de364, flatShading: true }),
        );

        const box = new THREE.Mesh(
            new THREE.BoxGeometry(0.45, 0.45, 0.45),
            new THREE.MeshStandardMaterial({ color: 0x643de3, flatShading: true }),
        );

        const cone = new THREE.Mesh(
            new THREE.ConeGeometry(0.28, 0.5, 10),
            new THREE.MeshStandardMaterial({ color: 0xe33d4e, flatShading: true }),
        );

        sphere.visible = true;
        box.visible = cone.visible = false;

        meshContainer.add(sphere, box, cone);

        const meshes = [sphere, box, cone];

        function showMesh(id) {
            meshes.forEach((mesh, i) => {
                mesh.visible = i === id;
            });
        }

        const container = new ThreeMeshUI.Block({
            backgroundColor: ARENAColors.bg,
            justifyContent: 'center',
            flexDirection: 'row',
            fontFamily: 'Roboto',
            fontSize: 0.07,
            padding: 0.02,
            borderRadius: 0.11,
        });

        container.position.set(0, 0.6, -1.2);
        container.rotation.x = -0.55;
        object3DContainer.add(container);

        // Buttons creation, with the options objects passed in parameters.

        const buttonNext = new ThreeMeshUI.Block({ ...buttonOptions, name: 'buttonNext' });
        const buttonPrevious = new ThreeMeshUI.Block({ ...buttonOptions, name: 'buttonPrevious' });
        buttonNext.isMeshUIButton = true;
        buttonPrevious.isMeshUIButton = true;

        // Add text to buttons

        buttonNext.add(new ThreeMeshUI.Text({ ...buttonTextOptions, name: 'buttonNext', textContent: 'next' }));
        buttonPrevious.add(
            new ThreeMeshUI.Text({ ...buttonTextOptions, name: 'buttonPrevious', textContent: 'previous' }),
        );

        buttonNext.set(BUTTONSTATES.default);
        buttonPrevious.set(BUTTONSTATES.default);

        this.buttonMap.buttonNext = {
            el: buttonNext,
            clickFn: () => {
                currentMesh = (currentMesh + 1) % 3;
                showMesh(currentMesh);
            },
            state: 'default',
        };
        this.buttonMap.buttonPrevious = {
            el: buttonPrevious,
            clickFn: () => {
                currentMesh -= 1;
                if (currentMesh < 0) currentMesh = 2;
                showMesh(currentMesh);
            },
            state: 'default',
        };

        container.add(buttonPrevious, buttonNext);
        objsToTest.push(buttonNext, buttonPrevious);
    },
});

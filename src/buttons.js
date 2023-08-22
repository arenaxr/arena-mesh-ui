/* global AFRAME, THREE */
import ThreeMeshUI from 'three-mesh-ui';
import { ARENAColors, ARENALayout, ARENATypography, EVENTS } from './constants';

// BUTTONS
const buttonOptions = {
    width: 'auto',
    height: 'auto',
    justifyContent: 'center',
    offset: ARENALayout.buttonDefaultOffset,
    margin: ARENALayout.buttonMargin,
    borderRadius: ARENALayout.buttonBorderRadius,
    textAlign: 'center',
    padding: ARENALayout.buttonPadding,
    backgroundOpacity: ARENAColors.buttonBgOpacity,
    fontSize: ARENATypography.button,
};

const buttonTextOptions = {
    offset: 0,
    padding: ARENALayout.buttonTextPadding,
    color: ARENAColors.buttonText,
};

const BUTTONSTATES = {
    default: {
        offset: ARENALayout.buttonDefaultOffset,
        backgroundColor: ARENAColors.buttonBg,
    },
    hover: {
        offset: ARENALayout.buttonDefaultOffset,
        backgroundColor: ARENAColors.buttonBgHover,
    },
    selected: {
        offset: ARENALayout.buttonDownOffset,
        backgroundColor: ARENAColors.buttonBgSelected,
    },
};

const buttonBase = {
    buttonMap: undefined,
    object3DContainer: undefined,

    init() {
        this.buttonMap = {};
        this.object3DContainer = new THREE.Object3D();
        this.el.setObject3D('mesh', this.object3DContainer); // Make sure to update for AFRAME
        this.el.setAttribute('click-listener-local', 'enabled: true');
        this.registerListeners();
    },

    registerListeners() {
        this.el.addEventListener('mousedown', this.mouseDownHandler.bind(this));
        this.el.addEventListener('mouseup', this.mouseUpHandler.bind(this));
        this.el.addEventListener(EVENTS.INTERSECT, this.mouseEnterHandler.bind(this));
        this.el.addEventListener(EVENTS.INTERSECT_CLEAR, this.mouseLeaveHandler.bind(this));
    },

    unregisterListeners() {
        this.el.removeEventListener('mousedown', this.mouseDownHandler);
        this.el.removeEventListener('mouseup', this.mouseUpHandler);
        this.el.removeEventListener(EVENTS.INTERSECT, this.mouseEnterHandler);
        this.el.removeEventListener(EVENTS.INTERSECT_CLEAR, this.mouseLeaveHandler);
    },

    mouseEnterHandler(evt) {
        if ('UIEl' in evt.detail) {
            const hoveredButton = this.buttonMap[evt.detail.UIEl];
            if (hoveredButton) {
                hoveredButton.el.set(BUTTONSTATES.hover);
                hoveredButton.prevState = 'default';
                hoveredButton.state = 'hover';
            }
        }
    },

    mouseLeaveHandler(evt) {
        evt.detail.clearedUIEls?.forEach((el) => {
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
            const selectedButton = this.buttonMap[evt.detail.intersection?.object.parent.name];
            if (selectedButton) {
                selectedButton.el.set(BUTTONSTATES.selected);
                selectedButton.prevState = selectedButton.state; // Probably hover but may be default w/ touchscreen
                selectedButton.state = 'selected';
                selectedButton.selector = evt.detail.cursorEl;
            }
        }
    },
    mouseUpHandler(evt) {
        if ('cursorEl' in evt.detail) {
            const curSelectedButton = this.buttonMap[evt.detail.intersection?.object.parent.name];
            // If this is the same button we clicked on, then call its function
            if (curSelectedButton && curSelectedButton.selector === evt.detail.cursorEl) {
                curSelectedButton.clickFn(evt.detail);
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

    createButton(buttonName, clickFn) {
        const button = new ThreeMeshUI.Block({ ...buttonOptions, name: buttonName });
        button.isMeshUIButton = true;
        button.add(new ThreeMeshUI.Text({ ...buttonTextOptions, name: buttonName, textContent: buttonName }));
        button.set(BUTTONSTATES.default);
        this.buttonMap[buttonName] = {
            el: button,
            state: 'default',
            clickFn:
                clickFn ??
                (() => {
                    console.log('Clicked', buttonName);
                }),
        };
        return button;
    },

    setClickFn(buttonName, clickFn) {
        const button = this.buttonMap[buttonName];
        if (button) {
            button.clickFn = clickFn;
        }
    },

    remove() {
        this.unregisterListeners();
    },
};

AFRAME.registerComponent('arenaui-button-panel', {
    ...buttonBase,

    buttonContainer: undefined,
    outerContainer: undefined,
    schema: {
        buttons: { type: 'array', default: ['Confirm', 'Cancel'] },
        title: { type: 'string', default: '' },
        vertical: { type: 'boolean', default: false },
        font: { type: 'string', default: 'Roboto' },
        demo: { type: 'boolean', default: false },
    },

    init() {
        const { data } = this;
        buttonBase.init.bind(this)();
        const shadowContainer = new ThreeMeshUI.Block({
            backgroundColor: ARENAColors.textBg,
            backgroundOpacity: ARENAColors.textBgOpacity,
            padding: ARENALayout.containerPadding,
            borderRadius: ARENALayout.borderRadius,
        });
        this.shadowContainer = shadowContainer;
        const buttonOuterContainer = new ThreeMeshUI.Block({
            backgroundSide: THREE.DoubleSide,
            backgroundColor: ARENAColors.bg,
            backgroundOpacity: ARENAColors.bgOpacity,
            alignItems: 'stretch',
            fontFamily: data.font,
            padding: [ARENALayout.containerPadding * 2, ARENALayout.containerPadding],
            borderRadius: ARENALayout.borderRadius,
            flexDirection: 'column',
        });
        this.outerContainer = buttonOuterContainer;
        shadowContainer.add(buttonOuterContainer);
        if (data.title) {
            const title = new ThreeMeshUI.Text({
                textAlign: 'center',
                fontSize: ARENATypography.button,
                margin: ARENALayout.containerPadding * 2,
                color: ARENAColors.buttonText,
                textContent: data.title,
            });
            buttonOuterContainer.add(title);
            this.title = title;
        }
        this.buttonContainer = new ThreeMeshUI.Block({
            alignItems: 'stretch',
            whiteSpace: 'nowrap',
        });
        buttonOuterContainer.add(this.buttonContainer);
        this.object3DContainer.add(shadowContainer);
    },

    update(oldData) {
        const { data, title } = this;
        if (data.buttons !== oldData?.buttons) {
            this.buttonContainer.remove(...Object.values(this.buttonMap).map((b) => b.el));
            this.buttonMap = {};
            // Buttons creation, with the options objects passed in parameters.
            data.buttons.forEach((buttonName) => {
                const button = this.createButton(buttonName);
                this.buttonContainer.add(button);
            });
            this.el.setObject3D('mesh', this.object3DContainer); // Make sure to update for AFRAME
        }
        if (this.data.vertical !== oldData?.vertical) {
            this.buttonContainer.set({ flexDirection: this.data.vertical ? 'column' : 'row' });
        }
        if (data.title !== oldData?.title && title) {
            title.set({ textContent: data.title });
        }
        if (data.font !== oldData?.font) {
            this.outerContainer.set({ fontFamily: data.font });
        }
        // Demo code
        if (data.demo) {
            // Demo stuff
            this.makeDemoPanel();
            this.shadowContainer.position.set(0, 0.6, -1.2);
            this.shadowContainer.rotation.x = -0.55;
        }
    },
    makeDemoPanel() {
        const { object3DContainer } = this;

        const meshContainer = new THREE.Group();
        meshContainer.position.set(0, 1, -1.9);
        object3DContainer.add(meshContainer);

        let currentMesh = 0;

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

        this.setClickFn('Next', () => {
            currentMesh = (currentMesh + 1) % 3;
            showMesh(currentMesh);
        });
        this.setClickFn('Previous', () => {
            currentMesh = (currentMesh + 2) % 3;
            showMesh(currentMesh);
        });
    },
});

export default buttonBase;

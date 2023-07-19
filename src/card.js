/* global AFRAME, THREE */

import ThreeMeshUI from 'three-mesh-ui';
import { ARENAColors, ARENALayout } from './constants';

const borderRadiusLeft = [ARENALayout.borderRadius, 0, 0, ARENALayout.borderRadius];
const borderRadiusRight = [0, ARENALayout.borderRadius, ARENALayout.borderRadius, 0];

AFRAME.registerComponent('arena-ui-card', {
    title: undefined,
    img: undefined,
    imgContainer: undefined,
    body: undefined,
    imgCaption: undefined,
    bodyContainer: undefined,
    schema: {
        title: { type: 'string', default: '' },
        body: { type: 'string', default: '' },
        bodyAlign: { type: 'string', default: 'justify' }, // ['center', 'left', 'right', 'justify']
        img: { type: 'string', default: '' },
        imgCaption: { type: 'string', default: '' },
        imgDirection: { type: 'string', default: 'right' },
        imgSize: { type: 'string', default: 'cover' }, // ['cover', 'contain', 'stretch']
        fontSize: { type: 'number', default: 0.035 },
        widthScale: { type: 'number', default: 1 }, // Scale factor
    },

    init() {
        const {
            data,
            el: { object3D },
        } = this;
        const container = new ThreeMeshUI.Block({
            ref: 'container',
            padding: ARENALayout.containerPadding,
            fontFamily: 'Roboto',
            color: ARENAColors.text,
            backgroundColor: '#000000',
            backgroundOpacity: 0.25,
            borderRadius: ARENALayout.borderRadius,
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
        });

        let imgContainerBlock;
        if (data.img) {
            imgContainerBlock = new ThreeMeshUI.Block({
                width: data.widthScale,
                backgroundColor: ARENAColors.bg,
                backgroundOpacity: 1,
                borderRadius: data.imgDirection === 'right' ? borderRadiusRight : borderRadiusLeft,
            });
            this.imgContainer = imgContainerBlock;

            const imgSubBock = new ThreeMeshUI.Block({
                width: '100%',
                height: '100%',
                borderRadius: ARENALayout.borderRadius,
                textAlign: 'left',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'end',
                backgroundColor: '#FFFFFF',
                backgroundOpacity: 1,
                backgroundSize: data.imgSize,
            });
            this.img = imgSubBock;
            imgContainerBlock.add(imgSubBock);

            new THREE.TextureLoader().load(data.img, (texture) => {
                imgSubBock.set({
                    backgroundImage: texture,
                });
            });

            if (data.imgCaption) {
                const caption = new ThreeMeshUI.Text({
                    width: 'auto',
                    textAlign: 'center',
                    justifyContent: 'center',
                    backgroundColor: ARENAColors.bg,
                    textContent: data.imgCaption,
                    fontSize: data.fontSize,
                    padding: ARENALayout.containerPadding,
                    margin: [0, 0, ARENALayout.containerPadding, 0],
                    borderRadius: ARENALayout.borderRadius / 2,
                });
                imgSubBock.add(caption);
                this.imgCaption = caption;
            }
        }

        let textBorderRadius = ARENALayout.borderRadius;
        if (data.img) {
            textBorderRadius = data.imgDirection === 'right' ? borderRadiusLeft : borderRadiusRight;
        }

        const textContainer = new ThreeMeshUI.Block({
            width: data.img
                ? ARENALayout.textImageRatio * data.widthScale
                : (1 + ARENALayout.textImageRatio) * data.widthScale,
            padding: [0.04, 0.06],
            backgroundColor: ARENAColors.bg,
            backgroundOpacity: 0.8,
            flexDirection: 'column',
            justifyContent: 'space-evenly',
            borderRadius: textBorderRadius,
        });
        this.bodyContainer = textContainer;

        if (data.title) {
            const title = new ThreeMeshUI.Text({
                textAlign: 'center',
                fontSize: data.fontSize * 1.4,
                margin: [0, ARENALayout.containerPadding, ARENALayout.containerPadding, ARENALayout.containerPadding],
                textContent: data.title,
            });
            textContainer.add(title);
            this.title = title;
        }

        const textBody = new ThreeMeshUI.Text({
            width: '100%',
            fontSize: data.fontSize,
            alignItems: 'start',
            textAlign: data.bodyAlign,
            backgroundOpacity: 0,
            textContent: data.body,
        });
        this.body = textBody;

        textContainer.add(textBody);

        const contentContainer = new ThreeMeshUI.Block({
            padding: 0,
            margin: 0,
            flexDirection: 'row',
            alignItems: 'stretch',
        });
        if (data.img) {
            contentContainer.add(textContainer, imgContainerBlock);
            if (data.imgDirection === 'left') {
                contentContainer.set({ flexDirection: 'row-reverse' });
            }
        } else {
            contentContainer.add(textContainer);
        }

        this.container = contentContainer;
        container.add(contentContainer);

        object3D.add(container);
    },

    update(oldData) {
        const { data } = this;
        if (data.title !== oldData.title) {
            this.title.set({ textContent: data.title });
        }
        if (data.body !== oldData.body) {
            this.body.set({ textContent: data.body });
        }
        if (data.img !== oldData.img) {
            new THREE.TextureLoader().load(data.img, (texture) => {
                this.img.set({
                    backgroundImage: texture,
                });
            });
        }
        if (data.imgCaption !== oldData.imgCaption) {
            this.imgCaption.set({ textContent: data.imgCaption });
        }
        if (data.imgDirection !== oldData.imgDirection) {
            if (data.img) {
                this.imgContainer.set({
                    borderRadius:
                        data.imgDirection === 'right'
                            ? [0, ARENALayout.borderRadius, ARENALayout.borderRadius, 0]
                            : [ARENALayout.borderRadius, 0, 0, ARENALayout.borderRadius],
                });

                const textBorderRadius = data.imgDirection === 'right' ? borderRadiusLeft : borderRadiusRight;
                if (data.imgDirection === 'right') {
                    this.container.set({ flexDirection: 'row' });
                } else {
                    this.container.set({ flexDirection: 'row-reverse' });
                }
                this.bodyContainer.set({ borderRadius: textBorderRadius });
            }
        }
        if (data.imgSize !== oldData.imgSize) {
            this.img.set({ backgroundSize: data.imgSize });
        }
        if (data.fontSize !== oldData.fontSize) {
            this.title.set({ fontSize: data.fontSize * 1.4 });
            this.body.set({ fontSize: data.fontSize });
            if (this.img && this.caption) {
                this.caption.set({ fontSize: data.fontSize });
            }
        }
        if (data.widthScale !== oldData.widthScale) {
            this.imgContainer.set({ width: data.widthScale });
            this.body.set({
                width: data.img
                    ? ARENALayout.textImageRatio * data.widthScale
                    : (1 + ARENALayout.textImageRatio) * data.widthScale,
            });
        }
    },
});

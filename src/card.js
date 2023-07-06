/* global AFRAME, THREE */

import ThreeMeshUI from 'three-mesh-ui';
import { ARENAColors, ARENALayout } from './constants';
import FontJSON from './fonts/Roboto-msdf.json';
import FontImage from './fonts/Roboto-msdf.png';

AFRAME.registerComponent('arena-ui-card', {
    container: null,
    title: null,
    schema: {
        title: { type: 'string', default: '' },
        body: { type: 'string', default: '' },
        img: { type: 'string', default: '' },
        imgCaption: { type: 'string', default: '' },
        imgDirection: { type: 'string', default: 'right' },
    },
    init() {
        const {
            data,
            el: { object3D },
        } = this;
        const container = new ThreeMeshUI.Block({
            ref: 'container',
            padding: ARENALayout.containerPadding,
            fontFamily: FontJSON,
            fontTexture: FontImage,
            fontColor: ARENAColors.text,
            backgroundColor: ARENAColors.bg,
            backgroundOpacity: 0.66,
        });

        if (data.title) {
            const title = new ThreeMeshUI.Block({
                height: 0.2,
                width: 1.5,
                justifyContent: 'center',
                fontSize: 0.09,
                margin: 0.025,
                backgroundColor: ARENAColors.bg,
            });
            title.add(
                new ThreeMeshUI.Text({
                    content: data.title,
                }),
            );
            container.add(title);
            container.position.y += 0.2;
            this.title = title;
        }

        const imgSubBlock = new ThreeMeshUI.Block({
            height: 0.95,
            width: 1.0,
            margin: 0.025,
            padding: 0.025,
            textAlign: 'left',
            justifyContent: 'end',
        });

        const caption = new ThreeMeshUI.Block({
            height: 0.07,
            width: 0.37,
            textAlign: 'center',
            justifyContent: 'center',
            backgroundColor: ARENAColors.bg,
        });

        caption.add(
            new ThreeMeshUI.Text({
                content: "Look it's a robot",
                fontSize: 0.04,
            }),
        );

        imgSubBlock.add(caption);

        const textBlock = new ThreeMeshUI.Block({
            margin: 0.025,
            padding: 0.035,
            height: 0.95,
            backgroundColor: ARENAColors.bg,
        });

        const textSubBlock = new ThreeMeshUI.Block({
            height: 0.93,
            width: 0.5,
            fontSize: 0.04,
            alignItems: 'start',
            textAlign: 'justify',
            backgroundOpacity: 0,
        }).add(
            new ThreeMeshUI.Text({
                content: data.body,
            }),
        );

        textBlock.add(textSubBlock);

        //

        const contentContainer = new ThreeMeshUI.Block({
            contentDirection: 'row',
            padding: 0.02,
            margin: 0.025,
            backgroundOpacity: 0,
        });
        if (data.imgDirection === 'right') {
            contentContainer.add(textBlock, imgSubBlock);
        } else {
            contentContainer.add(imgSubBlock, textBlock);
        }
        container.add(contentContainer);

        //

        new THREE.TextureLoader().load(data.img, (texture) => {
            imgSubBlock.set({
                backgroundTexture: texture,
            });
        });

        object3D.add(container);
        this.container = container;
    },
});

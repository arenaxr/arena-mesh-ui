/* global AFRAME, ARENA */

/**
 * @fileoverview Component to listen for mouse events and publish corresponding events
 *
 * Open source software under the terms in /LICENSE
 * Copyright (c) 2020, The CONIX Research Center. All rights reserved.
 * @date 2020
 */

/**
 * Keep track of mouse events and publish corresponding events
 * @module click-listener
 */
AFRAME.registerComponent('click-listener', {
    schema: {
        bubble: { type: 'boolean', default: true },
        enabled: { type: 'boolean', default: true },
        default: true,
    },

    init() {
        this.mouseHandler = this.mouseHandler.bind(this);
    },

    update(oldData) {
        if (this.data && !oldData) {
            this.registerListeners();
        } else if (!this.data && oldData) {
            this.unregisterListeners();
        }
    },
    remove() {
        this.unregisterListeners();
    },
    registerListeners() {
        this.el.addEventListener('mousedown', this.mouseHandler);
        this.el.addEventListener('mouseup', this.mouseHandler);
        // this.el.addEventListener('mouseenter', this.mouseHandler);
        // this.el.addEventListener('mouseleave', this.mouseHandler);
    },
    unregisterListeners() {
        this.el.removeEventListener('mousedown', this.mouseHandler);
        this.el.removeEventListener('mouseup', this.mouseHandler);
        this.el.removeEventListener('mouseenter', this.mouseHandler);
        this.el.removeEventListener('mouseleave', this.mouseHandler);
    },
    mouseHandler(evt) {
        if (this.data.bubble === false) {
            evt.stopPropagation();
        }
        if (this.data.enabled === false) return;

        if ('cursorEl' in evt.detail) {
            // original click event; simply publish to MQTT
            // console.log(evt.detail.intersection?.object); // .intersection?.object.parent.name);
        }
    },
});

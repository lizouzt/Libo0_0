## matrix(n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n)的值及其说明

* translate3d(tx,ty,tz)等价于matrix3d(1,0,0,0,0,1,0,0,0,0,1,0,tx,ty,tz,1)
* scale3d(sx,sy,sz)等价于matrix3d(sx,0,0,0,0,sy,0,0,0,0,sz,0,0,0,0,1)
* rotate3d(x,y,z,a)真是得搬出高中数学书好好复习一下了，第四个参数alpha用于sc和sq中

函数|值的说明
```
只有X轴上的旋转，没有扩大缩小、平移
matrix3d(
1,0,0,0,
0,Math.cos(角度值)，Math.sin(-角度值),0,
0,Math.sin(角度值),Math.cos(角度值),0,
0,0,0,1) 

只有Y轴上的旋转，没有扩大缩小、平移
matrix3d(
Math.cos(角度值),0，Math.sin(角度值),0,
0,1,0,0,
Math.sin(-角度值),Math.cos(角度值),0,
0,0,0,1)

只有Z轴上的旋转，没有扩大缩小、平移
matrix3d(
Math.cos(角度值),Math.sin(-角度值),0,0,
Math.sin(角度值),0,Math.cos(角度值),0,0,
0,0,1,0,
0,0,0,1)

只有扩大缩小、没有回转、平移
matrix3d(
sx,0,0,0,
0,sy,0,0,
0,0,sz,0,
0,0,0,1)

只有平移，没有扩大缩小、回转
matrix3d(
1,0,0,0,
0,1,0,0,
0,0,1,0,
tx,ty,tz,1)
```

### DEMO:
```
/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import MatrixMath from 'react-native/Libraries/Utilities/MatrixMath';
import Video from 'react-native-video';
import {
    Platform,
    StyleSheet,
    Text,
    View,
    Image,
    PanResponder,
} from 'react-native';

const WIDTH = config.width;
const HEIGHT = config.height;

export default class rotateView extends Component {
    gesture = {dx: 0, dy: 0}

    constructor (props) {
        super(props);

        this.panResponder = PanResponder.create({
            onMoveShouldSetPanResponder: () => true,
            onPanResponderMove: this.handlePanResponderMove.bind(this),
            onPanResponderRelease: this.handlePanResponderRelease.bind(this),
        });
    }

    handlePanResponderMove (e, gestureState) {
        const { dx: rdx, dy: rdy } = gestureState;
        const origin = { x: 0, y: 0, z: WIDTH/2 };

        let dx = this.gesture.dx + (rdx || 0);
        let dy = this.gesture.dy + (rdy || 0);

        let matrix = rotateXY(dx, dy);
        transformOrigin(matrix, origin);
        this.refViewFront.setNativeProps({style: {transform: [{perspective: 1000}, {matrix: matrix}]}});

        matrix = rotateXY(dx + 180, dy);
        transformOrigin(matrix, origin);
        this.refViewBack.setNativeProps({style: {transform: [{perspective: 1000}, {matrix: matrix}]}});

        matrix = rotateXY(dx + 90, dy);
        transformOrigin(matrix, origin);
        this.refViewRight.setNativeProps({style: {transform: [{perspective: 1000}, {matrix: matrix}]}});

        matrix = rotateXY(dx - 90, dy);
        transformOrigin(matrix, origin);
        this.refViewLeft.setNativeProps({style: {transform: [{perspective: 1000}, {matrix: matrix}]}});
    }

    handlePanResponderRelease (e, gestureState) {
        const { dx: rdx, dy: rdy } = gestureState;

        let dx = this.gesture.dx + (rdx || 0);
        let dy = this.gesture.dy + (rdy || 0);

        this.gesture = {dx, dy};
    }

    renderLeft(color) {
        return (
            <View ref={component => this.refViewRight = component}
                style={[styles.rectangle, (color) ? {backgroundColor: color} : null]}
                {...this.panResponder.panHandlers}>
                <Image source={{uri: 'https://xxx.codoon.com/git/xxxx/dy_02.jpg'}} resizeMode="cover" style={styles.fkCoverItem} />
            </View>
        )
    }

    renderRight(color) {
        return (
            <View ref={component => this.refViewLeft = component}
                style={[styles.rectangle, (color) ? {backgroundColor: color} : null]}
                {...this.panResponder.panHandlers}>
                <Image source={{uri: 'https://xxx.codoon.com/git/xxxx/dy_03.jpg'}} resizeMode="cover" style={styles.fkCoverItem} />
            </View>
        )
    }

    renderFront(color) {
        return (
            <View ref={component => this.refViewFront = component}
                style={[styles.rectangle, (color) ? {backgroundColor: color} : null]}
                {...this.panResponder.panHandlers}>
                <Image source={{uri: 'https://xxx.codoon.com/git/xxxx/dy_06.jpg'}} resizeMode="cover" style={styles.fkCoverItem} />
            </View>
        )
    }

    renderBack(color) {
        return (
            <View ref={component => this.refViewBack = component}
                style={[styles.rectangle, (color) ? {backgroundColor: color} : null]}
                {...this.panResponder.panHandlers}>
                <Image source={{uri: 'https://xxx.codoon.com/git/xxxx/dy_05.jpg'}} resizeMode="cover" style={styles.fkCoverItem} />
            </View>
        )
    }

    render() {
        return (
            <View style={styles.container}>
                {this.renderFront('#4c72e0')}
                {this.renderBack('#8697df')}
                {this.renderLeft('#b5bce2')}
                {this.renderRight('#e5afb9')}
            </View>
        )
    }
}

function transformOrigin(matrix, origin) {
    const { x, y, z } = origin;

    const translate = MatrixMath.createIdentityMatrix();
    MatrixMath.reuseTranslate3dCommand(translate, x, y, z);
    MatrixMath.multiplyInto(matrix, translate, matrix);

    const untranslate = MatrixMath.createIdentityMatrix();
    MatrixMath.reuseTranslate3dCommand(untranslate, -x, -y, -z);
    MatrixMath.multiplyInto(matrix, matrix, untranslate);
}

export const rotateXY = (dx, dy) => {
    const radX = (Math.PI / 180) * dy;
    const cosX = Math.cos(radX);
    const sinX = Math.sin(radX);

    const radY = (Math.PI / 180) * -dx;
    const cosY= Math.cos(radY);
    const sinY = Math.sin(radY);

    return [
        cosY, sinX * sinY, cosX * sinY, 0,
        0, cosX, -sinX, 0,
        -sinY, cosY * sinX, cosX * cosY, 0,
        0, 0, 0, 1
    ];
};

export const rotateXZ = (dx, dy) => {
    const radX = (Math.PI / 180) * dx;
    const cosX = Math.cos(radX);
    const sinX = Math.sin(radX);

    const radY = (Math.PI / 180) * dy;
    const cosY= Math.cos(radY);
    const sinY = Math.sin(radY);

    return [
        cosX, -cosY * sinX, sinX * sinY, 0,
        sinX, cosX * cosY, -sinY * cosX, 0,
        0, sinY, cosY, 0,
        0, 0, 0, 1
    ];
};

const styles = {
    container: {
        position: 'absolute',
        left: config.width/2 - WIDTH/2,
        top: config.height/2 - HEIGHT/2,
        width: WIDTH,
        height: HEIGHT,
        backgroundColor: "transparent"
    },
    rectangle: {
        position: 'absolute',
        left: 0,
        top: 0,
        width: WIDTH,
        height: HEIGHT,
        zIndex: 10
    },
    fkCoverItem: {
        height: HEIGHT,
        width: WIDTH,
    }
}
```

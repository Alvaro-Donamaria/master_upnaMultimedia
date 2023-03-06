import * as THREE from 'three';

import { VRButton } from 'three/addons/webxr/VRButton.js';

import { XRControllerModelFactory } from 'three/addons/webxr/XRControllerModelFactory.js';

let container;
let camera, scene, renderer;
let controller1, controller2;
let controllerGrip1, controllerGrip2;

let firstPoint = null;
let secondPoint = null;


const pointGeometry = new THREE.SphereGeometry( 0.01, 32, 32 );
const pointMaterial = new THREE.MeshStandardMaterial({
    color: 0xff0000
});


init();
animate();

function init() {

    container = document.createElement( 'div' );
    document.body.appendChild( container );

    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0x808080 );

    camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 0.1, 10 );
    camera.position.set( 0, 1.6, 3 );

    const floorGeometry = new THREE.PlaneGeometry( 4, 4 );
    const floorMaterial = new THREE.MeshStandardMaterial( {
            color: 0xeeeeee,
            roughness: 1.0,
            metalness: 0.0
    } );
    const floor = new THREE.Mesh( floorGeometry, floorMaterial );
    floor.rotation.x = - Math.PI / 2;
    floor.receiveShadow = true;
    scene.add( floor );

    scene.add( new THREE.HemisphereLight( 0x808080, 0x606060 ) );

    const light = new THREE.DirectionalLight( 0xffffff );
    light.position.set( 0, 6, 0 );
    light.castShadow = true;
    light.shadow.camera.top = 2;
    light.shadow.camera.bottom = - 2;
    light.shadow.camera.right = 2;
    light.shadow.camera.left = - 2;
    light.shadow.mapSize.set( 4096, 4096 );
    scene.add( light );

    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.shadowMap.enabled = true;
    renderer.xr.enabled = true;
    container.appendChild( renderer.domElement );

    document.body.appendChild( VRButton.createButton( renderer ) );

    // controllers

    controller1 = renderer.xr.getController( 0 );
    controller1.addEventListener( 'selectstart', onSelectStart );
    scene.add( controller1 );

    controller2 = renderer.xr.getController( 1 );
    controller2.addEventListener( 'selectstart', onSelectStart );
    scene.add( controller2 );

    const controllerModelFactory = new XRControllerModelFactory();

    controllerGrip1 = renderer.xr.getControllerGrip( 0 );
    controllerGrip1.add( controllerModelFactory.createControllerModel( controllerGrip1 ) );
    scene.add( controllerGrip1 );

    controllerGrip2 = renderer.xr.getControllerGrip( 1 );
    controllerGrip2.add( controllerModelFactory.createControllerModel( controllerGrip2 ) );
    scene.add( controllerGrip2 );

    window.addEventListener( 'resize', onWindowResize );

}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

}

function onSelectStart( event ) {

    const controller = event.target;
    
    if (firstPoint === null) {
        firstPoint = new THREE.Mesh( pointGeometry, pointMaterial );
        firstPoint.position.x = controller.position.x;
        firstPoint.position.y = controller.position.y;
        firstPoint.position.z = controller.position.z;

        scene.add( firstPoint );
    }else if (firstPoint !== null && secondPoint !== null){
        scene.remove(firstPoint)
        scene.remove(secondPoint)
        secondPoint = null;

        firstPoint = new THREE.Mesh( pointGeometry, pointMaterial );
        firstPoint.position.x = controller.position.x;
        firstPoint.position.y = controller.position.y;
        firstPoint.position.z = controller.position.z;
        scene.add( firstPoint );
    }else{
        secondPoint = new THREE.Mesh( pointGeometry, pointMaterial );
        secondPoint.position.x = controller.position.x;
        secondPoint.position.y = controller.position.y;
        secondPoint.position.z = controller.position.z;
        scene.add( secondPoint );
        
        let firstPosition = firstPoint.position;
        let secondPosition = secondPoint.position;
        let boxX = secondPosition.x - firstPosition.x;
        let boxY = secondPosition.y - firstPosition.y;
        let boxZ = secondPosition.z - firstPosition.z;

        const boxGeometry = new THREE.BoxGeometry( boxX, boxY, boxZ);
        const boxMaterial = new THREE.MeshStandardMaterial({
            color: 0x00ff00
        });
        const box = new THREE.Mesh( boxGeometry, boxMaterial );
        box.position.x = firstPosition.x + (boxX/2);
        box.position.y = firstPosition.y + (boxY/2);
        box.position.z = firstPosition.z + (boxZ/2);
        scene.add( box );
        
    }
}

function animate() {

    renderer.setAnimationLoop( render );
}

function render() {

    renderer.render( scene, camera );

}


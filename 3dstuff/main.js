import * as THREE from './r132/build/three.module.js';
import {OrbitControls} from './r132/examples/jsm/controls/OrbitControls.js';
import {GLTFLoader} from './r132/examples/jsm/loaders/GLTFLoader.js';

//Main constants
const canvas = document.querySelector('#c');
const renderer = new THREE.WebGLRenderer({canvas:canvas, alpha:true});
const fov = 45;
const aspect = 2;  // the canvas default
const near = 0.1;
const far = 100;
let views = [];
let scene;
function setCamera(left, background){
  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  camera.position.set(0, 10, 20);
  const controls = new OrbitControls(camera, document.querySelector("#c"));
  controls.target.set(0, 5, 0);
  controls.update();
  //controls.addEventListener("change",onChange);
  views.push({camera: camera, controls:controls, width:0.5, left:left, background:background});//will set the position later
}
function onChange(){

}

function initScene(){
  //must crete
  scene = new THREE.Scene();

}

function initMesh(){
  const planeSize = 40;
  const loader = new THREE.TextureLoader();
  const texture = loader.load('resources/images/checker.png');
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.magFilter = THREE.NearestFilter;
  const repeats = planeSize / 2;
  texture.repeat.set(repeats, repeats);
  const planeGeo = new THREE.PlaneGeometry(planeSize, planeSize);
  const planeMat = new THREE.MeshPhongMaterial({
    map: texture,
    side: THREE.DoubleSide,
  });
  const mesh = new THREE.Mesh(planeGeo, planeMat);
  mesh.rotation.x = Math.PI * -.5;
  scene.add(mesh);
}
function initView(){//two cameras this time
  setCamera(0, new THREE.Color( 0, 0, 0 ));
  }

function initLights(){
  {
    const skyColor = 0xffffff;  // light blue
    const groundColor = 0xffffff;  // brownish orange
    const intensity = 1;
    const light = new THREE.HemisphereLight(skyColor, groundColor, intensity);
    scene.add(light);
  }

  {
    const color = 0xFFFFFF;
    const intensity = 1;
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(5, 10, 2);
    light.position.set(5, 2, 2);
    scene.add(light);
    //scene.add(light.target);
  }
}

function frameArea(sizeToFitOnScreen, boxSize, boxCenter, camera) {
  const halfSizeToFitOnScreen = sizeToFitOnScreen * 0.5;
  const halfFovY = THREE.MathUtils.degToRad(camera.fov * .5);
  const distance = halfSizeToFitOnScreen / Math.tan(halfFovY);
  // compute a unit vector that points in the direction the camera is now
  // in the xz plane from the center of the box
  //later change all the views to a loop as of now only one view
  const direction = (new THREE.Vector3())
      .subVectors(camera.position, boxCenter)
      .multiply(new THREE.Vector3(1, 0, 1))
      .normalize();
  // move the camera to a position distance units way from the center
  // in whatever direction the camera was from the center already
  camera.position.copy(direction.multiplyScalar(distance).add(boxCenter));
  // pick some near and far values for the frustum that
  // will contain the box.
  camera.near = boxSize / 100;
  camera.far = boxSize * 100;
  camera.updateProjectionMatrix();
  // point the camera to look at the center of the box
  camera.lookAt(boxCenter.x, boxCenter.y, boxCenter.z);
}

function initObj(){
  {
    const gltfLoader = new GLTFLoader();
    gltfLoader.load('resources/models/cartoon_lowpoly_small_city_free_pack/scene.gltf', (gltf) => {
      const root = gltf.scene;
      scene.add(root);
      const box = new THREE.Box3().setFromObject(root);
      const boxSize = box.getSize(new THREE.Vector3()).length();
      const boxCenter = box.getCenter(new THREE.Vector3());
      // update the Trackball controls to handle the new size
      frameArea(boxSize, boxSize, boxCenter, views[0].camera);
      views[0].controls.maxDistance = boxSize * 10;
      views[0].controls.target.copy(boxCenter);
      views[0].controls.update();
    });
  }
}
function resizingNeeded(rendererR){
  const canvasR = rendererR.domElement;
  const width = canvasR.clientWidth;
  const height = canvasR.clientHeight;
  const needResize = canvasR.width !== width || canvasR.height !== height;
  if (needResize) {
    rendererR.setSize(width, height, false);
  }
  return needResize;
}
function render(){
  if (resizingNeeded(renderer)) {
      const canvasR = renderer.domElement;
      const left = Math.floor( canvasR.clientWidth * views[0].left );
      const width = Math.floor( canvasR.clientWidth * views[0].width );;
      renderer.setClearColor( views[0].background);
      views[0].camera.aspect = canvasR.clientWidth  / canvasR.clientHeight;
      views[0].camera.updateProjectionMatrix();
    //}
  }
  renderer.render(scene, views[0].camera);
  requestAnimationFrame(render);
}

function main(){
  initView();
  initScene();
  initMesh();
  initLights();
  initObj();

  requestAnimationFrame(render);
}

main();

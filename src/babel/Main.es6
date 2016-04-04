import Cloth from "./cloth/Cloth";

const DISTANCE = 25; // 旗を分割した頂点間の距離
const SEGMENTS_X = 10; // 旗のX軸の分割数
const SEGMENTS_Y = 10; // 旗のY軸の分割数
const WIDTH = DISTANCE * SEGMENTS_X; // 旗の横幅
const HEIGHT = DISTANCE * SEGMENTS_Y; // 旗の縦幅

// レンダラー
var renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize(800, 600);
renderer.setClearColor(0x000000);
document.getElementById("js_box").appendChild(renderer.domElement);

// シーン
var scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x000000, 500, 5000);

// カメラ
var camera = new THREE.PerspectiveCamera(30, 800 / 600, 1, 5000);
camera.position.z = 1500;
scene.add(camera);

// 光源
var light = new THREE.DirectionalLight(0xffffff, 2);
light.position.set(50, 200, 100);
light.castShadow = false;
scene.add(light);
scene.add(new THREE.AmbientLight(0x333333));

// 星条旗
var loader = new THREE.TextureLoader();
var clothTexture = loader.load("texture/cloth.png");
clothTexture.wrapS = THREE.RepeatWrapping;
clothTexture.wrapT = THREE.RepeatWrapping;
clothTexture.anisotropy = 16;
var clothMaterial = new THREE.MeshPhongMaterial({specular: 0x000000, map: clothTexture, side: THREE.DoubleSide});
var cloth = new Cloth(SEGMENTS_X, SEGMENTS_Y, DISTANCE, function(u, v){
  var x = (u - 0.5) * DISTANCE * SEGMENTS_X;
  var y = (v + 0.5) * DISTANCE * SEGMENTS_Y;
  var z = 0;
  return new THREE.Vector3(x, y, z);
});
var clothMeth = new THREE.Mesh(cloth.getGeometry(), clothMaterial);
clothMeth.position.set(WIDTH / 2, -HEIGHT / 2, 0);
scene.add(clothMeth);

// ポール
var poleGeometry = new THREE.CylinderGeometry(5, 5, 500, 10, 0, true);
var poleMaterial = new THREE.MeshPhongMaterial({color: 0x999999, specular: 0xffffff});
var poleMesh = new THREE.Mesh(poleGeometry, poleMaterial);
poleMesh.position.x = 0;
poleMesh.position.y = 0;
scene.add(poleMesh);

// 月面
loader = new THREE.TextureLoader();
var groundTexture = loader.load("texture/grand.jpg");
groundTexture.wrapS = THREE.RepeatWrapping;
groundTexture.wrapT = THREE.RepeatWrapping;
groundTexture.repeat.set(25, 25);
groundTexture.anisotropy = 16;
var groundMaterial = new THREE.MeshPhongMaterial({color: 0x999999, specular: 0x000000, map: groundTexture});
var groundMesh = new THREE.Mesh(new THREE.PlaneBufferGeometry(20000, 20000), groundMaterial);
groundMesh.position.y = - 250;
groundMesh.rotation.x = - Math.PI / 2;
scene.add(groundMesh);

// アニメーション
function animate() {
	requestAnimationFrame(animate);
	cloth.windSimulate(Date.now());
	camera.lookAt(scene.position);
	renderer.render(scene, camera);
}
animate();
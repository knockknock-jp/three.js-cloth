"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * 新しいClothオブジェクトを作成する。
 * ＠class 風の揺らめきをシミュレーションする布クラス
 * ＠params {Number} segmentX X軸の分割数
 * ＠params {Number} segmentY Y軸の分割数
 * ＠params {Number} distance 分割した頂点間の距離
 * ＠params {Function} paramFunc パラメトリック曲面の計算式の関数
 */

var Cloth = function () {
	function Cloth(segmentX, segmentY, distance, paramFunc) {
		_classCallCheck(this, Cloth);

		this.segmentX = segmentX;
		this.segmentY = segmentY;
		this.distance = distance;
		this.paramFunc = paramFunc;
		this.geometry = new THREE.ParametricGeometry(this.paramFunc, this.segmentX, this.segmentY);
		this.windForce = new THREE.Vector3(0, 0, 0);
		this.tmpForce = new THREE.Vector3();
		this.lastTime = null;
		this.particles = [];
		this.constrains = [];
		var u, v;
		for (v = 0; v <= this.segmentY; v++) {
			for (u = 0; u <= this.segmentX; u++) {
				this.particles.push(new ClothParticle(u / this.segmentX, v / this.segmentY, 0, 0.1, this.paramFunc));
			}
		}
		for (v = 0; v < this.segmentY; v++) {
			for (u = 0; u < this.segmentX; u++) {
				this.constrains.push([this.particles[this.getIndex_(u, v)], this.particles[this.getIndex_(u, v + 1)], this.distance]);
				this.constrains.push([this.particles[this.getIndex_(u, v)], this.particles[this.getIndex_(u + 1, v)], this.distance]);
			}
		}
		for (u = this.segmentX, v = 0; v < this.segmentY; v++) {
			this.constrains.push([this.particles[this.getIndex_(u, v)], this.particles[this.getIndex_(u, v + 1)], this.distance]);
		}
		for (v = this.segmentY, u = 0; u < this.segmentX; u++) {
			this.constrains.push([this.particles[this.getIndex_(u, v)], this.particles[this.getIndex_(u + 1, v)], this.distance]);
		}
	}

	_createClass(Cloth, [{
		key: "getGeometry",
		value: function getGeometry() {
			return this.geometry;
		}
	}, {
		key: "windSimulate",
		value: function windSimulate(time) {
			if (!this.lastTime) {
				this.lastTime = time;
				return;
			}
			this.windForce.set(Math.sin(time / 2000), Math.cos(time / 3000), Math.sin(time / 1000)).normalize().multiplyScalar(200);
			var i = 0,
			    max;
			for (i = 0, max = this.particles.length; i < max; i = i + 1) {
				this.geometry.vertices[i].copy(this.particles[i].position);
			}
			this.geometry.computeFaceNormals();
			this.geometry.computeVertexNormals();
			this.geometry.normalsNeedUpdate = true;
			this.geometry.verticesNeedUpdate = true;
			var faces = this.geometry.faces;
			for (i = 0, max = faces.length; i < max; i = i + 1) {
				this.tmpForce.copy(faces[i].normal).normalize().multiplyScalar(faces[i].normal.dot(this.windForce));
				this.particles[faces[i].a].addForce(this.tmpForce);
				this.particles[faces[i].b].addForce(this.tmpForce);
				this.particles[faces[i].c].addForce(this.tmpForce);
			}
			for (i = 0, max = this.particles.length; i < max; i = i + 1) {
				this.particles[i].addForce(new THREE.Vector3(0, -(981 * 1.4), 0).multiplyScalar(0.1));
				this.particles[i].integrate(18 / 1000 * (18 / 1000));
			}
			for (i = 0, max = this.constrains.length; i < max; i = i + 1) {
				this.satisifyConstrains_(this.constrains[i][0], this.constrains[i][1], this.constrains[i][2]);
			}
			for (i = 0, max = this.particles.length; i < max; i = i + 1) {
				if (i % (this.segmentX + 1) == 0) {
					this.particles[i].position.copy(this.particles[i].original);
					this.particles[i].previous.copy(this.particles[i].original);
				}
			}
		}
	}, {
		key: "getIndex_",
		value: function getIndex_(u, v) {
			return u + v * (this.segmentX + 1);
		}
	}, {
		key: "satisifyConstrains_",
		value: function satisifyConstrains_(p1, p2, distance) {
			var diff = new THREE.Vector3();
			diff.subVectors(p2.position, p1.position);
			var currentDist = diff.length();
			if (currentDist == 0) return;
			var correction = diff.multiplyScalar(1 - distance / currentDist);
			var correctionHalf = correction.multiplyScalar(0.5);
			p1.position.add(correctionHalf);
			p2.position.sub(correctionHalf);
		}
	}]);

	return Cloth;
}();

/**
 * 新しいClothParticleオブジェクトを作成する。
 * ＠class 風の揺らめきに反応する各頂点のクラス
 * ＠params {Number} x X座標
 * ＠params {Number} y Y座標
 * ＠params {Number} z Z座標
 * ＠params {Number} mass
 * ＠params {Function} paramFunc パラメトリック曲面の計算式の関数
 */


exports.default = Cloth;

var ClothParticle = exports.ClothParticle = function () {
	function ClothParticle(x, y, z, mass, paramFunc) {
		_classCallCheck(this, ClothParticle);

		this.position = paramFunc(x, y);
		this.previous = paramFunc(x, y);
		this.original = paramFunc(x, y);
		this.mass = 1 / mass;
		this.vector = new THREE.Vector3(0, 0, 0);
		this.tmp = new THREE.Vector3();
		this.tmp2 = new THREE.Vector3();
	}

	_createClass(ClothParticle, [{
		key: "addForce",
		value: function addForce(force) {
			this.vector.add(this.tmp2.copy(force).multiplyScalar(this.mass));
		}
	}, {
		key: "integrate",
		value: function integrate(timesq) {
			var newPos = this.tmp.subVectors(this.position, this.previous);
			newPos.multiplyScalar(0.95).add(this.position);
			newPos.add(this.vector.multiplyScalar(timesq));
			this.tmp = this.previous;
			this.previous = this.position;
			this.position = newPos;
			this.vector.set(0, 0, 0);
		}
	}]);

	return ClothParticle;
}();
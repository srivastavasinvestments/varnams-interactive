/**
 * physics.js — Cannon-es 3D rigid-body physics world
 * Handles world creation, materials, stable body factories, and mesh sync.
 * Tuned for rock-solid stability and satisfying multi-shot demolition:
 * - High static friction and low bounce prevent premature full-tower collapses
 * - Heavy structural damping ensures adjacent standing pillars stay upright
 */
import {
  World, Body, Sphere, Box, Cylinder, Plane,
  Vec3, Material, ContactMaterial, NaiveBroadphase,
} from 'cannon-es';

export class PhysicsWorld {
  constructor() {
    this.world       = null;
    this.pairs       = []; // { mesh, body }
    this._paused     = false;
    // Cannon-es materials
    this.matGround   = null;
    this.matCan      = null;
    this.matBall     = null;
    this.matPlatform = null;
  }

  init() {
    this.world = new World({ gravity: new Vec3(0, -22, 0) });
    this.world.broadphase = new NaiveBroadphase();
    this.world.allowSleep = true; // Sleep mode prevents solver micro-drift / auto-collapses
    this.world.solver.iterations = 28; // High iteration count for rock-solid stacking stability
    this.world.defaultContactMaterial.contactEquationStiffness = 1.2e7; // Firm contact without explosive spring micro-bounces
    this.world.defaultContactMaterial.contactEquationRelaxation = 3;

    this._buildMaterials();
    this._buildGround();
  }

  wakeUpAll() {
    if (!this.world) return;
    this.world.bodies.forEach(b => {
      if (b.mass > 0) b.wakeUp();
    });
  }

  sleepAll() {
    if (!this.world) return;
    this.world.bodies.forEach(b => {
      if (b.mass > 0 && typeof b.sleep === 'function') {
        b.velocity.set(0, 0, 0);
        b.angularVelocity.set(0, 0, 0);
        b.sleep();
      }
    });
  }

  pause() {
    this._paused = true;
  }

  unpause() {
    this._paused = false;
  }

  _buildMaterials() {
    this.matGround   = new Material('ground');
    this.matCan      = new Material('can');
    this.matBall     = new Material('ball');
    this.matPlatform = new Material('platform');

    const contacts = [
      // Ball hits can: energetic kinetic punch with clean impulse
      [this.matBall,   this.matCan,      { friction: 0.28, restitution: 0.30 }],
      [this.matBall,   this.matPlatform, { friction: 0.35, restitution: 0.15 }],
      [this.matBall,   this.matGround,   { friction: 0.45, restitution: 0.20 }],
      // Dynamic block stacking: high friction & near-zero restitution gives rock-solid towers with zero pre-impact jitter
      [this.matCan,    this.matCan,      { friction: 0.65, restitution: 0.02 }],
      [this.matCan,    this.matPlatform, { friction: 0.68, restitution: 0.02 }],
      [this.matCan,    this.matGround,   { friction: 0.58, restitution: 0.12 }],
    ];
    contacts.forEach(([a, b, opts]) => this.world.addContactMaterial(new ContactMaterial(a, b, opts)));
  }

  _buildGround() {
    const body = new Body({ mass: 0, shape: new Plane(), material: this.matGround });
    body.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
    this.world.addBody(body);
  }

  // ─── Body Factories ──────────────────────────────────────────────────────

  // Stable can body: box collider with matching footprint gives rock-solid stacking stability
  makeCanBody(radius, height, mass, pos) {
    const side = radius * 1.85;
    const body = new Body({
      mass,
      shape: new Box(new Vec3(side / 2, height / 2, side / 2)),
      material: this.matCan,
      linearDamping: 0.08,
      angularDamping: 0.14,
      allowSleep: true,
      sleepSpeedLimit: 0.10,
      sleepTimeLimit: 1.2,
    });
    body.position.set(pos.x, pos.y, pos.z);
    this.world.addBody(body);
    return body;
  }

  makeCylinder(rTop, rBot, height, mass, pos) {
    const body = new Body({
      mass,
      shape: new Cylinder(rTop, rBot, height, 14),
      material: this.matCan,
      linearDamping: 0.08,
      angularDamping: 0.14,
      allowSleep: true,
      sleepSpeedLimit: 0.10,
      sleepTimeLimit: 1.2,
    });
    body.position.set(pos.x, pos.y, pos.z);
    this.world.addBody(body);
    return body;
  }

  makeBox(w, h, d, mass, pos) {
    const body = new Body({
      mass,
      shape: new Box(new Vec3(w / 2, h / 2, d / 2)),
      material: mass > 0 ? this.matCan : this.matPlatform,
      linearDamping: 0.08,
      angularDamping: 0.14,
      allowSleep: mass > 0,
      sleepSpeedLimit: 0.10,
      sleepTimeLimit: 1.2,
    });
    body.position.set(pos.x, pos.y, pos.z);
    this.world.addBody(body);
    return body;
  }

  makeSphere(radius, mass, pos) {
    const body = new Body({
      mass,
      shape: new Sphere(radius),
      material: this.matBall,
      linearDamping:  0.01,
      angularDamping: 0.02,
    });
    body.position.set(pos.x, pos.y, pos.z);
    this.world.addBody(body);
    return body;
  }

  makeStaticBox(w, h, d, pos) {
    return this.makeBox(w, h, d, 0, pos);
  }

  // 100% Solid Table Surface: 3.0-meter deep kinematic block extending downwards from surfaceY
  makeKinematicPlatform(w, depth, d, topSurfacePos) {
    const solidDepth = depth || 3.0;
    const body = new Body({
      mass: 0,
      type: Body.KINEMATIC,
      shape: new Box(new Vec3(w / 2, solidDepth / 2, d / 2)),
      material: this.matPlatform,
    });
    // Center is solidDepth/2 BELOW the top surface, so the top face is exactly at topSurfacePos.y
    body.position.set(topSurfacePos.x, topSurfacePos.y - solidDepth / 2, topSurfacePos.z);
    this.world.addBody(body);
    return body;
  }

  rotateKinematicPlatform(platBody, angle, speed) {
    if (!platBody) return;
    platBody.angularVelocity.set(0, speed, 0);
    platBody.quaternion.setFromAxisAngle(new Vec3(0, 1, 0), angle);
  }

  // ─── Pair registration ───────────────────────────────────────────────────

  registerPair(mesh, body) {
    this.pairs.push({ mesh, body });
  }

  removeBody(body) {
    if (!body) return;
    try { this.world.removeBody(body); } catch (_) {}
    this.pairs = this.pairs.filter(p => p.body !== body);
  }

  // ─── Simulation step ─────────────────────────────────────────────────────

  step(dt) {
    if (this._paused) return;
    // High-frequency 180Hz substepping (1/180s) with 15 substeps: Prevents tunneling and guarantees rock-solid, crisp collisions
    this.world.step(1 / 180, dt, 15);
  }

  syncMeshes() {
    for (const { mesh, body } of this.pairs) {
      if (mesh._skipPhysicsSync) continue;
      mesh.position.set(body.position.x, body.position.y, body.position.z);
      mesh.quaternion.set(body.quaternion.x, body.quaternion.y, body.quaternion.z, body.quaternion.w);
    }
  }

  // ─── Reset (between levels) ──────────────────────────────────────────────

  reset() {
    [...this.world.bodies].forEach(b => this.world.removeBody(b));
    this.pairs = [];
    this._paused = false;
    this._buildGround();
  }
}

import {
  COLLIDERTYPE_POINT,
  COLLIDERTYPE_RECTANGLE,
  COLLIDERTYPE_CIRCLE,
  COLLIDERTYPE_RAYCAST,
  RAYCAST_ITERATIONS,
} from "./constants";
import { Vector2 } from "./vector";
import { Entity } from "./entity";
import { DrawDebugDot } from "./sprites";
import {
  PointInsideCircle,
  PointInsideRectangle,
  PointDistance,
  rectangle_inside_rectangle,
  circle_inside_circle,
  rectangle_inside_circle,
  MoveToward,
} from "./tools";
import { ctx } from "./render";
import { Game } from "./engine";

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Dynamic collisions
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Internal collision resolution
 * @param {Entity} caller
 * @param {Array<Entity>} all_colliders
 * @returns {void}
 */
export function __RESOLVE_COLLISIONS(
  caller: Entity,
  all_colliders: Array<Entity>,
) {
  // Dynamic collisions. Static collisions are handled in Update() manually.
  if (caller == null) return;
  if (all_colliders.length <= 1) return;
  all_colliders.forEach((clu) => {
    if (
      clu != caller &&
      !caller.IsDestroyed() &&
      !clu.IsDestroyed() &&
      caller.GetColliders().length
    ) {
      // Check all colliders on an entity against all other colliders that exist, except if they are on our own entity!
      let data_list: CollisionData[] = [];
      caller.GetColliders().forEach((each_collider) => {
        data_list = data_list.concat(each_collider.CheckCollider(caller, clu));
      });
      // For each collision that happened, resolve them one by one, so this loop is not required to be made by EVERY time.
      if (data_list.length > 0) {
        data_list.forEach((col_data: CollisionData) => {
          if (col_data.entity.IsDestroyed()) return; // Already destroyed by something, drop out. All future collisions are irrelevant.
          if (!col_data.other_entity.IsDestroyed())
            caller.OnCollision(col_data); // Only allow non destroyed entities to affect collision.
        });
      }
    }
  });
}

export class ColliderPoint {
  /**
   * Unique name for collider assigned in the constructor, used to identify which collider hit which collider when checking between two known objects.
   * @type {string}
   * @public
   */
  collider_unique_id = "";

  /**
   * Type of collision logic used, uses the COLLIDERTYPE_ constants.
   * @type {COLLIDERTYPE}
   * @protected
   */
  collider_type = COLLIDERTYPE_POINT;

  /**
   * Flag for if the collider will perform collisions, both giving and recieving.
   * @type {boolean}
   * @public
   */
  active = true;

  /**
   * Offset from the entity's x and y position that this collider's origin is placed.
   * @type {Vector2}
   * @public
   */
  offset = Vector2.Identity();

  /**
   * Width of the collider,
   * unused in points,
   * rectangle width,
   * circles use this for radius,
   * raycasts use this for angle.
   * @type {number}
   * @public
   */
  width = 0;

  /**
   * Height of the collider,
   * unused in points,
   * rectangle width,
   * unused in circles,
   * raycasts use this for the distance of the cast.
   * @type {number}
   * @public
   */
  height = 0;

  constructor(
    id: string,
    xoff: number,
    yoff: number,
    wid: number,
    hig: number,
  ) {
    this.collider_unique_id = id;
    this.offset.x = xoff;
    this.offset.y = yoff;
    if (wid != undefined) this.width = wid;
    if (hig != undefined) this.height = hig;
  }

  /**
   * @param {Entity} owner
   * @param {Entity} other
   * @returns {Array<CollisionData>}
   */
  CheckCollider(owner: Entity, other: Entity): Array<CollisionData> {
    let return_data: CollisionData[] = [];
    let x: number = owner.position.x + this.offset.x;
    let y: number = owner.position.y + this.offset.y;

    other.GetColliders().forEach((other_collider) => {
      let otherx = other.position.x + other_collider.offset.x;
      let othery = other.position.y + other_collider.offset.y;
      let other_data = new CollisionData(
        this.collider_unique_id,
        other_collider.collider_unique_id,
        owner,
        other,
        x,
        y,
      );

      switch (this.collider_type) {
        case COLLIDERTYPE_POINT:
          if (
            !PointInsideCircle(
              x,
              y,
              otherx,
              othery,
              other_collider.width + other_collider.height,
            )
          )
            return return_data;

          switch (other_collider.collider_type) {
            case COLLIDERTYPE_POINT:
              if (
                Math.round(x) == Math.round(otherx) &&
                Math.round(y) == Math.round(othery)
              )
                return_data.push(other_data);
              break;

            case COLLIDERTYPE_RECTANGLE:
              if (
                PointInsideRectangle(
                  x,
                  y,
                  otherx,
                  othery,
                  otherx + other_collider.width,
                  othery + other_collider.height,
                )
              )
                return_data.push(other_data);
              break;

            case COLLIDERTYPE_CIRCLE:
              if (PointInsideCircle(x, y, otherx, othery, other_collider.width))
                return_data.push(other_data);
              break;

            case COLLIDERTYPE_RAYCAST: // Raycasts are oneway
              break;
          }
          break;

        case COLLIDERTYPE_RECTANGLE:
          if (
            !PointInsideCircle(
              x,
              y,
              otherx,
              othery,
              this.width +
                this.height +
                other_collider.width +
                other_collider.height,
            )
          )
            return return_data;

          switch (other_collider.collider_type) {
            case COLLIDERTYPE_POINT:
              if (
                PointInsideRectangle(
                  otherx,
                  othery,
                  x,
                  y,
                  x + this.width,
                  y + this.height,
                )
              )
                return_data.push(other_data);

            case COLLIDERTYPE_RECTANGLE:
              if (
                rectangle_inside_rectangle(
                  x,
                  y,
                  x + this.width,
                  y + this.height,
                  otherx,
                  othery,
                  otherx + other_collider.width,
                  othery + other_collider.height,
                )
              )
                return_data.push(other_data);

            case COLLIDERTYPE_CIRCLE:
              if (
                rectangle_inside_circle(
                  x,
                  y,
                  x + this.width,
                  y + this.height,
                  otherx,
                  othery,
                  other_collider.width,
                )
              )
                return_data.push(other_data);

            case COLLIDERTYPE_RAYCAST: // Raycasts are oneway
              break;
          }
          break;

        case COLLIDERTYPE_CIRCLE:
          if (
            !PointInsideCircle(
              x,
              y,
              otherx,
              othery,
              this.width +
                this.height +
                other_collider.width +
                other_collider.height,
            )
          )
            return return_data;

          switch (other_collider.collider_type) {
            case COLLIDERTYPE_POINT:
              if (PointInsideCircle(otherx, othery, x, y, this.width))
                return_data.push(other_data);

            case COLLIDERTYPE_RECTANGLE:
              if (
                rectangle_inside_circle(
                  otherx,
                  othery,
                  otherx + other_collider.width,
                  othery + other_collider.height,
                  x,
                  y,
                  this.width,
                )
              )
                return_data.push(other_data);

            case COLLIDERTYPE_CIRCLE:
              if (
                circle_inside_circle(
                  otherx,
                  othery,
                  other_collider.width,
                  x,
                  y,
                  this.width,
                )
              )
                return_data.push(other_data);

            case COLLIDERTYPE_RAYCAST: // Raycasts are oneway
              break;
          }
          break;

        case COLLIDERTYPE_RAYCAST:
          // If we're not in this range don't bother with anything more complex
          if (
            !PointInsideCircle(
              x,
              y,
              otherx,
              othery,
              this.height + other_collider.width + other_collider.height,
            )
          )
            return return_data;

          if (this.height > 0) {
            // Check either the length of the raycast, or the number of RAYCAST_ITERATIONS along it if it is longer than RAYCAST_ITERATIONS!
            let angle = this.width;
            let check_distance = GetRayCastIterationDistance(this.height);
            let check = new Vector2(x, y);
            do {
              check.AddHeading(angle, check_distance);
              switch (other_collider.collider_type) {
                case COLLIDERTYPE_POINT:
                  if (
                    Math.round(check.x) == Math.round(otherx) &&
                    Math.round(check.y) == Math.round(othery)
                  ) {
                    other_data.hit.x = check.x;
                    other_data.hit.y = check.y;
                    return_data.push(other_data);
                    continue;
                  }
                  break;

                case COLLIDERTYPE_RECTANGLE:
                  if (
                    PointInsideRectangle(
                      check.x,
                      check.y,
                      otherx,
                      othery,
                      otherx + other_collider.width,
                      othery + other_collider.height,
                    )
                  ) {
                    other_data.hit.x = check.x;
                    other_data.hit.y = check.y;
                    return_data.push(other_data);
                    continue;
                  }
                  break;

                case COLLIDERTYPE_CIRCLE:
                  if (
                    PointInsideCircle(
                      check.x,
                      check.y,
                      otherx,
                      othery,
                      other_collider.width,
                    )
                  ) {
                    other_data.hit.x = check.x;
                    other_data.hit.y = check.y;
                    return_data.push(other_data);
                    continue;
                  }
                  break;

                case COLLIDERTYPE_RAYCAST: // Raycasts are oneway
                  break;
              }
            } while (check.Magnitude() < this.height);
          }
          break;
      }
      return;
    });
    return return_data;
  }

  /**
   * @param {Entity} owner
   * @returns {void}
   */
  DrawCollider(owner: Entity): void {
    let x =
      owner.position.x + this.offset.x - Game.active_scene.view_position.x;
    let y =
      owner.position.y + this.offset.y - Game.active_scene.view_position.y;

    switch (this.collider_type) {
      case COLLIDERTYPE_POINT:
        ctx.beginPath();
        ctx.arc(x, y, 0.5, 0, 2 * Math.PI);
        ctx.fillStyle = "#ff0000BB";
        ctx.fill();
        ctx.lineWidth = 1;
        ctx.strokeStyle = "#00ff00BB";
        ctx.stroke();
        break;

      case COLLIDERTYPE_RECTANGLE:
        ctx.beginPath();
        ctx.rect(x, y, this.width, this.height);
        ctx.fillStyle = "#ff0000BB";
        ctx.fill();
        ctx.lineWidth = 1;
        ctx.strokeStyle = "#00ff00BB";
        ctx.stroke();
        break;

      case COLLIDERTYPE_CIRCLE:
        ctx.beginPath();
        ctx.arc(x, y, this.width, 0, 2 * Math.PI);
        ctx.fillStyle = "#ff0000BB";
        ctx.fill();
        ctx.lineWidth = 1;
        ctx.strokeStyle = "#00ff00BB";
        ctx.stroke();
        break;

      case COLLIDERTYPE_RAYCAST:
        ctx.beginPath();
        ctx.moveTo(x, y);
        let offset = MoveToward(this.width, this.height);
        ctx.lineTo(x + offset.x, y + offset.y);
        ctx.lineWidth = 1;
        ctx.strokeStyle = "#00ff00BB";
        ctx.stroke();
        break;
    }
  }
}

export class ColliderRectangle extends ColliderPoint {
  override collider_type = COLLIDERTYPE_RECTANGLE;
}

export class ColliderCircle extends ColliderPoint {
  override collider_type = COLLIDERTYPE_CIRCLE;

  constructor(id: string, xoff: number, yoff: number, rad: number) {
    super(id, xoff, yoff, rad, 0);
  }
}

export class ColliderRayCast extends ColliderPoint {
  override collider_type = COLLIDERTYPE_RAYCAST;

  constructor(
    id: string,
    xoff: number,
    yoff: number,
    angle: number,
    dist: number,
  ) {
    super(id, xoff, yoff, angle, dist);
  }
}

export class CollisionData {
  /**
   * Identifier name of the collider checking for collisions.
   * @type {string}
   * @public
   */
  id: string = "";

  /**
   * Identifier name of the collider detected in the collision.
   * @type {string}
   * @public
   */
  other_id: string = "";

  /**
   * Instance of the entity that owns the source collider
   * @type {Entity}
   * @public
   */
  entity: Entity;

  /**
   * Instance of the entity that owns the other collider
   * @type {Entity}
   * @public
   */
  other_entity: Entity;

  /**
   * Position of the collision. Usually just the source collider's x and y, but raycasts will give the exact x and y.
   * @type {Vector2}
   * @public
   */
  hit: Vector2 = Vector2.Identity();

  constructor(
    unique_id: string,
    other_unique_id: string,
    col_entity: Entity,
    other_col_entity: Entity,
    hit_x: number,
    hit_y: number,
  ) {
    this.id = unique_id;
    this.other_id = other_unique_id;
    this.entity = col_entity;
    this.other_entity = other_col_entity;
    this.hit.x = hit_x;
    this.hit.y = hit_y;
  }
}

export class StaticCollisionData {
  /**
   * Return value of the static collision data map. Can by anything put into the collision map.
   * @type {any}
   * @public
   */
  value: any = 0;

  /**
   * Start of the collision's cast. Usually just the check's x and y.
   * @type {Vector2}
   * @public
   */
  start: Vector2 = Vector2.Identity();

  /**
   * Position of the collision. Usually just the check's x and y, but raycasts will give the exact x and y.
   * @type {Vector2}
   * @public
   */
  hit: Vector2 = Vector2.Identity();

  /**
   * Position of the last position without a collision. Usually just the check's x and y, but raycasts will give the exact x and y.
   * @type {Vector2}
   * @public
   */
  last_free: Vector2 = Vector2.Identity();

  /**
   * The distance of each raycast.
   * @type {Vector2}
   * @public
   */
  cast_length: Vector2 = Vector2.Identity();

  constructor(
    collision_value: any,
    start_x: number,
    start_y: number,
    hit_x: number,
    hit_y: number,
    free_x: number,
    free_y: number,
  ) {
    this.value = collision_value;
    this.start.x = start_x;
    this.start.y = start_y;
    this.hit.x = hit_x;
    this.hit.y = hit_y;
    this.last_free.x = free_x;
    this.last_free.y = free_y;
  }

  /**
   * @returns {number} A number representing the distance between the start of the collision and it's end.
   */
  MagnitudeHit() {
    return PointDistance(this.start.x, this.start.y, this.hit.x, this.hit.y);
  }

  /**
   * @returns {number} A number representing the distance between the start of the collision and the last free position.
   */
  MagnitudeFree() {
    return PointDistance(
      this.start.x,
      this.start.y,
      this.last_free.x,
      this.last_free.y,
    );
  }

  /**
   * @returns {Vector2} A vector containing the distances in both axis needed to correct a collision.
   */
  GetCorrectionOffsets() {
    return new Vector2(
      this.hit.x - this.start.x - this.cast_length.x,
      this.hit.y - this.start.y - this.cast_length.y,
    );
  }
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Static collision map
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const static_col_checks: Array<Array<number>> = [];

/**
 * Gets the static collision data of a point in the world
 * @param {number} x
 * @param {number} y
 * @returns {StaticCollisionData}
 */
export function GetStaticCollision(x: number, y: number): StaticCollisionData {
  x = Math.floor(x);
  y = Math.floor(y);
  if (x < 0) x = 0;
  if (y < 0) y = 0;
  static_col_checks.push([x, y]);
  if (
    Game.active_scene == null ||
    Game.active_scene.static_collision_map.length <= 0
  )
    return new StaticCollisionData(0, x, y, x, y, x, y);
  if (
    Math.floor(y / Game.active_scene.static_col_resolution) >=
    Game.active_scene.static_collision_map.length
  )
    return new StaticCollisionData(0, x, y, x, y, x, y);
  let submap =
    Game.active_scene.static_collision_map[
      Math.floor(y / Game.active_scene.static_col_resolution)
    ];
  if (submap == null || submap.length <= 0)
    return new StaticCollisionData(0, x, y, x, y, x, y);
  if (Math.floor(x / Game.active_scene.static_col_resolution) >= submap.length)
    return new StaticCollisionData(0, x, y, x, y, x, y);
  return new StaticCollisionData(
    submap[Math.floor(x / Game.active_scene.static_col_resolution)],
    x,
    y,
    x,
    y,
    x,
    y,
  );
}

/**
 * Casts a ray at a set angle and distance, returning the static collision data of the first point along the ray that hit.
 * @param {number} x
 * @param {number} y
 * @param {number} angle
 * @param {number} dist
 * @returns {StaticCollisionData}
 */
export function RayCastStaticCollision(
  x: number,
  y: number,
  angle: number,
  dist: number,
): StaticCollisionData {
  x = Math.floor(x);
  y = Math.floor(y);
  if (dist <= 0) return GetStaticCollision(x, y);

  let check_distance = GetRayCastIterationDistance(dist);
  let last_free = new Vector2(x, y);
  let check = new Vector2(x, y);
  while (true) {
    let get_data = GetStaticCollision(check.x, check.y);
    // Update the start position to match raycast's
    get_data.start.x = x;
    get_data.start.y = y;
    // Check collision state
    if (get_data.value > 0) {
      // Update the last free position with ours and return the collision.
      get_data.last_free.x = Math.floor(last_free.x);
      get_data.last_free.y = Math.floor(last_free.y);
      get_data.cast_length = MoveToward(angle, dist);
      return get_data;
    } else {
      // Hold the last free position we've found.
      last_free.x = check.x;
      last_free.y = check.y;
    }
    // Once we hit the end of the cast, just return the last check done.
    if (PointDistance(x, y, check.x, check.y) >= dist) return get_data;
    // Step forward until we run out of steps to do!
    check.AddHeading(angle, check_distance);
  }
}

/**
 * Check either the length of the raycast, or the number of RAYCAST_ITERATIONS along it if it is longer than RAYCAST_ITERATIONS! Mostly for internal collision code use.
 * @param {number} dist - Length of the ray being cast
 * @returns {number} The distance between raycasting checks
 */
export function GetRayCastIterationDistance(dist: number): number {
  //
  let check_distance = dist / RAYCAST_ITERATIONS;
  if (dist <= RAYCAST_ITERATIONS) check_distance = 1;
  return check_distance;
}

/**
 * Draws the static collision array, useful for testing tilesets, but too laggy to be used in actual gameplay.
 * @returns {void}
 */
export function DrawStaticColliders(): void {
  if (Game.active_scene.static_collision_map.length > 0) {
    for (let yy = 0; yy < Game.active_scene.static_collision_map.length; yy++) {
      let submap = Game.active_scene.static_collision_map[yy];
      if (submap != null && submap.length == 0) break;
      for (let xx = 0; xx < submap.length; xx++) {
        if (submap[xx] == 0) continue;

        let xpos =
          xx * Game.active_scene.static_col_resolution -
          Game.active_scene.view_position.x;
        let ypos =
          yy * Game.active_scene.static_col_resolution -
          Game.active_scene.view_position.y;

        ctx.beginPath();
        ctx.rect(
          xpos,
          ypos,
          Game.active_scene.static_col_resolution,
          Game.active_scene.static_col_resolution,
        );
        ctx.fillStyle = "#ff0000BB";
        ctx.fill();
        ctx.lineWidth = 1;
        ctx.strokeStyle = "#00eeffBB";
        ctx.stroke();
        ctx.fillStyle = "#ffffffBB";
        ctx.fillText(
          submap[xx],
          xpos,
          ypos + Game.active_scene.static_col_resolution,
          Game.active_scene.static_col_resolution,
        );
      }
    }
  }
  while (static_col_checks.length > 0) {
    let pip: Array<number> = static_col_checks.pop() as Array<number>;
    DrawDebugDot(pip[0] as number, pip[1] as number);
  }
}

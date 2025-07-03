import { AXIS } from "./constants";
import { MoveToward, PointDistance, FindAngle } from "./tools";

export class Vector2 {
	x: number = 0;
	y: number = 0;

	/**
	 * @returns {Vector2} Returns a new vector with both an x and y of 0;
	 */
	public static Identity(): Vector2 {
		return new Vector2(0, 0);
	}

	constructor(xx: number, yy: number) {
		this.x = xx;
		this.y = yy;
	}

	/**
	 * @param {Vector2} vector - Adds the provided vector into the current vector.
	 * @param {number} axis - Filter for which axis this operation is applied to
	 * @returns {Vector2} Returns this vector.
	 */
	Add(vector: Vector2, axis: number = AXIS.BOTH): Vector2 {
		if (axis & AXIS.X) this.x += vector.x;
		if (axis & AXIS.Y) this.y += vector.y;
		return this;
	}

	/**
	 * @param {number} angle - Heading of the new vector being added this this vector
	 * @param {number} dist - Magnitude of the new vector being added to this vector;
	 * @param {number} axis - Filter for which axis this operation is applied to
	 * @returns {Vector2} Returns this vector.
	 */
	AddHeading(angle: number, dist: number, axis: number = AXIS.BOTH): Vector2 {
		let new_heading = MoveToward(angle, dist);
		if (axis & AXIS.X) this.x += new_heading.x;
		if (axis & AXIS.Y) this.y += new_heading.y;
		return this;
	}

	/**
	 * @param {number} scaler - Multiplied with the current vector.
	 * @param {number} axis - Filter for which axis this operation is applied to
	 * @returns {Vector2} Returns this vector.
	 */
	Multiply(scaler: number, axis: number = AXIS.BOTH): Vector2 {
		if (axis & AXIS.X) this.x *= scaler;
		if (axis & AXIS.Y) this.y *= scaler;
		return this;
	}

	/**
	 * @param {number} denominator - Current vector is divided by this.
	 * @param {number} axis - Filter for which axis this operation is applied to
	 * @returns {Vector2} Returns this vector.
	 */
	Divide(denominator: number, axis: number = AXIS.BOTH): Vector2 {
		if (axis & AXIS.X) this.x /= denominator;
		if (axis & AXIS.Y) this.y /= denominator;
		return this;
	}

	/**
	 * Inverts the sign of the vector's component x and y.
	 * @param {number} axis - Filter for which axis this operation is applied to
	 * @returns {Vector2} Returns this vector.
	 */
	Inverse(axis: number = AXIS.BOTH): Vector2 {
		if (axis & AXIS.X) this.x *= -1;
		if (axis & AXIS.Y) this.y *= -1;
		return this;
	}

	/**
	 * Returns the vector to its default state of 0,0
	 * @param {number} axis - Filter for which axis this operation is applied to
	 * @returns {Vector2} Returns this vector.
	 */
	Zero(axis: number = AXIS.BOTH): Vector2 {
		if (axis & AXIS.X) this.x = 0;
		if (axis & AXIS.Y) this.y = 0;
		return this;
	}

	/**
	 * @param {number} axis - Filter for which axis this operation is applied to
	 * @param {number} acc - Adds the provided number to the vector's current magnitude without changing heading.
	 * @returns {Vector2} Returns this vector.
	 */
	Accelerate(acc: number, axis: number = AXIS.BOTH): Vector2 {
		let org_x = axis & AXIS.X ? undefined : this.x;
		let org_y = axis & AXIS.Y ? undefined : this.y;
		this.Add(MoveToward(this.Heading(), acc));
		if (org_x != undefined) this.x = org_x;
		if (org_y != undefined) this.y = org_y;
		return this;
	}

	/**
	 * @param {number} axis - Filter for which axis this operation is applied to
	 * @param {number} decl - Removes the provided number from the vector's current magnitude, bottoms out at 0.
	 * @returns {Vector2} Returns this vector.
	 */
	Decelerate(decl: number, axis: number = AXIS.BOTH): Vector2 {
		if (this.x == 0 && this.y == 0) return this;
		let org_x = axis & AXIS.X ? undefined : this.x;
		let org_y = axis & AXIS.Y ? undefined : this.y;

		let dist = this.Magnitude() - Math.abs(decl);
		if (dist < 0) dist = 0;

		let head = this.Heading();
		let new_vec = Vector2.Identity();
		if (head >= 0) new_vec = MoveToward(head, dist);
		this.Zero(AXIS.BOTH).Add(new_vec, axis);

		if (org_x != undefined) this.x = org_x;
		if (org_y != undefined) this.y = org_y;
		return this;
	}

	/**
	 * @param {number} axis - Filter for which axis this operation is applied to
	 * @returns {number} A number representing the length of the vector
	 */
	Magnitude(axis: number = AXIS.BOTH): number {
		return PointDistance(0, 0, axis & AXIS.X ? this.x : 0, axis & AXIS.Y ? this.y : 0);
	}

	/**
	 * Normalizes this vector to a unit distance of 1.
	 * @returns {Vector2} Returns this vector.
	 */
	Normalized(): Vector2 {
		let heading = this.Heading();
		if (heading == -1) return this;
		let new_vec = MoveToward(heading, 1);
		this.x = new_vec.x;
		this.y = new_vec.y;
		return this;
	}

	/**
	 * @param {Vector2} vector
	 * @returns {Boolean} If the provided vector is equal to this vector.
	 */
	Equals(vector: Vector2): Boolean {
		return this.x === vector.x && this.y === vector.y;
	}

	/**
	 * @returns {Vector2} Copy of the current vector.
	 */
	Copy(): Vector2 {
		return new Vector2(this.x, this.y);
	}

	/**
	 * @returns {number} An angle representing the heading of the vector. -1 if not possible.
	 */
	Heading(): number {
		if (this.x == 0 && this.y == 0) return -1;
		return FindAngle(0, 0, this.x, this.y);
	}

	/**
	 * @returns {string} A string for debugging a vector
	 */
	Print(full = false): string {
		if (full) return "[" + this.x.toString() + "," + this.y.toString() + "](" + this.Magnitude() + "," + this.Heading() + ")";
		return "[" + this.x.toString() + "," + this.y.toString() + "]";
	}
}

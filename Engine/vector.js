class Vector2 {
	x = 0;
	y = 0;

	constructor(xx,yy)
	{
		this.x = xx;
		this.y = yy;
	}

	/** 
	* @param {Vector2} vector - Adds the provided vector into the current vector.
	* @param {AXIS} axis - Filter for which axis this operation is applied to
	* @returns {Vector2} Returns this vector.
	*/
	Add(vector,axis = AXIS_BOTH) {
		if(axis & AXIS_X) this.x += vector.x;
		if(axis & AXIS_Y) this.y += vector.y;
		return this;
	}
	
	/** 
	* @param {number} scaler - Multiplied with the current vector.
	* @param {AXIS} axis - Filter for which axis this operation is applied to
	* @returns {Vector2} Returns this vector.
	*/
	Multiply(scaler,axis = AXIS_BOTH) {
		if(axis & AXIS_X) this.x *= scaler;
		if(axis & AXIS_Y) this.y *= scaler;
		return this;
	}

	/** 
	* @param {number} denominator - Current vector is divided by this.
	* @param {AXIS} axis - Filter for which axis this operation is applied to
	* @returns {Vector2} Returns this vector.
	*/
	Divide(denominator,axis = AXIS_BOTH) {
		if(axis & AXIS_X) this.x /= denominator;
		if(axis & AXIS_Y) this.y /= denominator;
		return this;
	}

	/** 
	* Inverts the sign of the vector's component x and y.
	* @param {AXIS} axis - Filter for which axis this operation is applied to
	* @returns {Vector2} Returns this vector.
	*/
	Inverse(axis = AXIS_BOTH) {
		if(axis & AXIS_X) this.x *= -1;
		if(axis & AXIS_Y) this.y *= -1;
		return this;
	}

	/** 
	* Returns the vector to its default state of 0,0
	* @param {AXIS} axis - Filter for which axis this operation is applied to
	* @returns {Vector2} Returns this vector.
	*/
	Zero(axis = AXIS_BOTH) {
		if(axis & AXIS_X) this.x = 0;
		if(axis & AXIS_Y) this.y = 0;
		return this;
	}

	/** 
	* @param {AXIS} axis - Filter for which axis this operation is applied to
	* @param {number} acc - Adds the provided number to the vector's current magnitude without changing heading.
	* @returns {Vector2} Returns this vector.
	*/
	Accelerate(acc,axis = AXIS_BOTH) {
		let org_x = (axis & AXIS_X) ? undefined : this.x;
		let org_y = (axis & AXIS_Y) ? undefined : this.y;
        this.Add(MoveToward(this.Heading(),acc));
		if(org_x != undefined) this.x = org_x;
		if(org_y != undefined) this.y = org_y;
		return this;
	}

	/** 
	* @param {AXIS} axis - Filter for which axis this operation is applied to
	* @param {number} decl - Removes the provided number from the vector's current magnitude, bottoms out at 0.
	* @returns {Vector2} Returns this vector.
	*/
	Decelerate(decl,axis = AXIS_BOTH) {
		if(this.x == 0 && this.y == 0) return this;
		let org_x = (axis & AXIS_X) ? undefined : this.x;
		let org_y = (axis & AXIS_Y) ? undefined : this.y;

        let dist = this.Magnitude() - Math.abs(decl);
        if(dist < 0) dist = 0;
		
		let head = this.Heading();
		let new_vec = new Vector2(0,0)
		if(head >= 0) new_vec = MoveToward(head,dist);
		this.Zero(AXIS_BOTH).Add(new_vec,axis);

		if(org_x != undefined) this.x = org_x;
		if(org_y != undefined) this.y = org_y;
		return this;
	}
	
	/** 
	* @param {AXIS} axis - Filter for which axis this operation is applied to
	* @returns {number} A number representing the length of the vector
	*/
	Magnitude(axis = AXIS_BOTH) {
		return PointDistance(0,0,(axis & AXIS_X) ? this.x : 0,(axis & AXIS_Y) ? this.y : 0);
	}

	/** 
	* Normalizes this vector to a unit distance of 1.
	* @returns {Vector2} Returns this vector.
	*/
	Normalized() {
		let heading = this.Heading();
		if(heading == -1) 
			return this;
		let new_vec = MoveToward(heading,1);
		this.x = new_vec.x;
		this.y = new_vec.y;
		return this;
	}

	/** 
	* @param {Vector2} vector 
	* @returns {Boolean} If the provided vector is equal to this vector.
	*/
	Equals(vector) {
		return this.x === vector.x && this.y === vector.y;
	}

	/** 
	* @returns {Vector2} Copy of the current vector.
	*/
	Copy() {
		return new Vector2(this.x,this.y);
	}

	/** 
	* @returns {number} An angle representing the heading of the vector. -1 if not possible.
	*/
	Heading() {
        if(this.x == 0 && this.y == 0) 
			return -1;
		return FindAngle(0,0,this.x,this.y);
	}

	/** 
	* @returns {number} A string for debugging a vector
	*/
	Print(full = false) {
		if(full) return "[" + this.x.toString() + "," + this.y.toString() + "](" + this.Magnitude() + "," + this.Heading() + ")";
		return "[" + this.x.toString() + "," + this.y.toString() + "]";
	}
}
